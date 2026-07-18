function buildModals() {
  var kontejner = document.getElementById("modals-container");
  if (!kontejner || kontejner.innerHTML.trim() !== "") {
    return;
  }

  kontejner.innerHTML =
    "<div class=\"modal-backdrop\" id=\"modal-login\">" +
    "<div class=\"modal\"><div class=\"modal-header\">" +
    "<h2>Log In</h2><button type=\"button\" class=\"modal-close\" data-close=\"modal-login\">&times;</button>" +
    "</div><div class=\"modal-body\">" +
    "<form class=\"form\" id=\"form-prijava\" onsubmit=\"return false;\">" +
    "<div class=\"field\"><label for=\"login-username\">Username</label>" +
    "<input type=\"text\" id=\"login-username\" /></div>" +
    "<div class=\"field\"><label for=\"login-password\">Password</label>" +
    "<input type=\"password\" id=\"login-password\" /></div>" +
    "<p class=\"greska hidden\" id=\"login-error\"></p>" +
    "</form></div><div class=\"modal-footer\">" +
    "<button type=\"button\" class=\"btn btn-outline\" data-close=\"modal-login\">Cancel</button>" +
    "<button type=\"button\" class=\"btn btn-primary\" id=\"btn-potvrdi-prijava\">Log In</button>" +
    "</div></div></div>" +

    "<div class=\"modal-backdrop\" id=\"modal-register\">" +
    "<div class=\"modal modal-lg\"><div class=\"modal-header\">" +
    "<h2>Register</h2><button type=\"button\" class=\"modal-close\" data-close=\"modal-register\">&times;</button>" +
    "</div><div class=\"modal-body\">" +
    "<form class=\"form\" id=\"form-registracija\" onsubmit=\"return false;\">" +
    "<div class=\"form-row\">" +
    "<div class=\"field\"><label for=\"reg-username\">Username</label><input type=\"text\" id=\"reg-username\" /></div>" +
    "<div class=\"field\"><label for=\"reg-password\">Password</label><input type=\"password\" id=\"reg-password\" /></div>" +
    "</div><div class=\"form-row\">" +
    "<div class=\"field\"><label for=\"reg-first-name\">First Name</label><input type=\"text\" id=\"reg-first-name\" /></div>" +
    "<div class=\"field\"><label for=\"reg-last-name\">Last Name</label><input type=\"text\" id=\"reg-last-name\" /></div>" +
    "</div><div class=\"field\"><label for=\"reg-email\">E-mail</label><input type=\"email\" id=\"reg-email\" /></div>" +
    "<div class=\"form-row\">" +
    "<div class=\"field\"><label for=\"reg-birth-date\">Date of Birth</label><input type=\"date\" id=\"reg-birth-date\" /></div>" +
    "<div class=\"field\"><label for=\"reg-occupation\">Occupation</label><input type=\"text\" id=\"reg-occupation\" /></div>" +
    "</div><div class=\"field\"><label for=\"reg-address\">Address</label><input type=\"text\" id=\"reg-address\" /></div>" +
    "<p class=\"greska hidden\" id=\"register-error\"></p>" +
    "</form></div><div class=\"modal-footer\">" +
    "<button type=\"button\" class=\"btn btn-outline\" data-close=\"modal-register\">Cancel</button>" +
    "<button type=\"button\" class=\"btn btn-primary\" id=\"btn-potvrdi-registracija\">Register</button>" +
    "</div></div></div>";
}

function openModal(id) {
  var modal = document.getElementById(id);
  if (modal) {
    modal.classList.add("open");
  }
}

function closeModal(id) {
  var modal = document.getElementById(id);
  if (modal) {
    modal.classList.remove("open");
  }
}

function logoutUser() {
  localStorage.removeItem("loggedInUser");
  location.reload();
}

function updateNavigation() {
  var navAkcije = document.getElementById("nav-actions");
  if (!navAkcije) {
    return;
  }

  var loggedInId = localStorage.getItem("loggedInUser");

  if (loggedInId) {
    var htmlUlogovan = "";
    htmlUlogovan += "<button type=\"button\" class=\"btn btn-primary\" id=\"btn-odjava\">Log Out</button>";
    navAkcije.innerHTML = htmlUlogovan;

    var btnOdjava = document.getElementById("btn-odjava");
    if (btnOdjava) {
      btnOdjava.addEventListener("click", logoutUser);
    }
  } else {
    var htmlGost = "";
    htmlGost += "<button type=\"button\" class=\"btn btn-primary\" id=\"btn-login\">Log In</button>";
    htmlGost += "<button type=\"button\" class=\"btn btn-primary\" id=\"btn-register\">Register</button>";
    navAkcije.innerHTML = htmlGost;

    var btnPrijava = document.getElementById("btn-login");
    var btnRegistracija = document.getElementById("btn-register");

    if (btnPrijava) {
      btnPrijava.addEventListener("click", function () {
        openModal("modal-login");
      });
    }
    if (btnRegistracija) {
      btnRegistracija.addEventListener("click", function () {
        openModal("modal-register");
      });
    }
  }
}

