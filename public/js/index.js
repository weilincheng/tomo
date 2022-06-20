const randomVariation = () => {
  return (Math.random() - 0.5) * 0.0005;
};

const updateMarker = (socketId, pos) => {
  const marker = markersList.get(socketId);
  marker.setPosition(pos);
};

const createMarker = (map, socketId, pos, name) => {
  const marker = new google.maps.Marker({
    position: pos,
    map: map,
    label: {
      color: "blue",
      fontWeight: "bold",
      text: name ? name : "annonymous",
    },
  });
  markersList.set(socketId, marker);
  createUserCard(socketId, name, pos);
};

const removeMarker = (socketId) => {
  const marker = markersList.get(socketId);
  marker.setMap(null);
  markersList.delete(socketId);
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
    const userId = localStorage.getItem("userId");
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const pos = { lat: latitude, lng: longitude };
      createMarker(map, socket.id, pos, "You are here");
      socket.emit("update position", {
        pos,
        socketId: socket.id,
        userId,
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
        socketId: socket.id,
        userId,
        name,
        location,
        website,
      });
    });
  }
  socket.on("update position", (data) => {
    const { socketId, userId, pos, name, location, website } = data;
    if (markersList.has(socketId)) {
      updateMarker(socketId, pos);
    } else {
      createMarker(map, socketId, pos, name);
      if ($("#signin-signup-form").length === 0) {
        const card = createUserCard(socketId, name, pos);
        appendUserCard(card);
        updateCardTitleText(socketId, name, location, website);
        updateUserCardLink(socketId, userId);
      }
    }
  });
  socket.on("remove position", (data) => {
    const { socketId } = data;
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
    const { name, location, website, id } = resultJson;
    localStorage.setItem("name", name);
    localStorage.setItem("location", location);
    localStorage.setItem("website", website);
    localStorage.setItem("userId", id);
    removeSignInSignUpForm();
    appendRightColTitle(name);
    updateProfileIconLink(id);
  }
};

const removeSignInSignUpForm = () => {
  $("#signin-signup-form").remove();
};

const createUserCard = (socketId) => {
  const card = $('<div class="card mb-3" style="max-width: 540px;">');
  card.attr("id", `user-card-${socketId}`);
  const cardRow = $('<div class="row g-0">');
  const cardColImage = $('<div class="col-md-4">');
  const cardImage = $(
    '<img class="img-fluid rounded-circle" src="https://via.placeholder.com/150" alt="Card image">'
  );
  cardColImage.append(cardImage);
  cardRow.append(cardColImage);
  const cardColBody = $('<div class="col-md-8">');
  const cardBody = $('<div class="card-body">');
  const cardTitle = $('<h5 class="card-title"></h5>');
  cardTitle.attr("id", `card-title-${socketId}`);
  cardBody.append(cardTitle);
  const cardText = $('<p class="card-text"></p>');
  cardText.attr("id", `card-text-${socketId}`);
  cardBody.append(cardText);
  cardColBody.append(cardBody);
  cardRow.append(cardColBody);
  card.append(cardRow);
  return card;
};

const appendUserCard = (card) => {
  $("#right-col").append(card);
};

const updateCardTitleText = (socketId, name, location, website) => {
  $("#card-title-" + socketId).text(name ? name : "annonymous");
  $("#card-text-" + socketId).text(
    `${location ? location : ""} ${website ? website : ""}`
  );
};

const appendRightColTitle = (name) => {
  const title = $('<p class="fs-3"></p>');
  title.text(`Welcome, ${name}!`);
  const text = $('<p class="fs-6"></p>');
  text.text(`Let's see who is nearby!`);
  $("#right-col").append(title);
  $("#right-col").append(text);
};

const removeUserCard = (socketId) => {
  $(`#user-card-${socketId}`).remove();
};

const updateProfileIconLink = (userId) => {
  $("#nav-profile-link").attr("href", `/user/${userId}`);
};

const updateUserCardLink = (socketId, userId) => {
  console.log(`card-title-${socketId}`);
  $("#card-title-" + socketId).wrap(
    `<a href="/user/${userId}" target="_blank" rel="noopener noreferrer"></a>`
  );
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
