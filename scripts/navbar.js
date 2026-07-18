function closeNavMenu() {
  var linkovi = document.getElementById("nav-links");
  var hamburger = document.querySelector(".hamburger");

  if (linkovi) {
    linkovi.classList.remove("open");
  }
  if (hamburger) {
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  }
  document.body.classList.remove("nav-menu-open");
}

function openNavMenu() {
  var linkovi = document.getElementById("nav-links");
  var hamburger = document.querySelector(".hamburger");

  if (linkovi) {
    linkovi.classList.add("open");
  }
  if (hamburger) {
    hamburger.classList.add("open");
    hamburger.setAttribute("aria-expanded", "true");
  }
  document.body.classList.add("nav-menu-open");
}

function initNavbar() {
  var hamburger = document.querySelector(".hamburger");
  var linkovi = document.getElementById("nav-links");

  if (!hamburger || !linkovi) {
    return;
  }

  hamburger.addEventListener("click", function (e) {
    e.stopPropagation();
    if (linkovi.classList.contains("open")) {
      closeNavMenu();
    } else {
      openNavMenu();
    }
  });

  var stavke = linkovi.querySelectorAll("a");
  for (var i = 0; i < stavke.length; i++) {
    stavke[i].addEventListener("click", closeNavMenu);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeNavMenu();
    }
  });

  document.body.addEventListener("click", function (e) {
    if (!document.body.classList.contains("nav-menu-open")) {
      return;
    }
    if (hamburger.contains(e.target) || linkovi.contains(e.target)) {
      return;
    }
    closeNavMenu();
  });
}

document.addEventListener("DOMContentLoaded", initNavbar);
