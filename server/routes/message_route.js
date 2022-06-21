const router = require("express").Router();
const {
  getMessages,
  saveMessages,
} = require("../controllers/message_controller");
const { catchAsyncError, authUser } = require("../../utilities/utilities");

router
  .route("/message/:currentUserId/:targetUserId")
  .get(authUser(), catchAsyncError(getMessages));

router
  .route("/message/:currentUserId/:targetUserId")
  .post(authUser(), catchAsyncError(saveMessages));

module.exports = router;
