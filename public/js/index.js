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

const createInfowindow = (nickname, userId, bio) => {
  const contentString = `<div id="content"> 
    <div id="siteNotice">
    </div>
    <h5 id="firstHeading" class="firstHeading">${nickname}</h1>
    <div id="bodyContent">
    <a href="/user/${userId}" target="_blank">View Profile</a>
    <p>${bio}</p>
    </div>
    </div>`;

  return new google.maps.InfoWindow({
    content: contentString,
  });
};

const createIcon = (map, pos, profileImage, animation) => {
  const icon = {
    url: `${profileImage}`,
    scaledSize: new google.maps.Size(50, 50), // scaled size
    origin: new google.maps.Point(0, 0), // origin
    anchor: new google.maps.Point(0, 0), // anchor
  };
  return new google.maps.Marker({
    position: pos,
    animation,
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

function initMap() {
  const appWorksSchool = { lat: 25.03843, lng: 121.532488 };
  map = new google.maps.Map($("#map")[0], {
    center: appWorksSchool,
    zoom: 15,
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
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    renderUsersIcon(accessToken, map, markers);
  }
  attachAgeRangeListener();
  attachApplyFilterListener(map);
}

const checkAccessToken = async (accessToken) => {
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
    localStorage.setItem("nickname", nickname);
    localStorage.setItem("location", location);
    localStorage.setItem("website", website);
    localStorage.setItem("userId", id);
    localStorage.setItem("profileImage", profileImage);
    $(() => {
      removeSignInSignUpForm();
      displayGreetingAndSearch();
      updateProfileIconLink(id);
    });
  }
};

const displayGreetingAndSearch = () => {
  $("#greeting-name").text(`Welcome, ${localStorage.getItem("nickname")}!`);
  $("#greeting").removeClass("invisible");
  $("#filters-button").removeClass("invisible");
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
    const nickname = localStorage.getItem("nickname");
    const location = localStorage.getItem("location");
    const website = localStorage.getItem("website");
    const userId = localStorage.getItem("userId");
    const profileImage = localStorage.getItem("profileImage");
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const pos = { lat: latitude, lng: longitude };
      let profileUrl;
      if (profileImage.slice(0, 5) === "https") {
        profileUrl = profileImage;
      } else {
        profileUrl = `${cloudfrontUrl}/${profileImage}`;
      }
      const currentUserIcon = createIcon(
        map,
        pos,
        profileUrl,
        google.maps.Animation.DROP
      );
      const currentUserInfowindow = createInfowindow(nickname);
      currentUserIcon.addListener("click", () => {
        currentUserInfowindow.open({
          anchor: currentUserIcon,
          map,
          shouldFocus: false,
        });
      });
      map.setCenter(pos);
      map.setZoom(15);
    });
  }
};

