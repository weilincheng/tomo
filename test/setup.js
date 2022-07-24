const app = require("../index");
const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const should = chai.should();
const expect = chai.expect;
const requester = chai.request(app).keepOpen();
const { truncateFakeData } = require("./truncate_fake_data");
const {
  insertFakeData,
  insertInterests,
  insertTestAccount,
} = require("./insert_fake_data");
const { pool } = require("../server/models/mysql_connection");

const { NODE_ENV } = process.env;
before(async function () {
  if (NODE_ENV !== "test") {
    throw "Not in test env";
  }
  const dbName = pool.pool.config.connectionConfig.database;
  dbName.should.equal("tomo_test");
  console.log("Truncating fake data");
  await truncateFakeData();
  console.log("Inserting fake data");
  await insertTestAccount();
  await insertInterests();
  const usersCount = 10;
  let coordinate = [25.04, 121.5602];
  await insertFakeData(usersCount, coordinate);
  coordinate = [-25.04, -121.5602];
  await insertFakeData(usersCount, coordinate);
});

module.exports = { requester, should, expect };
