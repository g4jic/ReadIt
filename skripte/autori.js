function ucitajKatalogAutora() {
  var kontejner = document.getElementById("katalog-autora-kontejner");
  if (!kontejner) {
    return;
  }

  kontejner.innerHTML = "<p class=\"poruka-prazno\">Учитавање аутора...</p>";

  ucitajSaFirebase("autori", function (autori) {
    prikaziKatalogAutora(autori, kontejner);
  }, function () {
    kontejner.innerHTML = "<p class=\"poruka-greska\">Грешка при учитавању аутора. Проверите Firebase URL.</p>";
  });
}

function prikaziKatalogAutora(autori, kontejner) {
  var lista = pretvoriUListu(autori);

  lista.sort(function (a, b) {
    var imeA = punoImeAutora(a.podaci);
    var imeB = punoImeAutora(b.podaci);
    return imeA.localeCompare(imeB, "sr");
  });

  if (lista.length === 0) {
    kontejner.innerHTML = "<p class=\"poruka-prazno\">Нема аутора у бази.</p>";
    return;
  }

  var html = "";
  for (var i = 0; i < lista.length; i++) {
    var stavka = lista[i];
    var autor = stavka.podaci;
    var slika = autor.slike && autor.slike[0] ? autor.slike[0] : "";
    var statusKlasa = klasaStatusaAutora(autor.status);

    html += "<a href=\"detaljiAutora.html?id=" + escapeHtml(stavka.id) + "\" class=\"autor-kartica\">";
    html += "<img src=\"" + escapeHtml(slika) + "\" alt=\"\" class=\"autor-slika\" />";
    html += "<div class=\"autor-sadrzaj\">";
    html += "<h3>" + escapeHtml(punoImeAutora(autor)) + "</h3>";
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
    kontejner.innerHTML = "<p class=\"poruka-greska\">Није пронађен ID аутора у адреси (?id=...).</p>";
    return;
  }

  kontejner.innerHTML = "<p class=\"poruka-prazno\">Учитавање...</p>";

  ucitajSaFirebase("autori/" + idAutora, function (autor) {
    if (!autor) {
      kontejner.innerHTML = "<p class=\"poruka-greska\">Аутор не постоји у бази.</p>";
      return;
    }

    ucitajSaFirebase("knjige", function (knjige) {
      ucitajSaFirebase("ocene", function (ocene) {
        prikaziDetaljAutora(idAutora, autor, knjige, ocene, kontejner);
      });
    });
  }, function () {
    kontejner.innerHTML = "<p class=\"poruka-greska\">Грешка при учитавању аутора.</p>";
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
    return "<p class=\"poruka-prazno\">Нема књига овог аутора у каталогу.</p>";
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

  document.title = "Ридит - " + punoImeAutora(autor);

  var html = "";
  html += "<div class=\"autor-detalj\">";
  html += "<div class=\"autor-hero\">";
  html += "<img class=\"autor-hero-avatar\" src=\"" + escapeHtml(slika) + "\" alt=\"\" />";
  html += "<div class=\"autor-hero-info\">";
  html += "<h1>" + escapeHtml(punoImeAutora(autor)) + "</h1>";
  html += "<p><span class=\"autor-status " + escapeHtml(statusKlasa) + "\">" + escapeHtml(autor.status || "") + "</span></p>";
  html += "<p>Рођен(а): " + escapeHtml(formatirajDatum(autor.datumRodjenja)) + "</p>";
  html += "<p>Телефон менаџера: " + escapeHtml(autor.kontaktTelefonMenadzera || "—") + "</p>";
  html += "</div></div>";

  html += "<div class=\"autor-detalj-telo\">";
  html += "<p class=\"autor-biografija\">" + escapeHtml(autor.biografija) + "</p>";

  html += "<div class=\"autor-meta-lista\">";
  html += "<div><strong>Награде:</strong> " + escapeHtml(formatirajBroj(autor.brojOsvojenihNagrada)) + "</div>";
  html += "<div><strong>Продати примерци:</strong> " + escapeHtml(formatirajBroj(autor.brojProdatihPrimeraka)) + "</div>";
  html += "</div>";

  html += "<div class=\"ocena-kutija\">";
  html += "<div class=\"ocena-prikaz\">";
  html += "<span class=\"ocena-broj\">" + escapeHtml(ocenaInfo.prosek.toFixed(1)) + "</span>";
  html += prikaziZvezdiceProsek(ocenaInfo.prosek);
  html += "</div>";
  html += "<p class=\"ocena-info\">Просечна оцена (" + escapeHtml(ocenaInfo.broj) + " гласова)</p>";
  html += "</div>";

  html += "<div id=\"kutija-ocena\">";
  html += "<h3>Оцените аутора</h3>";
  html += "<p class=\"ocena-objasnjenje\">Морате бити пријављени да бисте оставили оцену. Користите дугме „Пријава“ у менију.</p>";
  html += "<div class=\"zvezdice\" aria-hidden=\"true\">";
  for (var z = 1; z <= 5; z++) {
    html += "<span class=\"zvezdica\">★</span>";
  }
  html += "</div>";
  html += "<div class=\"forma-akcije\" style=\"margin-top:var(--razmak-m);\">";
  html += "<button type=\"button\" class=\"dugme dugme-primarno\" disabled>Сачувај оцену</button>";
  html += "</div></div>";

  html += "<section style=\"margin-top:var(--razmak-xl);\">";
  html += "<h2>Књиге аутора</h2>";
  html += prikaziKnjigeAutora(idAutora, knjige);
  html += "</section>";

  html += "</div></div>";

  kontejner.innerHTML = html;
}

window.addEventListener("DOMContentLoaded", function () {
  ucitajKatalogAutora();
  ucitajDetaljAutora();
});
