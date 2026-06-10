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
