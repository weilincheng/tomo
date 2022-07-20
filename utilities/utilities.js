const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const uuid = require("uuid").v4;
const multer = require("multer");
const storage = multer.memoryStorage();
const MAX_FILE_SIZE = 1000000;
const MAX_FILES_COUNT = 4;
const multerUpload = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_FILES_COUNT },
});
const { TOKEN_SECRET, TOKEN_EXPIRATION, AWS_BUCKET_NAME } = process.env;
const jwt = require("jsonwebtoken");

const catchAsyncError = (callback) => {
  return (req, res, next) => {
    callback(req, res, next).catch(next);
  };
};

const generateToken = (
  id,
  nickname,
  email,
  location,
  website,
  profileImage
) => {
  return jwt.sign(
    { id, nickname, email, location, website, profileImage },
    TOKEN_SECRET,
    {
      expiresIn: TOKEN_EXPIRATION,
    }
  );
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

const s3Upload = async (files) => {
  const s3client = new S3Client();
  const params = files.map((file) => {
    return {
      Bucket: AWS_BUCKET_NAME,
      Key: `${uuid()}-${file.originalname}`,
      Body: file.buffer,
    };
  });
  let filesName = [];
  await Promise.all(
    params.map((param) => {
      s3client.send(new PutObjectCommand(param));
      filesName.push(param.Key);
    })
  );
  return filesName;
};

module.exports = {
  catchAsyncError,
  authUser,
  generateToken,
  verifyToken,
  multerUpload,
  s3Upload,
};
