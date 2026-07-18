var adminKnjigeCache = {};
var adminAutoriCache = {};
var izabranaKnjigaId = null;

function ucitajAdminKnjige() {
  var tbody = document.getElementById("admin-tabela-telo");
  if (!tbody) {
    return;
  }

  tbody.innerHTML = "<tr><td colspan=\"8\">Loading...</td></tr>";

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
    return imeA.localeCompare(imeB, "en");
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
    tbody.innerHTML = "<tr><td colspan=\"8\">No books found.</td></tr>";
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
    html += "<button type=\"button\" class=\"dugme dugme-outline dugme-malo\" data-akcija=\"izmeni\" data-id=\"" + escapeHtml(stavka.id) + "\">Edit</button>";
    html += "<button type=\"button\" class=\"dugme dugme-opasno dugme-malo\" data-akcija=\"obrisi\" data-id=\"" + escapeHtml(stavka.id) + "\">Delete</button>";
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
  document.getElementById("knjiga-format-input").value = knjiga.format || "Hardcover";
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
    naslovForme.textContent = "Edit Book: " + knjiga.naziv;
  }

  otvoriModalKnjige();
}

function otvoriNovuKnjigu() {
  isprazniFormuKnjige();
  var naslovForme = document.getElementById("admin-forma-naslov");
  if (naslovForme) {
    naslovForme.textContent = "New Book";
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
  document.getElementById("knjiga-format-input").value = "Hardcover";
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

  var dugme = document.getElementById("dugme-sacuvaj-knjiga");
  var stariTekst = dugme.textContent;
  dugme.textContent = "Saving...";
  dugme.disabled = true;

  if (izabranaKnjigaId) {
    izmeniUFirebase("knjige", izabranaKnjigaId, podatak, function () {
      prikaziPoruku("admin-poruka", "Book updated successfully.", "uspeh");
      zatvoriModalKnjige();
      ucitajAdminKnjige();
      dugme.textContent = stariTekst;
      dugme.disabled = false;
    }, function () {
      prikaziPoruku("admin-modal-poruka", "Error updating book.", "greska");
      dugme.textContent = stariTekst;
      dugme.disabled = false;
    });
  } else {
    dodajUFirebase("knjige", podatak, function () {
      prikaziPoruku("admin-poruka", "Book added successfully.", "uspeh");
      zatvoriModalKnjige();
      ucitajAdminKnjige();
      dugme.textContent = stariTekst;
      dugme.disabled = false;
    }, function () {
      prikaziPoruku("admin-modal-poruka", "Error adding book.", "greska");
      dugme.textContent = stariTekst;
      dugme.disabled = false;
    });
  }
}

function otvoriDijalogBrisanja(id) {
  var knjiga = adminKnjigeCache[id];
  if (!knjiga) {
    return;
  }

  izabranaKnjigaId = id;
  var tekst = document.getElementById("modal-brisanje-tekst");
  tekst.textContent = "Are you sure you want to delete the book \"" + knjiga.naziv + "\"?";

  document.getElementById("modal-brisanje-knjige").classList.add("otvoren");
}

function zatvoriDijalogBrisanja() {
  document.getElementById("modal-brisanje-knjige").classList.remove("otvoren");
}

function potvrdiBrisanjeKnjige() {
  var idZaBrisanje = izabranaKnjigaId;
  var dugme = document.getElementById("modal-brisanje-potvrdi");
  var stariTekst = dugme ? dugme.textContent : "Delete";

  if (dugme) {
    dugme.textContent = "Deleting...";
    dugme.disabled = true;
  }

  obrisiIzFirebase("knjige", idZaBrisanje, function () {
    prikaziPoruku("admin-poruka", "Book deleted successfully.", "uspeh");
    izabranaKnjigaId = null;
    zatvoriDijalogBrisanja();
    ucitajAdminKnjige();
    if (dugme) {
      dugme.textContent = stariTekst;
      dugme.disabled = false;
    }
  }, function () {
    prikaziPoruku("admin-poruka", "Error deleting book.", "greska");
    izabranaKnjigaId = null;
    zatvoriDijalogBrisanja();
    if (dugme) {
      dugme.textContent = stariTekst;
      dugme.disabled = false;
    }
  });
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
