const getUserInfo = async (userId) => {
  const accessToken = localStorage.getItem("accessToken");
  const headers = {
    Authorization: `Bearer ${accessToken}`,
  };
  const result = await fetch(`/api/v1/user/${userId}`, {
    method: "GET",
    headers,
  });
  const resultJson = await result.json();
  if (resultJson.error) {
    alert(resultJson.error);
    return (window.location = "/");
  }
  const {
    nickname,
    bio,
    geo_location_lat: geoLocationLat,
    geo_location_lng: geoLocationLng,
    display_geo_location: displayGeoLocation,
    website,
    profile_image: profileImage,
    background_image: backgroundImage,
    gender,
    birthdate,
    interests,
  } = resultJson;
  return {
    nickname,
    bio,
    geoLocationLat,
    geoLocationLng,
    displayGeoLocation,
    website,
    profileImage,
    backgroundImage,
    gender,
    birthdate,
    interests,
  };
};

const renderUserProfile = async () => {
  const accessToken = localStorage.getItem("accessToken");
  if (!accessToken) {
    alert("Please sign in first");
    return (window.location = "/");
  }
  await verifyToken(accessToken);
  const userId = localStorage.getItem("userId");
  updateProfileIconLink(userId);
  const {
    nickname,
    website,
    bio,
    profileImage,
    backgroundImage,
    geoLocationLat,
    geoLocationLng,
    displayGeoLocation,
    birthdate,
    gender,
    interests,
  } = await getUserInfo(userId);
  const convertedBirthdate = new Date(birthdate);
  const [year, month, day] = [
    convertedBirthdate.getFullYear(),
    convertedBirthdate.getMonth() < 9
      ? `0${convertedBirthdate.getMonth() + 1}`
      : convertedBirthdate.getMonth() + 1,
    convertedBirthdate.getDate() < 9
      ? `0${convertedBirthdate.getDate()}`
      : convertedBirthdate.getDate(),
  ];

  const cloudFrontUrl = "https://d3efyzwqsfoubm.cloudfront.net";
  $("#nickname").val(nickname);
  $("#nickname-current").text(nickname.length);
  $("#bio").val(bio);
  $("#geo-location-lat").val(geoLocationLat);
  $("#geo-location-lng").val(geoLocationLng);
  $("#display-geo-location").prop("checked", displayGeoLocation);
  if (bio) {
    $("#bio-current").text(bio.length);
  }
  $("#website").val(website);
  if (website) {
    $("#website-current").text(website.length);
  }
  $("#profile-image-source").attr(
    "src",
    profileImage
      ? `${cloudFrontUrl}/${profileImage}`
      : "https://via.placeholder.com/100"
  );
  $("#background-image-source").attr(
    "src",
    backgroundImage
      ? `${cloudFrontUrl}/${backgroundImage}`
      : "https://via.placeholder.com/100"
  );
  $("#gender").val(gender);
  if (birthdate) {
    $("#birthdate").val(`${year}-${month}-${day}`);
  }
  renderInterestsSelect(interests);
};

