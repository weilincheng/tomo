const { createClient } = require("redis");
require("dotenv").config();
const {
  REDIS_USER_PRODUCTION,
  REDIS_HOST_PRODUCTION,
  REDIS_PASSWORD_PRODUCTION,
  REDIS_USER_DEVELOPMENT,
  REDIS_HOST_DEVELOPMENT,
  REDIS_PASSWORD_DEVELOPMENT,
  REDIS_PORT,
  NODE_ENV,
} = process.env;

const config = {
  production: {
    url: `redis://${REDIS_USER_PRODUCTION}:${REDIS_PASSWORD_PRODUCTION}@${REDIS_HOST_PRODUCTION}:${REDIS_PORT}`,
  },
  development: {
    url: `redis://${REDIS_USER_DEVELOPMENT}:${REDIS_PASSWORD_DEVELOPMENT}@${REDIS_HOST_DEVELOPMENT}:${REDIS_PORT}`,
  },
  test: {
    url: `redis://${REDIS_USER_DEVELOPMENT}:${REDIS_PASSWORD_DEVELOPMENT}@${REDIS_HOST_DEVELOPMENT}:${REDIS_PORT}`,
  },
};

const client = createClient(config[NODE_ENV]);

client.ready = false;
client.connect();

client.on("connect", () => {
  console.log("Connecting to Redis server...");
});

client.on("ready", () => {
  client.ready = true;
  console.log("Redis connected");
});

client.on("error", () => {
  client.ready = false;
  if (NODE_ENV === "production") {
    console.log("Not able to connect Redis");
  }
});

client.on("end", () => {
  client.ready = false;
  console.log("Redis disconnected");
});

module.exports = client;
