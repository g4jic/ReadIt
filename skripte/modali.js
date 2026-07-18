function napraviModale() {
  var kontejner = document.getElementById("modali-kontejner");
  if (!kontejner || kontejner.innerHTML.trim() !== "") {
    return;
  }

  kontejner.innerHTML =
    "<div class=\"modal-pozadina\" id=\"modal-prijava\">" +
    "<div class=\"modal\"><div class=\"modal-zaglavlje\">" +
    "<h2>Log In</h2><button type=\"button\" class=\"modal-zatvori\" data-zatvori=\"modal-prijava\">&times;</button>" +
    "</div><div class=\"modal-telo\">" +
    "<form class=\"forma\" id=\"forma-prijava\" onsubmit=\"return false;\">" +
    "<div class=\"polje\"><label for=\"prijava-korisnicko\">Username</label>" +
    "<input type=\"text\" id=\"prijava-korisnicko\" /></div>" +
    "<div class=\"polje\"><label for=\"prijava-lozinka\">Password</label>" +
    "<input type=\"password\" id=\"prijava-lozinka\" /></div>" +
    "<p class=\"greska sakriveno\" id=\"prijava-greska\"></p>" +
    "</form></div><div class=\"modal-podnozje\">" +
    "<button type=\"button\" class=\"dugme dugme-outline\" data-zatvori=\"modal-prijava\">Cancel</button>" +
    "<button type=\"button\" class=\"dugme dugme-primarno\" id=\"dugme-potvrdi-prijava\">Log In</button>" +
    "</div></div></div>" +

    "<div class=\"modal-pozadina\" id=\"modal-registracija\">" +
    "<div class=\"modal modal-veliki\"><div class=\"modal-zaglavlje\">" +
    "<h2>Register</h2><button type=\"button\" class=\"modal-zatvori\" data-zatvori=\"modal-registracija\">&times;</button>" +
    "</div><div class=\"modal-telo\">" +
    "<form class=\"forma\" id=\"forma-registracija\" onsubmit=\"return false;\">" +
    "<div class=\"forma-red\">" +
    "<div class=\"polje\"><label for=\"reg-korisnicko\">Username</label><input type=\"text\" id=\"reg-korisnicko\" /></div>" +
    "<div class=\"polje\"><label for=\"reg-lozinka\">Password</label><input type=\"password\" id=\"reg-lozinka\" /></div>" +
    "</div><div class=\"forma-red\">" +
    "<div class=\"polje\"><label for=\"reg-ime\">First Name</label><input type=\"text\" id=\"reg-ime\" /></div>" +
    "<div class=\"polje\"><label for=\"reg-prezime\">Last Name</label><input type=\"text\" id=\"reg-prezime\" /></div>" +
    "</div><div class=\"polje\"><label for=\"reg-email\">E-mail</label><input type=\"email\" id=\"reg-email\" /></div>" +
    "<div class=\"forma-red\">" +
    "<div class=\"polje\"><label for=\"reg-datum\">Date of Birth</label><input type=\"date\" id=\"reg-datum\" /></div>" +
    "<div class=\"polje\"><label for=\"reg-zanimanje\">Occupation</label><input type=\"text\" id=\"reg-zanimanje\" /></div>" +
    "</div><div class=\"polje\"><label for=\"reg-adresa\">Address</label><input type=\"text\" id=\"reg-adresa\" /></div>" +
    "<p class=\"greska sakriveno\" id=\"registracija-greska\"></p>" +
    "</form></div><div class=\"modal-podnozje\">" +
    "<button type=\"button\" class=\"dugme dugme-outline\" data-zatvori=\"modal-registracija\">Cancel</button>" +
    "<button type=\"button\" class=\"dugme dugme-primarno\" id=\"dugme-potvrdi-registracija\">Register</button>" +
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

function odjaviKorisnika() {
  localStorage.removeItem("prijavljenKorisnik");
  location.reload();
}

function azurirajNavigaciju() {
  var navAkcije = document.getElementById("nav-akcije");
  if (!navAkcije) {
    return;
  }

  var prijavljenId = localStorage.getItem("prijavljenKorisnik");

  if (prijavljenId) {
    var htmlUlogovan = "";
    htmlUlogovan += "<button type=\"button\" class=\"dugme dugme-primarno\" id=\"dugme-odjava\">Log Out</button>";
    navAkcije.innerHTML = htmlUlogovan;

    var dugmeOdjava = document.getElementById("dugme-odjava");
    if (dugmeOdjava) {
      dugmeOdjava.addEventListener("click", odjaviKorisnika);
    }
  } else {
    var htmlGost = "";
    htmlGost += "<button type=\"button\" class=\"dugme dugme-primarno\" id=\"dugme-prijava\">Log In</button>";
    htmlGost += "<button type=\"button\" class=\"dugme dugme-primarno\" id=\"dugme-registracija\">Register</button>";
    navAkcije.innerHTML = htmlGost;

    var dugmePrijava = document.getElementById("dugme-prijava");
    var dugmeRegistracija = document.getElementById("dugme-registracija");

    if (dugmePrijava) {
      dugmePrijava.addEventListener("click", function () {
        otvoriModal("modal-prijava");
      });
    }
    if (dugmeRegistracija) {
      dugmeRegistracija.addEventListener("click", function () {
        otvoriModal("modal-registracija");
      });
    }
  }
}

function prijaviKorisnika() {
  var korisnicko = document.getElementById("prijava-korisnicko").value.trim();
  var lozinka = document.getElementById("prijava-lozinka").value;
  var greskaEl = document.getElementById("prijava-greska");

  if (!korisnicko || !lozinka) {
    greskaEl.textContent = "Please enter your username and password.";
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
      greskaEl.textContent = "Username and password are correct.";
      greskaEl.className = "poruka-uspeh";
      greskaEl.classList.remove("sakriveno");
      document.getElementById("prijava-korisnicko").value = "";
      document.getElementById("prijava-lozinka").value = "";
      
      localStorage.setItem("prijavljenKorisnik", pronadjenId);
      zatvoriModal("modal-prijava");
      location.reload();
    } else {
      greskaEl.textContent = "Incorrect username or password.";
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
  var datumRodjenja = document.getElementById("reg-datum").value;
  var adresa = document.getElementById("reg-adresa").value.trim();
  var zanimanje = document.getElementById("reg-zanimanje").value.trim();

  if (!korisnicko || !lozinka || !ime || !prezime || !email || !datumRodjenja || !adresa || !zanimanje) {
    return "All fields are required.";
  }
  if (!validirajLozinku(lozinka)) {
    return "Password must be at least 6 characters.";
  }
  if (!validirajEmail(email)) {
    return "Invalid e-mail address (e.g. user@example.com).";
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
        greskaEl.textContent = "Username is already taken.";
        greskaEl.classList.remove("sakriveno");
        return;
      }
    }

    var noviKorisnik = {
      korisnickoIme: korisnicko,
      lozinka: document.getElementById("reg-lozinka").value,
      ime: document.getElementById("reg-ime").value.trim(),
      prezime: document.getElementById("reg-prezime").value.trim(),
      email: document.getElementById("reg-email").value.trim(),
      datumRodjenja: document.getElementById("reg-datum").value,
      adresa: document.getElementById("reg-adresa").value.trim(),
      zanimanje: document.getElementById("reg-zanimanje").value.trim()
    };

    dodajUFirebase("korisnici", noviKorisnik, function (odgovor) {
      if (odgovor && odgovor.name) {
        localStorage.setItem("prijavljenKorisnik", odgovor.name);
      }
      document.getElementById("reg-korisnicko").value = "";
      document.getElementById("reg-lozinka").value = "";
      document.getElementById("reg-ime").value = "";
      document.getElementById("reg-prezime").value = "";
      document.getElementById("reg-email").value = "";
      document.getElementById("reg-datum").value = "";
      document.getElementById("reg-adresa").value = "";
      document.getElementById("reg-zanimanje").value = "";
      
      zatvoriModal("modal-registracija");
      location.reload();
    }, function () {
      greskaEl.textContent = "Registration failed.";
      greskaEl.classList.remove("sakriveno");
    });
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
