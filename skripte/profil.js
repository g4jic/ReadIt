function ucitajPodatkeKorisnika(prijavljenId) {
  var kontejner = document.getElementById("profil-osnovni-podaci");
  if (!kontejner) {
    return;
  }

  ucitajSaFirebase("korisnici/" + prijavljenId, function (korisnik) {
    if (!korisnik) {
      kontejner.innerHTML = "<p class=\"poruka-greska\">Грешка: Корисник не постоји.</p>";
      return;
    }

    var imeStr = korisnik.ime || "";
    var prezimeStr = korisnik.prezime || "";
    var prvoSlovoIme = imeStr.charAt(0) || "";
    var prvoSlovoPrezime = prezimeStr.charAt(0) || "";
    var inicijali = prvoSlovoIme + prvoSlovoPrezime;

    var html = "";
    html += "<div class=\"profil-avatar\" aria-hidden=\"true\">" + escapeHtml(inicijali.toUpperCase()) + "</div>";
    html += "<div class=\"profil-telo-podaci\">";
    html += "<p class=\"profil-ime\">" + escapeHtml(imeStr) + " " + escapeHtml(prezimeStr) + "</p>";
    html += "<p class=\"profil-korisnicko\">@" + escapeHtml(korisnik.korisnickoIme || "korisnik") + "</p>";
    html += "<ul class=\"profil-lista\">";
    html += "<li><span class=\"profil-oznaka\">E-mail:</span> " + escapeHtml(korisnik.email) + "</li>";
    if (korisnik.datumRodjenja) {
      html += "<li><span class=\"profil-oznaka\">Рођен(а):</span> " + escapeHtml(formatirajDatum(korisnik.datumRodjenja)) + "</li>";
    }
    if (korisnik.adresa) {
      html += "<li><span class=\"profil-oznaka\">Адреса:</span> " + escapeHtml(korisnik.adresa) + "</li>";
    }
    if (korisnik.zanimanje) {
      html += "<li><span class=\"profil-oznaka\">Занимање:</span> " + escapeHtml(korisnik.zanimanje) + "</li>";
    }
    html += "</ul>";
    html += "</div>";

    kontejner.innerHTML = html;
  }, function () {
    kontejner.innerHTML = "<p class=\"poruka-greska\">Грешка при учитавању података о кориснику.</p>";
  });
}

function prikaziZvezdiceOcena(vrednost) {
  var html = "<div class=\"zvezdice samo-citanje\" aria-hidden=\"true\">";
  for (var i = 1; i <= 5; i++) {
    var klasa = i <= vrednost ? "zvezdica aktivna" : "zvezdica";
    html += "<span class=\"" + klasa + "\">★</span>";
  }
  html += "</div>";
  return html;
}

function prikaziMojeRecenzije(prijavljenId, recenzije, knjige) {
  var kontejner = document.getElementById("moje-recenzije-kontejner");
  if (!kontejner) {
    return;
  }

  var listaRecenzija = pretvoriUListu(recenzije);
  var mojeRecenzije = [];

  for (var i = 0; i < listaRecenzija.length; i++) {
    if (listaRecenzija[i].podaci.idKorisnika === prijavljenId) {
      mojeRecenzije.push(listaRecenzija[i]);
    }
  }

  var html = "<h2 class=\"profil-podnaslov-karte\">Моје рецензије</h2>";

  if (mojeRecenzije.length === 0) {
    html += "<p class=\"poruka-prazno\">Још нисте написали ниједну рецензију.</p>";
    kontejner.innerHTML = html;
    return;
  }

  html += "<ul class=\"profil-lista-stavki\">";
  for (var j = 0; j < mojeRecenzije.length; j++) {
    var stavka = mojeRecenzije[j];
    var recenzija = stavka.podaci;
    var knjiga = knjige ? knjige[recenzija.idKnjige] : null;
    var nazivKnjige = knjiga ? knjiga.naziv : "Непозната књига";

    html += "<li class=\"profil-stavka\">";
    html += "<div class=\"profil-stavka-levo\">";
    html += "<a href=\"detaljiKnjige.html?id=" + escapeHtml(recenzija.idKnjige) + "\" class=\"profil-stavka-naslov\">" + escapeHtml(nazivKnjige) + "</a>";
    html += "<p class=\"profil-stavka-tekst\">" + escapeHtml(recenzija.tekst) + "</p>";
    html += "</div>";
    html += "<div class=\"profil-stavka-desno\">";
    html += "<span class=\"profil-stavka-datum\">" + escapeHtml(formatirajDatum(recenzija.datum)) + "</span>";
    html += "<button type=\"button\" class=\"dugme dugme-opasno dugme-malo\" data-obrisi-recenziju=\"" + escapeHtml(stavka.id) + "\">Обриши</button>";
    html += "</div>";
    html += "</li>";
  }
  html += "</ul>";

  kontejner.innerHTML = html;
}

