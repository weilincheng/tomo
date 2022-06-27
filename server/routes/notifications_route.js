const router = require("express").Router();
const { getNotifications } = require("../controllers/notifications_controller");
const { catchAsyncError, authUser } = require("../../utilities/utilities");

router
  .route("/notifications/")
  .get(authUser(), catchAsyncError(getNotifications));

module.exports = router;
