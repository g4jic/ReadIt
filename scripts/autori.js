var katalogAutoriCache = null;

function ucitajKatalogAutora() {
  var kontejner = document.getElementById("katalog-autora-kontejner");
  if (!kontejner) {
    return;
  }

  kontejner.innerHTML = "<p class=\"poruka-prazno\">Loading authors...</p>";

  ucitajSaFirebase("autori", function (autori) {
    katalogAutoriCache = autori || {};
    prikaziKatalogAutora(katalogAutoriCache, kontejner, "");
  }, function () {
    kontejner.innerHTML = "<p class=\"poruka-greska\">Error loading authors. Check the Firebase URL.</p>";
  });
}

function prikaziKatalogAutora(autori, kontejner, terminZaPretragu) {
  var lista = typeof autori.length === "number" ? autori : pretvoriUListu(autori);

  lista.sort(function (a, b) {
    var imeA = punoImeAutora(a.podaci);
    var imeB = punoImeAutora(b.podaci);
    return imeA.localeCompare(imeB, "en");
  });

  if (lista.length === 0) {
    kontejner.innerHTML = "<p class=\"poruka-prazno\">No authors match your search.</p>";
    return;
  }

  var html = "";
  for (var i = 0; i < lista.length; i++) {
    var stavka = lista[i];
    var autor = stavka.podaci;
    var slika = autor.slike && autor.slike[0] ? autor.slike[0] : "";
    var statusKlasa = klasaStatusaAutora(autor.status);
    
    var punoIme = punoImeAutora(autor);
    var imeZaPrikaz = terminZaPretragu ? oznaciTekst(punoIme, terminZaPretragu) : escapeHtml(punoIme);

    html += "<a href=\"detaljiAutora.html?id=" + escapeHtml(stavka.id) + "\" class=\"autor-kartica\">";
    html += "<img src=\"" + escapeHtml(slika) + "\" alt=\"\" class=\"autor-slika\" />";
    html += "<div class=\"autor-sadrzaj\">";
    html += "<h3>" + imeZaPrikaz + "</h3>";
    html += "<span class=\"autor-status " + escapeHtml(statusKlasa) + "\">" + escapeHtml(autor.status || "") + "</span>";
    html += "</div></a>";
  }

  kontejner.innerHTML = html;
}

function ucitajDetaljAutora() {
  var kontejner = document.getElementById("autor-kontejner");
  if (!kontejner) {
    return;
  }

  var idAutora = uzmiParametarIzUrl("id");
  if (!idAutora) {
    kontejner.innerHTML = "<p class=\"poruka-greska\">Author ID not found in the URL (?id=...).</p>";
    return;
  }

  kontejner.innerHTML = "<p class=\"poruka-prazno\">Loading...</p>";

  ucitajSaFirebase("autori/" + idAutora, function (autor) {
    if (!autor) {
      kontejner.innerHTML = "<p class=\"poruka-greska\">Author not found in the database.</p>";
      return;
    }

    ucitajSaFirebase("knjige", function (knjige) {
      ucitajSaFirebase("ocene", function (ocene) {
        prikaziDetaljAutora(idAutora, autor, knjige, ocene, kontejner);
      });
    });
  }, function () {
    kontejner.innerHTML = "<p class=\"poruka-greska\">Error loading author.</p>";
  });
}

function izracunajProsekOcena(idAutora, ocene) {
  var lista = pretvoriUListu(ocene);
  var zbir = 0;
  var broj = 0;

  for (var i = 0; i < lista.length; i++) {
    if (lista[i].podaci.idAutora === idAutora) {
      zbir += Number(lista[i].podaci.vrednost);
      broj++;
    }
  }

  if (broj === 0) {
    return { prosek: 0, broj: 0 };
  }

  return { prosek: zbir / broj, broj: broj };
}

function prikaziKnjigeAutora(idAutora, knjige) {
  var lista = pretvoriUListu(knjige);
  var html = "";

  for (var i = 0; i < lista.length; i++) {
    if (lista[i].podaci.idAutora !== idAutora) {
      continue;
    }
    var knjiga = lista[i].podaci;
    var slika = knjiga.slike && knjiga.slike[0] ? knjiga.slike[0] : "";
    html += "<a href=\"detaljiKnjige.html?id=" + escapeHtml(lista[i].id) + "\" class=\"autor-knjiga-mini\">";
    html += "<img src=\"" + escapeHtml(slika) + "\" alt=\"\" />";
    html += "<span class=\"mini-naslov\">" + escapeHtml(knjiga.naziv) + "</span>";
    html += "<span class=\"mini-zanr\">" + escapeHtml(knjiga.zanr) + "</span>";
    html += "</a>";
  }

  if (!html) {
    return "<p class=\"poruka-prazno\">No books by this author in the catalog.</p>";
  }

  return "<div class=\"autor-knjige-lista\">" + html + "</div>";
}

