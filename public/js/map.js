const createInfowindow = (nickname, userId, bio) => {
  const contentString = `<div id="content"> 
    <div id="siteNotice">
    </div>
    <h5 id="firstHeading" class="firstHeading">${nickname}</h5>
    <div id="bodyContent">
    <a href="/user/${userId}" target="_blank">View Profile</a>
    <p>${bio}</p>
    </div>
    </div>`;

  return new google.maps.InfoWindow({
    content: contentString,
  });
};

const createClusterIcon = (map, pos, count) => {
  const cloudfrontUrl = "https://d3efyzwqsfoubm.cloudfront.net/asset";
  let url = `${cloudfrontUrl}/m1.png`;
  if (count > 10 && count <= 250) {
    url = `${cloudfrontUrl}/m2.png`;
  } else if (count > 250 && count <= 500) {
    url = `${cloudfrontUrl}/m3.png`;
  } else if (count > 500 && count <= 1000) {
    url = `${cloudfrontUrl}/m4.png`;
  } else if (count > 1000) {
    url = `${cloudfrontUrl}/m5.png`;
  }
  const clusterIcon = {
    url: url,
    scaledSize: new google.maps.Size(50, 50), // scaled size
    origin: new google.maps.Point(0, 0), // origin
    anchor: new google.maps.Point(0, 0), // anchor
  };
  return new google.maps.Marker({
    position: pos,
    map,
    icon: clusterIcon,
    label: { text: count.toString(), color: "white" },
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
  userIconClusterer.clearMarkers();
};

function initMap() {
  const appWorksSchool = { lat: 25.03843, lng: 121.532488 };
  map = new google.maps.Map($("#map")[0], {
    center: appWorksSchool,
    zoom: 7,
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
  google.maps.event.addListener(map, "idle", () => {
    zoomLevel = map.getZoom();
    visibleLatLL = map.getBounds().getSouthWest().lat();
    visibleLngLL = map.getBounds().getSouthWest().lng();
    visibleLatUR = map.getBounds().getNorthEast().lat();
    visibleLngUR = map.getBounds().getNorthEast().lng();
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      const minAgeInput = $("#minAgeRangeInput").val();
      const maxAgeInput = $("#maxAgeRangeInput").val();
      const gender = $("#gender").val();
      const interestsArray = $("#interests-select").selectivity("value");
      const minAge = parseInt(minAgeInput);
      const maxAge = parseInt(maxAgeInput);
      renderUsersIcon(
        accessToken,
        map,
        markers,
        visibleLatLL,
        visibleLngLL,
        visibleLatUR,
        visibleLngUR,
        minAge,
        maxAge,
        gender,
        interestsArray
      );
    }
  });
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
      bio,
      profile_image: profileImage,
    } = userInfoJson;
    localStorage.setItem("nickname", nickname);
    localStorage.setItem("location", location);
    localStorage.setItem("website", website);
    localStorage.setItem("userId", id);
    localStorage.setItem("bio", bio);
    localStorage.setItem("profileImage", profileImage);
    $(() => {
      $("#main-content").removeClass("invisible");
      updateProfileIconLink(id);
    });
  } else {
    alert("Please sign in or sign up first");
    window.location = "/signin";
  }
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

const getCurrentLocaiton = async (map) => {
  if (navigator.geolocation) {
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
        website,
        id,
        bio,
        profile_image: profileImage,
      } = userInfoJson;
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
        const currentUserInfowindow = createInfowindow(nickname, id, bio);
        currentUserIcon.addListener("click", () => {
          currentUserInfowindow.open({
            anchor: currentUserIcon,
            map,
            shouldFocus: false,
          });
        });
        map.setCenter(pos);
        map.setZoom(19);
      });
    }
  }
};

