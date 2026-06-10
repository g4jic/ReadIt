var adminKnjigeCache = {};
var adminAutoriCache = {};
var izabranaKnjigaId = null;

function ucitajAdminKnjige() {
  var tbody = document.getElementById("admin-tabela-telo");
  if (!tbody) {
    return;
  }

  tbody.innerHTML = "<tr><td colspan=\"8\">Учитавање...</td></tr>";

  ucitajSaFirebase("knjige", function (knjige) {
    adminKnjigeCache = knjige || {};
    ucitajSaFirebase("autori", function (autori) {
      adminAutoriCache = autori || {};
      popuniSelectAutora();
      prikaziAdminTabelu();
    });
  });
}

function popuniSelectAutora() {
  var select = document.getElementById("knjiga-autor-input");
  if (!select) {
    return;
  }

  var lista = pretvoriUListu(adminAutoriCache);
  lista.sort(function (a, b) {
    var imeA = a.podaci.ime + a.podaci.prezime;
    var imeB = b.podaci.ime + b.podaci.prezime;
    return imeA.localeCompare(imeB, "sr");
  });

  select.innerHTML = "";
  for (var i = 0; i < lista.length; i++) {
    var opcija = document.createElement("option");
    opcija.value = lista[i].id;
    opcija.textContent = lista[i].podaci.ime + " " + lista[i].podaci.prezime;
    select.appendChild(opcija);
  }
}

function prikaziAdminTabelu() {
  var tbody = document.getElementById("admin-tabela-telo");
  var lista = pretvoriUListu(adminKnjigeCache);

  if (lista.length === 0) {
    tbody.innerHTML = "<tr><td colspan=\"8\">Нема књига.</td></tr>";
    return;
  }

  var html = "";
  for (var i = 0; i < lista.length; i++) {
    var stavka = lista[i];
    var knjiga = stavka.podaci;
    var slika = knjiga.slike && knjiga.slike[0] ? knjiga.slike[0] : "";
    var autorIme = imeAutora(adminAutoriCache, knjiga.idAutora);

    html += "<tr>";
    html += "<td><img src=\"" + escapeHtml(slika) + "\" alt=\"\" class=\"slicica\" /></td>";
    html += "<td>" + escapeHtml(knjiga.naziv) + "</td>";
    html += "<td>" + escapeHtml(autorIme) + "</td>";
    html += "<td>" + escapeHtml(knjiga.zanr) + "</td>";
    html += "<td>" + escapeHtml(knjiga.brojStrana) + "</td>";
    html += "<td>" + escapeHtml(formatirajCenu(knjiga.cena)) + "</td>";
    html += "<td>" + escapeHtml(knjiga.isbn) + "</td>";
    html += "<td><div class=\"tabela-akcije\">";
    html += "<button type=\"button\" class=\"dugme dugme-outline dugme-malo\" data-akcija=\"izmeni\" data-id=\"" + escapeHtml(stavka.id) + "\">Измени</button>";
    html += "<button type=\"button\" class=\"dugme dugme-opasno dugme-malo\" data-akcija=\"obrisi\" data-id=\"" + escapeHtml(stavka.id) + "\">Обриши</button>";
    html += "</div></td></tr>";
  }

  tbody.innerHTML = html;

  var dugmad = tbody.querySelectorAll("button[data-akcija]");
  for (var j = 0; j < dugmad.length; j++) {
    dugmad[j].addEventListener("click", obradiAkcijuTabele);
  }
}

function obradiAkcijuTabele(dogadjaj) {
  var dugme = dogadjaj.currentTarget;
  var akcija = dugme.getAttribute("data-akcija");
  var id = dugme.getAttribute("data-id");

  if (akcija === "izmeni") {
    popuniFormuKnjige(id);
  } else if (akcija === "obrisi") {
    otvoriDijalogBrisanja(id);
  }
}

function otvoriModalKnjige() {
  document.getElementById("modal-knjiga-forma").classList.add("otvoren");
}

function zatvoriModalKnjige() {
  document.getElementById("modal-knjiga-forma").classList.remove("otvoren");
}

function popuniFormuKnjige(id) {
  var knjiga = adminKnjigeCache[id];
  if (!knjiga) {
    return;
  }

  izabranaKnjigaId = id;
  sakrijPoruku("admin-modal-poruka");
  sakrijPoruku("admin-poruka");

  document.getElementById("knjiga-naziv-input").value = knjiga.naziv || "";
  document.getElementById("knjiga-opis-input").value = knjiga.opis || "";
  document.getElementById("knjiga-zanr-input").value = knjiga.zanr || "";
  document.getElementById("knjiga-format-input").value = knjiga.format || "Тврди повез";
  document.getElementById("knjiga-cena-input").value = knjiga.cena || "";
  document.getElementById("knjiga-strana-input").value = knjiga.brojStrana || "";
  document.getElementById("knjiga-isbn-input").value = knjiga.isbn || "";
  document.getElementById("knjiga-autor-input").value = knjiga.idAutora || "";

  var slikeTekst = "";
  if (knjiga.slike && knjiga.slike.length > 0) {
    slikeTekst = knjiga.slike.join(", ");
  }
  document.getElementById("knjiga-slike-input").value = slikeTekst;

  var naslovForme = document.getElementById("admin-forma-naslov");
  if (naslovForme) {
    naslovForme.textContent = "Измена књиге: " + knjiga.naziv;
  }

  otvoriModalKnjige();
}

