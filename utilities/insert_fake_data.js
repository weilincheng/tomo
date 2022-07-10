const { pool } = require("../server/models/mysql_connection");
const { faker } = require("@faker-js/faker");
const uuid = require("uuid").v4;
const bcrypt = require("bcrypt");
const saltRounds = 10;
const { truncateTable } = require("../test/truncate_fake_data");
const { ExistingObjectReplication } = require("@aws-sdk/client-s3");

const insertUsers = async (sql, sqlBindings) => {
  const [result] = await pool.query(sql, [sqlBindings]);
  return result.insertId;
};

const insertUserInterests = async (startUserId, usersCount, lastInterestId) => {
  const sql = `INSERT INTO user_interests (user_id, interest_id) VALUES ?`;
  let sqlBindings = [];
  for (let i = 0; i < usersCount; i++) {
    const randomInterestsId = Math.floor(Math.random() * lastInterestId + 1);
    sqlBindings.push([startUserId + i, randomInterestsId]);
  }
  await pool.query(sql, [sqlBindings]);
};

const insertUserPosts = async (startUserId, usersCount) => {
  const sql = `INSERT INTO posts (user_id, text) VALUES ?`;
  let sqlBindings = [];
  for (let i = 0; i < usersCount; i++) {
    const text = faker.commerce.productDescription();
    sqlBindings.push([startUserId + i, text]);
  }
  await pool.query(sql, [sqlBindings]);
};

const insertInterests = async () => {
  const sql = ` INSERT INTO interests (name, category) 
  VALUES ('Coffee', 'Indoors'), ('Anime', 'Indoors'), ('Baking', 'Indoors'), ('Cooking', 'Indoors'), ('Bonsai', 'Indoors'), ('Coding', 'Indoors'), ('Dancing', 'Outdoors'), ('Fishing', 'Outdoors'), ('Gardening', 'Outdoors'), ('Hiking', 'Outdoors'), ('Running', 'Outdoors'), ('Singing', 'Indoors'), ('Traveling', 'Outdoors'), ('Writing', 'Indoors'), ('Yoga', 'Indoors'), ('Pilates', 'Indoors'), ('Weaving', 'Indoors'), ('Photography', 'Outdoors'), ('Sewing', 'Indoors'), ('Badminton', 'Outdoors'), ('Baseball', 'Outdoors'), ('Motorcycling', 'Outdoors'), ('Rugby', 'Outdoors'), ('Tennis', 'Outdoors'), ('Skiing', 'Outdoors')`;
  const [result] = await pool.query(sql);
  return result.insertId;
};

const insertFakeData = async (lastInterestId, usersCount, coordinate) => {
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
  const startUserId = await insertUsers(sql, sqlBindings);
  insertUserInterests(startUserId, usersCount, lastInterestId);
  insertUserPosts(startUserId, usersCount);
};

const main = async () => {
  const usersCount = 10;
  const coordinates = {
    Taipei: [25.034820140317443, 121.52168912178846],
    Taoyuan: [24.96780130276039, 121.22577282690152],
    Taichung: [24.136804450395037, 120.67901592984462],
    Yunlin: [23.709671070120784, 120.54126161670258],
    Kaohsiung: [22.706986866207725, 120.42602567961437],
  };
  await truncateTable("interests");
  const lastInterestId = (await insertInterests()) + 24;
  for (let city in coordinates) {
    insertFakeData(lastInterestId, usersCount, coordinates[city]);
  }
};
main();
