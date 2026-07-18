var authorsCatalogCache = null;

function loadAuthorsCatalog() {
  var kontejner = document.getElementById("authors-catalog-container");
  if (!kontejner) {
    return;
  }

  kontejner.innerHTML = "<p class=\"message-empty\">Loading authors...</p>";

  loadFromFirebase("autori", function (autori) {
    authorsCatalogCache = autori || {};
    renderAuthorsCatalog(authorsCatalogCache, kontejner, "");
  }, function () {
    kontejner.innerHTML = "<p class=\"message-error\">Error loading authors. Check the Firebase URL.</p>";
  });
}

function renderAuthorsCatalog(autori, kontejner, terminZaPretragu) {
  var lista = typeof autori.length === "number" ? autori : toList(autori);

  lista.sort(function (a, b) {
    var imeA = getAuthorFullName(a.data);
    var imeB = getAuthorFullName(b.data);
    return imeA.localeCompare(imeB, "en");
  });

  if (lista.length === 0) {
    kontejner.innerHTML = "<p class=\"message-empty\">No authors match your search.</p>";
    return;
  }

  var html = "";
  for (var i = 0; i < lista.length; i++) {
    var stavka = lista[i];
    var autor = stavka.data;
    var slika = autor.slike && autor.slike[0] ? autor.slike[0] : "";
    var statusKlasa = getAuthorStatusClass(autor.status);
    
    var punoIme = getAuthorFullName(autor);
    var imeZaPrikaz = terminZaPretragu ? highlightText(punoIme, terminZaPretragu) : escapeHtml(punoIme);

    html += "<a href=\"author-details.html?id=" + escapeHtml(stavka.id) + "\" class=\"author-card\">";
    html += "<img src=\"" + escapeHtml(slika) + "\" alt=\"\" class=\"author-image\" />";
    html += "<div class=\"author-content\">";
    html += "<h3>" + imeZaPrikaz + "</h3>";
    html += "<span class=\"author-status " + escapeHtml(statusKlasa) + "\">" + escapeHtml(autor.status || "") + "</span>";
    html += "</div></a>";
  }

  kontejner.innerHTML = html;
}

function loadAuthorDetails() {
  var kontejner = document.getElementById("author-container");
  if (!kontejner) {
    return;
  }

  var idAutora = getUrlParam("id");
  if (!idAutora) {
    kontejner.innerHTML = "<p class=\"message-error\">Author ID not found in the URL (?id=...).</p>";
    return;
  }

  kontejner.innerHTML = "<p class=\"message-empty\">Loading...</p>";

  loadFromFirebase("autori/" + idAutora, function (autor) {
    if (!autor) {
      kontejner.innerHTML = "<p class=\"message-error\">Author not found in the database.</p>";
      return;
    }

    loadFromFirebase("knjige", function (knjige) {
      loadFromFirebase("ocene", function (ocene) {
        renderAuthorDetails(idAutora, autor, knjige, ocene, kontejner);
      });
    });
  }, function () {
    kontejner.innerHTML = "<p class=\"message-error\">Error loading author.</p>";
  });
}

function calculateAverageRating(idAutora, ocene) {
  var lista = toList(ocene);
  var zbir = 0;
  var broj = 0;

  for (var i = 0; i < lista.length; i++) {
    if (lista[i].data.idAutora === idAutora) {
      zbir += Number(lista[i].data.vrednost);
      broj++;
    }
  }

  if (broj === 0) {
    return { prosek: 0, broj: 0 };
  }

  return { prosek: zbir / broj, broj: broj };
}

function renderAuthorBooks(idAutora, knjige) {
  var lista = toList(knjige);
  var html = "";

  for (var i = 0; i < lista.length; i++) {
    if (lista[i].data.idAutora !== idAutora) {
      continue;
    }
    var knjiga = lista[i].data;
    var slika = knjiga.slike && knjiga.slike[0] ? knjiga.slike[0] : "";
    html += "<a href=\"book-details.html?id=" + escapeHtml(lista[i].id) + "\" class=\"author-book-mini\">";
    html += "<img src=\"" + escapeHtml(slika) + "\" alt=\"\" />";
    html += "<span class=\"mini-title\">" + escapeHtml(knjiga.naziv) + "</span>";
    html += "<span class=\"mini-genre\">" + escapeHtml(knjiga.zanr) + "</span>";
    html += "</a>";
  }

  if (!html) {
    return "<p class=\"message-empty\">No books by this author in the catalog.</p>";
  }

  return "<div class=\"author-books-list\">" + html + "</div>";
}

