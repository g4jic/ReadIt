function loadUserData(loggedInId) {
  var kontejner = document.getElementById("profile-basic-data");
  if (!kontejner) {
    return;
  }

  loadFromFirebase("korisnici/" + loggedInId, function (korisnik) {
    if (!korisnik) {
      kontejner.innerHTML = "<p class=\"message-error\">Error: User not found.</p>";
      return;
    }

    var imeStr = korisnik.ime || "";
    var prezimeStr = korisnik.prezime || "";
    var prvoSlovoIme = imeStr.charAt(0) || "";
    var prvoSlovoPrezime = prezimeStr.charAt(0) || "";
    var inicijali = prvoSlovoIme + prvoSlovoPrezime;

    var html = "";
    html += "<div class=\"profile-avatar\" aria-hidden=\"true\">" + escapeHtml(inicijali.toUpperCase()) + "</div>";
    html += "<div class=\"profile-body-data\">";
    html += "<p class=\"profile-name\">" + escapeHtml(imeStr) + " " + escapeHtml(prezimeStr) + "</p>";
    html += "<p class=\"profile-username\">@" + escapeHtml(korisnik.korisnickoIme || "user") + "</p>";
    html += "<ul class=\"profile-list\">";
    html += "<li><span class=\"profile-label\">Username:</span> " + escapeHtml(korisnik.korisnickoIme || "—") + "</li>";
    html += "<li><span class=\"profile-label\">First Name:</span> " + escapeHtml(imeStr || "—") + "</li>";
    html += "<li><span class=\"profile-label\">Last Name:</span> " + escapeHtml(prezimeStr || "—") + "</li>";
    html += "<li><span class=\"profile-label\">E-mail:</span> " + escapeHtml(korisnik.email || "—") + "</li>";
    html += "<li><span class=\"profile-label\">Born:</span> " + escapeHtml(korisnik.datumRodjenja ? formatDate(korisnik.datumRodjenja) : "—") + "</li>";
    html += "<li><span class=\"profile-label\">Address:</span> " + escapeHtml(korisnik.adresa || "—") + "</li>";
    html += "<li><span class=\"profile-label\">Occupation:</span> " + escapeHtml(korisnik.zanimanje || "—") + "</li>";
    html += "</ul>";
    html += "</div>";

    kontejner.innerHTML = html;
  }, function () {
    kontejner.innerHTML = "<p class=\"message-error\">Error loading user data.</p>";
  });
}

function renderRatingStars(vrednost) {
  var html = "<div class=\"stars read-only\" aria-hidden=\"true\">";
  for (var i = 1; i <= 5; i++) {
    var klasa = i <= vrednost ? "star star-active" : "star";
    html += "<span class=\"" + klasa + "\">★</span>";
  }
  html += "</div>";
  return html;
}

function renderMyReviews(loggedInId, recenzije, knjige) {
  var kontejner = document.getElementById("my-reviews-container");
  if (!kontejner) {
    return;
  }

  var listaRecenzija = toList(recenzije);
  var mojeRecenzije = [];

  for (var i = 0; i < listaRecenzija.length; i++) {
    if (listaRecenzija[i].data.idKorisnika === loggedInId) {
      mojeRecenzije.push(listaRecenzija[i]);
    }
  }

  var html = "<h2 class=\"profile-card-subtitle\">My Reviews</h2>";

  if (mojeRecenzije.length === 0) {
    html += "<p class=\"message-empty\">You haven't written any reviews yet.</p>";
    kontejner.innerHTML = html;
    return;
  }

  html += "<ul class=\"profile-item-list\">";
  for (var j = 0; j < mojeRecenzije.length; j++) {
    var stavka = mojeRecenzije[j];
    var recenzija = stavka.data;
    var knjiga = knjige ? knjige[recenzija.idKnjige] : null;
    var nazivKnjige = knjiga ? knjiga.naziv : "Unknown book";

    html += "<li class=\"profile-item\">";
    html += "<div class=\"profile-item-left\">";
    html += "<a href=\"book-details.html?id=" + escapeHtml(recenzija.idKnjige) + "\" class=\"profile-item-title\">" + escapeHtml(nazivKnjige) + "</a>";
    html += "<p class=\"profile-item-text\">" + escapeHtml(recenzija.tekst) + "</p>";
    html += "</div>";
    html += "<div class=\"profile-item-right\">";
    html += "<span class=\"profile-item-date\">" + escapeHtml(formatDate(recenzija.datum)) + "</span>";
    html += "<button type=\"button\" class=\"btn btn-danger btn-sm\" data-delete-review=\"" + escapeHtml(stavka.id) + "\">Delete</button>";
    html += "</div>";
    html += "</li>";
  }
  html += "</ul>";

  kontejner.innerHTML = html;
}

