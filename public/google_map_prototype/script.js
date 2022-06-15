let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 25.03843, lng: 121.532488 }, //25.038430, 121.532488
    zoom: 15,
  });
}

window.initMap = initMap;
