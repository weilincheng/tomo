const { requester, should } = require("./setup");
const {
  getClusterBounds,
} = require("../server/controllers/location_controller");

describe("Get cluster bounds", function () {
  it("should return cluster bounds and average lat/lng", async function () {
    const usersLocation = [
      { geo_location_lat: 0, geo_location_lng: 0 },
      { geo_location_lat: 1, geo_location_lng: 1 },
    ];
    const cluster = [0, 1];
    const [
      clusterMarkerLat,
      clusterMarkerLng,
      clusterBoundsLatLL,
      clusterBoundsLngLL,
      clusterBoundsLatUR,
      clusterBoundsLngUR,
    ] = getClusterBounds(usersLocation, cluster);
    clusterMarkerLat.should.equal(0.5);
    clusterMarkerLng.should.equal(0.5);
    clusterBoundsLatLL.should.equal(0);
    clusterBoundsLngLL.should.equal(0);
    clusterBoundsLatUR.should.equal(1);
    clusterBoundsLngUR.should.equal(1);
  });
});

describe("Get users' location", function () {
  describe("Both lat and lng are positive", function () {
    it("should returns one cluster marker with size 10", async function () {
      const signin = await requester
        .post("/api/v1/user/signin")
        .send({ provider: "native", email: "test@test.com", password: "test" });
      const accessToken = signin.body.access_token;
      const res = await requester
        .get("/api/v1/location")
        .set("Authorization", `Bearer ${accessToken}`)
        .query({ latLL: 24, latUR: 26, lngLL: 121, lngUR: 122, zoomLevel: 1 });
      const { type, clusterSize } = res.body[0];
      should.exist(res.body);
      res.body.should.have.lengthOf(1);
      clusterSize.should.equal(10);
      type.should.equal("clusterMarker");
    });

    it("should returns 10 users", async function () {
      const signin = await requester
        .post("/api/v1/user/signin")
        .send({ provider: "native", email: "test@test.com", password: "test" });
      const accessToken = signin.body.access_token;
      const res = await requester
        .get("/api/v1/location")
        .set("Authorization", `Bearer ${accessToken}`)
        .query({ latLL: 24, latUR: 26, lngLL: 121, lngUR: 122, zoomLevel: 20 });
      should.exist(res.body);
      res.body.should.have.lengthOf(10);
    });
  });

  describe("Both lat and lng are negative", function () {
    it("should returns one cluster marker with size 10", async function () {
      const signin = await requester
        .post("/api/v1/user/signin")
        .send({ provider: "native", email: "test@test.com", password: "test" });
      const accessToken = signin.body.access_token;
      const res = await requester
        .get("/api/v1/location")
        .set("Authorization", `Bearer ${accessToken}`)
        .query({
          latLL: -26,
          latUR: -24,
          lngLL: -122,
          lngUR: -121,
          zoomLevel: 1,
        });
      const { type, clusterSize } = res.body[0];
      should.exist(res.body);
      res.body.should.have.lengthOf(1);
      clusterSize.should.equal(10);
      type.should.equal("clusterMarker");
    });

    it("should returns 10 users", async function () {
      const signin = await requester
        .post("/api/v1/user/signin")
        .send({ provider: "native", email: "test@test.com", password: "test" });
      const accessToken = signin.body.access_token;
      const res = await requester
        .get("/api/v1/location")
        .set("Authorization", `Bearer ${accessToken}`)
        .query({
          latLL: -26,
          latUR: -24,
          lngLL: -122,
          lngUR: -121,
          zoomLevel: 20,
        });
      should.exist(res.body);
      res.body.should.have.lengthOf(10);
    });
  });
});
