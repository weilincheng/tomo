const router = require("express").Router();
const { getInterests } = require("../controllers/interests_controller");
const { authUser, catchAsyncError } = require("../../utilities/utilities");

router.route("/interests").get(authUser(), catchAsyncError(getInterests));

module.exports = router;
