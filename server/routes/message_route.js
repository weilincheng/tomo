const router = require("express").Router();
const { getMessages } = require("../controllers/message_controller");
const { catchAsyncError } = require("../../utilities/utilities");

router
  .route("/message/:currentUserId/:targetUserId")
  .get(catchAsyncError(getMessages));

module.exports = router;
