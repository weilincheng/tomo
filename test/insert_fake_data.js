const { pool } = require("../server/models/mysql_connection");
const { faker } = require("@faker-js/faker");
const uuid = require("uuid").v4;
const bcrypt = require("bcrypt");
const saltRounds = 10;

const insertUsers = async (sql, sqlBindings) => {
  const [result] = await pool.query(sql, [sqlBindings]);
  return result.insertId;
};

const insertFakeData = async (usersCount, coordinate) => {
  const sql = `INSERT INTO users 
  (nickname, email, password, website, profile_image, bio, geo_location_lat, geo_location_lng, gender, birthdate) 
  VALUES 
  ?`;
  let sqlBindings = [];
  const genderArray = ["pnts", "male", "female", "neutral"];
  const password = "password";
  for (let i = 0; i < usersCount; i++) {
    const randomLocation = faker.address.nearbyGPSCoordinate(coordinate, 10);
    const randomName = faker.name.firstName();
    const randomEmail = faker.internet.email();
    const randomBirthdate = faker.date.birthdate({
      min: 20,
      max: 100,
      mode: "age",
    });
    const randomWebsite = faker.internet.url();
    const randomProfileImage = faker.internet.avatar();
    const randomBio = faker.name.jobTitle();
    const hash = await bcrypt.hash(password, saltRounds);
    const sqlBind = [
      randomName,
      `${randomEmail}_${uuid()}`,
      hash,
      randomWebsite,
      randomProfileImage,
      randomBio,
      randomLocation[0],
      randomLocation[1],
      genderArray[Math.floor(Math.random() * 4)],
      randomBirthdate,
    ];
    sqlBindings.push(sqlBind);
  }
  insertUsers(sql, sqlBindings);
};

const insertTestAccount = async () => {
  const testPassword = await bcrypt.hash("test", saltRounds);
  insertUsers(
    `INSERT INTO users (nickname, email, password) 
    VALUES ?`,
    [["test", "test@test.com", testPassword]]
  );
};

module.exports = { insertFakeData, insertTestAccount };
