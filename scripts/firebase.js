var firebaseUrl = "https://web-dizajn-6d8a7-default-rtdb.europe-west1.firebasedatabase.app";

function loadFromFirebase(path, onSuccess, onError) {
  var request = new XMLHttpRequest();
  request.open("GET", firebaseUrl + "/" + path + ".json");
  request.onreadystatechange = function () {
    if (request.readyState !== 4) {
      return;
    }
    if (request.status === 200) {
      var data = JSON.parse(request.responseText);
      if (onSuccess) {
        onSuccess(data);
      }
    } else if (onError) {
      onError(request.status);
    }
  };
  request.send();
}

function addToFirebase(path, data, onSuccess, onError) {
  var request = new XMLHttpRequest();
  request.open("POST", firebaseUrl + "/" + path + ".json");
  request.setRequestHeader("Content-Type", "application/json");
  request.onreadystatechange = function () {
    if (request.readyState !== 4) {
      return;
    }
    if (request.status === 200) {
      var response = JSON.parse(request.responseText);
      if (onSuccess) {
        onSuccess(response);
      }
    } else if (onError) {
      onError(request.status);
    }
  };
  request.send(JSON.stringify(data));
}

function updateInFirebase(path, id, data, onSuccess, onError) {
  var request = new XMLHttpRequest();
  request.open("PUT", firebaseUrl + "/" + path + "/" + id + ".json");
  request.setRequestHeader("Content-Type", "application/json");
  request.onreadystatechange = function () {
    if (request.readyState !== 4) {
      return;
    }
    if (request.status === 200) {
      var response = JSON.parse(request.responseText);
      if (onSuccess) {
        onSuccess(response);
      }
    } else if (onError) {
      onError(request.status);
    }
  };
  request.send(JSON.stringify(data));
}

function deleteFromFirebase(path, id, onSuccess, onError) {
  var request = new XMLHttpRequest();
  request.open("DELETE", firebaseUrl + "/" + path + "/" + id + ".json");
  request.onreadystatechange = function () {
    if (request.readyState !== 4) {
      return;
    }
    if (request.status === 200) {
      if (onSuccess) {
        onSuccess();
      }
    } else if (onError) {
      onError(request.status);
    }
  };
  request.send();
}