function renderAverageStars(prosek) {
  var html = "<div class=\"stars read-only\" aria-hidden=\"true\">";
  for (var i = 1; i <= 5; i++) {
    var klasa = i <= Math.round(prosek) ? " star star-active" : " star";
    html += "<span class=\"" + klasa.trim() + "\">★</span>";
  }
  html += "</div>";
  return html;
}

function renderAuthorDetails(idAutora, autor, knjige, ocene, kontejner) {
  var slika = autor.slike && autor.slike[0] ? autor.slike[0] : "";
  var statusKlasa = getAuthorStatusClass(autor.status);
  var ocenaInfo = calculateAverageRating(idAutora, ocene);

  document.title = "Ridit - " + getAuthorFullName(autor);

  var loggedInId = localStorage.getItem("loggedInUser");
  var postojecaOcenaId = null;
  var trenutnaVrednostOcene = 0;

  if (loggedInId) {
    var listaOcena = toList(ocene);
    for (var j = 0; j < listaOcena.length; j++) {
      if (listaOcena[j].data.idAutora === idAutora && listaOcena[j].data.idKorisnika === loggedInId) {
        postojecaOcenaId = listaOcena[j].id;
        trenutnaVrednostOcene = Number(listaOcena[j].data.vrednost);
        break;
      }
    }
  }

  var html = "";
  html += "<div class=\"author-detail\">";
  html += "<div class=\"author-hero\">";
  html += "<img class=\"author-hero-avatar\" src=\"" + escapeHtml(slika) + "\" alt=\"\" />";
  html += "<div class=\"author-hero-info\">";
  html += "<h1>" + escapeHtml(getAuthorFullName(autor)) + "</h1>";
  html += "<p><span class=\"author-status " + escapeHtml(statusKlasa) + "\">" + escapeHtml(autor.status || "") + "</span></p>";
  html += "<p>Born: " + escapeHtml(formatDate(autor.datumRodjenja)) + "</p>";
  html += "<p>Manager phone: " + escapeHtml(autor.kontaktTelefonMenadzera || "—") + "</p>";
  html += "</div></div>";

  html += "<div class=\"author-detail-body\">";
  html += "<p class=\"author-bio\">" + escapeHtml(autor.biografija) + "</p>";

  html += "<div class=\"author-meta-list\">";
  html += "<div><strong>Awards:</strong> " + escapeHtml(formatNumber(autor.brojOsvojenihNagrada)) + "</div>";
  html += "<div><strong>Copies sold:</strong> " + escapeHtml(formatNumber(autor.brojProdatihPrimeraka)) + "</div>";
  html += "</div>";

  html += "<div class=\"rating-box\">";
  html += "<div class=\"rating-display\">";
  html += "<span class=\"rating-number\">" + escapeHtml(ocenaInfo.prosek.toFixed(1)) + "</span>";
  html += renderAverageStars(ocenaInfo.prosek);
  html += "</div>";
  html += "<p class=\"rating-info\">Average rating (" + escapeHtml(ocenaInfo.broj) + " votes)</p>";
  html += "</div>";

  html += "<div id=\"rating-box-inner\">";
  html += "<h3>Rate this author</h3>";
  
  if (!loggedInId) {
    html += "<p class=\"rating-hint\">You must be logged in to leave a rating. Use the Log In button in the menu.</p>";
    html += "<div class=\"stars\" aria-hidden=\"true\">";
    for (var z = 1; z <= 5; z++) {
      html += "<span class=\"star\">★</span>";
    }
    html += "</div>";
    html += "<div class=\"form-actions\" style=\"margin-top:var(--space-md);\">";
    html += "<button type=\"button\" class=\"btn btn-primary\" disabled>Save Rating</button>";
    html += "</div>";
  } else {
    html += "<p class=\"rating-hint\" id=\"rating-message\">Select a star rating:</p>";
    html += "<div class=\"stars interactive\" id=\"stars-container\" aria-hidden=\"true\">";
    for (var v = 1; v <= 5; v++) {
      var klasaZvezdice = v <= trenutnaVrednostOcene ? "star star-active" : "star";
      html += "<span class=\"" + klasaZvezdice + "\" data-value=\"" + v + "\">★</span>";
    }
    html += "</div>";
    html += "<div class=\"form-actions\" style=\"margin-top:var(--space-md);\">";
    html += "<button type=\"button\" class=\"btn btn-primary\" id=\"btn-save-rating\">Save Rating</button>";
    html += "</div>";
  }
  html += "</div>";

  html += "<section style=\"margin-top:var(--space-xl);\">";
  html += "<h2>Author's Books</h2>";
  html += renderAuthorBooks(idAutora, knjige);
  html += "</section>";

  html += "</div></div>";

  kontejner.innerHTML = html;

  if (loggedInId) {
    bindStars(idAutora, postojecaOcenaId, loggedInId, trenutnaVrednostOcene);
  }
}

