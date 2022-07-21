const INITIAL_ZOOM_LEVEL = 8;
const MIN_FIT_BOUNDS_ZOOM_LEVEL = 15;
const createInfowindow = (nickname, userId, bio, interests) => {
  let contentString = `
    <div id="content" class="px-2 py-2 infowindow-content"> 
      <div class="d-flex align-items-center mb-2 justify-content-between">
        <h5 id="firstHeading" class="firstHeading mb-0">${nickname}</h5>
        <a class="infowindowProfileIcon ms-2 rounded-pill" href="/user/${userId}" target="_blank"><i class="fa-regular fa-user"></i></a>
      </div>
      <div id="bodyContent">
        <div class="d-flex flex-column">
  `;
  if (bio) {
    contentString += `
          <div class="d-flex align-items-center mb-2">
            <i class="fa-solid fa-circle-info"></i>
            <p class="ms-1 my-0" >${bio}</p>
          </div>
          <div class="d-flex align-items-center">
          `;
  }
  if (interests.length > 0 && interests[0] !== null) {
    contentString += `<i class="fa-solid fa-heart"></i>`;
    for (const interest of interests) {
      contentString += `
        <span class="ms-1 badge rounded-pill text-bg-primary py-1">${interest}</span>
      `;
    }
  }
  contentString += `
          </div>
        </div>
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
    url: `${profileImage}` + "#custom_marker",
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

async function initMap() {
  await renderInterestsSelect();
  const NANTOU = { lat: 23.961, lng: 120.9719 };
  map = new google.maps.Map($("#map")[0], {
    center: NANTOU,
    zoom: INITIAL_ZOOM_LEVEL,
    mapId: "d91850b214eae5c9",
    fullscreenControl: false,
    streetViewControl: false,
    mapTypeControl: false,
  });

  const userListControlDiv = document.createElement("div");
  const panToCurrentLocationControlDiv = document.createElement("div");
  userListControl(userListControlDiv);
  panToCurrentLocationControl(panToCurrentLocationControlDiv, map);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(
    panToCurrentLocationControlDiv
  );
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(userListControlDiv);

  const redrawUsersIcon = () => {
    zoomLevel = map.getZoom();
    visibleLatLL = map.getBounds().getSouthWest().lat();
    visibleLngLL = map.getBounds().getSouthWest().lng();
    visibleLatUR = map.getBounds().getNorthEast().lat();
    visibleLngUR = map.getBounds().getNorthEast().lng();
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      $(() => {
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
      });
    }
  };

  let timeout = false;
  const INFOWINDOW_EVENT_DELAY = 250;

  google.maps.event.addListener(map, "idle", () => {
    clearTimeout(timeout);
    timeout = setTimeout(redrawUsersIcon, INFOWINDOW_EVENT_DELAY);
  });
  attachAgeRangeListener();
  attachApplyFilterListener(map);
}

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
  controlText.style.paddingLeft = "10px";
  controlText.style.paddingRight = "10px";
  controlText.innerHTML = "Pan to My Location";
  controlUI.appendChild(controlText);

  const clickShareLocation = () => {
    getCurrentLocation(map);
  };
  controlUI.addEventListener("click", clickShareLocation);
};

const userListControl = (controlDiv) => {
  const controlUI = document.createElement("div");
  controlUI.style.color = "#0773f4";
  controlUI.style.border = "2px solid #fff";
  controlUI.style.backgroundColor = "#fff";
  controlUI.style.borderRadius = "3px";
  controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
  controlUI.style.cursor = "pointer";
  controlUI.style.marginTop = "8px";
  controlUI.style.marginBottom = "22px";
  controlUI.style.textAlign = "center";
  controlUI.title = "Click to show users list";
  controlUI.classList.add("ms-2");
  controlUI.setAttribute("data-bs-toggle", "offcanvas");
  controlUI.setAttribute("data-bs-target", "#offcanvasUserList");
  controlDiv.appendChild(controlUI);

  const controlText = document.createElement("div");
  controlText.style.color = "rgb(25,25,25)";
  controlText.style.fontFamily = "Roboto,Arial,sans-serif";
  controlText.style.fontSize = "16px";
  controlText.style.lineHeight = "38px";
  controlText.style.paddingLeft = "10px";
  controlText.style.paddingRight = "10px";
  controlText.innerHTML = "Users List";
  controlUI.appendChild(controlText);
};

const getCurrentLocation = async (map) => {
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
      interests,
      geo_location_lat: userLat,
      geo_location_lng: userLng,
    } = userInfoJson;
    if (userLat === null || userLng === null) {
      $("#alertModalToggleLabel").text("Your location is not set yet.");
      $("#alertModalToggle").modal("show");
      return;
    }
    const pos = { lat: userLat, lng: userLng };
    let profileUrl;
    if (profileImage.slice(0, 5) === "https") {
      profileUrl = profileImage;
    } else {
      profileUrl = `${cloudfrontUrl}/${profileImage}`;
    }
    if (currentUserIcon !== undefined) {
      currentUserIcon.setMap(null);
    }
    currentUserIcon = createIcon(
      map,
      pos,
      profileUrl,
      google.maps.Animation.DROP
    );
    const currentUserInfowindow = createInfowindow(
      nickname,
      id,
      bio,
      interests
    );
    currentUserIcon.addListener("mouseover", () => {
      currentUserInfowindow.open({
        anchor: currentUserIcon,
        map,
        shouldFocus: false,
      });
    });
    map.setCenter(pos);
    map.setZoom(18);
    currentUserIcon.addListener("mouseout", function () {
      setTimeout(function () {
        if (!mouseOverInfoWindow) {
          currentUserInfowindow.close();
        }
      }, 200);
    });
    google.maps.event.addListener(
      currentUserInfowindow,
      "domready",
      function () {
        $(".infowindow-content").mouseover(() => {
          mouseOverInfoWindow = true;
        });
        $(".infowindow-content").mouseout(() => {
          mouseOverInfoWindow = false;
          setTimeout(function () {
            if (!mouseOverInfoWindow) {
              currentUserInfowindow.close();
            }
          }, 50);
        });
      }
    );
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
  let targetUrl = `/api/v1/location/?latLL=${visibleLatLL}&lngLL=${visibleLngLL}&latUR=${visibleLatUR}&lngUR=${visibleLngUR}&zoomLevel=${zoomLevel}&minAge=${minAge}&maxAge=${maxAge}`;
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
      clusterBoundsLngUR,
      clusterBoundsLatUR,
      clusterBoundsLngLL,
      clusterBoundsLatLL,
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
          if (zoomLevel < MIN_FIT_BOUNDS_ZOOM_LEVEL) {
            const zoomLevel = map.getZoom();
            map.setCenter(pos);
            map.setZoom(zoomLevel + 3);
          } else {
            const bounds = {
              east: clusterBoundsLngUR,
              north: clusterBoundsLatUR,
              west: clusterBoundsLngLL,
              south: clusterBoundsLatLL,
            };
            map.fitBounds(bounds);
          }
        });
        markers.push(clusterMarker);
      } else {
        const userIcon = createIcon(map, pos, profileUrl);
        markers.push(userIcon);
        const iconInfowindow = createInfowindow(
          nickname,
          userId,
          bio,
          interests
        );
        userIcon.addListener("mouseover", () => {
          iconInfowindow.open({
            anchor: userIcon,
            map,
            shouldFocus: false,
          });
        });
        userIcon.addListener("mouseout", function () {
          setTimeout(function () {
            if (!mouseOverInfoWindow) {
              iconInfowindow.close();
            }
          }, 200);
        });
        google.maps.event.addListener(iconInfowindow, "domready", function () {
          $(".infowindow-content").mouseover(() => {
            mouseOverInfoWindow = true;
          });
          $(".infowindow-content").mouseout(() => {
            mouseOverInfoWindow = false;
            setTimeout(function () {
              if (!mouseOverInfoWindow) {
                iconInfowindow.close();
              }
            }, 50);
          });
        });
      }
    }
  }
};
let mouseOverInfoWindow = false;
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
      clusterBoundsLatLL,
      clusterBoundsLngLL,
      clusterBoundsLatUR,
      clusterBoundsLngUR,
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
          if (zoomLevel < MIN_FIT_BOUNDS_ZOOM_LEVEL) {
            const zoomLevel = map.getZoom();
            map.setCenter(pos);
            map.setZoom(zoomLevel + 3);
          } else {
            const bounds = {
              east: clusterBoundsLngUR,
              north: clusterBoundsLatUR,
              west: clusterBoundsLngLL,
              south: clusterBoundsLatLL,
            };
            map.fitBounds(bounds);
          }
        });
        markers.push(clusterMarker);
      } else {
        const userIcon = createIcon(map, pos, profileUrl);
        markers.push(userIcon);
        const iconInfowindow = createInfowindow(
          nickname,
          userId,
          bio,
          interests
        );
        userIcon.addListener("mouseover", () => {
          iconInfowindow.open({
            anchor: userIcon,
            map,
            shouldFocus: false,
          });
        });
        userIcon.addListener("mouseout", function () {
          setTimeout(function () {
            if (!mouseOverInfoWindow) {
              iconInfowindow.close();
            }
          }, 200);
        });
        google.maps.event.addListener(iconInfowindow, "domready", function () {
          $(".infowindow-content").mouseover(() => {
            mouseOverInfoWindow = true;
          });
          $(".infowindow-content").mouseout(() => {
            mouseOverInfoWindow = false;
            setTimeout(function () {
              if (!mouseOverInfoWindow) {
                iconInfowindow.close();
              }
            }, 50);
          });
        });
      }
    }
  }
};

const renderUserCard = async (userId, nickname, profileImage, bio) => {
  const user = $(
    '<div class="row w-100 px-3 py-2 user-card text-decoration-none align-items-center"></div>'
  );
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
    '<a class="text-decoration-none" style="color: #0773f4;" target="_blank"><p class="fs-5 fw-semibold my-0 px-2"></p></a>'
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
    $("#offcanvasUserList").offcanvas("show");
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
    $("#offcanvasUserList").offcanvas("show");
  });
};

const renderInterestsSelect = async () => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    return;
  }
  const result = await fetch(`/api/v1/interests`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const resultJson = await result.json();
  const indoorsInterests = resultJson[0].interests.sort();
  const outdoorsInterests = resultJson[1].interests.sort();
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
  $("#interests-select").on("selectivity-open", () => {
    $(".selectivity-multiple-selected-item").addClass("bg-primary rounded");
  });
};

const google_api_key = $("#map-script").attr("google_api_key");
const script = $("<script></script>", {
  src: `https://maps.googleapis.com/maps/api/js?key=${google_api_key}&map_ids=d91850b214eae5c9&callback=initMap`,
  async: true,
  defer: true,
  type: "text/javascript",
});
script.appendTo("head");
const cloudfrontUrl = "https://d3efyzwqsfoubm.cloudfront.net";
let map,
  markers = [],
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

let currentUserIcon;
