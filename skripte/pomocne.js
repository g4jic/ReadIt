var ISBN_REGEX = /^978(?:-?\d){10}$|^979(?:-?\d){10}$/;
var TELEFON_REGEX = /^\+381 \d{2} \d{3}-\d{3,4}$/;
var URL_REGEX = /^https?:\/\/.+/;
var EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function escapeHtml(tekst) {
  if (tekst === null || tekst === undefined) {
    return "";
  }
  return String(tekst)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function uzmiParametarIzUrl(ime) {
  var parametri = new URLSearchParams(window.location.search);
  return parametri.get(ime);
}

function formatirajCenu(broj) {
  var vrednost = Number(broj);
  if (isNaN(vrednost)) {
    return "0 РСД";
  }
  return vrednost.toLocaleString("sr-RS") + " РСД";
}

function formatirajDatum(isoDatum) {
  if (!isoDatum) {
    return "";
  }
  var delovi = isoDatum.split("-");
  if (delovi.length !== 3) {
    return isoDatum;
  }
  return delovi[2] + "." + delovi[1] + "." + delovi[0] + ".";
}

function validirajIsbn(isbn) {
  if (!isbn) {
    return false;
  }
  return ISBN_REGEX.test(isbn.trim());
}

function validirajTelefon(telefon) {
  if (!telefon) {
    return false;
  }
  return TELEFON_REGEX.test(telefon.trim());
}

function validirajUrl(url) {
  if (!url) {
    return false;
  }
  return URL_REGEX.test(url.trim());
}

function validirajSlike(slike) {
  if (!slike || slike.length === 0 || !slike[0]) {
    return false;
  }
  for (var i = 0; i < slike.length; i++) {
    if (!validirajUrl(slike[i])) {
      return false;
    }
  }
  return true;
}

function validirajEmail(email) {
  if (!email) {
    return false;
  }
  return EMAIL_REGEX.test(email.trim());
}

function validirajLozinku(lozinka) {
  if (!lozinka) {
    return false;
  }
  return lozinka.length >= 6;
}

function validirajAutora(podatak) {
  if (!podatak.ime || !podatak.ime.trim()) {
    return "Име аутора је обавезно.";
  }
  if (!podatak.prezime || !podatak.prezime.trim()) {
    return "Презиме аутора је обавезно.";
  }
  if (!podatak.biografija || !podatak.biografija.trim()) {
    return "Биографија је обавезна.";
  }
  if (!podatak.status || !podatak.status.trim()) {
    return "Статус је обавезан.";
  }
  if (!podatak.datumRodjenja) {
    return "Датум рођења је обавезан.";
  }
  if (podatak.brojOsvojenihNagrada === "" || Number(podatak.brojOsvojenihNagrada) < 0) {
    return "Број награда мора бити нула или већи.";
  }
  if (podatak.brojProdatihPrimeraka === "" || Number(podatak.brojProdatihPrimeraka) < 0) {
    return "Број продатих примерака мора бити нула или већи.";
  }
  if (!validirajSlike(podatak.slike)) {
    return "Унесите бар један исправан URL слике (нпр. https://...).";
  }
  if (!validirajTelefon(podatak.kontaktTelefonMenadzera)) {
    return "Телефон менаџера мора бити у формату +381 XX XXX-XXXX (нпр. +381 64 123-4567).";
  }
  return "";
}

function validirajKnjigu(podatak) {
  if (!podatak.naziv || !podatak.naziv.trim()) {
    return "Назив књиге је обавезан.";
  }
  if (!podatak.opis || !podatak.opis.trim()) {
    return "Опис књиге је обавезан.";
  }
  if (!podatak.zanr || !podatak.zanr.trim()) {
    return "Жанр је обавезан.";
  }
  if (!podatak.format) {
    return "Формат је обавезан.";
  }
  if (!podatak.cena || Number(podatak.cena) <= 0) {
    return "Цена мора бити већа од нуле.";
  }
  if (!podatak.brojStrana || Number(podatak.brojStrana) < 1) {
    return "Број страна мора бити бар 1.";
  }
  if (!podatak.idAutora) {
    return "Морате изабрати аутора.";
  }
  if (!validirajSlike(podatak.slike)) {
    return "Унесите бар један исправан URL слике (нпр. https://...).";
  }
  if (!validirajIsbn(podatak.isbn)) {
    return "ISBN мора имати 13 цифара и почињати са 978 или 979 (нпр. 978-86-7543-123-4).";
  }
  return "";
}

function pretvoriUListu(objekat) {
  var lista = [];
  if (!objekat) {
    return lista;
  }
  for (var id in objekat) {
    if (Object.prototype.hasOwnProperty.call(objekat, id)) {
      lista.push({ id: id, podaci: objekat[id] });
    }
  }
  return lista;
}

function imeAutora(autori, idAutora) {
  if (!autori || !idAutora || !autori[idAutora]) {
    return "Непознат аутор";
  }
  return punoImeAutora(autori[idAutora]);
}

function punoImeAutora(autor) {
  if (!autor) {
    return "";
  }
  return (autor.ime || "") + " " + (autor.prezime || "");
}

function klasaStatusaAutora(status) {
  if (!status) {
    return "";
  }
  var lower = status.toLowerCase();
  if (lower.indexOf("актив") !== -1) {
    return "aktivan";
  }
  if (lower.indexOf("пенз") !== -1) {
    return "penzija";
  }
  if (lower.indexOf("премин") !== -1) {
    return "preminuo";
  }
  return "";
}

function formatirajBroj(broj) {
  var vrednost = Number(broj);
  if (isNaN(vrednost)) {
    return "0";
  }
  return vrednost.toLocaleString("sr-RS");
}

function imeKorisnika(korisnici, idKorisnika) {
  if (!korisnici || !idKorisnika || !korisnici[idKorisnika]) {
    return "Корисник";
  }
  var korisnik = korisnici[idKorisnika];
  return korisnik.ime + " " + korisnik.prezime;
}

function prikaziPoruku(elementId, tekst, tip) {
  var element = document.getElementById(elementId);
  if (!element) {
    return;
  }
  element.textContent = tekst;
  element.className = tip === "greska" ? "poruka-greska" : "poruka-uspeh";
  element.classList.remove("sakriveno");
}

function sakrijPoruku(elementId) {
  var element = document.getElementById(elementId);
  if (element) {
    element.classList.add("sakriveno");
  }
}
