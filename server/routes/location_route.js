const router = require("express").Router();
const { getUsersLocation } = require("../controllers/location_controller");
const { catchAsyncError, authUser } = require("../../utilities/utilities");

router.route("/location").get(authUser(), catchAsyncError(getUsersLocation));

module.exports = router;
