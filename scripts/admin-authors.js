var adminAuthorsCache = {};
var selectedAuthorId = null;

function loadAdminAuthors() {
  var tbody = document.getElementById("admin-table-body");
  if (!tbody) {
    return;
  }

  tbody.innerHTML = "<tr><td colspan=\"7\">Loading...</td></tr>";

  loadFromFirebase("autori", function (autori) {
    adminAuthorsCache = autori || {};
    renderAdminTableAutora();
  }, function () {
    tbody.innerHTML = "<tr><td colspan=\"7\">Error loading authors.</td></tr>";
  });
}

function renderAdminTableAutora() {
  var tbody = document.getElementById("admin-table-body");
  var lista = toList(adminAuthorsCache);

  lista.sort(function (a, b) {
    return getAuthorFullName(a.data).localeCompare(getAuthorFullName(b.data), "en");
  });

  if (lista.length === 0) {
    tbody.innerHTML = "<tr><td colspan=\"7\">No authors found.</td></tr>";
    return;
  }

  var html = "";
  for (var i = 0; i < lista.length; i++) {
    var stavka = lista[i];
    var autor = stavka.data;
    var slika = autor.slike && autor.slike[0] ? autor.slike[0] : "";

    html += "<tr>";
    html += "<td><img src=\"" + escapeHtml(slika) + "\" alt=\"\" class=\"thumb\" /></td>";
    html += "<td>" + escapeHtml(getAuthorFullName(autor)) + "</td>";
    html += "<td>" + escapeHtml(autor.status) + "</td>";
    html += "<td>" + escapeHtml(autor.brojOsvojenihNagrada) + "</td>";
    html += "<td>" + escapeHtml(formatNumber(autor.brojProdatihPrimeraka)) + "</td>";
    html += "<td>" + escapeHtml(autor.kontaktTelefonMenadzera) + "</td>";
    html += "<td><div class=\"table-actions\">";
    html += "<button type=\"button\" class=\"btn btn-outline btn-sm\" data-action=\"izmeni\" data-id=\"" + escapeHtml(stavka.id) + "\">Edit</button>";
    html += "<button type=\"button\" class=\"btn btn-danger btn-sm\" data-action=\"obrisi\" data-id=\"" + escapeHtml(stavka.id) + "\">Delete</button>";
    html += "</div></td></tr>";
  }

  tbody.innerHTML = html;

  var dugmad = tbody.querySelectorAll("button[data-action]");
  for (var j = 0; j < dugmad.length; j++) {
    dugmad[j].addEventListener("click", handleTableActionAutora);
  }
}

function handleTableActionAutora(dogadjaj) {
  var btn = dogadjaj.currentTarget;
  var action = btn.getAttribute("data-action");
  var id = btn.getAttribute("data-id");

  if (action === "edit") {
    fillAuthorForm(id);
  } else if (action === "delete") {
    openAuthorDeleteDialog(id);
  }
}

function openAuthorModal() {
  document.getElementById("modal-author-form").classList.add("open");
}

function closeAuthorModal() {
  document.getElementById("modal-author-form").classList.remove("open");
}

function fillAuthorForm(id) {
  var autor = adminAuthorsCache[id];
  if (!autor) {
    return;
  }

  selectedAuthorId = id;
  hideMessage("admin-modal-message");
  hideMessage("admin-message");


  document.getElementById("author-first-name-input").value = autor.ime || "";
  document.getElementById("author-last-name-input").value = autor.prezime || "";
  document.getElementById("author-bio-input").value = autor.biografija || "";
  document.getElementById("author-status-input").value = autor.status || "";
  document.getElementById("author-birth-date-input").value = autor.datumRodjenja || "";
  document.getElementById("author-awards-input").value = autor.brojOsvojenihNagrada != null ? autor.brojOsvojenihNagrada : "";
  document.getElementById("author-copies-input").value = autor.brojProdatihPrimeraka != null ? autor.brojProdatihPrimeraka : "";
  document.getElementById("author-phone-input").value = autor.kontaktTelefonMenadzera || "";

  var slikeTekst = "";
  if (autor.slike && autor.slike.length > 0) {
    slikeTekst = autor.slike.join(", ");
  }
  document.getElementById("author-images-input").value = slikeTekst;

  var naslovForme = document.getElementById("admin-form-title");
  if (naslovForme) {
    naslovForme.textContent = "Edit Author: " + getAuthorFullName(autor);
  }

  openAuthorModal();
}

function openNewAuthor() {
  clearAuthorForm();
  var naslovForme = document.getElementById("admin-form-title");
  if (naslovForme) {
    naslovForme.textContent = "New Author";
  }
  openAuthorModal();
}

function clearAuthorForm() {
  selectedAuthorId = null;
  hideMessage("admin-modal-message");
  hideMessage("admin-message");

  document.getElementById("author-first-name-input").value = "";
  document.getElementById("author-last-name-input").value = "";
  document.getElementById("author-bio-input").value = "";
  document.getElementById("author-status-input").value = "";
  document.getElementById("author-birth-date-input").value = "";
  document.getElementById("author-awards-input").value = "";
  document.getElementById("author-copies-input").value = "";
  document.getElementById("author-phone-input").value = "";
  document.getElementById("author-images-input").value = "";
}

