const express = require('express');
const { regiseterUser, loginUser, logout, forgotePassword } = require('../controller/userControl');
const router = express.Router();


router.route("/register").post(regiseterUser)

router.route("/login").post(loginUser);

router.route("/password/forgot").post(forgotePassword);

router.route("/logout").get(logout);


module.exports = router;