const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwtToken = require('jsonwebtoken')
const crypto = require('crypto');


const userSchema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, 'Please Enter Name'],
        maxLength: [30, "Name cannot exceed more tahn 30 characters"],
        minLength: [4, "Name cannot less more tahn 4 characters"]
    },
    email: {
        type: String,
        required: [true, 'Please Enter Email'],
        unique: true,
        validate: [validator.isEmail, "Please enter a valid Email"]
    },
    password: {
        type: String,
        required: [true, 'Please Enter Password'],
        minLength: [8, "Pasaword should be greater than 8 character"],
        select: false,
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    role: {
        type: String,
        default: "user",
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },

    resetPasswordToken: String,
    resetPasswordExpire: Date,

})

userSchema.pre("save", async function (next) {

    if (!this.isModified("password")) {
        next()
    }

    this.password = await bcrypt.hash(this.password, 10)
})

// JWT Token
userSchema.methods.getJwtToken = function () {

    return jwtToken.sign({ _id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIREIN
    })
    
};

// Generating Reset Password
userSchema.methods.generateResetPassword = function(){

    // Generating Token 
    const resetToken = crypto.randomBytes(20).toString("hex")

    //Hasing and giving value to resetPasswordToken
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    this.resetPasswordExpire = Date.now() + 15*60*1000;

    return resetToken ; 

}

module.exports = mongoose.model("User", userSchema)