function readAuthorForm() {
  var slikeRaw = document.getElementById("author-images-input").value.trim();
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
    ime: document.getElementById("author-first-name-input").value.trim(),
    prezime: document.getElementById("author-last-name-input").value.trim(),
    biografija: document.getElementById("author-bio-input").value.trim(),
    status: document.getElementById("author-status-input").value.trim(),
    datumRodjenja: document.getElementById("author-birth-date-input").value,
    brojOsvojenihNagrada: document.getElementById("author-awards-input").value,
    brojProdatihPrimeraka: document.getElementById("author-copies-input").value,
    kontaktTelefonMenadzera: document.getElementById("author-phone-input").value.trim(),
    slike: slikeNiz
  };
}

function saveAuthorForm() {
  var podatak = readAuthorForm();
  var greska = validateAuthor(podatak);

  if (greska) {
    showMessage("admin-modal-message", greska, "error");
    return;
  }

  var btn = document.getElementById("btn-save-author");
  var stariTekst = btn.textContent;
  btn.textContent = "Saving...";
  btn.disabled = true;

  if (selectedAuthorId) {
    updateInFirebase("autori", selectedAuthorId, podatak, function () {
      showMessage("admin-message", "Author updated successfully.", "success");
      closeAuthorModal();
      loadAdminAuthors();
      btn.textContent = stariTekst;
      btn.disabled = false;
    }, function () {
      showMessage("admin-modal-message", "Error updating author.", "error");
      btn.textContent = stariTekst;
      btn.disabled = false;
    });
  } else {
    addToFirebase("autori", podatak, function () {
      showMessage("admin-message", "Author added successfully.", "success");
      closeAuthorModal();
      loadAdminAuthors();
      btn.textContent = stariTekst;
      btn.disabled = false;
    }, function () {
      showMessage("admin-modal-message", "Error adding author.", "error");
      btn.textContent = stariTekst;
      btn.disabled = false;
    });
  }
}

function openAuthorDeleteDialog(id) {
  var autor = adminAuthorsCache[id];
  if (!autor) {
    return;
  }

  selectedAuthorId = id;
  var tekst = document.getElementById("modal-delete-text");
  tekst.textContent = "Are you sure you want to delete the author \"" + getAuthorFullName(autor) + "\"?";

  document.getElementById("modal-delete-author").classList.add("open");
}

function closeAuthorDeleteDialog() {
  document.getElementById("modal-delete-author").classList.remove("open");
}

function confirmDeleteAuthor() {
  var idZaBrisanje = selectedAuthorId;
  var btn = document.getElementById("modal-delete-confirm");
  var stariTekst = btn ? btn.textContent : "Delete";
  if (btn) {
    btn.textContent = "Deleting...";
    btn.disabled = true;
  }

  deleteFromFirebase("autori", idZaBrisanje, function () {
    showMessage("admin-message", "Author deleted successfully.", "success");
    selectedAuthorId = null;
    closeAuthorDeleteDialog();
    loadAdminAuthors();
    if (btn) {
      btn.textContent = stariTekst;
      btn.disabled = false;
    }
  }, function () {
    showMessage("admin-message", "Error deleting author.", "error");
    selectedAuthorId = null;
    closeAuthorDeleteDialog();
    if (btn) {
      btn.textContent = stariTekst;
      btn.disabled = false;
    }
  });
}

function bindAdminAuthorEvents() {
  var btnNovi = document.getElementById("btn-novi-autor");
  if (btnNovi) {
    btnNovi.addEventListener("click", openNewAuthor);
  }

  var btnSacuvaj = document.getElementById("btn-save-author");
  if (btnSacuvaj) {
    btnSacuvaj.addEventListener("click", saveAuthorForm);
  }

  var zatvoriFormu = document.getElementById("modal-author-close");
  var otkaziFormu = document.getElementById("modal-author-cancel");
  var pozadinaForme = document.getElementById("modal-author-form");

  if (zatvoriFormu) zatvoriFormu.addEventListener("click", closeModalAutora);
  if (otkaziFormu) otkaziFormu.addEventListener("click", closeModalAutora);
  if (pozadinaForme) {
    pozadinaForme.addEventListener("click", function (e) {
      if (e.target === pozadinaForme) {
        closeAuthorModal();
      }
    });
  }

  var zatvori = document.getElementById("modal-delete-close");
  var otkazi = document.getElementById("modal-delete-cancel");
  var potvrdi = document.getElementById("modal-delete-confirm");
  var pozadina = document.getElementById("modal-delete-author");

  if (zatvori) zatvori.addEventListener("click", closeAuthorDeleteDialog);
  if (otkazi) otkazi.addEventListener("click", closeAuthorDeleteDialog);
  if (potvrdi) potvrdi.addEventListener("click", confirmDeleteAuthor);
  if (pozadina) {
    pozadina.addEventListener("click", function (e) {
      if (e.target === pozadina) {
        closeAuthorDeleteDialog();
      }
    });
  }
}

window.addEventListener("DOMContentLoaded", function () {
  loadAdminAuthors();
  bindAdminAuthorEvents();
});
