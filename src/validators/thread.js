// const { query, body, param, cookie, header } = require("express-validator");
// const mongoose = require("mongoose");
// const { roles} = require("../constants/commonConstants");
// const { isOnlyAlphebetic, GHANA_PHONE_NUMBER_PATTERN, PASSWORD_PATTERN, isValidEmailOrPhone, isValidOTPCode } = require("../utils/validations/validationChecks");
// const { ParameterNotProvidedError, InvalidFormatError } = require("../utils/errors/CustomErrors");

// exports.createThreadValidator = [
//     param("serviceprovider")
//         .not()
//         .isEmpty()
//         .withMessage(() => { return {error: new ParameterNotProvidedError("Service Provider")}})
//         .trim()
//         .isLength({ min: 1})
//         .withMessage(() => { return {error: new ParameterNotProvidedError("Service Provider")}})
//         .isString()
//         .withMessage(() => { return {error: new InvalidFormatError("Service Provider")}})
//         .custom(async (serviceprovider) => {                        
//             if(!mongoose.isValidObjectId(serviceprovider)){
//                 throw { error: new InvalidFormatError("Service Provider") };
//             }
//             return true;
//         }),
// ];

// exports.paginationParametersValidator = [

//     query("offset")
//         .not()
//         .isEmpty()
//         .withMessage(() => ({ error: new ParameterNotProvidedError("Page") }))
//         .isInt({ min: 0 })
//         .withMessage(() => ({ error: new InvalidFormatError("Page") }))
//         .optional({ nullable: true, checkFalsy: true }),

//     query("limit")
//         .not()
//         .isEmpty()
//         .withMessage(() => ({ error: new ParameterNotProvidedError("Size") }))
//         .isInt({ min: 1 })
//         .withMessage(() => ({ error: new InvalidFormatError("Size") }))
//         .optional({ nullable: true, checkFalsy: true }),

//     query("userName")
//         .not()
//         .isEmpty()
//         .withMessage(() => { return {error: new ParameterNotProvidedError("User Name")}})
//         .isString()
//         .withMessage(() => { return {error: new InvalidFormatError("User Name")}})
//         .trim()
//         .isLength({ min: 1 })
//         .withMessage(() => { return {error: new ParameterNotProvidedError("User Name")}})
//         .optional({ nullable: true, checkFalsy: true }),

// ];

// exports.getUserChatsValidator = [

//     param("thread")
//         .not()
//         .isEmpty()
//         .withMessage(() => { return {error: new ParameterNotProvidedError("Thread")}})
//         .trim()
//         .isLength({ min: 1})
//         .withMessage(() => { return {error: new ParameterNotProvidedError("Thread")}})
//         .isString()
//         .withMessage(() => { return {error: new InvalidFormatError("Thread")}})
//         .custom(async (thread) => {                        
//             if(!mongoose.isValidObjectId(thread)){
//                 throw { error: new InvalidFormatError("Thread") };
//             }
//             return true;
//         }),

//     query("offset")
//         .not()
//         .isEmpty()
//         .withMessage(() => ({ error: new ParameterNotProvidedError("Page") }))
//         .isInt({ min: 0 })
//         .withMessage(() => ({ error: new InvalidFormatError("Page") }))
//         .optional({ nullable: true, checkFalsy: true }),

//     query("limit")
//         .not()
//         .isEmpty()
//         .withMessage(() => ({ error: new ParameterNotProvidedError("Size") }))
//         .isInt({ min: 1 })
//         .withMessage(() => ({ error: new InvalidFormatError("Size") }))
//         .optional({ nullable: true, checkFalsy: true }),

// ];