function ucitajMojeRecenzije(prijavljenId) {
  var kontejner = document.getElementById("moje-recenzije-kontejner");
  if (!kontejner) {
    return;
  }

  ucitajSaFirebase("recenzije", function (recenzije) {
    ucitajSaFirebase("knjige", function (knjige) {
      prikaziMojeRecenzije(prijavljenId, recenzije, knjige);
    }, function () {
      kontejner.innerHTML = "<h2 class=\"profil-podnaslov-karte\">Моје рецензије</h2><p class=\"poruka-greska\">Грешка при учитавању књига.</p>";
    });
  }, function () {
    kontejner.innerHTML = "<h2 class=\"profil-podnaslov-karte\">Моје рецензије</h2><p class=\"poruka-greska\">Грешка при учитавању рецензија.</p>";
  });
}

function prikaziMojeOcene(prijavljenId, ocene, autori) {
  var kontejner = document.getElementById("moje-ocene-kontejner");
  if (!kontejner) {
    return;
  }

  var listaOcena = pretvoriUListu(ocene);
  var mojeOcene = [];

  for (var i = 0; i < listaOcena.length; i++) {
    if (listaOcena[i].podaci.idKorisnika === prijavljenId) {
      mojeOcene.push(listaOcena[i]);
    }
  }

  var html = "<h2 class=\"profil-podnaslov-karte\">Моје оцене аутора</h2>";

  if (mojeOcene.length === 0) {
    html += "<p class=\"poruka-prazno\">Још нисте оценили ниједног аутора.</p>";
    kontejner.innerHTML = html;
    return;
  }

  html += "<ul class=\"profil-lista-stavki\">";
  for (var j = 0; j < mojeOcene.length; j++) {
    var stavka = mojeOcene[j];
    var ocena = stavka.podaci;
    var autor = autori ? autori[ocena.idAutora] : null;
    var ime = autor ? punoImeAutora(autor) : "Непознат аутор";

    html += "<li class=\"profil-stavka\">";
    html += "<div class=\"profil-stavka-levo\">";
    html += prikaziZvezdiceOcena(Number(ocena.vrednost));
    html += "<a href=\"detaljiAutora.html?id=" + escapeHtml(ocena.idAutora) + "\" class=\"profil-stavka-naslov\">" + escapeHtml(ime) + "</a>";
    html += "</div>";
    html += "<div class=\"profil-stavka-desno\">";
    html += "<span class=\"profil-stavka-datum\">" + escapeHtml(formatirajDatum(ocena.datum)) + "</span>";
    html += "<button type=\"button\" class=\"dugme dugme-opasno dugme-malo\" data-obrisi-ocenu=\"" + escapeHtml(stavka.id) + "\">Обриши</button>";
    html += "</div>";
    html += "</li>";
  }
  html += "</ul>";

  kontejner.innerHTML = html;
}

function ucitajMojeOcene(prijavljenId) {
  var kontejner = document.getElementById("moje-ocene-kontejner");
  if (!kontejner) {
    return;
  }

  ucitajSaFirebase("ocene", function (ocene) {
    ucitajSaFirebase("autori", function (autori) {
      prikaziMojeOcene(prijavljenId, ocene, autori);
    }, function () {
      kontejner.innerHTML = "<h2 class=\"profil-podnaslov-karte\">Моје оцене аутора</h2><p class=\"poruka-greska\">Грешка при учитавању аутора.</p>";
    });
  }, function () {
    kontejner.innerHTML = "<h2 class=\"profil-podnaslov-karte\">Моје оцене аутора</h2><p class=\"poruka-greska\">Грешка при учитавању оцена.</p>";
  });
}

