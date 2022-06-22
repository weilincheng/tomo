const router = require("express").Router();
const {
  signUp,
  signIn,
  profile,
  getUserInfo,
  getUserPosts,
  addPost,
  getRelationships,
  addRelationship,
  removeRelationship,
} = require("../controllers/user_controller");
const { catchAsyncError, authUser } = require("../../utilities/utilities");

router.route("/user/signup").post(catchAsyncError(signUp));
router.route("/user/signin").post(catchAsyncError(signIn));
router.route("/user/profile").get(catchAsyncError(profile));
router
  .route("/user/follow/:targetUserId")
  .get(catchAsyncError(getRelationships));
router
  .route("/user/follow/:targetUserId")
  .post(authUser(), catchAsyncError(addRelationship));
router
  .route("/user/follow/:targetUserId")
  .delete(authUser(), catchAsyncError(removeRelationship));
router.route("/user/:userId/posts").get(catchAsyncError(getUserPosts));
router.route("/user/:userId/posts").post(authUser(), catchAsyncError(addPost));
router.route("/user/:userId").get(catchAsyncError(getUserInfo));

module.exports = router;
