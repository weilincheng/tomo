const { requester, should } = require("./setup");
let accessToken;

describe("User", function () {
  before(async function () {
    const signin = await requester
      .post("/api/v1/user/signin")
      .send({ provider: "native", email: "test@test.com", password: "test" });
    accessToken = signin.body.accessToken;
  });
  describe("Update user Info", function () {
    it("should update user info", async function () {
      const userId = 1;
      const updateInfo = await requester
        .put(`/api/v1/user/${userId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          nickname: "Not a test",
          bio: "I am awesome",
          "geo-location-lat": "23",
          "geo-location-lng": "123",
          website: "http://awesome.com",
          displayGeoLocation: false,
          birthdate: "1995-02-17",
          gender: "male",
          interests: "Coding,Cooking",
        });
      updateInfo.body.status.should.equal("Save successfully");
      updateInfo.status.should.equal(200);

      const result = await requester
        .get(`/api/v1/user/${userId}`)
        .set("Authorization", `Bearer ${accessToken}`);
      should.exist(result.body);
      const {
        nickname,
        bio,
        geo_location_lat: geoLocationLat,
        geo_location_lng: geoLocationLng,
        website,
        display_geo_location: displayGeoLocation,
        birthdate,
      } = result.body;
      should.exist(nickname);
      nickname.should.equal("Not a test");
      should.exist(bio);
      bio.should.equal("I am awesome");
      should.exist(geoLocationLat);
      geoLocationLat.should.equal(23);
      should.exist(geoLocationLng);
      geoLocationLng.should.equal(123);
      should.exist(website);
      website.should.equal("awesome.com");
      should.exist(displayGeoLocation);
      displayGeoLocation.should.equal(0);
      should.exist(birthdate);
      const convertedBirthdate = new Date(birthdate);
      const [year, month, day] = [
        convertedBirthdate.getUTCFullYear(),
        convertedBirthdate.getUTCMonth() < 9
          ? `0${convertedBirthdate.getUTCMonth() + 1}`
          : convertedBirthdate.getUTCMonth() + 1,
        convertedBirthdate.getUTCDate() < 9
          ? `0${convertedBirthdate.getUTCDate()}`
          : convertedBirthdate.getUTCDate(),
      ];
      `${year}-${month}-${day}`.should.equal("1995-02-16");
    });
  });
});
