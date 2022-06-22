const { TOKEN_SECRET, TOKEN_EXPIRATION } = process.env;
const jwt = require("jsonwebtoken");

const catchAsyncError = (callback) => {
  return (req, res, next) => {
    callback(req, res, next).catch(next);
  };
};

const generateToken = (id, name, email, location, website) => {
  return jwt.sign({ id, name, email, location, website }, TOKEN_SECRET, {
    expiresIn: TOKEN_EXPIRATION,
  });
};

const verifyToken = (access_token) => {
  return jwt.verify(access_token, TOKEN_SECRET);
};

const authUser = () => {
  return async (req, res, next) => {
    const { currentUserId } = req.params;
    const { authorization } = req.headers;
    if (!authorization) {
      res.status(401).json({ error: "No token" });
      return;
    }
    const accessToken = authorization.split(" ")[1];
    try {
      const { id } = await verifyToken(accessToken);
      req.userId = id;
      if (!currentUserId) {
        next();
        return;
      }
      if (currentUserId && id !== parseInt(currentUserId)) {
        res.status(403).json({ error: "You are not authorized" });
        return;
      }
    } catch (error) {
      res.status(403).json({ error: "Invalid token" });
      return;
    }
    next();
  };
};

module.exports = { catchAsyncError, authUser, generateToken, verifyToken };
