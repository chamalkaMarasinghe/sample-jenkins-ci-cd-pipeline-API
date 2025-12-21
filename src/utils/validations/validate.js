const { validationResult } = require("express-validator");
// const AppError = require("./AppError");
// const {ALL_ERRORS, COMMON_ERRORS} = require("../constants/errorMessages");
const { ValidationFailureError, ParameterNotProvidedError, InvalidFormatError } = require("../errors/CustomErrors");
const AppError = require("../errors/AppError");

exports.validate = (req, res, next) => {    

    const errors = validationResult(req);

    if (errors.isEmpty()) {
        return next();
    }

    const error = errors.array()[0] || new ValidationFailureError();
    
    if(error?.msg?.error?.isCustomError){
        return next(error?.msg?.error);
    }else{
        console.log("validate error in catch block");
        console.log(error);
        return next(new ValidationFailureError());
    }
};
