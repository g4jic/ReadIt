var booksCatalogCache = null;
var authorsCatalogCache = null;

function loadCatalog() {
  var kontejner = document.getElementById("catalog-container");
  if (!kontejner) {
    return;
  }

  kontejner.innerHTML = "<p class=\"message-empty\">Loading books...</p>";

  loadFromFirebase("knjige", function (knjige) {
    booksCatalogCache = knjige || {};
    loadFromFirebase("autori", function (autori) {
      authorsCatalogCache = autori || {};
      populateGenres(booksCatalogCache);
      renderCatalog(booksCatalogCache, authorsCatalogCache, kontejner, "");
    }, function () {
      kontejner.innerHTML = "<p class=\"message-error\">Error loading authors.</p>";
    });
  }, function () {
    kontejner.innerHTML = "<p class=\"message-error\">Error loading books. Check the Firebase URL.</p>";
  });
}

function populateGenres(knjige) {
  var select = document.getElementById("search-genre");
  if (!select) {
    return;
  }

  var lista = toList(knjige);
  var zanrovi = {};

  for (var i = 0; i < lista.length; i++) {
    var zanr = lista[i].data.zanr;
    if (zanr) {
      zanrovi[zanr] = true;
    }
  }

  select.innerHTML = "<option value=\"\">All genres</option>";
  var nazivi = Object.keys(zanrovi);
  nazivi.sort(function (a, b) {
    return a.localeCompare(b, "en");
  });

  for (var j = 0; j < nazivi.length; j++) {
    var opcija = document.createElement("option");
    opcija.value = nazivi[j].toLowerCase();
    opcija.textContent = nazivi[j];
    select.appendChild(opcija);
  }
}

function renderCatalog(knjige, autori, kontejner, terminNaziva) {
  var lista = typeof knjige.length === "number" ? knjige : toList(knjige);

  if (lista.length === 0) {
    kontejner.innerHTML = "<p class=\"message-empty\">No books match your search.</p>";
    return;
  }

  var html = "";
  for (var i = 0; i < lista.length; i++) {
    var stavka = lista[i];
    var knjiga = stavka.data;
    var slika = knjiga.slike && knjiga.slike[0] ? knjiga.slike[0] : "";
    var autorIme = getAuthorName(autori, knjiga.idAutora);
    var nazivHtml = terminNaziva ? highlightText(knjiga.naziv, terminNaziva) : escapeHtml(knjiga.naziv);

    html += "<a href=\"pages/book-details.html?id=" + escapeHtml(stavka.id) + "\" class=\"book-card\">";
    html += "<img src=\"" + escapeHtml(slika) + "\" alt=\"\" class=\"book-image\" />";
    html += "<div class=\"book-content\">";
    html += "<h3>" + nazivHtml + "</h3>";
    html += "<span class=\"book-author\">" + escapeHtml(autorIme) + "</span>";
    html += "<div class=\"book-meta\">";
    html += "<span class=\"book-genre\">" + escapeHtml(knjiga.zanr) + "</span>";
    html += "<span class=\"book-price\">" + escapeHtml(formatPrice(knjiga.cena)) + "</span>";
    html += "</div></div></a>";
  }

  kontejner.innerHTML = html;
}

function applyBooksSearch() {
  if (!booksCatalogCache) {
    return;
  }

  var nazivInput = document.getElementById("search-title");
  var zanrInput = document.getElementById("search-genre");
  var kontejner = document.getElementById("catalog-container");

  if (!nazivInput || !zanrInput || !kontejner) {
    return;
  }

  var trazeniNaziv = nazivInput.value.trim().toLowerCase();
  var trazeniZanr = zanrInput.value.toLowerCase();
  var listaSva = toList(booksCatalogCache);
  var filtriranaLista = [];

  for (var i = 0; i < listaSva.length; i++) {
    var knjiga = listaSva[i].data;
    var naziv = (knjiga.naziv || "").toLowerCase();
    var zanr = (knjiga.zanr || "").toLowerCase();

    var odgovaraNaziv = true;
    if (trazeniNaziv !== "") {
      odgovaraNaziv = naziv.indexOf(trazeniNaziv) !== -1;
    }

    var odgovaraZanr = true;
    if (trazeniZanr !== "") {
      odgovaraZanr = zanr === trazeniZanr;
    }

    if (odgovaraNaziv && odgovaraZanr) {
      filtriranaLista.push(listaSva[i]);
    }
  }

  renderCatalog(filtriranaLista, authorsCatalogCache, kontejner, trazeniNaziv);
}

