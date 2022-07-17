const RATE_LIMIT = 20;
const WINDOW_TIME = 1;
const client = require("./redis.js");
const uuid = require("uuid").v4;

const rateLimiter = () => {
  return async (req, res, next) => {
    if (client.ready) {
      const now = Date.now();
      const key = req.ip;
      const [zremrangeReply, zrangeReply, zaddReply] = await client
        .multi()
        .ZREMRANGEBYSCORE(key, 0, now - WINDOW_TIME * 1000)
        .ZRANGE(key, 0, -1)
        .ZADD(key, { score: now, value: uuid() })
        .EXPIRE(key, WINDOW_TIME)
        .exec();

      if (zrangeReply.length >= RATE_LIMIT) {
        return res.status(429).json({ error: "Rate limit exceeded." });
      } else {
        next();
      }
    } else {
      next();
    }
  };
};

module.exports = { rateLimiter };
