const Errorhandlers = require("../utils/errorHandlers");

module.exports = (err, req, res, next) => {

    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server Error";

    //Wrong id 
    if (err.name === "CastError") {

        const message = `${err.path} not found `
        err = new Errorhandlers(message, 400)

    }

    //JSON web token error
    if (err.name === "JsonWebTokenError") {
        const message = `Json web token is invlaid`
        err = new Errorhandlers(message, 400)

    }



    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        statusCode: err.statusCode
    })

}
