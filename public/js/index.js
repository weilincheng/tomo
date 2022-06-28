const randomVariation = () => {
  return (Math.random() - 0.5) * 0.0005;
};

const updateMarker = (socketId, pos) => {
  const marker = markersList.get(socketId);
  marker.setPosition(pos);
};

const createPlacesMarker = (map, socketId, pos, name) => {
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
  if (marker) {
    marker.setMap(null);
    markersList.delete(socketId);
  }
};

const initMap = () => {
  const appWorksSchool = { lat: 25.03843, lng: 121.532488 };
  map = new google.maps.Map($("#map")[0], {
    center: appWorksSchool,
    zoom: 13,
    mapId: "d91850b214eae5c9",
    fullscreenControl: false,
    streetViewControl: false,
    mapTypeControl: false,
  });

  const shareLocationControlDiv = document.createElement("div");
  locateMeControl(shareLocationControlDiv, map);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(
    shareLocationControlDiv
  );

  socket.on("update position", (data) => {
    const { socketId, userId, pos, name, location, website, profileImage } =
      data;
    if (markersList.has(socketId)) {
      updateMarker(socketId, pos);
    } else {
      createPlacesMarker(map, socketId, pos, name);
      if ($("#signin-signup-form").length === 0) {
        const card = createUserCard(socketId);
        appendUserCard(card);
        updateCardTitleText(socketId, name, location, website, profileImage);
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
    const verifyResult = await fetch("/api/v1/user/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const resultJson = await verifyResult.json();
    if (resultJson.error) {
      alert(resultJson.error);
      localStorage.clear();
      return;
    }
    const userInfo = await fetch(`/api/v1/user/${resultJson.id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const userInfoJson = await userInfo.json();
    const {
      nickname,
      location,
      website,
      id,
      profile_image: profileImage,
    } = userInfoJson;
    localStorage.setItem("name", nickname);
    localStorage.setItem("location", location);
    localStorage.setItem("website", website);
    localStorage.setItem("userId", id);
    localStorage.setItem("profileImage", profileImage);
    removeSignInSignUpForm();
    appendRightColTitle(nickname);
    updateProfileIconLink(id);
  }
};

const removeSignInSignUpForm = () => {
  $("#signin-signup-form").remove();
};

const shareLocationControl = (controlDiv, map) => {
  const controlUI = document.createElement("div");
  controlUI.style.backgroundColor = "#fff";
  controlUI.style.border = "2px solid #fff";
  controlUI.style.borderRadius = "3px";
  controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
  controlUI.style.cursor = "pointer";
  controlUI.style.marginTop = "8px";
  controlUI.style.marginBottom = "22px";
  controlUI.style.textAlign = "center";
  controlUI.title = "Click to share the location";
  controlDiv.appendChild(controlUI);

  const controlText = document.createElement("div");
  controlText.style.color = "rgb(25,25,25)";
  controlText.style.fontFamily = "Roboto,Arial,sans-serif";
  controlText.style.fontSize = "16px";
  controlText.style.lineHeight = "38px";
  controlText.style.paddingLeft = "5px";
  controlText.style.paddingRight = "5px";
  controlText.innerHTML = "Share My Location";
  controlUI.appendChild(controlText);

  const clickShareLocation = () => {
    getCurrentLocaiton(map);
    controlUI.removeEventListener("click", clickShareLocation, false);
  };
  controlUI.addEventListener("click", clickShareLocation);
};

const getCurrentLocaiton = (map) => {
  if (navigator.geolocation) {
    const name = localStorage.getItem("name");
    const location = localStorage.getItem("location");
    const website = localStorage.getItem("website");
    const userId = localStorage.getItem("userId");
    const profileImage = localStorage.getItem("profileImage");
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const pos = { lat: latitude, lng: longitude };
      createPlacesMarker(map, socket.id, pos, "You are here");
      map.setCenter(pos);
      map.setZoom(18);
      socket.emit("update position", {
        pos,
        socketId: socket.id,
        userId,
        name,
        location,
        website,
        profileImage,
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
        profileImage,
      });
    });
  }
};

checkAccessToken();

const google_api_key = $("#map-script").attr("google_api_key");
const socket_host = $("#map-script").attr("socket_host");
const script = $("<script></script>", {
  src: `https://maps.googleapis.com/maps/api/js?key=${google_api_key}&map_ids=d91850b214eae5c9&callback=initMap`,
  async: true,
});
script.appendTo("head");
// const socket = io(socket_host);
const markersList = new Map();
let map;
window.initMap = initMap;

$("#signin").click(() => {
  window.location.href = "/signin";
});
$("#signup").click(() => {
  window.location.href = "/signup";
});
