const app = require("../index");
const chai = require("chai"),
  chaiHttp = require("chai-http");
chai.use(chaiHttp);
const { assert, expect } = chai;
const requester = chai.request(app).keepOpen();

const { NODE_EVN } = process.env;
before(async () => {
  if (NODE_ENV !== "test") {
    throw "Not in test env";
  }

  await truncateFakeData();
  await createFakeData();
});

module.exports = {
  assert,
  expect,
  requester,
};
