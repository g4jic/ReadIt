function zatvoriNavMeni() {
  var linkovi = document.getElementById("nav-linkovi");
  var hamburger = document.querySelector(".hamburger");

  if (linkovi) {
    linkovi.classList.remove("otvoren");
  }
  if (hamburger) {
    hamburger.classList.remove("otvoren");
    hamburger.setAttribute("aria-expanded", "false");
  }
  document.body.classList.remove("nav-meni-otvoren");
}

function otvoriNavMeni() {
  var linkovi = document.getElementById("nav-linkovi");
  var hamburger = document.querySelector(".hamburger");

  if (linkovi) {
    linkovi.classList.add("otvoren");
  }
  if (hamburger) {
    hamburger.classList.add("otvoren");
    hamburger.setAttribute("aria-expanded", "true");
  }
  document.body.classList.add("nav-meni-otvoren");
}

function inicijalizujNavbar() {
  var hamburger = document.querySelector(".hamburger");
  var linkovi = document.getElementById("nav-linkovi");

  if (!hamburger || !linkovi) {
    return;
  }

  hamburger.addEventListener("click", function (e) {
    e.stopPropagation();
    if (linkovi.classList.contains("otvoren")) {
      zatvoriNavMeni();
    } else {
      otvoriNavMeni();
    }
  });

  var stavke = linkovi.querySelectorAll("a");
  for (var i = 0; i < stavke.length; i++) {
    stavke[i].addEventListener("click", zatvoriNavMeni);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      zatvoriNavMeni();
    }
  });

  document.body.addEventListener("click", function (e) {
    if (!document.body.classList.contains("nav-meni-otvoren")) {
      return;
    }
    if (hamburger.contains(e.target) || linkovi.contains(e.target)) {
      return;
    }
    zatvoriNavMeni();
  });
}

document.addEventListener("DOMContentLoaded", inicijalizujNavbar);
