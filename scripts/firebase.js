var firebaseUrl = "https://web-dizajn-6d8a7-default-rtdb.europe-west1.firebasedatabase.app";

function ucitajSaFirebase(putanja, onUspeh, onGreska) {
  var zahtev = new XMLHttpRequest();
  zahtev.open("GET", firebaseUrl + "/" + putanja + ".json");
  zahtev.onreadystatechange = function () {
    if (zahtev.readyState !== 4) {
      return;
    }
    if (zahtev.status === 200) {
      var podaci = JSON.parse(zahtev.responseText);
      if (onUspeh) {
        onUspeh(podaci);
      }
    } else if (onGreska) {
      onGreska(zahtev.status);
    }
  };
  zahtev.send();
}

function dodajUFirebase(putanja, podaci, onUspeh, onGreska) {
  var zahtev = new XMLHttpRequest();
  zahtev.open("POST", firebaseUrl + "/" + putanja + ".json");
  zahtev.setRequestHeader("Content-Type", "application/json");
  zahtev.onreadystatechange = function () {
    if (zahtev.readyState !== 4) {
      return;
    }
    if (zahtev.status === 200) {
      var odgovor = JSON.parse(zahtev.responseText);
      if (onUspeh) {
        onUspeh(odgovor);
      }
    } else if (onGreska) {
      onGreska(zahtev.status);
    }
  };
  zahtev.send(JSON.stringify(podaci));
}

function izmeniUFirebase(putanja, id, podaci, onUspeh, onGreska) {
  var zahtev = new XMLHttpRequest();
  zahtev.open("PUT", firebaseUrl + "/" + putanja + "/" + id + ".json");
  zahtev.setRequestHeader("Content-Type", "application/json");
  zahtev.onreadystatechange = function () {
    if (zahtev.readyState !== 4) {
      return;
    }
    if (zahtev.status === 200) {
      var odgovor = JSON.parse(zahtev.responseText);
      if (onUspeh) {
        onUspeh(odgovor);
      }
    } else if (onGreska) {
      onGreska(zahtev.status);
    }
  };
  zahtev.send(JSON.stringify(podaci));
}

function obrisiIzFirebase(putanja, id, onUspeh, onGreska) {
  var zahtev = new XMLHttpRequest();
  zahtev.open("DELETE", firebaseUrl + "/" + putanja + "/" + id + ".json");
  zahtev.onreadystatechange = function () {
    if (zahtev.readyState !== 4) {
      return;
    }
    if (zahtev.status === 200) {
      if (onUspeh) {
        onUspeh();
      }
    } else if (onGreska) {
      onGreska(zahtev.status);
    }
  };
  zahtev.send();
}
