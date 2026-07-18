var adminBooksCache = {};
var adminAuthorsCache = {};
var selectedBookId = null;

function loadAdminBooks() {
  var tbody = document.getElementById("admin-table-body");
  if (!tbody) {
    return;
  }

  tbody.innerHTML = "<tr><td colspan=\"8\">Loading...</td></tr>";

  loadFromFirebase("knjige", function (knjige) {
    adminBooksCache = knjige || {};
    loadFromFirebase("autori", function (autori) {
      adminAuthorsCache = autori || {};
      populateAuthorSelect();
      renderAdminTable();
    });
  });
}

function populateAuthorSelect() {
  var select = document.getElementById("book-author-input");
  if (!select) {
    return;
  }

  var lista = toList(adminAuthorsCache);
  lista.sort(function (a, b) {
    var imeA = a.data.ime + a.data.prezime;
    var imeB = b.data.ime + b.data.prezime;
    return imeA.localeCompare(imeB, "en");
  });

  select.innerHTML = "";
  for (var i = 0; i < lista.length; i++) {
    var opcija = document.createElement("option");
    opcija.value = lista[i].id;
    opcija.textContent = lista[i].data.ime + " " + lista[i].data.prezime;
    select.appendChild(opcija);
  }
}

function renderAdminTable() {
  var tbody = document.getElementById("admin-table-body");
  var lista = toList(adminBooksCache);

  if (lista.length === 0) {
    tbody.innerHTML = "<tr><td colspan=\"8\">No books found.</td></tr>";
    return;
  }

  var html = "";
  for (var i = 0; i < lista.length; i++) {
    var stavka = lista[i];
    var knjiga = stavka.data;
    var slika = knjiga.slike && knjiga.slike[0] ? knjiga.slike[0] : "";
    var autorIme = getAuthorName(adminAuthorsCache, knjiga.idAutora);

    html += "<tr>";
    html += "<td><img src=\"" + escapeHtml(slika) + "\" alt=\"\" class=\"thumb\" /></td>";
    html += "<td>" + escapeHtml(knjiga.naziv) + "</td>";
    html += "<td>" + escapeHtml(autorIme) + "</td>";
    html += "<td>" + escapeHtml(knjiga.zanr) + "</td>";
    html += "<td>" + escapeHtml(knjiga.brojStrana) + "</td>";
    html += "<td>" + escapeHtml(formatPrice(knjiga.cena)) + "</td>";
    html += "<td>" + escapeHtml(knjiga.isbn) + "</td>";
    html += "<td><div class=\"table-actions\">";
    html += "<button type=\"button\" class=\"btn btn-outline btn-sm\" data-action=\"izmeni\" data-id=\"" + escapeHtml(stavka.id) + "\">Edit</button>";
    html += "<button type=\"button\" class=\"btn btn-danger btn-sm\" data-action=\"obrisi\" data-id=\"" + escapeHtml(stavka.id) + "\">Delete</button>";
    html += "</div></td></tr>";
  }

  tbody.innerHTML = html;

  var dugmad = tbody.querySelectorAll("button[data-action]");
  for (var j = 0; j < dugmad.length; j++) {
    dugmad[j].addEventListener("click", handleTableAction);
  }
}

function handleTableAction(dogadjaj) {
  var btn = dogadjaj.currentTarget;
  var action = btn.getAttribute("data-action");
  var id = btn.getAttribute("data-id");

  if (action === "edit") {
    fillBookForm(id);
  } else if (action === "delete") {
    openBookDeleteDialog(id);
  }
}

function openBookModal() {
  document.getElementById("modal-book-form").classList.add("open");
}

function closeBookModal() {
  document.getElementById("modal-book-form").classList.remove("open");
}

function fillBookForm(id) {
  var knjiga = adminBooksCache[id];
  if (!knjiga) {
    return;
  }

  selectedBookId = id;
  hideMessage("admin-modal-message");
  hideMessage("admin-message");

  document.getElementById("book-title-input").value = knjiga.naziv || "";
  document.getElementById("book-description-input").value = knjiga.opis || "";
  document.getElementById("book-genre-input").value = knjiga.zanr || "";
  document.getElementById("book-format-input").value = knjiga.format || "Hardcover";
  document.getElementById("book-price-input").value = knjiga.cena || "";
  document.getElementById("book-pages-input").value = knjiga.brojStrana || "";
  document.getElementById("book-isbn-input").value = knjiga.isbn || "";
  document.getElementById("book-author-input").value = knjiga.idAutora || "";

  var slikeTekst = "";
  if (knjiga.slike && knjiga.slike.length > 0) {
    slikeTekst = knjiga.slike.join(", ");
  }
  document.getElementById("book-images-input").value = slikeTekst;

  var naslovForme = document.getElementById("admin-form-title");
  if (naslovForme) {
    naslovForme.textContent = "Edit Book: " + knjiga.naziv;
  }

  openBookModal();
}

function openNewBook() {
  clearBookForm();
  var naslovForme = document.getElementById("admin-form-title");
  if (naslovForme) {
    naslovForme.textContent = "New Book";
  }
  openBookModal();
}

