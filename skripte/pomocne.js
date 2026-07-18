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
    return "0 RSD";
  }
  return vrednost.toLocaleString("en-US") + " RSD";
}

function formatirajDatum(isoDatum) {
  if (!isoDatum) {
    return "";
  }
  var delovi = isoDatum.split("-");
  if (delovi.length !== 3) {
    return isoDatum;
  }
  return delovi[1] + "/" + delovi[2] + "/" + delovi[0];
}

function normalizujStatus(status) {
  if (!status) {
    return "";
  }
  var lower = status.toLowerCase();
  if (lower.indexOf("актив") !== -1 || lower.indexOf("active") !== -1) {
    return "active";
  }
  if (lower.indexOf("пенз") !== -1 || lower.indexOf("retired") !== -1) {
    return "retired";
  }
  if (lower.indexOf("премин") !== -1 || lower.indexOf("deceased") !== -1) {
    return "deceased";
  }
  return lower;
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
    return "Author first name is required.";
  }
  if (!podatak.prezime || !podatak.prezime.trim()) {
    return "Author last name is required.";
  }
  if (!podatak.biografija || !podatak.biografija.trim()) {
    return "Biography is required.";
  }
  if (!podatak.status || !podatak.status.trim()) {
    return "Status is required.";
  }
  var dozvoljeniStatusi = ["Active", "Retired", "Deceased", "Активан", "У пензији", "Преминуо"];
  var statusIspravan = false;
  for (var s = 0; s < dozvoljeniStatusi.length; s++) {
    if (podatak.status === dozvoljeniStatusi[s]) {
      statusIspravan = true;
      break;
    }
  }
  if (!statusIspravan) {
    return "Status must be Active, Retired, or Deceased.";
  }
  if (!podatak.datumRodjenja) {
    return "Date of birth is required.";
  }
  if (podatak.brojOsvojenihNagrada === "" || Number(podatak.brojOsvojenihNagrada) < 0) {
    return "Number of awards must be zero or greater.";
  }
  if (podatak.brojProdatihPrimeraka === "" || Number(podatak.brojProdatihPrimeraka) < 0) {
    return "Number of copies sold must be zero or greater.";
  }
  if (!validirajSlike(podatak.slike)) {
    return "Enter at least one valid image URL (e.g. https://...).";
  }
  if (!validirajTelefon(podatak.kontaktTelefonMenadzera)) {
    return "Manager phone must be in the format +381 XX XXX-XXXX (e.g. +381 64 123-4567).";
  }
  return "";
}

function validirajKnjigu(podatak) {
  if (!podatak.naziv || !podatak.naziv.trim()) {
    return "Book title is required.";
  }
  if (!podatak.opis || !podatak.opis.trim()) {
    return "Book description is required.";
  }
  if (!podatak.zanr || !podatak.zanr.trim()) {
    return "Genre is required.";
  }
  if (!podatak.format) {
    return "Format is required.";
  }
  if (!podatak.cena || Number(podatak.cena) <= 0) {
    return "Price must be greater than zero.";
  }
  if (!podatak.brojStrana || Number(podatak.brojStrana) < 1) {
    return "Page count must be at least 1.";
  }
  if (!podatak.idAutora) {
    return "You must select an author.";
  }
  if (!validirajSlike(podatak.slike)) {
    return "Enter at least one valid image URL (e.g. https://...).";
  }
  if (!validirajIsbn(podatak.isbn)) {
    return "ISBN must have 13 digits and start with 978 or 979 (e.g. 978-86-7543-123-4).";
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
    return "Unknown author";
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
  if (lower.indexOf("актив") !== -1 || lower.indexOf("active") !== -1) {
    return "aktivan";
  }
  if (lower.indexOf("пенз") !== -1 || lower.indexOf("retired") !== -1) {
    return "penzija";
  }
  if (lower.indexOf("премин") !== -1 || lower.indexOf("deceased") !== -1) {
    return "preminuo";
  }
  return "";
}

function formatirajBroj(broj) {
  var vrednost = Number(broj);
  if (isNaN(vrednost)) {
    return "0";
  }
  return vrednost.toLocaleString("en-US");
}

function imeKorisnika(korisnici, idKorisnika) {
  if (!korisnici || !idKorisnika || !korisnici[idKorisnika]) {
    return "User";
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

function oznaciTekst(tekst, termin) {
  if (!tekst) {
    return "";
  }
  if (!termin || termin.trim() === "") {
    return escapeHtml(tekst);
  }

  var trazeno = termin.toLowerCase();
  var original = String(tekst);
  var lower = original.toLowerCase();
  var html = "";
  var pos = 0;
  var index = lower.indexOf(trazeno, pos);

  while (index !== -1) {
    html += escapeHtml(original.substring(pos, index));
    html += "<mark class=\"mark\">" + escapeHtml(original.substring(index, index + trazeno.length)) + "</mark>";
    pos = index + trazeno.length;
    index = lower.indexOf(trazeno, pos);
  }

  html += escapeHtml(original.substring(pos));
  return html;
}

function danasnjiDatum() {
  var datum = new Date();
  return datum.toISOString().split("T")[0];
}
