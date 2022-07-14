const { createClient } = require("redis");
require("dotenv").config();

const client = createClient({
  url: `redis://${process.env.REDIS_USER}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

client.ready = false;

client.on("connect", () => {
  console.log("Connecting to Redis server...");
});

client.on("ready", () => {
  client.ready = true;
  console.log("Redis connected");
});

client.on("error", (err) => {
  client.ready = false;
  console.log("Not able to connect Redis: ", err);
});

client.on("end", () => {
  client.ready = false;
  console.log("Redis disconnected");
});

module.exports = client;