const getUsersLocation = async (
  accessToken,
  visibleLatLL,
  visibleLngLL,
  visibleLatUR,
  visibleLngUR,
  zoomLevel,
  minAge,
  maxAge,
  gender,
  interests
) => {
  let targetUrl = `/api/v1/location/?latLL=${visibleLatLL}&lngLL=${visibleLngLL}&latUR=${visibleLatUR}&lngUR=${visibleLngUR}&zoomLevel=${zoomLevel}&min_age=${minAge}&max_age=${maxAge}`;
  if (gender) {
    targetUrl += `&gender=${gender}`;
  }
  if (interests.length > 0) {
    for (const interest of interests) {
      targetUrl += `&interests=${interest}`;
    }
  }
  const result = await fetch(targetUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const resultJson = await result.json();
  return resultJson;
};

const renderUsersIcon = async (
  accessToken,
  map,
  markers,
  visibleLatLL,
  visibleLngLL,
  visibleLatUR,
  visibleLngUR,
  minAge,
  maxAge,
  gender,
  interestsArray
) => {
  while (markers.length > 0) {
    const marker = markers.pop();
    marker.setMap(null);
  }
  if (userIconClusterer) {
    userIconClusterer.clearMarkers();
  }
  $(".user-card").remove();
  const usersLocation = await getUsersLocation(
    accessToken,
    visibleLatLL,
    visibleLngLL,
    visibleLatUR,
    visibleLngUR,
    zoomLevel,
    minAge,
    maxAge,
    gender,
    interestsArray
  );
  for (const user of usersLocation) {
    const {
      geo_location_lat: lat,
      geo_location_lng: lng,
      profile_image: profileImage,
      id: userId,
      nickname,
      interests,
      bio,
      type,
      clusterSize,
    } = user;
    if (lat && lng && userId !== parseInt(localStorage.getItem("userId"))) {
      if (type !== "clusterMarker") {
        renderUserCard(userId, nickname, profileImage, bio);
      }
      const pos = { lat, lng };
      let profileUrl;
      if (typeof profileImage !== "undefined") {
        if (profileImage.slice(0, 5) === "https") {
          profileUrl = profileImage;
        } else {
          profileUrl = `${cloudfrontUrl}/${profileImage}`;
        }
      }
      if (type === "clusterMarker") {
        const clusterMarker = createClusterIcon(map, pos, clusterSize);
        clusterMarker.addListener("click", () => {
          const zoomLevel = map.getZoom();
          map.setCenter(pos);
          const noAggregationZoomLevel = 19;
          if (zoomLevel <= noAggregationZoomLevel - 3) {
            map.setZoom(zoomLevel + 3);
          } else {
            map.setZoom(noAggregationZoomLevel);
          }
        });
        markers.push(clusterMarker);
      } else {
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
  }
};

const renderFilteredUsersIcon = async (map, usersLocation, markers) => {
  while (markers.length > 0) {
    const marker = markers.pop();
    marker.setMap(null);
  }
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
      type,
      clusterSize,
    } = user;
    if (lat && lng && userId !== parseInt(localStorage.getItem("userId"))) {
      if (type !== "clusterMarker") {
        renderUserCard(userId, nickname, profileImage, bio);
      }
      const pos = { lat, lng };
      let profileUrl;
      if (typeof profileImage !== "undefined") {
        if (profileImage.slice(0, 5) === "https") {
          profileUrl = profileImage;
        } else {
          profileUrl = `${cloudfrontUrl}/${profileImage}`;
        }
      }
      if (type === "clusterMarker") {
        const clusterMarker = createClusterIcon(map, pos, clusterSize);
        markers.push(clusterMarker);
      } else {
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
  }
  // userIconClusterer = new markerClusterer.MarkerClusterer({ map, markers });
};

const renderUserCard = async (userId, nickname, profileImage, bio) => {
  const user = $(
    '<div class="row w-100 mb-4 user-card text-decoration-none align-items-center"></div>'
  );
  // user.attr("href", `/user/${userId}`);
  const profileImageDiv = $('<div class="col-2 d-flex "></div>');
  profileImageDiv.css({
    display: "inline-block",
    width: "50px",
    height: "50px",
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
    '<div class="col-10 d-flex flex-column justify-content-center my-2"></div>'
  );
  const username = $(
    '<a class="text-decoration-none"><p class="fs-5 fw-semibold my-0 px-2 text-muted "></p></a>'
  );
  username.children().text(nickname);
  username.attr("href", `/user/${userId}`);
  const bioP = $('<p class="fs-6 fw-light my-0 px-2 lh-sm"></p>').text(bio);
  userInfoCol.append(username);
  userInfoCol.append(bioP);
  user.append(profileImageDiv);
  user.append(userInfoCol);
  $("#user-cards-list-section").append(user);
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
  $("#filters-clear-button").click(async () => {
    $("#minAgeRangeInput").val(20);
    $("#maxAgeRangeInput").val(100);
    $("#minAgeAmount").val(20);
    $("#maxAgeAmount").val(100);
    $("#gender").val("");
    $("#interests-select").selectivity("clear");
    const interestsArray = [];
    const filteredUsersLocation = await getUsersLocation(
      accessToken,
      visibleLatLL,
      visibleLngLL,
      visibleLatUR,
      visibleLngUR,
      zoomLevel,
      20,
      100,
      "",
      interestsArray
    );
    renderFilteredUsersIcon(map, filteredUsersLocation, markers);
  });
  $("#filters-apply-button").click(async () => {
    const minAgeInput = $("#minAgeRangeInput").val();
    const maxAgeInput = $("#maxAgeRangeInput").val();
    const gender = $("#gender").val();
    const interestsArray = $("#interests-select").selectivity("value");
    const minAge = parseInt(minAgeInput);
    const maxAge = parseInt(maxAgeInput);
    const filteredUsersLocation = await getUsersLocation(
      accessToken,
      visibleLatLL,
      visibleLngLL,
      visibleLatUR,
      visibleLngUR,
      zoomLevel,
      minAge,
      maxAge,
      gender,
      interestsArray
    );
    renderFilteredUsersIcon(map, filteredUsersLocation, markers);
  });
};

const renderInterestsSelect = async () => {
  const accessToken = localStorage.getItem("accessToken");
  const result = await fetch(`/api/v1/interests`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const resultJson = await result.json();
  const indoorsInterests = resultJson[0].interests;
  const outdoorsInterests = resultJson[1].interests;
  $("#interests-select").selectivity({
    items: [
      { text: "Indoors", children: indoorsInterests },
      { text: "Outdoors", children: outdoorsInterests },
    ],
    multiple: true,
    placeholder: "Type to search interests",
    backspaceHighlightsBeforeDelete: false,
  });
  $("#interests-select").children().addClass("bg-light");
  $("#interests-select").on("selectivity-selected", () => {
    $(".selectivity-multiple-selected-item").addClass("bg-primary rounded");
  });
  $("#interests-select").on("sselectivity-open", () => {
    $(".selectivity-multiple-selected-item").addClass("bg-primary rounded");
  });
};

const accessToken = localStorage.getItem("accessToken");
checkAccessToken(accessToken);
const google_api_key = $("#map-script").attr("google_api_key");
const script = $("<script></script>", {
  src: `https://maps.googleapis.com/maps/api/js?key=${google_api_key}&map_ids=d91850b214eae5c9&callback=initMap`,
  async: true,
  defer: true,
  type: "text/javascript",
});
script.appendTo("head");
const cloudfrontUrl = "https://d3efyzwqsfoubm.cloudfront.net";
const markersList = new Map();
let map,
  markers = [],
  userIconClusterer,
  visibleLatLL,
  visibleLngLL,
  visibleLatUR,
  visibleLngUR,
  zoomLevel;
window.initMap = initMap;

$("#signin").click(() => {
  window.location.href = "/signin";
});
$("#signup").click(() => {
  window.location.href = "/signup";
});

renderInterestsSelect();
