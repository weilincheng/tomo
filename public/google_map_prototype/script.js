function initMap() {
  const appWorksSchool = { lat: 25.03843, lng: 121.532488 };
  const markersList = new Map();
  const map = new google.maps.Map($("#map")[0], {
    center: appWorksSchool,
    zoom: 18,
    mapId: "d91850b214eae5c9",
  });

  const updateMarker = (id, pos) => {
    const marker = markersList.get(id);
    marker.setPosition(pos);
  };

  const createMarker = (id, pos) => {
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

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const pos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      createMarker(socket.id, pos);
      socket.emit("update position", { pos, id: socket.id });
    });

    navigator.geolocation.watchPosition((position) => {
      const pos = {
        lat: position.coords.latitude + (Math.random() - 0.5) * 0.0005,
        lng: position.coords.longitude + (Math.random() - 0.5) * 0.0005,
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
      createMarker(id, pos);
    }
  });
}

const script = $("<script></script>", {
  src: "https://maps.googleapis.com/maps/api/js?key=AIzaSyBpE92CZ9GMcOVTRBhfn5Kqhoytsltum5I&map_ids=d91850b214eae5c9&callback=initMap",
  async: true,
});
script.appendTo("head");
const socket = io(`http://${window.location.host}`);
window.initMap = initMap;
