const { requester, should } = require("./setup");

describe("Get users' location", function () {
  describe("Both lngLL and lngUR are positive", function () {
    it("should return one cluster marker with size 10", async function () {
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
      console.log(res.body);
      res.body.should.have.lengthOf(1);
      clusterSize.should.equal(10);
      type.should.equal("clusterMarker");
    });

    it("should return 10 users", async function () {
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
});
