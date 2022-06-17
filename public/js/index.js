const randomVariation = () => {
  return (Math.random() - 0.5) * 0.0005;
};

const updateMarker = (id, pos) => {
  const marker = markersList.get(id);
  marker.setPosition(pos);
};

const createMarker = (map, id, pos) => {
  const marker = new google.maps.Marker({
    position: pos,
    map: map,
    label: {
      color: "blue",
      fontWeight: "bold",
      text: id,
    },
  });
  markersList.set(id, marker);
};

const initMap = () => {
  const appWorksSchool = { lat: 25.03843, lng: 121.532488 };
  const map = new google.maps.Map($("#map")[0], {
    center: appWorksSchool,
    zoom: 18,
    mapId: "d91850b214eae5c9",
  });

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      const pos = { lat: latitude, lng: longitude };
      createMarker(map, socket.id, pos);
      socket.emit("update position", { pos, id: socket.id });
    });

    navigator.geolocation.watchPosition((position) => {
      const { latitude, longitude } = position.coords;
      const pos = {
        lat: latitude + randomVariation(),
        lng: longitude + randomVariation(),
      };
      updateMarker(socket.id, pos);
      socket.emit("update position", { pos, id: socket.id });
    });
  }
  socket.on("update position", (data) => {
    const { id, pos } = data;
    console.log(`new position ${JSON.stringify(pos)} received from ${id}`);
    if (markersList.has(id)) {
      updateMarker(id, pos);
    } else {
      createMarker(map, id, pos);
    }
  });
};

const google_api_key = $("#map-script").attr("google_api_key");
const script = $("<script></script>", {
  src: `https://maps.googleapis.com/maps/api/js?key=${google_api_key}&map_ids=d91850b214eae5c9&callback=initMap`,
  async: true,
});
script.appendTo("head");
const socket = io(`http://${window.location.host}`);
const markersList = new Map();
window.initMap = initMap;

$("#signin").click(() => {
  window.location.href = "/signin";
});