function prikaziZvezdiceProsek(prosek) {
  var html = "<div class=\"zvezdice samo-citanje\" aria-hidden=\"true\">";
  for (var i = 1; i <= 5; i++) {
    var klasa = i <= Math.round(prosek) ? " zvezdica aktivna" : " zvezdica";
    html += "<span class=\"" + klasa.trim() + "\">★</span>";
  }
  html += "</div>";
  return html;
}

function prikaziDetaljAutora(idAutora, autor, knjige, ocene, kontejner) {
  var slika = autor.slike && autor.slike[0] ? autor.slike[0] : "";
  var statusKlasa = klasaStatusaAutora(autor.status);
  var ocenaInfo = izracunajProsekOcena(idAutora, ocene);

  document.title = "Ridit - " + punoImeAutora(autor);

  var prijavljenId = localStorage.getItem("prijavljenKorisnik");
  var postojecaOcenaId = null;
  var trenutnaVrednostOcene = 0;

  if (prijavljenId) {
    var listaOcena = pretvoriUListu(ocene);
    for (var j = 0; j < listaOcena.length; j++) {
      if (listaOcena[j].podaci.idAutora === idAutora && listaOcena[j].podaci.idKorisnika === prijavljenId) {
        postojecaOcenaId = listaOcena[j].id;
        trenutnaVrednostOcene = Number(listaOcena[j].podaci.vrednost);
        break;
      }
    }
  }

  var html = "";
  html += "<div class=\"autor-detalj\">";
  html += "<div class=\"autor-hero\">";
  html += "<img class=\"autor-hero-avatar\" src=\"" + escapeHtml(slika) + "\" alt=\"\" />";
  html += "<div class=\"autor-hero-info\">";
  html += "<h1>" + escapeHtml(punoImeAutora(autor)) + "</h1>";
  html += "<p><span class=\"autor-status " + escapeHtml(statusKlasa) + "\">" + escapeHtml(autor.status || "") + "</span></p>";
  html += "<p>Born: " + escapeHtml(formatirajDatum(autor.datumRodjenja)) + "</p>";
  html += "<p>Manager phone: " + escapeHtml(autor.kontaktTelefonMenadzera || "—") + "</p>";
  html += "</div></div>";

  html += "<div class=\"autor-detalj-telo\">";
  html += "<p class=\"autor-biografija\">" + escapeHtml(autor.biografija) + "</p>";

  html += "<div class=\"autor-meta-lista\">";
  html += "<div><strong>Awards:</strong> " + escapeHtml(formatirajBroj(autor.brojOsvojenihNagrada)) + "</div>";
  html += "<div><strong>Copies sold:</strong> " + escapeHtml(formatirajBroj(autor.brojProdatihPrimeraka)) + "</div>";
  html += "</div>";

  html += "<div class=\"ocena-kutija\">";
  html += "<div class=\"ocena-prikaz\">";
  html += "<span class=\"ocena-broj\">" + escapeHtml(ocenaInfo.prosek.toFixed(1)) + "</span>";
  html += prikaziZvezdiceProsek(ocenaInfo.prosek);
  html += "</div>";
  html += "<p class=\"ocena-info\">Average rating (" + escapeHtml(ocenaInfo.broj) + " votes)</p>";
  html += "</div>";

  html += "<div id=\"kutija-ocena\">";
  html += "<h3>Rate this author</h3>";
  
  if (!prijavljenId) {
    html += "<p class=\"ocena-objasnjenje\">You must be logged in to leave a rating. Use the Log In button in the menu.</p>";
    html += "<div class=\"zvezdice\" aria-hidden=\"true\">";
    for (var z = 1; z <= 5; z++) {
      html += "<span class=\"zvezdica\">★</span>";
    }
    html += "</div>";
    html += "<div class=\"forma-akcije\" style=\"margin-top:var(--razmak-m);\">";
    html += "<button type=\"button\" class=\"dugme dugme-primarno\" disabled>Save Rating</button>";
    html += "</div>";
  } else {
    html += "<p class=\"ocena-objasnjenje\" id=\"poruka-za-ocenu\">Select a star rating:</p>";
    html += "<div class=\"zvezdice interaktivne\" id=\"kontejner-zvezdica\" aria-hidden=\"true\">";
    for (var v = 1; v <= 5; v++) {
      var klasaZvezdice = v <= trenutnaVrednostOcene ? "zvezdica aktivna" : "zvezdica";
      html += "<span class=\"" + klasaZvezdice + "\" data-vrednost=\"" + v + "\">★</span>";
    }
    html += "</div>";
    html += "<div class=\"forma-akcije\" style=\"margin-top:var(--razmak-m);\">";
    html += "<button type=\"button\" class=\"dugme dugme-primarno\" id=\"dugme-sacuvaj-ocenu\">Save Rating</button>";
    html += "</div>";
  }
  html += "</div>";

  html += "<section style=\"margin-top:var(--razmak-xl);\">";
  html += "<h2>Author's Books</h2>";
  html += prikaziKnjigeAutora(idAutora, knjige);
  html += "</section>";

  html += "</div></div>";

  kontejner.innerHTML = html;

  if (prijavljenId) {
    poveziZvezdice(idAutora, postojecaOcenaId, prijavljenId, trenutnaVrednostOcene);
  }
}

