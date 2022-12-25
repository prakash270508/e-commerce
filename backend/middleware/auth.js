const catchAsyncError = require("./asyncError");
const Errorhandlers = require("../utils/errorHandlers");
const jwtToken = require('jsonwebtoken');
const User = require("../models/userModel");

exports.isAuthanticateUser = catchAsyncError(async (req, res, next) => {

    const { token } = req.cookies;

    if (!token) {
        return next(new Errorhandlers("Please Login to access this ", 401))
    }

    const decodedCode = jwtToken.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decodedCode.id);

    next()

})

exports.authorizeRoles = (...roles) => {

    
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new Errorhandlers(
                    `Role: ${req.user.role} is not allowed to access this resouce `,
                    403
                )
            );
        }

        next();
    };
};