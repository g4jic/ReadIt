function napraviModale() {
  var kontejner = document.getElementById("modali-kontejner");
  if (!kontejner || kontejner.innerHTML.trim() !== "") {
    return;
  }

  kontejner.innerHTML =
    "<div class=\"modal-pozadina\" id=\"modal-prijava\">" +
    "<div class=\"modal\"><div class=\"modal-zaglavlje\">" +
    "<h2>Пријава</h2><button type=\"button\" class=\"modal-zatvori\" data-zatvori=\"modal-prijava\">&times;</button>" +
    "</div><div class=\"modal-telo\">" +
    "<form class=\"forma\" id=\"forma-prijava\" onsubmit=\"return false;\">" +
    "<div class=\"polje\"><label for=\"prijava-korisnicko\">Корисничко име</label>" +
    "<input type=\"text\" id=\"prijava-korisnicko\" /></div>" +
    "<div class=\"polje\"><label for=\"prijava-lozinka\">Лозинка</label>" +
    "<input type=\"password\" id=\"prijava-lozinka\" /></div>" +
    "<p class=\"greska sakriveno\" id=\"prijava-greska\"></p>" +
    "</form></div><div class=\"modal-podnozje\">" +
    "<button type=\"button\" class=\"dugme dugme-outline\" data-zatvori=\"modal-prijava\">Откажи</button>" +
    "<button type=\"button\" class=\"dugme dugme-primarno\" id=\"dugme-potvrdi-prijava\">Пријави се</button>" +
    "</div></div></div>" +

    "<div class=\"modal-pozadina\" id=\"modal-registracija\">" +
    "<div class=\"modal modal-veliki\"><div class=\"modal-zaglavlje\">" +
    "<h2>Регистрација</h2><button type=\"button\" class=\"modal-zatvori\" data-zatvori=\"modal-registracija\">&times;</button>" +
    "</div><div class=\"modal-telo\">" +
    "<form class=\"forma\" id=\"forma-registracija\" onsubmit=\"return false;\">" +
    "<div class=\"forma-red\">" +
    "<div class=\"polje\"><label for=\"reg-korisnicko\">Корисничко име</label><input type=\"text\" id=\"reg-korisnicko\" /></div>" +
    "<div class=\"polje\"><label for=\"reg-lozinka\">Лозинка</label><input type=\"password\" id=\"reg-lozinka\" /></div>" +
    "</div><div class=\"forma-red\">" +
    "<div class=\"polje\"><label for=\"reg-ime\">Име</label><input type=\"text\" id=\"reg-ime\" /></div>" +
    "<div class=\"polje\"><label for=\"reg-prezime\">Презиме</label><input type=\"text\" id=\"reg-prezime\" /></div>" +
    "</div><div class=\"polje\"><label for=\"reg-email\">E-mail</label><input type=\"email\" id=\"reg-email\" /></div>" +
    "<p class=\"greska sakriveno\" id=\"registracija-greska\"></p>" +
    "</form></div><div class=\"modal-podnozje\">" +
    "<button type=\"button\" class=\"dugme dugme-outline\" data-zatvori=\"modal-registracija\">Откажи</button>" +
    "<button type=\"button\" class=\"dugme dugme-primarno\" id=\"dugme-potvrdi-registracija\">Региструј се</button>" +
    "</div></div></div>";
}

function otvoriModal(id) {
  var modal = document.getElementById(id);
  if (modal) {
    modal.classList.add("otvoren");
  }
}

function zatvoriModal(id) {
  var modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove("otvoren");
  }
}

function azurirajNavigaciju() {
  var prijava = document.getElementById("dugme-prijava");
  var registracija = document.getElementById("dugme-registracija");

  if (!prijava || !registracija) {
    return;
  }

  prijava.addEventListener("click", function () {
    otvoriModal("modal-prijava");
  });
  registracija.addEventListener("click", function () {
    otvoriModal("modal-registracija");
  });
}

function prijaviKorisnika() {
  var korisnicko = document.getElementById("prijava-korisnicko").value.trim();
  var lozinka = document.getElementById("prijava-lozinka").value;
  var greskaEl = document.getElementById("prijava-greska");

  if (!korisnicko || !lozinka) {
    greskaEl.textContent = "Унесите корисничко име и лозинку.";
    greskaEl.classList.remove("sakriveno");
    return;
  }

  ucitajSaFirebase("korisnici", function (korisnici) {
    var pronadjenId = null;
    var lista = pretvoriUListu(korisnici);

    for (var i = 0; i < lista.length; i++) {
      var k = lista[i].podaci;
      if (k.korisnickoIme === korisnicko && k.lozinka === lozinka) {
        pronadjenId = lista[i].id;
        break;
      }
    }

    if (pronadjenId) {
      greskaEl.textContent = "Корисничко име и лозинка су исправни.";
      greskaEl.className = "poruka-uspeh";
      greskaEl.classList.remove("sakriveno");
      document.getElementById("prijava-korisnicko").value = "";
      document.getElementById("prijava-lozinka").value = "";
    } else {
      greskaEl.textContent = "Погрешно корисничко име или лозинка.";
      greskaEl.classList.remove("sakriveno");
    }
  });
}

function validirajRegistraciju() {
  var korisnicko = document.getElementById("reg-korisnicko").value.trim();
  var lozinka = document.getElementById("reg-lozinka").value;
  var ime = document.getElementById("reg-ime").value.trim();
  var prezime = document.getElementById("reg-prezime").value.trim();
  var email = document.getElementById("reg-email").value.trim();

  if (!korisnicko || !lozinka || !ime || !prezime || !email) {
    return "Сва поља су обавезна.";
  }
  if (email.indexOf("@") === -1) {
    return "E-mail није исправан.";
  }
  return "";
}

function registrujKorisnika() {
  var greskaEl = document.getElementById("registracija-greska");
  var greska = validirajRegistraciju();

  if (greska) {
    greskaEl.textContent = greska;
    greskaEl.classList.remove("sakriveno");
    return;
  }

  var korisnicko = document.getElementById("reg-korisnicko").value.trim();

  ucitajSaFirebase("korisnici", function (korisnici) {
    var lista = pretvoriUListu(korisnici || {});

    for (var i = 0; i < lista.length; i++) {
      if (lista[i].podaci.korisnickoIme === korisnicko) {
        greskaEl.textContent = "Корисничко име је већ заузето.";
        greskaEl.classList.remove("sakriveno");
        return;
      }
    }

    greskaEl.textContent = "Подаци за регистрацију су исправни.";
    greskaEl.className = "poruka-uspeh";
    greskaEl.classList.remove("sakriveno");
  });
}

function poveziModalDogadjaje() {
  document.addEventListener("click", function (e) {
    var zatvoriId = e.target.getAttribute("data-zatvori");
    if (zatvoriId) {
      zatvoriModal(zatvoriId);
    }

    if (e.target.classList.contains("modal-pozadina") && e.target.classList.contains("otvoren")) {
      e.target.classList.remove("otvoren");
    }
  });

  var potvrdiPrijava = document.getElementById("dugme-potvrdi-prijava");
  if (potvrdiPrijava) {
    potvrdiPrijava.addEventListener("click", prijaviKorisnika);
  }

  var potvrdiReg = document.getElementById("dugme-potvrdi-registracija");
  if (potvrdiReg) {
    potvrdiReg.addEventListener("click", registrujKorisnika);
  }
}

window.addEventListener("DOMContentLoaded", function () {
  napraviModale();
  poveziModalDogadjaje();
  azurirajNavigaciju();
});
