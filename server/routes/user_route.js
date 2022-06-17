const router = require("express").Router();
const { signUp, signIn, profile } = require("../controllers/user_controller");
const { catchAsyncError } = require("../../utilities/utilities");

router.route("/user/signup").post(catchAsyncError(signUp));
router.route("/user/signin").post(catchAsyncError(signIn));
router.route("/user/profile").get(catchAsyncError(profile));

module.exports = router;
