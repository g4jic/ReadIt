var adminAutoriCache = {};
var izabraniAutorId = null;

function ucitajAdminAutore() {
  var tbody = document.getElementById("admin-tabela-telo");
  if (!tbody) {
    return;
  }

  tbody.innerHTML = "<tr><td colspan=\"7\">Loading...</td></tr>";

  ucitajSaFirebase("autori", function (autori) {
    adminAutoriCache = autori || {};
    prikaziAdminTabeluAutora();
  }, function () {
    tbody.innerHTML = "<tr><td colspan=\"7\">Error loading authors.</td></tr>";
  });
}

function prikaziAdminTabeluAutora() {
  var tbody = document.getElementById("admin-tabela-telo");
  var lista = pretvoriUListu(adminAutoriCache);

  lista.sort(function (a, b) {
    return punoImeAutora(a.podaci).localeCompare(punoImeAutora(b.podaci), "en");
  });

  if (lista.length === 0) {
    tbody.innerHTML = "<tr><td colspan=\"7\">No authors found.</td></tr>";
    return;
  }

  var html = "";
  for (var i = 0; i < lista.length; i++) {
    var stavka = lista[i];
    var autor = stavka.podaci;
    var slika = autor.slike && autor.slike[0] ? autor.slike[0] : "";

    html += "<tr>";
    html += "<td><img src=\"" + escapeHtml(slika) + "\" alt=\"\" class=\"slicica\" /></td>";
    html += "<td>" + escapeHtml(punoImeAutora(autor)) + "</td>";
    html += "<td>" + escapeHtml(autor.status) + "</td>";
    html += "<td>" + escapeHtml(autor.brojOsvojenihNagrada) + "</td>";
    html += "<td>" + escapeHtml(formatirajBroj(autor.brojProdatihPrimeraka)) + "</td>";
    html += "<td>" + escapeHtml(autor.kontaktTelefonMenadzera) + "</td>";
    html += "<td><div class=\"tabela-akcije\">";
    html += "<button type=\"button\" class=\"dugme dugme-outline dugme-malo\" data-akcija=\"izmeni\" data-id=\"" + escapeHtml(stavka.id) + "\">Edit</button>";
    html += "<button type=\"button\" class=\"dugme dugme-opasno dugme-malo\" data-akcija=\"obrisi\" data-id=\"" + escapeHtml(stavka.id) + "\">Delete</button>";
    html += "</div></td></tr>";
  }

  tbody.innerHTML = html;

  var dugmad = tbody.querySelectorAll("button[data-akcija]");
  for (var j = 0; j < dugmad.length; j++) {
    dugmad[j].addEventListener("click", obradiAkcijuTabeleAutora);
  }
}

function obradiAkcijuTabeleAutora(dogadjaj) {
  var dugme = dogadjaj.currentTarget;
  var akcija = dugme.getAttribute("data-akcija");
  var id = dugme.getAttribute("data-id");

  if (akcija === "izmeni") {
    popuniFormuAutora(id);
  } else if (akcija === "obrisi") {
    otvoriDijalogBrisanjaAutora(id);
  }
}

function otvoriModalAutora() {
  document.getElementById("modal-autor-forma").classList.add("otvoren");
}

function zatvoriModalAutora() {
  document.getElementById("modal-autor-forma").classList.remove("otvoren");
}

function popuniFormuAutora(id) {
  var autor = adminAutoriCache[id];
  if (!autor) {
    return;
  }

  izabraniAutorId = id;
  sakrijPoruku("admin-modal-poruka");
  sakrijPoruku("admin-poruka");


  document.getElementById("autor-ime-input").value = autor.ime || "";
  document.getElementById("autor-prezime-input").value = autor.prezime || "";
  document.getElementById("autor-biografija-input").value = autor.biografija || "";
  document.getElementById("autor-status-input").value = autor.status || "";
  document.getElementById("autor-datum-input").value = autor.datumRodjenja || "";
  document.getElementById("autor-nagrade-input").value = autor.brojOsvojenihNagrada != null ? autor.brojOsvojenihNagrada : "";
  document.getElementById("autor-primeraka-input").value = autor.brojProdatihPrimeraka != null ? autor.brojProdatihPrimeraka : "";
  document.getElementById("autor-telefon-input").value = autor.kontaktTelefonMenadzera || "";

  var slikeTekst = "";
  if (autor.slike && autor.slike.length > 0) {
    slikeTekst = autor.slike.join(", ");
  }
  document.getElementById("autor-slike-input").value = slikeTekst;

  var naslovForme = document.getElementById("admin-forma-naslov");
  if (naslovForme) {
    naslovForme.textContent = "Edit Author: " + punoImeAutora(autor);
  }

  otvoriModalAutora();
}

function otvoriNovogAutora() {
  isprazniFormuAutora();
  var naslovForme = document.getElementById("admin-forma-naslov");
  if (naslovForme) {
    naslovForme.textContent = "New Author";
  }
  otvoriModalAutora();
}

function isprazniFormuAutora() {
  izabraniAutorId = null;
  sakrijPoruku("admin-modal-poruka");
  sakrijPoruku("admin-poruka");

  document.getElementById("autor-ime-input").value = "";
  document.getElementById("autor-prezime-input").value = "";
  document.getElementById("autor-biografija-input").value = "";
  document.getElementById("autor-status-input").value = "";
  document.getElementById("autor-datum-input").value = "";
  document.getElementById("autor-nagrade-input").value = "";
  document.getElementById("autor-primeraka-input").value = "";
  document.getElementById("autor-telefon-input").value = "";
  document.getElementById("autor-slike-input").value = "";
}

