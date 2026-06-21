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
  var html = "<div class=\"zvezdice samo-citanje\" style=\"margin-right: 10px; font-size: 1rem;\" aria-hidden=\"true\">";
  for (var i = 1; i <= 5; i++) {
    var klasa = i <= vrednost ? "zvezdica aktivna" : "zvezdica";
    html += "<span class=\"" + klasa + "\">★</span>";
  }
  html += "</div>";
  return html;
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

  html += "<ul style=\"list-style:none; padding:0; margin-top:var(--razmak-m);\">";
  for (var j = 0; j < mojeOcene.length; j++) {
    var ocena = mojeOcene[j].podaci;
    var autor = autori ? autori[ocena.idAutora] : null;
    var ime = autor ? punoImeAutora(autor) : "Непознат аутор";

    html += "<li style=\"display:flex; align-items:center; margin-bottom:var(--razmak-s); padding-bottom:var(--razmak-s); border-bottom:1px solid var(--boja-ivice);\">";
    html += prikaziZvezdiceOcena(Number(ocena.vrednost));
    html += "<a href=\"detaljiAutora.html?id=" + escapeHtml(ocena.idAutora) + "\" style=\"font-weight:600; color:var(--boja-primarna); text-decoration:none;\">" + escapeHtml(ime) + "</a>";
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
  ucitajMojeOcene(prijavljenId);
});