const sendPutFormData = async (formData) => {
  const accessToken = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId");
  const result = await fetch(`/api/v1/user/${userId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });
  const resultJson = await result.json();
  alert(resultJson.status);
  window.location = `/user/${userId}`;
};

const attachClickEventEditPage = () => {
  $("#profile-image").on("change", (evt) => {
    const [file] = evt.target.files;
    if (file.size > 1000000) {
      alert("File size is too large. Max size is 1MB");
      $("#profile-image").prop("value", "");
      return;
    }
    if (file) {
      $("#profile-image-source").attr("src", URL.createObjectURL(file));
    }
  });
  $("#background-image").on("change", (evt) => {
    const [file] = evt.target.files;
    if (file.size > 1000000) {
      alert("File size is too large");
      $("#profile-image").prop("value", "");
      return;
    }
    if (file) {
      $("#background-image-source").attr("src", URL.createObjectURL(file));
    }
  });
  $("#save-button").click(() => {
    const formData = new FormData(document.getElementById("profile-form"));
    const interests = $("#interests-select").selectivity("value");
    formData.append("interests", interests);
    sendPutFormData(formData);
  });
  $("#cancel-button").click(() => {
    window.location = `/user/${localStorage.getItem("userId")}`;
  });
  $("#display-geo-location").click(() => {
    const switchStatus = $("#display-geo-location").prop("checked");
    if (switchStatus) {
      $("#display-geo-location-label").text("Display Geo Location on Map");
    } else {
      $("#display-geo-location-label").text("Hide Geo Location on Map");
    }
  });
};

const attachTypeEventEditPage = () => {
  $("#nickname").keyup(() => {
    let characterCount = $("#nickname").val().length,
      current = $("#nickname-current");
    current.text(characterCount);
  });
  $("#bio").keyup(() => {
    let characterCount = $("#bio").val().length,
      current = $("#bio-current");
    current.text(characterCount);
  });
  $("#location").keyup(() => {
    let characterCount = $("#location").val().length,
      current = $("#location-current");
    current.text(characterCount);
  });
  $("#website").keyup(() => {
    let characterCount = $("#website").val().length,
      current = $("#website-current");
    current.text(characterCount);
  });
};

const initMap = () => {
  const appWorksSchool = { lat: 25.03843, lng: 121.532488 };
  infowindow = new google.maps.InfoWindow();
  map = new google.maps.Map($("#map")[0], {
    center: appWorksSchool,
    zoom: 13,
    mapId: "d91850b214eae5c9",
    fullscreenControl: false,
    streetViewControl: false,
    mapTypeControl: false,
  });

  const locateMeControlDiv = document.createElement("div");
  locateMeControl(locateMeControlDiv, map);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locateMeControlDiv);
};

const locateMeControl = (controlDiv, map) => {
  const controlUI = document.createElement("div");
  controlUI.style.backgroundColor = "#fff";
  controlUI.style.border = "2px solid #fff";
  controlUI.style.borderRadius = "3px";
  controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.3)";
  controlUI.style.cursor = "pointer";
  controlUI.style.marginTop = "8px";
  controlUI.style.marginBottom = "22px";
  controlUI.style.textAlign = "center";
  controlUI.title = "We do not share your real location";
  controlDiv.appendChild(controlUI);

  const controlText = document.createElement("div");
  controlText.style.color = "rgb(25,25,25)";
  controlText.style.fontFamily = "Roboto,Arial,sans-serif";
  controlText.style.fontSize = "16px";
  controlText.style.lineHeight = "38px";
  controlText.style.paddingLeft = "5px";
  controlText.style.paddingRight = "5px";
  controlText.innerHTML = "Locate Me";
  controlUI.appendChild(controlText);

  const clickLocateMe = () => {
    getCurrentLocaiton(map);
    controlUI.removeEventListener("click", clickLocateMe, false);
  };
  controlUI.addEventListener("click", clickLocateMe);
};

const getCurrentLocaiton = (map) => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const pos = { lat: latitude, lng: longitude };
      createCustomMarker(map, pos);
      map.setCenter(pos);
      map.setZoom(16);
      getNearybyPlaces(map, pos, "park");
    });
  }
};

const getNearybyPlaces = async (map, pos, type) => {
  const request = {
    location: pos,
    radius: "50000",
    type: [type],
  };
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, (results, status) => {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        createPlacesMarker(results[i]);
      }
    }
  });
};

const createPlacesMarker = (place) => {
  if (!place.geometry || !place.geometry.location) return;

  const marker = new google.maps.Marker({
    map,
    position: place.geometry.location,
    icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
  });

  google.maps.event.addListener(marker, "click", () => {
    $("#geo-location-lat").val(place.geometry.location.lat);
    $("#geo-location-lng").val(place.geometry.location.lng);
    const toastLiveExample = document.getElementById("liveToast");
    const toast = new bootstrap.Toast(toastLiveExample);
    toast.show();
  });
};

const createCustomMarker = (map, pos) => {
  const profileImage = $("#profile-image-source").attr("src");
  const icon = {
    url: `${profileImage}` + "#custom_marker",
    scaledSize: new google.maps.Size(50, 50), // scaled size
    origin: new google.maps.Point(0, 0), // origin
    anchor: new google.maps.Point(0, 0), // anchor
  };
  new google.maps.Marker({
    position: pos,
    animation: google.maps.Animation.DROP,
    map,
    icon,
  });
};

const renderInterestsSelect = async (interests) => {
  const accessToken = localStorage.getItem("accessToken");
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
  $("#interests-select").on("sselectivity-open", () => {
    $(".selectivity-multiple-selected-item").addClass("bg-primary rounded");
  });
  if (interests[0] !== null) {
    $("#interests-select").selectivity("value", interests);
    $(".selectivity-multiple-selected-item").addClass("bg-primary rounded");
  }
};

renderUserProfile();

$(() => {
  attachClickEventEditPage();
  attachTypeEventEditPage();
});

const google_api_key = $("#map-script").attr("google_api_key");
const script = $("<script></script>", {
  src: `https://maps.googleapis.com/maps/api/js?key=${google_api_key}&map_ids=d91850b214eae5c9&libraries=places&callback=initMap`,
  async: true,
});
script.appendTo("head");
let map, service, infowindow;
window.initMap = initMap;