function loadMyReviews(loggedInId) {
  var kontejner = document.getElementById("my-reviews-container");
  if (!kontejner) {
    return;
  }
  
  loadFromFirebase("recenzije", function (recenzije) {
    loadFromFirebase("knjige", function (knjige) {
      renderMyReviews(loggedInId, recenzije, knjige);
    }, function () {
      kontejner.innerHTML = "<h2 class=\"profile-card-subtitle\">My Reviews</h2><p class=\"message-error\">Error loading books.</p>";
    });
  }, function () {
    kontejner.innerHTML = "<h2 class=\"profile-card-subtitle\">My Reviews</h2><p class=\"message-error\">Error loading reviews.</p>";
  });
}

function renderMyBookRatings(loggedInId, oceneKnjiga, knjige) {
  var kontejner = document.getElementById("my-book-ratings-container");
  if (!kontejner) {
    return;
  }
  var listaOcena = toList(oceneKnjiga);
  var mojeOcene = [];

  for (var i = 0; i < listaOcena.length; i++) {
    if (listaOcena[i].data.idKorisnika === loggedInId) {
      mojeOcene.push(listaOcena[i]);
    }
  }

  var html = "<h2 class=\"profile-card-subtitle\">My Book Ratings</h2>";

  if (mojeOcene.length === 0) {
    html += "<p class=\"message-empty\">You haven't rated any books yet.</p>";
    kontejner.innerHTML = html;
    return;
  }

  html += "<ul class=\"profile-item-list\">";
  for (var j = 0; j < mojeOcene.length; j++) {
    var stavka = mojeOcene[j];
    var ocena = stavka.data;
    var knjiga = knjige ? knjige[ocena.idKnjige] : null;
    var nazivKnjige = knjiga ? knjiga.naziv : "Unknown book";

    html += "<li class=\"profile-item\">";
    html += "<div class=\"profile-item-left\">";
    html += "<a href=\"book-details.html?id=" + escapeHtml(ocena.idKnjige) + "\" class=\"profile-item-title\">" + escapeHtml(nazivKnjige) + "</a>";
    html += "<p class=\"profile-item-text\">Rating: " + escapeHtml(ocena.vrednost) + "/5</p>";
    html += "</div>";
    html += "<div class=\"profile-item-right\">";
    html += "<span class=\"profile-item-date\">" + escapeHtml(formatDate(ocena.datum)) + "</span>";
    html += "<button type=\"button\" class=\"btn btn-danger btn-sm\" data-delete-book-rating=\"" + escapeHtml(stavka.id) + "\">Delete</button>";
    html += "</div>";
    html += "</li>";
  }
  html += "</ul>";

  kontejner.innerHTML = html;
}

function loadMyBookRatings(loggedInId) {
  var kontejner = document.getElementById("my-book-ratings-container");
  if (!kontejner) {
    return;
  }

  loadFromFirebase("oceneKnjiga", function (oceneKnjiga) {
    loadFromFirebase("knjige", function (knjige) {
      renderMyBookRatings(loggedInId, oceneKnjiga, knjige);
    }, function () {
      kontejner.innerHTML = "<h2 class=\"profile-card-subtitle\">My Book Ratings</h2><p class=\"message-error\">Error loading books.</p>";
    });
  }, function () {
    kontejner.innerHTML = "<h2 class=\"profile-card-subtitle\">My Book Ratings</h2><p class=\"message-error\">Error loading book ratings.</p>";
  });
}

