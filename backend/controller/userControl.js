const Errorhandlers = require("../utils/errorHandlers");
const catchAsyncError = require("../middleware/asyncError");
const bcrypt = require('bcryptjs');
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail")
const crypto = require('crypto')

//Register A user

exports.regiseterUser = catchAsyncError(async (req, res, next) => {

    const { name, email, password } = req.body


    const user = await User.create({
        name, email, password,
        avatar: {
            public_id: "This is a sample id",
            url: "This is a sample Url"
        }
    })

    const token = user.getJwtToken()

    res.cookie("token", token, {
        expires: new Date(Date.now() + 2589200000),
        httpOnly: true
    })

    res.status(201).json({
        success: true,
        message: "Registration Successfull",
        user,
        token
    });

    user.save();

});

// Login user
exports.loginUser = catchAsyncError(async (req, res, next) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return next(new Errorhandlers("Please Enter Email & password", 401))
    }

    const user = await User.findOne({ email }).select("+password")

    if (!user) {
        return next(new Errorhandlers("Invlaid Email or password", 401))
    }

    const isMAtchPassword = await bcrypt.compare(password, user.password)

    if (!isMAtchPassword) {
        return next(new Errorhandlers("Invlaid password", 401))
    }

    const token = user.getJwtToken()

    res.cookie("token", token, {
        expires: new Date(Date.now() + 2589200000),
        httpOnly: true
    })


    res.status(200).json({
        success: true,
        message: "Login Successfull",
        user,
        token
    });
})


// LogOut

exports.logout = catchAsyncError(async (req, res, next) => {

    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })


    res.status(200).json({
        success: true,
        message: "Logout Successfull"
    });

})

// Forgot Password 
exports.forgotePassword = catchAsyncError(async (req, res, next) => {

    const user = await User.findOne({ email: req.body.email })

    if (!user) {

        return next(new Errorhandlers('User not found', 404));

    }

    const resetToken = user.generateResetPassword();

    await user.save({ validateBeforeSave: false })

    const resetLink = `${req.protocol}//${req.get("host")}/api/v1/password/reset/${resetToken}`

    const message = `${user.name} Your password reset link is \n\n ${resetLink} \n\n It is valid till 15mins Please ignore if you not requested for this.`

    try {

        await sendEmail({
            email: user.email,
            subject: `Password Recovery`,
            message
        });

        res.status(200).json({
            success: true,
            message: `Email send to ${user.email} successfully.`
        })


    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;


        await user.save({ validateBeforeSave: false })
        return next(new Errorhandlers(error.message, 500))
    }

});

//Reset PAssword

exports.resetPassword = catchAsyncError(async (req, res, next) => {

    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    })

    if (!user) {

        return next(new Errorhandlers('Reset password token Invlaid or Expired', 404));
    }

    if (req.body.password !== req.body.confirmPassword) {
        return next(new Errorhandlers('Password not match', 404));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save(); 

})