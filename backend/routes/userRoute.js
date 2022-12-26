const express = require("express");
const {
  regiseterUser,
  loginUser,
  logout,
  forgotePassword,
  resetPassword,
  getUserDetails,
  updatePassword,
  updateUserProfile,
  getAllUsers,
  getUser,
  updateUserRole,
  deleteUserProfile,
} = require("../controller/userControl");
const { isAuthanticateUser, authorizeRoles } = require("../middleware/auth");
const router = express.Router();

router.route("/register").post(regiseterUser);

router.route("/login").post(loginUser);

router.route("/logout").get(logout);

router.route("/password/forgot").post(forgotePassword);

router.route("/password/reset/:token").put(resetPassword);

router.route("/me").get(isAuthanticateUser, getUserDetails);

router.route("/password/update").put(isAuthanticateUser, updatePassword);

router.route("/me/update").put(isAuthanticateUser, updateUserProfile);

router
  .route("/admin/users")
  .get(isAuthanticateUser, authorizeRoles("admin"), getAllUsers);

router
  .route("/admin/user/:id")
  .get(isAuthanticateUser, authorizeRoles("admin"), getUser)
  .put(isAuthanticateUser, authorizeRoles("admin"), updateUserRole)
  .delete(isAuthanticateUser, authorizeRoles("admin"), deleteUserProfile);

module.exports = router;
