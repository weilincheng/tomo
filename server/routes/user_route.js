const router = require("express").Router();
const {
  signUp,
  signIn,
  profile,
  getUserInfo,
  updateUserInfo,
  getPosts,
  addPost,
  getRelationships,
  addRelationship,
  removeRelationship,
} = require("../controllers/user_controller");
const {
  catchAsyncError,
  authUser,
  multerUpload,
} = require("../../utilities/utilities");
const cpUpload = multerUpload.fields([
  { name: "profile-image", maxCount: 1 },
  { name: "background-image", maxCount: 1 },
  { name: "post-images", maxCount: 4 },
]);

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
router.route("/user/:userId").get(catchAsyncError(getUserInfo));
router
  .route("/user/:userId")
  .put(authUser(), cpUpload, catchAsyncError(updateUserInfo));
router.route("/user/:userId/posts").get(catchAsyncError(getPosts));
router
  .route("/user/:userId/posts")
  .post(authUser(), cpUpload, catchAsyncError(addPost));

module.exports = router;
