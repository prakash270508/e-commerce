const Errorhandlers = require("../utils/errorHandlers");
const catchAsyncError = require("../middleware/asyncError");
const bcrypt = require("bcryptjs");
const sendToken = require("../utils/jwtToken");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const asyncError = require("../middleware/asyncError");

//Register A user

exports.regiseterUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "This is a sample id",
      url: "This is a sample Url",
    },
  });

  const token = user.getJwtToken();

  res.cookie("token", token, {
    expires: new Date(Date.now() + 2589200000),
    httpOnly: true,
  });

  res.status(201).json({
    success: true,
    message: "Registration Successfull",
    user,
    token,
  });

  user.save();
});

// Login user
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new Errorhandlers("Please Enter Email & password", 401));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new Errorhandlers("Invlaid Email or password", 401));
  }

  const isMAtchPassword = await bcrypt.compare(password, user.password);

  if (!isMAtchPassword) {
    return next(new Errorhandlers("Invlaid password", 401));
  }

  const token = user.getJwtToken();

  res.cookie("token", token, {
    expires: new Date(Date.now() + 2589200000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Login Successfull",
    user,
    token,
  });
});

// LogOut

exports.logout = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logout Successfull",
  });
});

// Forgot Password
exports.forgotePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new Errorhandlers("User not found", 404));
  }

  const resetToken = user.generateResetPassword();

  await user.save({ validateBeforeSave: false });

  const resetLink = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `${user.name} Your password reset link is \n\n ${resetLink} \n\n It is valid till 15mins Please ignore if you not requested for this.`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email send to ${user.email} successfully.`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new Errorhandlers(error.message, 500));
  }
});

//Reset PAssword

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(
      new Errorhandlers("Reset password token Invlaid or Expired", 404)
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new Errorhandlers("Password not match", 404));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

// Get user details
exports.getUserDetails = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// Get user details
exports.getUserDetails = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// Update user password
exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isMAtchPassword = await bcrypt.compare(
    req.body.oldPassword,
    user.password
  );

  if (!isMAtchPassword) {
    return next(new Errorhandlers("Old Password not match", 401));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(
      new Errorhandlers("New password and confirm password not match", 401)
    );
  }

  user.password = req.body.newPassword;
  await user.save();

  sendToken(user, 200, res);
});

//Update user profile
exports.updateUserProfile = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  user.save();

  res.status(200).json({
    success: true,
    user,
  });
});

//Get all users Details (Admin)
exports.getAllUsers = asyncError(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    success: true,
    users,
  });
});

//Get Single users Details (Admin)
exports.getUser = asyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new Errorhandlers(`User dose not exist with id : ${req.params.id}`, 400)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

//Update user role
exports.updateUserRole = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  user.save();

  res.status(200).json({
    success: true,
    user,
  });
});

exports.deleteUserProfile = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new Errorhandlers(`User dose not exist with id : ${req.params.id}`, 400)
    );
  }

  await user.remove();

  res.status(200).json({
    success: true,
    message:"User deleted successfully"
  });
});