function bindBooksSearch() {
  var nazivInput = document.getElementById("search-title");
  var zanrInput = document.getElementById("search-genre");
  var searchButton = document.getElementById("btn-search-books");
  var resetButton = document.getElementById("btn-reset-books");

  if (searchButton) {
    searchButton.addEventListener("click", applyBooksSearch);
  }

  if (resetButton) {
    resetButton.addEventListener("click", function () {
      if (nazivInput) {
        nazivInput.value = "";
      }
      if (zanrInput) {
        zanrInput.value = "";
      }
      applyBooksSearch();
    });
  }
}

function loadBookDetails() {
  var kontejner = document.getElementById("book-container");
  if (!kontejner) {
    return;
  }

  var idKnjige = getUrlParam("id");
  if (!idKnjige) {
    kontejner.innerHTML = "<p class=\"message-error\">Book ID not found in the URL (?id=...).</p>";
    return;
  }

  kontejner.innerHTML = "<p class=\"message-empty\">Loading...</p>";

  loadFromFirebase("knjige/" + idKnjige, function (knjiga) {
    if (!knjiga) {
      kontejner.innerHTML = "<p class=\"message-error\">Book not found in the database.</p>";
      return;
    }

    loadFromFirebase("autori", function (autori) {
      loadFromFirebase("recenzije", function (recenzije) {
        loadFromFirebase("oceneKnjiga", function (oceneKnjiga) {
          loadFromFirebase("korisnici", function (korisnici) {
            renderBookDetails(idKnjige, knjiga, autori, recenzije, oceneKnjiga, korisnici, kontejner);
          });
        });
      });
    });
  }, function () {
    kontejner.innerHTML = "<p class=\"message-error\">Error loading book.</p>";
  });
}