const getUsersLocation = async (accessToken) => {
  const result = await fetch(`/api/v1/location/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const resultJson = await result.json();
  return resultJson;
};

const renderUsersIcon = async (accessToken, map, markers) => {
  const usersLocation = await getUsersLocation(accessToken);
  for (const user of usersLocation) {
    const {
      geo_location_lat: lat,
      geo_location_lng: lng,
      profile_image: profileImage,
      id: userId,
      nickname,
      interests,
      bio,
    } = user;
    if (lat && lng && userId !== parseInt(localStorage.getItem("userId"))) {
      renderUserCard(userId, nickname, profileImage, bio);
      const pos = { lat, lng };
      let profileUrl;
      if (profileImage.slice(0, 5) === "https") {
        profileUrl = profileImage;
      } else {
        profileUrl = `${cloudfrontUrl}/${profileImage}`;
      }
      const userIcon = createIcon(map, pos, profileUrl);
      markers.push(userIcon);
      const iconInfowindow = createInfowindow(nickname, userId, bio);
      userIcon.addListener("click", () => {
        iconInfowindow.open({
          anchor: userIcon,
          map,
          shouldFocus: false,
        });
      });
    }
  }
  userIconClusterer = new markerClusterer.MarkerClusterer({ map, markers });
};

const renderFilteredUsersIcon = async (map, usersLocation, markers) => {
  while (markers.length > 0) {
    const marker = markers.pop();
    marker.setMap(null);
  }
  userIconClusterer.clearMarkers();
  $(".user-card").remove();
  for (const user of usersLocation) {
    const {
      geo_location_lat: lat,
      geo_location_lng: lng,
      profile_image: profileImage,
      id: userId,
      nickname,
      interests,
      bio,
    } = user;
    if (lat && lng && userId !== parseInt(localStorage.getItem("userId"))) {
      renderUserCard(userId, nickname, profileImage, bio);
      const pos = { lat, lng };
      let profileUrl;
      if (profileImage.slice(0, 5) === "https") {
        profileUrl = profileImage;
      } else {
        profileUrl = `${cloudfrontUrl}/${profileImage}`;
      }
      const userIcon = createIcon(map, pos, profileUrl);
      markers.push(userIcon);
      const iconInfowindow = createInfowindow(nickname, userId, bio);
      userIcon.addListener("click", () => {
        iconInfowindow.open({
          anchor: userIcon,
          map,
          shouldFocus: false,
        });
      });
    }
  }
  userIconClusterer = new markerClusterer.MarkerClusterer({ map, markers });
};

const renderUserCard = async (userId, nickname, profileImage, bio) => {
  const user = $(
    '<a class="row w-100 mb-2 user-card text-decoration-none"></a>'
  );
  user.attr("href", `/user/${userId}`);
  const profileImageDiv = $(
    '<div class="col-3 d-flex align-items-center"></div>'
  );
  profileImageDiv.css({
    display: "inline-block",
    width: "80px",
    height: "80px",
    "border-radius": "50%",
    "background-repeat": "no-repeat",
    "background-position": "center center",
    "background-size": "cover",
    "background-image": `url("https://via.placeholder.com/100")`,
  });
  if (profileImage) {
    if (profileImage.slice(0, 5) === "https") {
      profileImageDiv.css("background-image", `url(${profileImage})`);
    } else {
      profileImageDiv.css(
        "background-image",
        `url('${cloudfrontUrl}/${profileImage}')`
      );
    }
  }
  const userInfoCol = $(
    '<div class="col-9 d-flex flex-column justify-content-center my-2"></div>'
  );
  const username = $('<p class="fs-5 my-0 px-2"></p>').text(nickname);
  const bioP = $('<p class="fs-5 my-0 px-2"></p>').text(bio);
  userInfoCol.append(username);
  userInfoCol.append(bioP);
  user.append(profileImageDiv);
  user.append(userInfoCol);
  $("#right-col").append(user);
};

const attachAgeRangeListener = () => {
  const minAgeInput = $("#minAgeRangeInput").val();
  const maxAgeInput = $("#maxAgeRangeInput").val();
  $("#maxAgeRangeInput").attr("min", minAgeInput);
  $("#minAgeRangeInput").attr("max", maxAgeInput);
  $("#minAgeRangeInput").change(() => {
    const minAgeInput = $("#minAgeRangeInput").val();
    $("#maxAgeRangeInput").attr("min", minAgeInput);
  });
  $("#maxAgeRangeInput").change(() => {
    const maxAgeInput = $("#maxAgeRangeInput").val();
    $("#minAgeRangeInput").attr("max", maxAgeInput);
  });
};

const attachApplyFilterListener = (map) => {
  $("#filters-clear-button").click(() => {
    $("#minAgeRangeInput").val(20);
    $("#maxAgeRangeInput").val(100);
    $("#minAgeAmount").val(20);
    $("#maxAgeAmount").val(100);
    $("#gender").val("");
    $("[id$=checkbox]").prop("checked", false);
  });
  $("#filters-apply-button").click(async () => {
    const minAgeInput = $("#minAgeRangeInput").val();
    const maxAgeInput = $("#maxAgeRangeInput").val();
    const interests = $("[id$=checkbox]");
    const gender = $("#gender").val();
    const interestsArray = [];
    for (const interest of interests) {
      if (interest.checked) {
        const interestName = interest.id.split("-")[0];
        interestsArray.push(interestName);
      }
    }
    const minAge = parseInt(minAgeInput);
    const maxAge = parseInt(maxAgeInput);
    const filteredUsersLocation = await fetchFilteredUsersLocation(
      minAge,
      maxAge,
      gender,
      interestsArray
    );
    renderFilteredUsersIcon(map, filteredUsersLocation, markers);
  });
};

const fetchFilteredUsersLocation = async (
  minAge,
  maxAge,
  gender,
  interests
) => {
  let targetUrl = `/api/v1/location/?min_age=${minAge}&max_age=${maxAge}`;
  if (gender) {
    targetUrl += `&gender=${gender}`;
  }
  if (interests.length > 0) {
    for (const interest of interests) {
      targetUrl += `&interests=${interest}`;
    }
  }
  console.log("targetUrl", targetUrl);
  const result = await fetch(targetUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const resultJson = await result.json();
  return resultJson;
};

const accessToken = localStorage.getItem("accessToken");
checkAccessToken(accessToken);
const google_api_key = $("#map-script").attr("google_api_key");
const socket_host = $("#map-script").attr("socket_host");
const script = $("<script></script>", {
  src: `https://maps.googleapis.com/maps/api/js?key=${google_api_key}&map_ids=d91850b214eae5c9&callback=initMap`,
  async: true,
  defer: true,
  type: "text/javascript",
});
script.appendTo("head");
// const socket = io(socket_host);
const cloudfrontUrl = "https://d3efyzwqsfoubm.cloudfront.net";
const markersList = new Map();
let map,
  markers = [],
  userIconClusterer;
window.initMap = initMap;
// renderUsersIcon(accessToken, map);

$("#signin").click(() => {
  window.location.href = "/signin";
});
$("#signup").click(() => {
  window.location.href = "/signup";
});
