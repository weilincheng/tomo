const router = require("express").Router();
const {
  signUp,
  signIn,
  profile,
  getUserInfo,
} = require("../controllers/user_controller");
const { catchAsyncError } = require("../../utilities/utilities");

router.route("/user/signup").post(catchAsyncError(signUp));
router.route("/user/signin").post(catchAsyncError(signIn));
router.route("/user/profile").get(catchAsyncError(profile));
router.route("/user/:userId").get(catchAsyncError(getUserInfo));

module.exports = router;
