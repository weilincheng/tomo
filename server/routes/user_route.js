const router = require("express").Router();
const {
  signUp,
  signIn,
  profile,
  getUserInfo,
  updateUserInfo,
  getPosts,
  addPost,
  removePost,
  getRelationships,
  addRelationship,
  removeRelationship,
  getBlockStatus,
  addBlockStatus,
  removeBlockStatus,
} = require("../controllers/user_controller");
const {
  catchAsyncError,
  authUser,
  multerUpload,
} = require("../../utilities/utilities");
const MAX_PROFILE_IMAGE_COUNT = 1;
const MAX_BACKGROUND_IMAGE_COUNT = 1;
const MAX_POST_IMAGES_COUNT = 4;
const cpUpload = multerUpload.fields([
  { name: "profile-image", maxCount: MAX_PROFILE_IMAGE_COUNT },
  { name: "background-image", maxCount: MAX_BACKGROUND_IMAGE_COUNT },
  { name: "post-images", maxCount: MAX_POST_IMAGES_COUNT },
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

router
  .route("/user/block/:targetUserId")
  .get(authUser(), catchAsyncError(getBlockStatus));
router
  .route("/user/block/:targetUserId")
  .post(authUser(), catchAsyncError(addBlockStatus));
router
  .route("/user/block/:targetUserId")
  .delete(authUser(), catchAsyncError(removeBlockStatus));

router.route("/user/:userId").get(authUser(), catchAsyncError(getUserInfo));
router
  .route("/user/:userId")
  .put(authUser(), cpUpload, catchAsyncError(updateUserInfo));

router.route("/user/:userId/posts").get(catchAsyncError(getPosts));
router
  .route("/user/:userId/posts")
  .post(authUser(), cpUpload, catchAsyncError(addPost));
router
  .route("/user/:userId/posts/:postId")
  .delete(authUser(), catchAsyncError(removePost));

module.exports = router;
