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
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    const result = await fetch("/api/v1/user/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const resultJson = await result.json();
    if (resultJson.error) {
      alert(resultJson.error);
      localStorage.clear();
      return;
    }
    console.log(resultJson);
    const { nickname, location, website, id } = resultJson;
    localStorage.setItem("name", nickname);
    localStorage.setItem("location", location);
    localStorage.setItem("website", website);
    localStorage.setItem("userId", id);
    removeSignInSignUpForm();
    appendRightColTitle(nickname);
    updateProfileIconLink(id);
  }
};

const removeSignInSignUpForm = () => {
  $("#signin-signup-form").remove();
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
