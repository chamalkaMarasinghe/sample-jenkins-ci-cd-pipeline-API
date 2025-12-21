const AppError = require("../utils/errors/AppError");
const ErrorCodes = require("../constants/errorCodes");

const sendErrorDev = (error, res) => {

    const statusCode = error.statusCode || ErrorCodes.CUSTOM_INTERNAL_SERVER_ERROR.httpStatus;
    const message = error?.isCustomError ? error.message : ErrorCodes.CUSTOM_INTERNAL_SERVER_ERROR.message;
    const stack = error.stack;
    const httpStatus = error.httpStatus || ErrorCodes.CUSTOM_INTERNAL_SERVER_ERROR.httpStatus;

    res.status(httpStatus).json({
        statusCode,
        message,
        stack,
    });
};

const sendErrorProd = (error, res) => {

    const statusCode = error.statusCode || ErrorCodes.CUSTOM_INTERNAL_SERVER_ERROR.httpStatus;
    const message = error.isCustomError ? error.message : ErrorCodes.CUSTOM_INTERNAL_SERVER_ERROR.message;
    const httpStatus = error.httpStatus || ErrorCodes.CUSTOM_INTERNAL_SERVER_ERROR.httpStatus;

    return res.status(httpStatus).json({
        statusCode,
        message,
    });
};

const globalErrorHandler = (err, req, res, _next) => {
    try {
        console.log(err);
    
        // Handle system errors
        if (err.name === "JsonWebTokenError") {
            err = new AppError("Authentication error", 401, 401);
        } else if (err.name === "TypeError") {
            err = new AppError("Failed to process request", 422, 422);
        } else if (err.name === "ValidationError") {
            err = new AppError("Validation error. Please check your input data", 400, 400);
        } else if (err.name === "CastError") {
            err = new AppError("Unable to process the provided information", 400, 400);
        } else if (err.name === "TokenExpiredError") {
            err = new AppError("Your session has expired. Please log in again", 401, 401);
        } else if (err.name === "MongoNetworkError") {
            err = new AppError("Unable to connect to the database. Please try again later", 503, 503);
        }else if(err?.response?.data?.message){
            err = new AppError(err?.response?.data?.message, 400, 400);
        }
    
        if (process.env.ENVIRONMENT === "dev") {
            return sendErrorDev(err, res);
        }
    
        sendErrorProd(err, res);
        
    } catch (error) {
            
        if (process.env.ENVIRONMENT === "dev") {
            return sendErrorDev(error, res);
        }
    
        sendErrorProd(error, res);
        
    }
};

module.exports = { globalErrorHandler };