function citajFormuAutora() {
  var slikeRaw = document.getElementById("autor-slike-input").value.trim();
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
    ime: document.getElementById("autor-ime-input").value.trim(),
    prezime: document.getElementById("autor-prezime-input").value.trim(),
    biografija: document.getElementById("autor-biografija-input").value.trim(),
    status: document.getElementById("autor-status-input").value.trim(),
    datumRodjenja: document.getElementById("autor-datum-input").value,
    brojOsvojenihNagrada: document.getElementById("autor-nagrade-input").value,
    brojProdatihPrimeraka: document.getElementById("autor-primeraka-input").value,
    kontaktTelefonMenadzera: document.getElementById("autor-telefon-input").value.trim(),
    slike: slikeNiz
  };
}

function sacuvajFormuAutora() {
  var podatak = citajFormuAutora();
  var greska = validirajAutora(podatak);

  if (greska) {
    prikaziPoruku("admin-modal-poruka", greska, "greska");
    return;
  }

  var dugme = document.getElementById("dugme-sacuvaj-autor");
  var stariTekst = dugme.textContent;
  dugme.textContent = "Saving...";
  dugme.disabled = true;

  if (izabraniAutorId) {
    izmeniUFirebase("autori", izabraniAutorId, podatak, function () {
      prikaziPoruku("admin-poruka", "Author updated successfully.", "uspeh");
      zatvoriModalAutora();
      ucitajAdminAutore();
      dugme.textContent = stariTekst;
      dugme.disabled = false;
    }, function () {
      prikaziPoruku("admin-modal-poruka", "Error updating author.", "greska");
      dugme.textContent = stariTekst;
      dugme.disabled = false;
    });
  } else {
    dodajUFirebase("autori", podatak, function () {
      prikaziPoruku("admin-poruka", "Author added successfully.", "uspeh");
      zatvoriModalAutora();
      ucitajAdminAutore();
      dugme.textContent = stariTekst;
      dugme.disabled = false;
    }, function () {
      prikaziPoruku("admin-modal-poruka", "Error adding author.", "greska");
      dugme.textContent = stariTekst;
      dugme.disabled = false;
    });
  }
}

function otvoriDijalogBrisanjaAutora(id) {
  var autor = adminAutoriCache[id];
  if (!autor) {
    return;
  }

  izabraniAutorId = id;
  var tekst = document.getElementById("modal-brisanje-tekst");
  tekst.textContent = "Are you sure you want to delete the author \"" + punoImeAutora(autor) + "\"?";

  document.getElementById("modal-brisanje-autora").classList.add("otvoren");
}

function zatvoriDijalogBrisanjaAutora() {
  document.getElementById("modal-brisanje-autora").classList.remove("otvoren");
}

function potvrdiBrisanjeAutora() {
  var idZaBrisanje = izabraniAutorId;
  var dugme = document.getElementById("modal-brisanje-potvrdi");
  var stariTekst = dugme ? dugme.textContent : "Delete";
  if (dugme) {
    dugme.textContent = "Deleting...";
    dugme.disabled = true;
  }

  obrisiIzFirebase("autori", idZaBrisanje, function () {
    prikaziPoruku("admin-poruka", "Author deleted successfully.", "uspeh");
    izabraniAutorId = null;
    zatvoriDijalogBrisanjaAutora();
    ucitajAdminAutore();
    if (dugme) {
      dugme.textContent = stariTekst;
      dugme.disabled = false;
    }
  }, function () {
    prikaziPoruku("admin-poruka", "Error deleting author.", "greska");
    izabraniAutorId = null;
    zatvoriDijalogBrisanjaAutora();
    if (dugme) {
      dugme.textContent = stariTekst;
      dugme.disabled = false;
    }
  });
}

function poveziAdminAutorDogadjaje() {
  var dugmeNovi = document.getElementById("dugme-novi-autor");
  if (dugmeNovi) {
    dugmeNovi.addEventListener("click", otvoriNovogAutora);
  }

  var dugmeSacuvaj = document.getElementById("dugme-sacuvaj-autor");
  if (dugmeSacuvaj) {
    dugmeSacuvaj.addEventListener("click", sacuvajFormuAutora);
  }

  var zatvoriFormu = document.getElementById("modal-autor-zatvori");
  var otkaziFormu = document.getElementById("modal-autor-otkazi");
  var pozadinaForme = document.getElementById("modal-autor-forma");

  if (zatvoriFormu) zatvoriFormu.addEventListener("click", zatvoriModalAutora);
  if (otkaziFormu) otkaziFormu.addEventListener("click", zatvoriModalAutora);
  if (pozadinaForme) {
    pozadinaForme.addEventListener("click", function (e) {
      if (e.target === pozadinaForme) {
        zatvoriModalAutora();
      }
    });
  }

  var zatvori = document.getElementById("modal-brisanje-zatvori");
  var otkazi = document.getElementById("modal-brisanje-otkazi");
  var potvrdi = document.getElementById("modal-brisanje-potvrdi");
  var pozadina = document.getElementById("modal-brisanje-autora");

  if (zatvori) zatvori.addEventListener("click", zatvoriDijalogBrisanjaAutora);
  if (otkazi) otkazi.addEventListener("click", zatvoriDijalogBrisanjaAutora);
  if (potvrdi) potvrdi.addEventListener("click", potvrdiBrisanjeAutora);
  if (pozadina) {
    pozadina.addEventListener("click", function (e) {
      if (e.target === pozadina) {
        zatvoriDijalogBrisanjaAutora();
      }
    });
  }
}

window.addEventListener("DOMContentLoaded", function () {
  ucitajAdminAutore();
  poveziAdminAutorDogadjaje();
});
