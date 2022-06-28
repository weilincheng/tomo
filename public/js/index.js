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

const createInfowindow = () => {
  const contentString =
    '<div id="content">' +
    '<div id="siteNotice">' +
    "</div>" +
    '<h1 id="firstHeading" class="firstHeading">Uluru</h1>' +
    '<div id="bodyContent">' +
    "<p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large " +
    "sandstone rock formation in the southern part of the " +
    "Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) " +
    "south west of the nearest large town, Alice Springs; 450&#160;km " +
    "(280&#160;mi) by road. Kata Tjuta and Uluru are the two major " +
    "features of the Uluru - Kata Tjuta National Park. Uluru is " +
    "sacred to the Pitjantjatjara and Yankunytjatjara, the " +
    "Aboriginal people of the area. It has many springs, waterholes, " +
    "rock caves and ancient paintings. Uluru is listed as a World " +
    "Heritage Site.</p>" +
    '<p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">' +
    "https://en.wikipedia.org/w/index.php?title=Uluru</a> " +
    "(last visited June 22, 2009).</p>" +
    "</div>" +
    "</div>";

  return new google.maps.InfoWindow({
    content: contentString,
  });
};

const createIcon = (map, pos, profileImage) => {
  const icon = {
    url: `${profileImage}`,
    scaledSize: new google.maps.Size(50, 50), // scaled size
    origin: new google.maps.Point(0, 0), // origin
    anchor: new google.maps.Point(0, 0), // anchor
  };
  return new google.maps.Marker({
    position: pos,
    animation: google.maps.Animation.DROP,
    map,
    icon,
  });
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

  const panToCurrentLocationControlDiv = document.createElement("div");
  panToCurrentLocationControl(panToCurrentLocationControlDiv, map);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(
    panToCurrentLocationControlDiv
  );

  // socket.on("update position", (data) => {
  //   const { socketId, userId, pos, name, location, website, profileImage } =
  //     data;
  //   if (markersList.has(socketId)) {
  //     updateMarker(socketId, pos);
  //   } else {
  //     createPlacesMarker(map, socketId, pos, name);
  //     if ($("#signin-signup-form").length === 0) {
  //       const card = createUserCard(socketId);
  //       appendUserCard(card);
  //       updateCardTitleText(socketId, name, location, website, profileImage);
  //       updateUserCardLink(socketId, userId);
  //     }
  //   }
  // });
  // socket.on("remove position", (data) => {
  //   const { socketId } = data;
  //   removeUserCard(socketId);
  //   removeMarker(socketId);
  // });
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

const panToCurrentLocationControl = (controlDiv, map) => {
  const controlUI = document.createElement("div");
  controlUI.style.backgroundColor = "#fff";
  controlUI.style.border = "2px solid #fff";
  controlUI.style.borderRadius = "3px";
  controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
  controlUI.style.cursor = "pointer";
  controlUI.style.marginTop = "8px";
  controlUI.style.marginBottom = "22px";
  controlUI.style.textAlign = "center";
  controlUI.title = "Click to pan to current location";
  controlDiv.appendChild(controlUI);

  const controlText = document.createElement("div");
  controlText.style.color = "rgb(25,25,25)";
  controlText.style.fontFamily = "Roboto,Arial,sans-serif";
  controlText.style.fontSize = "16px";
  controlText.style.lineHeight = "38px";
  controlText.style.paddingLeft = "5px";
  controlText.style.paddingRight = "5px";
  controlText.innerHTML = "Pan to Current Location";
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
      const currentUserIcon = createIcon(
        map,
        pos,
        `${cloudfrontUrl}/${profileImage}`
      );
      const currentUserInfowindow = createInfowindow();
      currentUserIcon.addListener("click", () => {
        currentUserInfowindow.open({
          anchor: currentUserIcon,
          map,
          shouldFocus: false,
        });
      });
      map.setCenter(pos);
      map.setZoom(18);
    });

    // navigator.geolocation.watchPosition((position) => {
    //   const { latitude, longitude } = position.coords;
    //   const pos = {
    //     lat: latitude + randomVariation(),
    //     lng: longitude + randomVariation(),
    //   };
    //   updateMarker(socket.id, pos);
    //   socket.emit("update position", {
    //     pos,
    //     socketId: socket.id,
    //     userId,
    //     name,
    //     location,
    //     website,
    //     profileImage,
    //   });
    // });
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
const cloudfrontUrl = "https://d3efyzwqsfoubm.cloudfront.net";
const markersList = new Map();
let map;
window.initMap = initMap;

$("#signin").click(() => {
  window.location.href = "/signin";
});
$("#signup").click(() => {
  window.location.href = "/signup";
});
