const randomVariation = () => {
  return (Math.random() - 0.5) * 0.0005;
};

const updateMarker = (id, pos) => {
  const marker = markersList.get(id);
  marker.setPosition(pos);
};

const createMarker = (map, id, pos, name) => {
  const marker = new google.maps.Marker({
    position: pos,
    map: map,
    label: {
      color: "blue",
      fontWeight: "bold",
      text: name,
    },
  });
  markersList.set(id, marker);
  createUserCard(id, name, pos);
};

const removeMarker = (socketId) => {
  const marker = markersList.get(socketId);
  marker.setMap(null);
  markersList.delete(socketId);
  console.log(`marker ${marker} removed`);
};

const initMap = () => {
  const appWorksSchool = { lat: 25.03843, lng: 121.532488 };
  const map = new google.maps.Map($("#map")[0], {
    center: appWorksSchool,
    zoom: 13,
    mapId: "d91850b214eae5c9",
  });

  if (navigator.geolocation) {
    const name = localStorage.getItem("name");
    const location = localStorage.getItem("location");
    const website = localStorage.getItem("website");
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const pos = { lat: latitude, lng: longitude };
      createMarker(map, socket.id, pos, "You are here");
      socket.emit("update position", {
        pos,
        id: socket.id,
        name,
        location,
        website,
      });
    });

    navigator.geolocation.watchPosition((position) => {
      const { latitude, longitude } = position.coords;
      const pos = {
        lat: latitude + randomVariation(),
        lng: longitude + randomVariation(),
      };
      updateMarker(socket.id, pos);
      socket.emit("update position", {
        pos,
        id: socket.id,
        name,
        location,
        website,
      });
    });
  }
  socket.on("update position", (data) => {
    const { id, pos, name, location, website } = data;
    console.log(`new position ${JSON.stringify(pos)} received from ${id}`);
    if (markersList.has(id)) {
      updateMarker(id, pos);
    } else {
      createMarker(map, id, pos, name);
      if ($("#signin-signup-form").length === 0) {
        const card = createUserCard(id, name, pos);
        appendUserCard(card);
        updateCardTitleText(id, name, location, website);
      }
    }
  });
  socket.on("remove position", (data) => {
    const { socketId } = data;
    console.log(`remove position for socket_id ${socketId}`);
    removeUserCard(socketId);
    removeMarker(socketId);
  });
};

const checkAccessToken = async () => {
  const access_token = localStorage.getItem("access_token");
  if (access_token) {
    const result = await fetch("/api/v1/user/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });
    const resultJson = await result.json();
    if (resultJson.error) {
      alert(result.error);
      return (window.location = "/");
    }
    const { name, location, website } = resultJson;
    localStorage.setItem("name", name);
    localStorage.setItem("location", location);
    localStorage.setItem("website", website);
    removeSignInSignUpForm();
  }
};

const removeSignInSignUpForm = () => {
  $("#signin-signup-form").remove();
};

const createUserCard = (id) => {
  const card = $('<div class="card mb-3" style="max-width: 540px;">');
  card.attr("id", `user-card-${id}`);
  const cardRow = $('<div class="row g-0">');
  const cardColImage = $('<div class="col-md-4">');
  const cardImage = $(
    '<img class="img-fluid rounded-start" src="https://via.placeholder.com/150" alt="Card image">'
  );
  cardColImage.append(cardImage);
  cardRow.append(cardColImage);
  const cardColBody = $('<div class="col-md-8">');
  const cardBody = $('<div class="card-body">');
  const cardTitle = $('<h5 class="card-title"></h5>');
  cardTitle.attr("id", `card-title-${id}`);
  cardBody.append(cardTitle);
  const cardText = $('<p class="card-text"></p>');
  cardText.attr("id", `card-text-${id}`);
  cardBody.append(cardText);
  cardColBody.append(cardBody);
  cardRow.append(cardColBody);
  card.append(cardRow);
  return card;
};

const appendUserCard = (card) => {
  $("#right-col").append(card);
};

const updateCardTitleText = (id, name, location, website) => {
  $("#card-title-" + id).text(name);
  $("#card-text-" + id).text(location + " " + website);
};

const removeUserCard = (id) => {
  $(`#user-card-${id}`).remove();
};

checkAccessToken();

const google_api_key = $("#map-script").attr("google_api_key");
const socket_host = $("#map-script").attr("socket_host");
const script = $("<script></script>", {
  src: `https://maps.googleapis.com/maps/api/js?key=${google_api_key}&map_ids=d91850b214eae5c9&callback=initMap`,
  async: true,
});
script.appendTo("head");
const socket = io(socket_host);
const markersList = new Map();
window.initMap = initMap;

$("#signin").click(() => {
  window.location.href = "/signin";
});
$("#signup").click(() => {
  window.location.href = "/signup";
});