function renderBookDetails(idKnjige, knjiga, autori, recenzije, oceneKnjiga, korisnici, kontejner) {
  var slika = knjiga.slike && knjiga.slike[0] ? knjiga.slike[0] : "";
  var autorIme = getAuthorName(autori, knjiga.idAutora);
  var idAutora = knjiga.idAutora || "";
  var loggedInId = localStorage.getItem("loggedInUser");
  var postojecaRecenzijaId = null;
  var postojeciTekst = "";
  var postojecaOcenaKnjigeId = null;
  var postojecaOcenaKnjige = "";

  if (loggedInId) {
    var listaRecenzija = toList(recenzije);
    for (var r = 0; r < listaRecenzija.length; r++) {
      if (listaRecenzija[r].data.idKnjige === idKnjige && listaRecenzija[r].data.idKorisnika === loggedInId) {
        postojecaRecenzijaId = listaRecenzija[r].id;
        postojeciTekst = listaRecenzija[r].data.tekst || "";
        break;
      }
    }

    var listaOcenaKnjiga = toList(oceneKnjiga);
    for (var o = 0; o < listaOcenaKnjiga.length; o++) {
      if (listaOcenaKnjiga[o].data.idKnjige === idKnjige && listaOcenaKnjiga[o].data.idKorisnika === loggedInId) {
        postojecaOcenaKnjigeId = listaOcenaKnjiga[o].id;
        postojecaOcenaKnjige = listaOcenaKnjiga[o].data.vrednost || "";
        break;
      }
    }
  }

  document.title = "Ridit - " + knjiga.naziv;

  var html = "";
  html += "<div class=\"book-detail\">";
  html += "<div class=\"book-gallery\">";
  html += "<img class=\"book-main-image\" src=\"" + escapeHtml(slika) + "\" alt=\"" + escapeHtml(knjiga.naziv) + "\" />";
  html += "<div class=\"book-gallery-thumbs\">";
  if (knjiga.slike) {
    for (var s = 0; s < knjiga.slike.length && s < 4; s++) {
      html += "<img src=\"" + escapeHtml(knjiga.slike[s]) + "\" alt=\"\" />";
    }
  }
  html += "</div></div>";
  html += "<div class=\"book-detail-info\">";
  html += "<h1>" + escapeHtml(knjiga.naziv) + "</h1>";
  html += "<p class=\"book-detail-author\">Author: <a href=\"author-details.html?id=" + escapeHtml(idAutora) + "\">" + escapeHtml(autorIme) + "</a></p>";
  html += "<p class=\"book-description\">" + escapeHtml(knjiga.opis) + "</p>";
  html += "<div class=\"book-meta-list\">";
  html += "<div class=\"book-meta-item\"><span class=\"label\">Genre</span><span class=\"vrednost\">" + escapeHtml(knjiga.zanr) + "</span></div>";
  html += "<div class=\"book-meta-item\"><span class=\"label\">Format</span><span class=\"vrednost\">" + escapeHtml(knjiga.format) + "</span></div>";
  html += "<div class=\"book-meta-item\"><span class=\"label\">Pages</span><span class=\"vrednost\">" + escapeHtml(knjiga.brojStrana) + "</span></div>";
  html += "<div class=\"book-meta-item\"><span class=\"label\">ISBN</span><span class=\"vrednost\">" + escapeHtml(knjiga.isbn) + "</span></div>";
  html += "<div class=\"book-meta-item\"><span class=\"label\">Price</span><span class=\"vrednost\">" + escapeHtml(formatPrice(knjiga.cena)) + "</span></div>";
  html += "</div></div></div>";

  html += "<section class=\"reviews-section\">";
  html += "<h2>Reviews & Ratings</h2>";
  html += renderBookRatings(idKnjige, oceneKnjiga, korisnici);
  html += renderBookRatingForm(loggedInId, postojecaOcenaKnjige);
  html += renderBookReviews(idKnjige, recenzije, korisnici);
  html += renderReviewForm(loggedInId, postojeciTekst);
  html += "</section>";

  kontejner.innerHTML = html;

  if (loggedInId) {
    bindBookRatingForm(idKnjige, loggedInId, postojecaOcenaKnjigeId);
    bindReviewForm(idKnjige, loggedInId, postojecaRecenzijaId);
  }
}

function renderBookRatings(idKnjige, oceneKnjiga, korisnici) {
  var lista = toList(oceneKnjiga);
  var filtrirane = [];
  
  for (var i = 0; i < lista.length; i++) {
    if (lista[i].data.idKnjige === idKnjige) {
      filtrirane.push(lista[i]);
    }
  }

  var html = "<div class=\"review-list-box\">";
  html += "<h3 class=\"review-list-title\">Book Ratings</h3>";

  if (filtrirane.length === 0) {
    html += "<p class=\"message-empty\">No ratings for this book yet.</p>";
  } else {
    for (var j = 0; j < filtrirane.length; j++) {
      var ocena = filtrirane[j].data;
      var autorOcene = getUserName(korisnici, ocena.idKorisnika);
      html += "<article class=\"recenzija\">";
      html += "<div class=\"review-header\">";
      html += "<span class=\"review-author\">" + escapeHtml(autorOcene) + "</span>";
      html += "<span class=\"review-date\">" + escapeHtml(formatDate(ocena.datum)) + "</span>";
      html += "</div>";
      html += "<p class=\"review-text\">Rating: " + escapeHtml(ocena.vrednost) + "/5</p>";
      html += "</article>";
    }
  }

  html += "</div>";
  return html;
}