function poveziBrisanjeNaProfilu(prijavljenId) {
  var akcijaBrisanja = null;

  function otvoriDijalogBrisanja(tekst, akcija) {
    var modal = document.getElementById("modal-brisanje-profil");
    var tekstEl = document.getElementById("modal-brisanje-profil-tekst");
    var greskaEl = document.getElementById("modal-brisanje-profil-greska");
    if (!modal || !tekstEl) {
      return;
    }
    tekstEl.textContent = tekst;
    if (greskaEl) {
      greskaEl.textContent = "";
      greskaEl.classList.add("sakriveno");
    }
    akcijaBrisanja = akcija;
    modal.classList.add("otvoren");
  }

  function zatvoriDijalogBrisanja() {
    var modal = document.getElementById("modal-brisanje-profil");
    if (modal) {
      modal.classList.remove("otvoren");
    }
    akcijaBrisanja = null;
  }

  var zatvori = document.getElementById("modal-brisanje-profil-zatvori");
  var otkazi = document.getElementById("modal-brisanje-profil-otkazi");
  var potvrdi = document.getElementById("modal-brisanje-profil-potvrdi");
  var pozadina = document.getElementById("modal-brisanje-profil");

  if (zatvori) {
    zatvori.addEventListener("click", zatvoriDijalogBrisanja);
  }
  if (otkazi) {
    otkazi.addEventListener("click", zatvoriDijalogBrisanja);
  }
  if (pozadina) {
    pozadina.addEventListener("click", function (e) {
      if (e.target === pozadina) {
        zatvoriDijalogBrisanja();
      }
    });
  }
  if (potvrdi) {
    potvrdi.addEventListener("click", function () {
      if (!akcijaBrisanja) {
        return;
      }
      var greskaEl = document.getElementById("modal-brisanje-profil-greska");
      var stariTekst = potvrdi.textContent;
      potvrdi.textContent = "Брисање...";
      potvrdi.disabled = true;
      akcijaBrisanja(function () {
        zatvoriDijalogBrisanja();
        potvrdi.textContent = stariTekst;
        potvrdi.disabled = false;
      }, function (poruka) {
        if (greskaEl) {
          greskaEl.textContent = poruka;
          greskaEl.classList.remove("sakriveno");
        }
        potvrdi.textContent = stariTekst;
        potvrdi.disabled = false;
      });
    });
  }

  var kontejnerRecenzije = document.getElementById("moje-recenzije-kontejner");
  if (kontejnerRecenzije) {
    kontejnerRecenzije.addEventListener("click", function (e) {
      var dugme = e.target;
      if (!dugme.getAttribute || !dugme.getAttribute("data-obrisi-recenziju")) {
        return;
      }

      var idRecenzije = dugme.getAttribute("data-obrisi-recenziju");
      otvoriDijalogBrisanja("Да ли сте сигурни да желите да обришете рецензију?", function (onUspeh, onGreska) {
        obrisiIzFirebase("recenzije", idRecenzije, function () {
          ucitajMojeRecenzije(prijavljenId);
          onUspeh();
        }, function () {
          onGreska("Грешка при брисању рецензије.");
        });
      });
    });
  }

  var kontejnerOcene = document.getElementById("moje-ocene-kontejner");
  if (kontejnerOcene) {
    kontejnerOcene.addEventListener("click", function (e) {
      var dugme = e.target;
      if (!dugme.getAttribute || !dugme.getAttribute("data-obrisi-ocenu")) {
        return;
      }

      var idOcene = dugme.getAttribute("data-obrisi-ocenu");
      otvoriDijalogBrisanja("Да ли сте сигурни да желите да обришете оцену?", function (onUspeh, onGreska) {
        obrisiIzFirebase("ocene", idOcene, function () {
          ucitajMojeOcene(prijavljenId);
          onUspeh();
        }, function () {
          onGreska("Грешка при брисању оцене.");
        });
      });
    });
  }
}

window.addEventListener("DOMContentLoaded", function () {
  var prijavljenId = localStorage.getItem("prijavljenKorisnik");
  if (!prijavljenId) {
    var main = document.querySelector("main");
    if (main) {
      main.innerHTML = "<div class=\"naslov-sekcije\"><h1>Мој профил</h1></div><p class=\"poruka-greska\" style=\"text-align:center; margin-top:var(--razmak-xl);\">Морате бити пријављени да бисте видели ову страницу.</p>";
    }
    return;
  }

  ucitajPodatkeKorisnika(prijavljenId);
  ucitajMojeRecenzije(prijavljenId);
  ucitajMojeOcene(prijavljenId);
  poveziBrisanjeNaProfilu(prijavljenId);
});