function renderMyRatings(loggedInId, ocene, autori) {
  var kontejner = document.getElementById("my-ratings-container");
  if (!kontejner) {
    return;
  }

  var listaOcena = toList(ocene);
  var mojeOcene = [];

  for (var i = 0; i < listaOcena.length; i++) {
    if (listaOcena[i].data.idKorisnika === loggedInId) {
      mojeOcene.push(listaOcena[i]);
    }
  }

  var html = "<h2 class=\"profile-card-subtitle\">My Author Ratings</h2>";

  if (mojeOcene.length === 0) {
    html += "<p class=\"message-empty\">You haven't rated any authors yet.</p>";
    kontejner.innerHTML = html;
    return;
  }

  html += "<ul class=\"profile-item-list\">";
  for (var j = 0; j < mojeOcene.length; j++) {
    var stavka = mojeOcene[j];
    var ocena = stavka.data;
    var autor = autori ? autori[ocena.idAutora] : null;
    var ime = autor ? getAuthorFullName(autor) : "Unknown author";

    html += "<li class=\"profile-item\">";
    html += "<div class=\"profile-item-left\">";
    html += renderRatingStars(Number(ocena.vrednost));
    html += "<a href=\"author-details.html?id=" + escapeHtml(ocena.idAutora) + "\" class=\"profile-item-title\">" + escapeHtml(ime) + "</a>";
    html += "</div>";
    html += "<div class=\"profile-item-right\">";
    html += "<span class=\"profile-item-date\">" + escapeHtml(formatDate(ocena.datum)) + "</span>";
    html += "<button type=\"button\" class=\"btn btn-danger btn-sm\" data-delete-rating=\"" + escapeHtml(stavka.id) + "\">Delete</button>";
    html += "</div>";
    html += "</li>";
  }
  html += "</ul>";

  kontejner.innerHTML = html;
}

function loadMyRatings(loggedInId) {
  var kontejner = document.getElementById("my-ratings-container");
  if (!kontejner) {
    return;
  }

  loadFromFirebase("ocene", function (ocene) {
    loadFromFirebase("autori", function (autori) {
      renderMyRatings(loggedInId, ocene, autori);
    }, function () {
      kontejner.innerHTML = "<h2 class=\"profile-card-subtitle\">My Author Ratings</h2><p class=\"message-error\">Error loading authors.</p>";
    });
  }, function () {
    kontejner.innerHTML = "<h2 class=\"profile-card-subtitle\">My Author Ratings</h2><p class=\"message-error\">Error loading ratings.</p>";
  });
}