function loginUser() {
  var korisnicko = document.getElementById("login-username").value.trim();
  var lozinka = document.getElementById("login-password").value;
  var greskaEl = document.getElementById("login-error");

  if (!korisnicko || !lozinka) {
    greskaEl.textContent = "Please enter your username and password.";
    greskaEl.classList.remove("hidden");
    return;
  }

  loadFromFirebase("korisnici", function (korisnici) {
    var pronadjenId = null;
    var lista = toList(korisnici);

    for (var i = 0; i < lista.length; i++) {
      var k = lista[i].data;
      if (k.korisnickoIme === korisnicko && k.lozinka === lozinka) {
        pronadjenId = lista[i].id;
        break;
      }
    }

    if (pronadjenId) {
      greskaEl.textContent = "Username and password are correct.";
      greskaEl.className = "message-success";
      greskaEl.classList.remove("hidden");
      document.getElementById("login-username").value = "";
      document.getElementById("login-password").value = "";
      
      localStorage.setItem("loggedInUser", pronadjenId);
      closeModal("modal-login");
      location.reload();
    } else {
      greskaEl.textContent = "Incorrect username or password.";
      greskaEl.classList.remove("hidden");
    }
  });
}

function validateRegistration() {
  var korisnicko = document.getElementById("reg-username").value.trim();
  var lozinka = document.getElementById("reg-password").value;
  var ime = document.getElementById("reg-first-name").value.trim();
  var prezime = document.getElementById("reg-last-name").value.trim();
  var email = document.getElementById("reg-email").value.trim();
  var datumRodjenja = document.getElementById("reg-birth-date").value;
  var adresa = document.getElementById("reg-address").value.trim();
  var zanimanje = document.getElementById("reg-occupation").value.trim();

  if (!korisnicko || !lozinka || !ime || !prezime || !email || !datumRodjenja || !adresa || !zanimanje) {
    return "All fields are required.";
  }
  if (!validatePassword(lozinka)) {
    return "Password must be at least 6 characters.";
  }
  if (!validateEmail(email)) {
    return "Invalid e-mail address (e.g. user@example.com).";
  }
  return "";
}

function registerUser() {
  var greskaEl = document.getElementById("register-error");
  var greska = validateRegistration();

  if (greska) {
    greskaEl.textContent = greska;
    greskaEl.classList.remove("hidden");
    return;
  }

  var korisnicko = document.getElementById("reg-username").value.trim();

  loadFromFirebase("korisnici", function (korisnici) {
    var lista = toList(korisnici || {});

    for (var i = 0; i < lista.length; i++) {
      if (lista[i].data.korisnickoIme === korisnicko) {
        greskaEl.textContent = "Username is already taken.";
        greskaEl.classList.remove("hidden");
        return;
      }
    }

    var noviKorisnik = {
      korisnickoIme: korisnicko,
      lozinka: document.getElementById("reg-password").value,
      ime: document.getElementById("reg-first-name").value.trim(),
      prezime: document.getElementById("reg-last-name").value.trim(),
      email: document.getElementById("reg-email").value.trim(),
      datumRodjenja: document.getElementById("reg-birth-date").value,
      adresa: document.getElementById("reg-address").value.trim(),
      zanimanje: document.getElementById("reg-occupation").value.trim()
    };

    addToFirebase("korisnici", noviKorisnik, function (odgovor) {
      if (odgovor && odgovor.name) {
        localStorage.setItem("loggedInUser", odgovor.name);
      }
      document.getElementById("reg-username").value = "";
      document.getElementById("reg-password").value = "";
      document.getElementById("reg-first-name").value = "";
      document.getElementById("reg-last-name").value = "";
      document.getElementById("reg-email").value = "";
      document.getElementById("reg-birth-date").value = "";
      document.getElementById("reg-address").value = "";
      document.getElementById("reg-occupation").value = "";
      
      closeModal("modal-register");
      location.reload();
    }, function () {
      greskaEl.textContent = "Registration failed.";
      greskaEl.classList.remove("hidden");
    });
  });
}

function bindModalEvents() {
  document.addEventListener("click", function (e) {
    var zatvoriId = e.target.getAttribute("data-close");
    if (zatvoriId) {
      closeModal(zatvoriId);
    }

    if (e.target.classList.contains("modal-backdrop") && e.target.classList.contains("open")) {
      e.target.classList.remove("open");
    }
  });

  var potvrdiPrijava = document.getElementById("btn-potvrdi-prijava");
  if (potvrdiPrijava) {
    potvrdiPrijava.addEventListener("click", loginUser);
  }

  var potvrdiReg = document.getElementById("btn-potvrdi-registracija");
  if (potvrdiReg) {
    potvrdiReg.addEventListener("click", registerUser);
  }
}

window.addEventListener("DOMContentLoaded", function () {
  buildModals();
  bindModalEvents();
  updateNavigation();
});
