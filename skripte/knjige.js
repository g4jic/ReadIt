var katalogKnjigeCache = null;
var katalogAutoriCache = null;

function ucitajKatalog() {
  var kontejner = document.getElementById("katalog-kontejner");
  if (!kontejner) {
    return;
  }

  kontejner.innerHTML = "<p class=\"poruka-prazno\">Loading books...</p>";

  ucitajSaFirebase("knjige", function (knjige) {
    katalogKnjigeCache = knjige || {};
    ucitajSaFirebase("autori", function (autori) {
      katalogAutoriCache = autori || {};
      popuniZanrove(katalogKnjigeCache);
      prikaziKatalog(katalogKnjigeCache, katalogAutoriCache, kontejner, "");
    }, function () {
      kontejner.innerHTML = "<p class=\"poruka-greska\">Error loading authors.</p>";
    });
  }, function () {
    kontejner.innerHTML = "<p class=\"poruka-greska\">Error loading books. Check the Firebase URL.</p>";
  });
}

function popuniZanrove(knjige) {
  var select = document.getElementById("pretraga-zanr");
  if (!select) {
    return;
  }

  var lista = pretvoriUListu(knjige);
  var zanrovi = {};

  for (var i = 0; i < lista.length; i++) {
    var zanr = lista[i].podaci.zanr;
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

function prikaziKatalog(knjige, autori, kontejner, terminNaziva) {
  var lista = typeof knjige.length === "number" ? knjige : pretvoriUListu(knjige);

  if (lista.length === 0) {
    kontejner.innerHTML = "<p class=\"poruka-prazno\">No books match your search.</p>";
    return;
  }

  var html = "";
  for (var i = 0; i < lista.length; i++) {
    var stavka = lista[i];
    var knjiga = stavka.podaci;
    var slika = knjiga.slike && knjiga.slike[0] ? knjiga.slike[0] : "";
    var autorIme = imeAutora(autori, knjiga.idAutora);
    var nazivHtml = terminNaziva ? oznaciTekst(knjiga.naziv, terminNaziva) : escapeHtml(knjiga.naziv);

    html += "<a href=\"stranice/detaljiKnjige.html?id=" + escapeHtml(stavka.id) + "\" class=\"knjiga-kartica\">";
    html += "<img src=\"" + escapeHtml(slika) + "\" alt=\"\" class=\"knjiga-slika\" />";
    html += "<div class=\"knjiga-sadrzaj\">";
    html += "<h3>" + nazivHtml + "</h3>";
    html += "<span class=\"knjiga-autor\">" + escapeHtml(autorIme) + "</span>";
    html += "<div class=\"knjiga-meta\">";
    html += "<span class=\"knjiga-zanr\">" + escapeHtml(knjiga.zanr) + "</span>";
    html += "<span class=\"knjiga-cena\">" + escapeHtml(formatirajCenu(knjiga.cena)) + "</span>";
    html += "</div></div></a>";
  }

  kontejner.innerHTML = html;
}

function primeniPretraguKnjiga() {
  if (!katalogKnjigeCache) {
    return;
  }

  var nazivInput = document.getElementById("pretraga-naziv");
  var zanrInput = document.getElementById("pretraga-zanr");
  var kontejner = document.getElementById("katalog-kontejner");

  if (!nazivInput || !zanrInput || !kontejner) {
    return;
  }

  var trazeniNaziv = nazivInput.value.trim().toLowerCase();
  var trazeniZanr = zanrInput.value.toLowerCase();
  var listaSva = pretvoriUListu(katalogKnjigeCache);
  var filtriranaLista = [];

  for (var i = 0; i < listaSva.length; i++) {
    var knjiga = listaSva[i].podaci;
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

  prikaziKatalog(filtriranaLista, katalogAutoriCache, kontejner, trazeniNaziv);
}

function poveziPretraguKnjiga() {
  var nazivInput = document.getElementById("pretraga-naziv");
  var zanrInput = document.getElementById("pretraga-zanr");
  var dugmePretrazi = document.getElementById("dugme-pretrazi-knjige");
  var dugmeResetuj = document.getElementById("dugme-resetuj-knjige");

  if (dugmePretrazi) {
    dugmePretrazi.addEventListener("click", primeniPretraguKnjiga);
  }

  if (dugmeResetuj) {
    dugmeResetuj.addEventListener("click", function () {
      if (nazivInput) {
        nazivInput.value = "";
      }
      if (zanrInput) {
        zanrInput.value = "";
      }
      primeniPretraguKnjiga();
    });
  }
}

function ucitajDetaljKnjige() {
  var kontejner = document.getElementById("knjiga-kontejner");
  if (!kontejner) {
    return;
  }

  var idKnjige = uzmiParametarIzUrl("id");
  if (!idKnjige) {
    kontejner.innerHTML = "<p class=\"poruka-greska\">Book ID not found in the URL (?id=...).</p>";
    return;
  }

  kontejner.innerHTML = "<p class=\"poruka-prazno\">Loading...</p>";

  ucitajSaFirebase("knjige/" + idKnjige, function (knjiga) {
    if (!knjiga) {
      kontejner.innerHTML = "<p class=\"poruka-greska\">Book not found in the database.</p>";
      return;
    }

    ucitajSaFirebase("autori", function (autori) {
      ucitajSaFirebase("recenzije", function (recenzije) {
        ucitajSaFirebase("oceneKnjiga", function (oceneKnjiga) {
          ucitajSaFirebase("korisnici", function (korisnici) {
            prikaziDetaljKnjige(idKnjige, knjiga, autori, recenzije, oceneKnjiga, korisnici, kontejner);
          });
        });
      });
    });
  }, function () {
    kontejner.innerHTML = "<p class=\"poruka-greska\">Error loading book.</p>";
  });
}

function prikaziDetaljKnjige(idKnjige, knjiga, autori, recenzije, oceneKnjiga, korisnici, kontejner) {
  var slika = knjiga.slike && knjiga.slike[0] ? knjiga.slike[0] : "";
  var autorIme = imeAutora(autori, knjiga.idAutora);
  var idAutora = knjiga.idAutora || "";
  var prijavljenId = localStorage.getItem("prijavljenKorisnik");
  var postojecaRecenzijaId = null;
  var postojeciTekst = "";
  var postojecaOcenaKnjigeId = null;
  var postojecaOcenaKnjige = "";

  if (prijavljenId) {
    var listaRecenzija = pretvoriUListu(recenzije);
    for (var r = 0; r < listaRecenzija.length; r++) {
      if (listaRecenzija[r].podaci.idKnjige === idKnjige && listaRecenzija[r].podaci.idKorisnika === prijavljenId) {
        postojecaRecenzijaId = listaRecenzija[r].id;
        postojeciTekst = listaRecenzija[r].podaci.tekst || "";
        break;
      }
    }

    var listaOcenaKnjiga = pretvoriUListu(oceneKnjiga);
    for (var o = 0; o < listaOcenaKnjiga.length; o++) {
      if (listaOcenaKnjiga[o].podaci.idKnjige === idKnjige && listaOcenaKnjiga[o].podaci.idKorisnika === prijavljenId) {
        postojecaOcenaKnjigeId = listaOcenaKnjiga[o].id;
        postojecaOcenaKnjige = listaOcenaKnjiga[o].podaci.vrednost || "";
        break;
      }
    }
  }

  document.title = "Ridit - " + knjiga.naziv;

  var html = "";
  html += "<div class=\"knjiga-detalj\">";
  html += "<div class=\"knjiga-galerija\">";
  html += "<img class=\"knjiga-glavna-slika\" src=\"" + escapeHtml(slika) + "\" alt=\"" + escapeHtml(knjiga.naziv) + "\" />";
  html += "<div class=\"knjiga-galerija-male\">";
  if (knjiga.slike) {
    for (var s = 0; s < knjiga.slike.length && s < 4; s++) {
      html += "<img src=\"" + escapeHtml(knjiga.slike[s]) + "\" alt=\"\" />";
    }
  }
  html += "</div></div>";
  html += "<div class=\"knjiga-detalj-info\">";
  html += "<h1>" + escapeHtml(knjiga.naziv) + "</h1>";
  html += "<p class=\"knjiga-detalj-autor\">Author: <a href=\"detaljiAutora.html?id=" + escapeHtml(idAutora) + "\">" + escapeHtml(autorIme) + "</a></p>";
  html += "<p class=\"knjiga-opis\">" + escapeHtml(knjiga.opis) + "</p>";
  html += "<div class=\"knjiga-meta-lista\">";
  html += "<div class=\"knjiga-meta-stavka\"><span class=\"label\">Genre</span><span class=\"vrednost\">" + escapeHtml(knjiga.zanr) + "</span></div>";
  html += "<div class=\"knjiga-meta-stavka\"><span class=\"label\">Format</span><span class=\"vrednost\">" + escapeHtml(knjiga.format) + "</span></div>";
  html += "<div class=\"knjiga-meta-stavka\"><span class=\"label\">Pages</span><span class=\"vrednost\">" + escapeHtml(knjiga.brojStrana) + "</span></div>";
  html += "<div class=\"knjiga-meta-stavka\"><span class=\"label\">ISBN</span><span class=\"vrednost\">" + escapeHtml(knjiga.isbn) + "</span></div>";
  html += "<div class=\"knjiga-meta-stavka\"><span class=\"label\">Price</span><span class=\"vrednost\">" + escapeHtml(formatirajCenu(knjiga.cena)) + "</span></div>";
  html += "</div></div></div>";

  html += "<section class=\"recenzije-sekcija\">";
  html += "<h2>Reviews & Ratings</h2>";
  html += prikaziOceneZaKnjigu(idKnjige, oceneKnjiga, korisnici);
  html += prikaziFormuOceneKnjige(prijavljenId, postojecaOcenaKnjige);
  html += prikaziRecenzijeZaKnjigu(idKnjige, recenzije, korisnici);
  html += prikaziFormuRecenzije(prijavljenId, postojeciTekst);
  html += "</section>";

  kontejner.innerHTML = html;

  if (prijavljenId) {
    poveziFormuOceneKnjige(idKnjige, prijavljenId, postojecaOcenaKnjigeId);
    poveziFormuRecenzije(idKnjige, prijavljenId, postojecaRecenzijaId);
  }
}

function prikaziOceneZaKnjigu(idKnjige, oceneKnjiga, korisnici) {
  var lista = pretvoriUListu(oceneKnjiga);
  var filtrirane = [];
  
  for (var i = 0; i < lista.length; i++) {
    if (lista[i].podaci.idKnjige === idKnjige) {
      filtrirane.push(lista[i]);
    }
  }

  var html = "<div class=\"recenzija-lista-okvir\">";
  html += "<h3 class=\"recenzija-lista-naslov\">Book Ratings</h3>";

  if (filtrirane.length === 0) {
    html += "<p class=\"poruka-prazno\">No ratings for this book yet.</p>";
  } else {
    for (var j = 0; j < filtrirane.length; j++) {
      var ocena = filtrirane[j].podaci;
      var autorOcene = imeKorisnika(korisnici, ocena.idKorisnika);
      html += "<article class=\"recenzija\">";
      html += "<div class=\"recenzija-zaglavlje\">";
      html += "<span class=\"recenzija-autor\">" + escapeHtml(autorOcene) + "</span>";
      html += "<span class=\"recenzija-datum\">" + escapeHtml(formatirajDatum(ocena.datum)) + "</span>";
      html += "</div>";
      html += "<p class=\"recenzija-tekst\">Rating: " + escapeHtml(ocena.vrednost) + "/5</p>";
      html += "</article>";
    }
  }

  html += "</div>";
  return html;
}

function prikaziFormuOceneKnjige(prijavljenId, postojecaOcenaKnjige) {
  var html = "<div class=\"recenzija-forma\">";

  if (!prijavljenId) {
    html += "<p class=\"poruka-prazno\">You must be logged in to rate this book.</p>";
    html += "<form class=\"forma\" action=\"#\" method=\"get\" onsubmit=\"return false;\">";
    html += "<div class=\"polje\">";
    html += "<label for=\"ocena-knjige-vrednost\">Your Rating</label>";
    html += "<select id=\"ocena-knjige-vrednost\" disabled><option>Select a rating</option></select>";
    html += "</div>";
    html += "<div class=\"forma-akcije\">";
    html += "<button type=\"button\" class=\"dugme dugme-primarno\" disabled>Save Rating</button>";
    html += "</div></form>";
  } else {
    html += "<form class=\"forma\" action=\"#\" method=\"get\" onsubmit=\"return false;\">";
    html += "<div class=\"polje\">";
    html += "<label for=\"ocena-knjige-vrednost\">Your Rating</label>";
    html += "<select id=\"ocena-knjige-vrednost\">";
    html += "<option value=\"\">Select a rating</option>";
    for (var i = 1; i <= 5; i++) {
      var selected = Number(postojecaOcenaKnjige) === i ? " selected" : "";
      html += "<option value=\"" + i + "\"" + selected + ">" + i + "</option>";
    }
    html += "</select>";
    html += "</div>";
    html += "<p class=\"greska sakriveno\" id=\"ocena-knjige-greska\"></p>";
    html += "<div class=\"forma-akcije\">";
    html += "<button type=\"button\" class=\"dugme dugme-primarno\" id=\"dugme-sacuvaj-ocenu-knjige\">Save Rating</button>";
    html += "</div></form>";
  }

  html += "</div>";
  return html;
}

function poveziFormuOceneKnjige(idKnjige, prijavljenId, postojecaOcenaKnjigeId) {
  var dugme = document.getElementById("dugme-sacuvaj-ocenu-knjige");
  var select = document.getElementById("ocena-knjige-vrednost");
  var greskaEl = document.getElementById("ocena-knjige-greska");

  if (!dugme || !select) {
    return;
  }

  dugme.addEventListener("click", function () {
    var vrednost = Number(select.value);

    if (vrednost < 1 || vrednost > 5) {
      if (greskaEl) {
        greskaEl.textContent = "Please select a rating from 1 to 5.";
        greskaEl.classList.remove("sakriveno");
      }
      return;
    }

    if (greskaEl) {
      greskaEl.classList.add("sakriveno");
    }

    var stariTekst = dugme.textContent;
    dugme.textContent = "Saving...";
    dugme.disabled = true;

    var podatak = {
      vrednost: vrednost,
      datum: danasnjiDatum(),
      idKnjige: idKnjige,
      idKorisnika: prijavljenId
    };

    if (postojecaOcenaKnjigeId) {
      izmeniUFirebase("oceneKnjiga", postojecaOcenaKnjigeId, podatak, function () {
        ucitajDetaljKnjige();
      }, function () {
        if (greskaEl) {
          greskaEl.textContent = "Error updating rating.";
          greskaEl.classList.remove("sakriveno");
        }
        dugme.textContent = stariTekst;
        dugme.disabled = false;
      });
    } else {
      dodajUFirebase("oceneKnjiga", podatak, function () {
        ucitajDetaljKnjige();
      }, function () {
        if (greskaEl) {
          greskaEl.textContent = "Error saving rating.";
          greskaEl.classList.remove("sakriveno");
        }
        dugme.textContent = stariTekst;
        dugme.disabled = false;
      });
    }
  });
}

function prikaziRecenzijeZaKnjigu(idKnjige, recenzije, korisnici) {
  var lista = pretvoriUListu(recenzije);
  var filtrirane = [];

  for (var i = 0; i < lista.length; i++) {
    if (lista[i].podaci.idKnjige === idKnjige) {
      filtrirane.push(lista[i]);
    }
  }

  var html = "<div class=\"recenzija-lista-okvir\">";
  html += "<h3 class=\"recenzija-lista-naslov\">Previous Reviews</h3>";

  if (filtrirane.length === 0) {
    html += "<p class=\"poruka-prazno\">No reviews for this book yet.</p>";
  } else {
    for (var j = 0; j < filtrirane.length; j++) {
      var rec = filtrirane[j].podaci;
      var autorRec = imeKorisnika(korisnici, rec.idKorisnika);
      html += "<article class=\"recenzija\">";
      html += "<div class=\"recenzija-zaglavlje\">";
      html += "<span class=\"recenzija-autor\">" + escapeHtml(autorRec) + "</span>";
      html += "<span class=\"recenzija-datum\">" + escapeHtml(formatirajDatum(rec.datum)) + "</span>";
      html += "</div>";
      html += "<p class=\"recenzija-tekst\">" + escapeHtml(rec.tekst) + "</p>";
      html += "</article>";
    }
  }

  html += "</div>";
  return html;
}

function prikaziFormuRecenzije(prijavljenId, postojeciTekst) {
  var html = "<div class=\"recenzija-forma\">";

  if (!prijavljenId) {
    html += "<p class=\"poruka-prazno\">You must be logged in to leave a review. Use the Log In button in the menu.</p>";
    html += "<form class=\"forma\" action=\"#\" method=\"get\" onsubmit=\"return false;\">";
    html += "<div class=\"polje\">";
    html += "<label for=\"recenzija-tekst\">Your Review</label>";
    html += "<textarea id=\"recenzija-tekst\" rows=\"4\" placeholder=\"Share your thoughts...\" disabled></textarea>";
    html += "</div>";
    html += "<div class=\"forma-akcije\">";
    html += "<button type=\"button\" class=\"dugme dugme-primarno\" disabled>Post Review</button>";
    html += "</div></form>";
  } else {
    html += "<form class=\"forma\" action=\"#\" method=\"get\" onsubmit=\"return false;\">";
    html += "<div class=\"polje\">";
    html += "<label for=\"recenzija-tekst\">Your Review</label>";
    html += "<textarea id=\"recenzija-tekst\" rows=\"4\" placeholder=\"Share your thoughts...\">" + escapeHtml(postojeciTekst) + "</textarea>";
    html += "</div>";
    html += "<p class=\"greska sakriveno\" id=\"recenzija-greska\"></p>";
    html += "<div class=\"forma-akcije\">";
    html += "<button type=\"button\" class=\"dugme dugme-primarno\" id=\"dugme-objavi-recenziju\">Post Review</button>";
    html += "</div></form>";
  }

  html += "</div>";
  return html;
}

function poveziFormuRecenzije(idKnjige, prijavljenId, postojecaRecenzijaId) {
  var dugme = document.getElementById("dugme-objavi-recenziju");
  var textarea = document.getElementById("recenzija-tekst");
  var greskaEl = document.getElementById("recenzija-greska");

  if (!dugme || !textarea) {
    return;
  }

  dugme.addEventListener("click", function () {
    var tekst = textarea.value.trim();

    if (!tekst) {
      if (greskaEl) {
        greskaEl.textContent = "Please enter review text.";
        greskaEl.classList.remove("sakriveno");
      }
      return;
    }

    if (greskaEl) {
      greskaEl.classList.add("sakriveno");
    }

    var stariTekst = dugme.textContent;
    dugme.textContent = "Saving...";
    dugme.disabled = true;

    var podatak = {
      tekst: tekst,
      datum: danasnjiDatum(),
      idKnjige: idKnjige,
      idKorisnika: prijavljenId
    };

    if (postojecaRecenzijaId) {
      izmeniUFirebase("recenzije", postojecaRecenzijaId, podatak, function () {
        ucitajDetaljKnjige();
      }, function () {
        if (greskaEl) {
          greskaEl.textContent = "Error updating review.";
          greskaEl.classList.remove("sakriveno");
        }
        dugme.textContent = stariTekst;
        dugme.disabled = false;
      });
    } else {
      dodajUFirebase("recenzije", podatak, function () {
        ucitajDetaljKnjige();
      }, function () {
        if (greskaEl) {
          greskaEl.textContent = "Error saving review.";
          greskaEl.classList.remove("sakriveno");
        }
        dugme.textContent = stariTekst;
        dugme.disabled = false;
      });
    }
  });
}

window.addEventListener("DOMContentLoaded", function () {
  ucitajKatalog();
  ucitajDetaljKnjige();
  poveziPretraguKnjiga();
});