function bindProfileDelete(loggedInId) {
  var akcijaBrisanja = null;

  function openConfirmDialog(tekst, akcija) {
    var modal = document.getElementById("modal-delete-profile");
    var tekstEl = document.getElementById("modal-delete-profile-text");
    var greskaEl = document.getElementById("modal-delete-profile-error");
    if (!modal || !tekstEl) {
      return;
    }
    tekstEl.textContent = tekst;
    if (greskaEl) {
      greskaEl.textContent = "";
      greskaEl.classList.add("hidden");
    }
    akcijaBrisanja = akcija;
    modal.classList.add("open");
  }

  function closeConfirmDialog() {
    var modal = document.getElementById("modal-delete-profile");
    if (modal) {
      modal.classList.remove("open");
    }
    akcijaBrisanja = null;
  }

  var zatvori = document.getElementById("modal-delete-profile-zatvori");
  var otkazi = document.getElementById("modal-delete-profile-otkazi");
  var potvrdi = document.getElementById("modal-delete-profile-potvrdi");
  var pozadina = document.getElementById("modal-delete-profile");

  if (zatvori) {
    zatvori.addEventListener("click", zatvoriDijalogBrisanja);
  }
  if (otkazi) {
    otkazi.addEventListener("click", zatvoriDijalogBrisanja);
  }
  if (pozadina) {
    pozadina.addEventListener("click", function (e) {
      if (e.target === pozadina) {
        closeConfirmDialog();
      }
    });
  }
  if (potvrdi) {
    potvrdi.addEventListener("click", function () {
      if (!akcijaBrisanja) {
        return;
      }
      var greskaEl = document.getElementById("modal-delete-profile-error");
      var stariTekst = potvrdi.textContent;
      potvrdi.textContent = "Deleting...";
      potvrdi.disabled = true;
      akcijaBrisanja(function () {
        closeConfirmDialog();
        potvrdi.textContent = stariTekst;
        potvrdi.disabled = false;
      }, function (poruka) {
        if (greskaEl) {
          greskaEl.textContent = poruka;
          greskaEl.classList.remove("hidden");
        }
        potvrdi.textContent = stariTekst;
        potvrdi.disabled = false;
      });
    });
  }

  var kontejnerRecenzije = document.getElementById("my-reviews-container");
  if (kontejnerRecenzije) {
    kontejnerRecenzije.addEventListener("click", function (e) {
      var btn = e.target;
      if (!btn.getAttribute || !btn.getAttribute("data-delete-review")) {
        return;
      }

      var idRecenzije = btn.getAttribute("data-delete-review");
      openConfirmDialog("Are you sure you want to delete this review?", function (onSuccess, onError) {
        deleteFromFirebase("recenzije", idRecenzije, function () {
          loadMyReviews(loggedInId);
          onSuccess();
        }, function () {
          onError("Error deleting review.");
        });
      });
    });
  }

  var kontejnerOcene = document.getElementById("my-ratings-container");
  if (kontejnerOcene) {
    kontejnerOcene.addEventListener("click", function (e) {
      var btn = e.target;
      if (!btn.getAttribute || !btn.getAttribute("data-delete-rating")) {
        return;
      }

      var idOcene = btn.getAttribute("data-delete-rating");
      openConfirmDialog("Are you sure you want to delete this rating?", function (onSuccess, onError) {
        deleteFromFirebase("ocene", idOcene, function () {
          loadMyRatings(loggedInId);
          onSuccess();
        }, function () {
          onError("Error deleting rating.");
        });
      });
    });
  }

  var kontejnerOceneKnjiga = document.getElementById("my-book-ratings-container");
  if (kontejnerOceneKnjiga) {
    kontejnerOceneKnjiga.addEventListener("click", function (e) {
      var btn = e.target;
      if (!btn.getAttribute || !btn.getAttribute("data-delete-book-rating")) {
        return;
      }

      var idOcene = btn.getAttribute("data-delete-book-rating");
      openConfirmDialog("Are you sure you want to delete this book rating?", function (onSuccess, onError) {
        deleteFromFirebase("oceneKnjiga", idOcene, function () {
          loadMyBookRatings(loggedInId);
          onSuccess();
        }, function () {
          onError("Error deleting book rating.");
        });
      });
    });
  }
}

window.addEventListener("DOMContentLoaded", function () {
  var loggedInId = localStorage.getItem("loggedInUser");
  if (!loggedInId) {
    var main = document.querySelector("main");
    if (main) {
      main.innerHTML = "<div class=\"section-header\"><h1>My Profile</h1></div><p class=\"message-error\" style=\"text-align:center; margin-top:var(--space-xl);\">You must be logged in to view this page.</p>";
    }
    return;
  }

  loadUserData(loggedInId);
  loadMyReviews(loggedInId);
  loadMyBookRatings(loggedInId);
  loadMyRatings(loggedInId);
  bindProfileDelete(loggedInId);
});
