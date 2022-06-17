const router = require("express").Router();
const { signUp, signIn } = require("../controllers/user_controller");
const { catchAsyncError } = require("../../utilities/utilities");

router.route("/user/signup").post(catchAsyncError(signUp));
router.route("/user/signin").post(catchAsyncError(signIn));
router.route("/user/profile").post(catchAsyncError(signIn));

module.exports = router;
