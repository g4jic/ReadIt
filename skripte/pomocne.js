var ISBN_REGEX = /^97[89](?:-?\d){10}$/;

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
  var ociscen = isbn.replace(/-/g, "");
  return ISBN_REGEX.test(ociscen);
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
  if (!podatak.slike || podatak.slike.length === 0 || !podatak.slike[0]) {
    return "Унесите бар један URL слике.";
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
  var autor = autori[idAutora];
  return autor.ime + " " + autor.prezime;
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