function bindStars(idAutora, postojecaOcenaId, loggedInId, trenutnaVrednostOcene) {
  var kontejnerZvezdica = document.getElementById("stars-container");
  var btnSacuvaj = document.getElementById("btn-save-rating");
  var poruka = document.getElementById("rating-message");
  
  if (!kontejnerZvezdica || !btnSacuvaj) {
    return;
  }

  var stars = kontejnerZvezdica.querySelectorAll(".star");
  var izabranaOcena = trenutnaVrednostOcene;

  function refreshStarsDisplay(vrednost) {
    for (var i = 0; i < stars.length; i++) {
      var trenutnaZvezdica = stars[i];
      var starVrednost = Number(trenutnaZvezdica.getAttribute("data-value"));
      if (starVrednost <= vrednost) {
        trenutnaZvezdica.classList.add("star-active");
      } else {
        trenutnaZvezdica.classList.remove("star-active");
      }
    }
  }

  for (var k = 0; k < stars.length; k++) {
    var zvezda = stars[k];
    
    zvezda.addEventListener("mouseenter", function (e) {
      var vrednost = Number(e.target.getAttribute("data-value"));
      refreshStarsDisplay(vrednost);
    });
    
    zvezda.addEventListener("mouseleave", function () {
      refreshStarsDisplay(izabranaOcena);
    });
    
    zvezda.addEventListener("click", function (e) {
      izabranaOcena = Number(e.target.getAttribute("data-value"));
      refreshStarsDisplay(izabranaOcena);
    });
  }

  btnSacuvaj.addEventListener("click", function () {
    if (izabranaOcena === 0) {
      if (poruka) {
        poruka.textContent = "You must select a star rating before saving.";
        poruka.style.color = "red";
      }
      return;
    }

    var btnTekst = btnSacuvaj.textContent;
    btnSacuvaj.textContent = "Saving...";
    btnSacuvaj.disabled = true;

    var datum = todayDate();

    var novaOcena = {
      vrednost: izabranaOcena,
      datum: datum,
      idAutora: idAutora,
      idKorisnika: loggedInId
    };

    if (postojecaOcenaId) {
      updateInFirebase("ocene", postojecaOcenaId, novaOcena, function () {
        loadAuthorDetails();
      }, function () {
        if (poruka) {
          poruka.textContent = "Error updating rating.";
          poruka.style.color = "red";
        }
        btnSacuvaj.textContent = btnTekst;
        btnSacuvaj.disabled = false;
      });
    } else {
      addToFirebase("ocene", novaOcena, function () {
        loadAuthorDetails();
      }, function () {
        if (poruka) {
          poruka.textContent = "Error saving rating.";
          poruka.style.color = "red";
        }
        btnSacuvaj.textContent = btnTekst;
        btnSacuvaj.disabled = false;
      });
    }
  });
}

function applyAuthorsSearch() {
  if (!authorsCatalogCache) {
    return;
  }

  var imeInput = document.getElementById("search-name");
  var statusInput = document.getElementById("search-status");
  var kontejner = document.getElementById("authors-catalog-container");

  if (!imeInput || !statusInput || !kontejner) {
    return;
  }

  var trazenoIme = imeInput.value.trim().toLowerCase();
  var trazeniStatus = statusInput.value.toLowerCase();

  var listaSva = toList(authorsCatalogCache);
  var filtriranaLista = [];

  for (var i = 0; i < listaSva.length; i++) {
    var autor = listaSva[i].data;
    var punoIme = getAuthorFullName(autor).toLowerCase();
    var status = normalizeStatus(autor.status);

    var odgovaraIme = true;
    if (trazenoIme !== "") {
      odgovaraIme = punoIme.indexOf(trazenoIme) !== -1;
    }

    var odgovaraStatus = true;
    if (trazeniStatus !== "") {
      odgovaraStatus = status === trazeniStatus;
    }

    if (odgovaraIme && odgovaraStatus) {
      filtriranaLista.push(listaSva[i]);
    }
  }

  renderAuthorsCatalog(filtriranaLista, kontejner, trazenoIme);
}

function bindAuthorsSearch() {
  var imeInput = document.getElementById("search-name");
  var statusInput = document.getElementById("search-status");
  var searchButton = document.getElementById("btn-search");
  var resetButton = document.getElementById("btn-reset");

  if (searchButton) {
    searchButton.addEventListener("click", applyAuthorsSearch);
  }

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      if (imeInput) imeInput.value = "";
      if (statusInput) statusInput.value = "";
      applyAuthorsSearch();
    });
  }
}

window.addEventListener("DOMContentLoaded", function () {
  loadAuthorsCatalog();
  loadAuthorDetails();
  bindAuthorsSearch();
});