function renderBookRatingForm(loggedInId, postojecaOcenaKnjige) {
  var html = "<div class=\"review-form\">";

  if (!loggedInId) {
    html += "<p class=\"message-empty\">You must be logged in to rate this book.</p>";
    html += "<form class=\"form\" action=\"#\" method=\"get\" onsubmit=\"return false;\">";
    html += "<div class=\"field\">";
    html += "<label for=\"book-rating-value\">Your Rating</label>";
    html += "<select id=\"book-rating-value\" disabled><option>Select a rating</option></select>";
    html += "</div>";
    html += "<div class=\"form-actions\">";
    html += "<button type=\"button\" class=\"btn btn-primary\" disabled>Save Rating</button>";
    html += "</div></form>";
  } else {
    html += "<form class=\"form\" action=\"#\" method=\"get\" onsubmit=\"return false;\">";
    html += "<div class=\"field\">";
    html += "<label for=\"book-rating-value\">Your Rating</label>";
    html += "<select id=\"book-rating-value\">";
    html += "<option value=\"\">Select a rating</option>";
    for (var i = 1; i <= 5; i++) {
      var selected = Number(postojecaOcenaKnjige) === i ? " selected" : "";
      html += "<option value=\"" + i + "\"" + selected + ">" + i + "</option>";
    }
    html += "</select>";
    html += "</div>";
    html += "<p class=\"greska hidden\" id=\"book-rating-error\"></p>";
    html += "<div class=\"form-actions\">";
    html += "<button type=\"button\" class=\"btn btn-primary\" id=\"btn-save-rating-knjige\">Save Rating</button>";
    html += "</div></form>";
  }

  html += "</div>";
  return html;
}

function bindBookRatingForm(idKnjige, loggedInId, postojecaOcenaKnjigeId) {
  var btn = document.getElementById("btn-save-rating-knjige");
  var select = document.getElementById("book-rating-value");
  var greskaEl = document.getElementById("book-rating-error");

  if (!btn || !select) {
    return;
  }

  btn.addEventListener("click", function () {
    var vrednost = Number(select.value);

    if (vrednost < 1 || vrednost > 5) {
      if (greskaEl) {
        greskaEl.textContent = "Please select a rating from 1 to 5.";
        greskaEl.classList.remove("hidden");
      }
      return;
    }

    if (greskaEl) {
      greskaEl.classList.add("hidden");
    }

    var stariTekst = btn.textContent;
    btn.textContent = "Saving...";
    btn.disabled = true;

    var podatak = {
      vrednost: vrednost,
      datum: todayDate(),
      idKnjige: idKnjige,
      idKorisnika: loggedInId
    };

    if (postojecaOcenaKnjigeId) {
      updateInFirebase("oceneKnjiga", postojecaOcenaKnjigeId, podatak, function () {
        loadBookDetails();
      }, function () {
        if (greskaEl) {
          greskaEl.textContent = "Error updating rating.";
          greskaEl.classList.remove("hidden");
        }
        btn.textContent = stariTekst;
        btn.disabled = false;
      });
    } else {
      addToFirebase("oceneKnjiga", podatak, function () {
        loadBookDetails();
      }, function () {
        if (greskaEl) {
          greskaEl.textContent = "Error saving rating.";
          greskaEl.classList.remove("hidden");
        }
        btn.textContent = stariTekst;
        btn.disabled = false;
      });
    }
  });
}