function poveziZvezdice(idAutora, postojecaOcenaId, prijavljenId, trenutnaVrednostOcene) {
  var kontejnerZvezdica = document.getElementById("kontejner-zvezdica");
  var dugmeSacuvaj = document.getElementById("dugme-sacuvaj-ocenu");
  var poruka = document.getElementById("poruka-za-ocenu");
  
  if (!kontejnerZvezdica || !dugmeSacuvaj) {
    return;
  }

  var zvezdice = kontejnerZvezdica.querySelectorAll(".zvezdica");
  var izabranaOcena = trenutnaVrednostOcene;

  function osveziPrikazZvezdica(vrednost) {
    for (var i = 0; i < zvezdice.length; i++) {
      var trenutnaZvezdica = zvezdice[i];
      var zvezdicaVrednost = Number(trenutnaZvezdica.getAttribute("data-vrednost"));
      if (zvezdicaVrednost <= vrednost) {
        trenutnaZvezdica.classList.add("aktivna");
      } else {
        trenutnaZvezdica.classList.remove("aktivna");
      }
    }
  }

  for (var k = 0; k < zvezdice.length; k++) {
    var zvezda = zvezdice[k];
    
    zvezda.addEventListener("mouseenter", function (e) {
      var vrednost = Number(e.target.getAttribute("data-vrednost"));
      osveziPrikazZvezdica(vrednost);
    });
    
    zvezda.addEventListener("mouseleave", function () {
      osveziPrikazZvezdica(izabranaOcena);
    });
    
    zvezda.addEventListener("click", function (e) {
      izabranaOcena = Number(e.target.getAttribute("data-vrednost"));
      osveziPrikazZvezdica(izabranaOcena);
    });
  }

  dugmeSacuvaj.addEventListener("click", function () {
    if (izabranaOcena === 0) {
      if (poruka) {
        poruka.textContent = "You must select a star rating before saving.";
        poruka.style.color = "red";
      }
      return;
    }

    var dugmeTekst = dugmeSacuvaj.textContent;
    dugmeSacuvaj.textContent = "Saving...";
    dugmeSacuvaj.disabled = true;

    var datum = danasnjiDatum();

    var novaOcena = {
      vrednost: izabranaOcena,
      datum: datum,
      idAutora: idAutora,
      idKorisnika: prijavljenId
    };

    if (postojecaOcenaId) {
      izmeniUFirebase("ocene", postojecaOcenaId, novaOcena, function () {
        ucitajDetaljAutora();
      }, function () {
        if (poruka) {
          poruka.textContent = "Error updating rating.";
          poruka.style.color = "red";
        }
        dugmeSacuvaj.textContent = dugmeTekst;
        dugmeSacuvaj.disabled = false;
      });
    } else {
      dodajUFirebase("ocene", novaOcena, function () {
        ucitajDetaljAutora();
      }, function () {
        if (poruka) {
          poruka.textContent = "Error saving rating.";
          poruka.style.color = "red";
        }
        dugmeSacuvaj.textContent = dugmeTekst;
        dugmeSacuvaj.disabled = false;
      });
    }
  });
}

function primeniPretraguAutora() {
  if (!katalogAutoriCache) {
    return;
  }

  var imeInput = document.getElementById("pretraga-ime");
  var statusInput = document.getElementById("pretraga-status");
  var kontejner = document.getElementById("katalog-autora-kontejner");

  if (!imeInput || !statusInput || !kontejner) {
    return;
  }

  var trazenoIme = imeInput.value.trim().toLowerCase();
  var trazeniStatus = statusInput.value.toLowerCase();

  var listaSva = pretvoriUListu(katalogAutoriCache);
  var filtriranaLista = [];

  for (var i = 0; i < listaSva.length; i++) {
    var autor = listaSva[i].podaci;
    var punoIme = punoImeAutora(autor).toLowerCase();
    var status = normalizujStatus(autor.status);

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

  prikaziKatalogAutora(filtriranaLista, kontejner, trazenoIme);
}

function poveziPretraguAutora() {
  var imeInput = document.getElementById("pretraga-ime");
  var statusInput = document.getElementById("pretraga-status");
  var dugmePretrazi = document.getElementById("dugme-pretrazi");
  var dugmeResetuj = document.getElementById("dugme-resetuj");

  if (dugmePretrazi) {
    dugmePretrazi.addEventListener("click", primeniPretraguAutora);
  }

  if (dugmeResetuj) {
    dugmeResetuj.addEventListener("click", function () {
      if (imeInput) imeInput.value = "";
      if (statusInput) statusInput.value = "";
      primeniPretraguAutora();
    });
  }
}

window.addEventListener("DOMContentLoaded", function () {
  ucitajKatalogAutora();
  ucitajDetaljAutora();
  poveziPretraguAutora();
});