function otvoriNovuKnjigu() {
  isprazniFormuKnjige();
  var naslovForme = document.getElementById("admin-forma-naslov");
  if (naslovForme) {
    naslovForme.textContent = "Нова књига";
  }
  otvoriModalKnjige();
}

function isprazniFormuKnjige() {
  izabranaKnjigaId = null;
  sakrijPoruku("admin-modal-poruka");
  sakrijPoruku("admin-poruka");

  document.getElementById("knjiga-naziv-input").value = "";
  document.getElementById("knjiga-opis-input").value = "";
  document.getElementById("knjiga-zanr-input").value = "";
  document.getElementById("knjiga-format-input").value = "Тврди повез";
  document.getElementById("knjiga-cena-input").value = "";
  document.getElementById("knjiga-strana-input").value = "";
  document.getElementById("knjiga-isbn-input").value = "";
  document.getElementById("knjiga-slike-input").value = "";
  if (document.getElementById("knjiga-autor-input").options.length > 0) {
    document.getElementById("knjiga-autor-input").selectedIndex = 0;
  }
}

function citajFormuKnjige() {
  var slikeRaw = document.getElementById("knjiga-slike-input").value.trim();
  var slikeNiz = [];
  if (slikeRaw) {
    var delovi = slikeRaw.split(",");
    for (var i = 0; i < delovi.length; i++) {
      var url = delovi[i].trim();
      if (url) {
        slikeNiz.push(url);
      }
    }
  }

  return {
    naziv: document.getElementById("knjiga-naziv-input").value.trim(),
    opis: document.getElementById("knjiga-opis-input").value.trim(),
    zanr: document.getElementById("knjiga-zanr-input").value.trim(),
    format: document.getElementById("knjiga-format-input").value,
    cena: document.getElementById("knjiga-cena-input").value,
    brojStrana: document.getElementById("knjiga-strana-input").value,
    idAutora: document.getElementById("knjiga-autor-input").value,
    isbn: document.getElementById("knjiga-isbn-input").value.trim(),
    slike: slikeNiz
  };
}

function sacuvajFormuKnjige() {
  var podatak = citajFormuKnjige();
  var greska = validirajKnjigu(podatak);

  if (greska) {
    prikaziPoruku("admin-modal-poruka", greska, "greska");
    return;
  }

  prikaziPoruku("admin-poruka", "Подаци су исправни.", "uspeh");
  zatvoriModalKnjige();
}

function otvoriDijalogBrisanja(id) {
  var knjiga = adminKnjigeCache[id];
  if (!knjiga) {
    return;
  }

  izabranaKnjigaId = id;
  var tekst = document.getElementById("modal-brisanje-tekst");
  tekst.textContent = "Да ли сте сигурни да желите да обришете књигу „" + knjiga.naziv + "“?";

  document.getElementById("modal-brisanje-knjige").classList.add("otvoren");
}

function zatvoriDijalogBrisanja() {
  document.getElementById("modal-brisanje-knjige").classList.remove("otvoren");
}

function potvrdiBrisanjeKnjige() {
  zatvoriDijalogBrisanja();
  prikaziPoruku("admin-poruka", "Брисање је потврђено.", "uspeh");
  izabranaKnjigaId = null;
}

function poveziAdminDogadjaje() {
  var dugmeNova = document.getElementById("dugme-nova-knjiga");
  if (dugmeNova) {
    dugmeNova.addEventListener("click", otvoriNovuKnjigu);
  }

  var dugmeSacuvaj = document.getElementById("dugme-sacuvaj-knjiga");
  if (dugmeSacuvaj) {
    dugmeSacuvaj.addEventListener("click", sacuvajFormuKnjige);
  }

  var zatvoriFormu = document.getElementById("modal-knjiga-zatvori");
  var otkaziFormu = document.getElementById("modal-knjiga-otkazi");
  var pozadinaForme = document.getElementById("modal-knjiga-forma");

  if (zatvoriFormu) zatvoriFormu.addEventListener("click", zatvoriModalKnjige);
  if (otkaziFormu) otkaziFormu.addEventListener("click", zatvoriModalKnjige);
  if (pozadinaForme) {
    pozadinaForme.addEventListener("click", function (e) {
      if (e.target === pozadinaForme) {
        zatvoriModalKnjige();
      }
    });
  }

  var zatvori = document.getElementById("modal-brisanje-zatvori");
  var otkazi = document.getElementById("modal-brisanje-otkazi");
  var potvrdi = document.getElementById("modal-brisanje-potvrdi");
  var pozadina = document.getElementById("modal-brisanje-knjige");

  if (zatvori) zatvori.addEventListener("click", zatvoriDijalogBrisanja);
  if (otkazi) otkazi.addEventListener("click", zatvoriDijalogBrisanja);
  if (potvrdi) potvrdi.addEventListener("click", potvrdiBrisanjeKnjige);
  if (pozadina) {
    pozadina.addEventListener("click", function (e) {
      if (e.target === pozadina) {
        zatvoriDijalogBrisanja();
      }
    });
  }
}

window.addEventListener("DOMContentLoaded", function () {
  ucitajAdminKnjige();
  poveziAdminDogadjaje();
});