function renderBookReviews(idKnjige, recenzije, korisnici) {
  var lista = toList(recenzije);
  var filtrirane = [];

  for (var i = 0; i < lista.length; i++) {
    if (lista[i].data.idKnjige === idKnjige) {
      filtrirane.push(lista[i]);
    }
  }

  var html = "<div class=\"review-list-box\">";
  html += "<h3 class=\"review-list-title\">Previous Reviews</h3>";

  if (filtrirane.length === 0) {
    html += "<p class=\"message-empty\">No reviews for this book yet.</p>";
  } else {
    for (var j = 0; j < filtrirane.length; j++) {
      var rec = filtrirane[j].data;
      var autorRec = getUserName(korisnici, rec.idKorisnika);
      html += "<article class=\"recenzija\">";
      html += "<div class=\"review-header\">";
      html += "<span class=\"review-author\">" + escapeHtml(autorRec) + "</span>";
      html += "<span class=\"review-date\">" + escapeHtml(formatDate(rec.datum)) + "</span>";
      html += "</div>";
      html += "<p class=\"review-text\">" + escapeHtml(rec.tekst) + "</p>";
      html += "</article>";
    }
  }

  html += "</div>";
  return html;
}

function renderReviewForm(loggedInId, postojeciTekst) {
  var html = "<div class=\"review-form\">";

  if (!loggedInId) {
    html += "<p class=\"message-empty\">You must be logged in to leave a review. Use the Log In button in the menu.</p>";
    html += "<form class=\"form\" action=\"#\" method=\"get\" onsubmit=\"return false;\">";
    html += "<div class=\"field\">";
    html += "<label for=\"review-text\">Your Review</label>";
    html += "<textarea id=\"review-text\" rows=\"4\" placeholder=\"Share your thoughts...\" disabled></textarea>";
    html += "</div>";
    html += "<div class=\"form-actions\">";
    html += "<button type=\"button\" class=\"btn btn-primary\" disabled>Post Review</button>";
    html += "</div></form>";
  } else {
    html += "<form class=\"form\" action=\"#\" method=\"get\" onsubmit=\"return false;\">";
    html += "<div class=\"field\">";
    html += "<label for=\"review-text\">Your Review</label>";
    html += "<textarea id=\"review-text\" rows=\"4\" placeholder=\"Share your thoughts...\">" + escapeHtml(postojeciTekst) + "</textarea>";
    html += "</div>";
    html += "<p class=\"greska hidden\" id=\"review-error\"></p>";
    html += "<div class=\"form-actions\">";
    html += "<button type=\"button\" class=\"btn btn-primary\" id=\"btn-objavi-recenziju\">Post Review</button>";
    html += "</div></form>";
  }

  html += "</div>";
  return html;
}

function bindReviewForm(idKnjige, loggedInId, postojecaRecenzijaId) {
  var btn = document.getElementById("btn-objavi-recenziju");
  var textarea = document.getElementById("review-text");
  var greskaEl = document.getElementById("review-error");

  if (!btn || !textarea) {
    return;
  }

  btn.addEventListener("click", function () {
    var tekst = textarea.value.trim();

    if (!tekst) {
      if (greskaEl) {
        greskaEl.textContent = "Please enter review text.";
        greskaEl.classList.remove("hidden");
      }
      return;
    }

    if (greskaEl) {
      greskaEl.classList.add("hidden");
    }

    var stariTekst = btn.textContent;
    btn.textContent = "Saving...";
    btn.disabled = true;

    var podatak = {
      tekst: tekst,
      datum: todayDate(),
      idKnjige: idKnjige,
      idKorisnika: loggedInId
    };

    if (postojecaRecenzijaId) {
      updateInFirebase("recenzije", postojecaRecenzijaId, podatak, function () {
        loadBookDetails();
      }, function () {
        if (greskaEl) {
          greskaEl.textContent = "Error updating review.";
          greskaEl.classList.remove("hidden");
        }
        btn.textContent = stariTekst;
        btn.disabled = false;
      });
    } else {
      addToFirebase("recenzije", podatak, function () {
        loadBookDetails();
      }, function () {
        if (greskaEl) {
          greskaEl.textContent = "Error saving review.";
          greskaEl.classList.remove("hidden");
        }
        btn.textContent = stariTekst;
        btn.disabled = false;
      });
    }
  });
}

window.addEventListener("DOMContentLoaded", function () {
  loadCatalog();
  loadBookDetails();
  bindBooksSearch();
});