function clearBookForm() {
  selectedBookId = null;
  hideMessage("admin-modal-message");
  hideMessage("admin-message");

  document.getElementById("book-title-input").value = "";
  document.getElementById("book-description-input").value = "";
  document.getElementById("book-genre-input").value = "";
  document.getElementById("book-format-input").value = "Hardcover";
  document.getElementById("book-price-input").value = "";
  document.getElementById("book-pages-input").value = "";
  document.getElementById("book-isbn-input").value = "";
  document.getElementById("book-images-input").value = "";
  if (document.getElementById("book-author-input").options.length > 0) {
    document.getElementById("book-author-input").selectedIndex = 0;
  }
}

function readBookForm() {
  var slikeRaw = document.getElementById("book-images-input").value.trim();
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
    naziv: document.getElementById("book-title-input").value.trim(),
    opis: document.getElementById("book-description-input").value.trim(),
    zanr: document.getElementById("book-genre-input").value.trim(),
    format: document.getElementById("book-format-input").value,
    cena: document.getElementById("book-price-input").value,
    brojStrana: document.getElementById("book-pages-input").value,
    idAutora: document.getElementById("book-author-input").value,
    isbn: document.getElementById("book-isbn-input").value.trim(),
    slike: slikeNiz
  };
}

function saveBookForm() {
  var podatak = readBookForm();
  var greska = validateBook(podatak);

  if (greska) {
    showMessage("admin-modal-message", greska, "error");
    return;
  }

  var btn = document.getElementById("btn-save-book");
  var stariTekst = btn.textContent;
  btn.textContent = "Saving...";
  btn.disabled = true;

  if (selectedBookId) {
    updateInFirebase("knjige", selectedBookId, podatak, function () {
      showMessage("admin-message", "Book updated successfully.", "success");
      closeBookModal();
      loadAdminBooks();
      btn.textContent = stariTekst;
      btn.disabled = false;
    }, function () {
      showMessage("admin-modal-message", "Error updating book.", "error");
      btn.textContent = stariTekst;
      btn.disabled = false;
    });
  } else {
    addToFirebase("knjige", podatak, function () {
      showMessage("admin-message", "Book added successfully.", "success");
      closeBookModal();
      loadAdminBooks();
      btn.textContent = stariTekst;
      btn.disabled = false;
    }, function () {
      showMessage("admin-modal-message", "Error adding book.", "error");
      btn.textContent = stariTekst;
      btn.disabled = false;
    });
  }
}

function openBookDeleteDialog(id) {
  var knjiga = adminBooksCache[id];
  if (!knjiga) {
    return;
  }

  selectedBookId = id;
  var tekst = document.getElementById("modal-delete-text");
  tekst.textContent = "Are you sure you want to delete the book \"" + knjiga.naziv + "\"?";

  document.getElementById("modal-delete-book").classList.add("open");
}

function closeConfirmDialog() {
  document.getElementById("modal-delete-book").classList.remove("open");
}

function confirmDeleteBook() {
  var idZaBrisanje = selectedBookId;
  var btn = document.getElementById("modal-delete-confirm");
  var stariTekst = btn ? btn.textContent : "Delete";

  if (btn) {
    btn.textContent = "Deleting...";
    btn.disabled = true;
  }

  deleteFromFirebase("knjige", idZaBrisanje, function () {
    showMessage("admin-message", "Book deleted successfully.", "success");
    selectedBookId = null;
    closeConfirmDialog();
    loadAdminBooks();
    if (btn) {
      btn.textContent = stariTekst;
      btn.disabled = false;
    }
  }, function () {
    showMessage("admin-message", "Error deleting book.", "error");
    selectedBookId = null;
    closeConfirmDialog();
    if (btn) {
      btn.textContent = stariTekst;
      btn.disabled = false;
    }
  });
}

function bindAdminEvents() {
  var btnNova = document.getElementById("btn-new-book");
  if (btnNova) {
    btnNova.addEventListener("click", openNewBook);
  }

  var btnSacuvaj = document.getElementById("btn-save-book");
  if (btnSacuvaj) {
    btnSacuvaj.addEventListener("click", saveBookForm);
  }

  var zatvoriFormu = document.getElementById("modal-book-close");
  var otkaziFormu = document.getElementById("modal-book-cancel");
  var pozadinaForme = document.getElementById("modal-book-form");

  if (zatvoriFormu) zatvoriFormu.addEventListener("click", closeModalKnjige);
  if (otkaziFormu) otkaziFormu.addEventListener("click", closeModalKnjige);
  if (pozadinaForme) {
    pozadinaForme.addEventListener("click", function (e) {
      if (e.target === pozadinaForme) {
        closeBookModal();
      }
    });
  }

  var zatvori = document.getElementById("modal-delete-close");
  var otkazi = document.getElementById("modal-delete-cancel");
  var potvrdi = document.getElementById("modal-delete-confirm");
  var pozadina = document.getElementById("modal-delete-book");

  if (zatvori) zatvori.addEventListener("click", zatvoriDijalogBrisanja);
  if (otkazi) otkazi.addEventListener("click", zatvoriDijalogBrisanja);
  if (potvrdi) potvrdi.addEventListener("click", confirmDeleteBook);
  if (pozadina) {
    pozadina.addEventListener("click", function (e) {
      if (e.target === pozadina) {
        closeConfirmDialog();
      }
    });
  }
}

window.addEventListener("DOMContentLoaded", function () {
  loadAdminBooks();
  bindAdminEvents();
});
