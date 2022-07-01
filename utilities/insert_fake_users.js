const { pool } = require("../server/models/mysql_connection");
const { faker } = require("@faker-js/faker");

const insertUsers = async (sql, sqlBindings) => {
  const [result] = await pool.query(sql, [sqlBindings]);
  return result.insertId;
};

const insertUserInterests = async (startUserId, usersCount) => {
  const sql = `INSERT INTO user_interests (user_id, interest_id) VALUES ?`;
  let sqlBindings = [];
  for (let i = 0; i < usersCount; i++) {
    const randomInterestsId = Math.floor(Math.random() * 5 + 1);
    sqlBindings.push([startUserId + i, randomInterestsId]);
  }
  const [result] = await pool.query(sql, [sqlBindings]);
  console.log(sql, sqlBindings);
};

const insertFake = async (usersCount) => {
  const sql = `INSERT INTO users 
  (nickname, email, password, website, profile_image, bio, geo_location_lat, geo_location_lng, gender, birthdate) 
  VALUES 
  ?`;
  let sqlBindings = [];
  const genderArray = ["pnts", "male", "female", "neutral"];
  const password = "password";
  for (let i = 0; i < usersCount; i++) {
    const randomLocation = faker.address.nearbyGPSCoordinate(
      [25.105497, 121.597366],
      10
    );
    const randomName = faker.name.firstName(); // Rowan
    const randomEmail = faker.internet.email(); // Kassandra.Haley@erich.biz
    const randomBirthdate = faker.date.birthdate({
      min: 20,
      max: 100,
      mode: "age",
    });
    const randomWebsite = faker.internet.url();
    const randomProfileImage = faker.internet.avatar();
    const randomBio = faker.name.jobTitle();

    const sqlBind = [
      randomName,
      randomEmail,
      password,
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
  const startUserId = await insertUsers(sql, sqlBindings);
  insertUserInterests(startUserId, usersCount);
};

const usersCount = 5;
insertFake(usersCount);
