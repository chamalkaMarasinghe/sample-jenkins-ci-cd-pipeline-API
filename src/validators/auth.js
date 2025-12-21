const { query, body, param, cookie, header } = require("express-validator");
const mongoose = require("mongoose");
const { roles} = require("../constants/commonConstants");
const { isOnlyAlphebetic, GHANA_PHONE_NUMBER_PATTERN, PASSWORD_PATTERN, isValidEmailOrPhone, isValidOTPCode } = require("../utils/validations/validationChecks");
const { ParameterNotProvidedError, InvalidFormatError, CustomError, BadRequestError } = require("../utils/errors/CustomErrors");

exports.signupAsUserValidator = [

    body("firstName")
        .not()
        .isEmpty()
        .withMessage(() => { return {error: new ParameterNotProvidedError("First Name")}})
        .isString()
        .withMessage(() => { return {error: new InvalidFormatError("First Name")}})
        .trim()
        .isLength({ min: 1 })
        .withMessage(() => { return {error: new ParameterNotProvidedError("First Name")}})
        .isLength({ max: 25 })
        .withMessage(() => { return {error: new BadRequestError("First Name is Too Long")}})
        .custom((firstName) => {
            if (!isOnlyAlphebetic(firstName)) {
                throw { error: new InvalidFormatError("First Name") };
            }
            return true;
        }),
    
    body("lastName")
        .not()
        .isEmpty()
        .withMessage(() => { return { error: new ParameterNotProvidedError("Last Name")}})
        .isString()
        .withMessage(() => { return { error: new InvalidFormatError("Last Name")}})
        .trim()
        .isLength({ min: 1 })
        .withMessage(() => { return { error: new ParameterNotProvidedError("Last Name")}})
        .isLength({ max: 25 })
        .withMessage(() => { return {error: new BadRequestError("Last Name is Too Long")}})
        .custom((lastName) => {
            if (!isOnlyAlphebetic(lastName)) {
                throw { error: new InvalidFormatError("Last Name")};
            }
            return true;
        }),

    body("email")
        .not()
        .isEmpty()
        .withMessage(() => { return { error: new ParameterNotProvidedError("Email")}})
        .isString()
        .withMessage(() => { return { error: new InvalidFormatError("Email")}})
        .trim()
        .isLength({ min: 1 })
        .withMessage(() => { return { error: new ParameterNotProvidedError("Email")}})
        .isEmail()
        .withMessage(() => { return { error: new InvalidFormatError("Email")}})
        .toLowerCase(),

    body("phoneNumber")
        .not()
        .isEmpty()
        .withMessage(() => { return { error: new ParameterNotProvidedError("Contact Number")}})
        .isString()
        .withMessage(() => { return { error: new InvalidFormatError("Contact Number")}})
        .trim()
        .isLength({min: 1})
        .withMessage(() => { return { error: new ParameterNotProvidedError("Contact Number")}})
        .matches(GHANA_PHONE_NUMBER_PATTERN)
        .withMessage(() => { return { error: new InvalidFormatError("Contact Number")}}),

    body("password")
        .not()
        .isEmpty()
        .withMessage(() => { return { error: new ParameterNotProvidedError("Password")}})
        .isString()
        .withMessage(() => { return { error: new InvalidFormatError("Password")}})
        .isLength({ min: 8, max: 128})
        .withMessage(() => { return { error: new InvalidFormatError("Password")}})
        .matches(PASSWORD_PATTERN)
        .withMessage(() => { return { error: new InvalidFormatError("Password")}}),

    // body("profilePicture")
    //     .not()
    //     .isEmpty()
    //     .withMessage(() => { return {error: new ParameterNotProvidedError("Profile Picture")}})
    //     .isString({ min: 1 })
    //     .withMessage(() => { return {error: new InvalidFormatError("Profile Picture")}})
    //     .custom(async (profilePicture) => {
    //         try {                
    //             if(!profilePicture || profilePicture?.toString()?.trim()?.length < 1 || typeof(profilePicture) !== "string" || !(new URL(profilePicture))){
    //                 throw { error: new InvalidFormatError("Profile Picture") };
    //             }
    //             return true;
    //         } catch (error) {                
    //             throw { error: new InvalidFormatError("Profile Picture") };
    //         }
    //     })
    //     .optional({ nullable: true, checkFalsy: true }),
];

exports.signupAsServiceProValidator = [

    body("firstName")
        .not()
        .isEmpty()
        .withMessage(() => { return {error: new ParameterNotProvidedError("First Name")}})
        .isString()
        .withMessage(() => { return {error: new InvalidFormatError("First Name")}})
        .trim()
        .isLength({ min: 1 })
        .withMessage(() => { return {error: new ParameterNotProvidedError("First Name")}})
        .isLength({ max: 25 })
        .withMessage(() => { return {error: new BadRequestError("First Name is Too Long")}})
        .custom((firstName) => {
            if (!isOnlyAlphebetic(firstName)) {
                throw { error: new InvalidFormatError("First Name") };
            }
            return true;
        }),

    body("lastName")
        .not()
        .isEmpty()
        .withMessage(() => { return { error: new ParameterNotProvidedError("Last Name")}})
        .isString()
        .withMessage(() => { return { error: new InvalidFormatError("Last Name")}})
        .trim()
        .isLength({ min: 1 })
        .withMessage(() => { return { error: new ParameterNotProvidedError("Last Name")}})
        .isLength({ max: 25 })
        .withMessage(() => { return {error: new BadRequestError("Last Name is Too Long")}})
        .custom((lastName) => {
            if (!isOnlyAlphebetic(lastName)) {
                throw { error: new InvalidFormatError("Last Name")};
            }
            return true;
        }),

    body("email")
        .not()
        .isEmpty()
        .withMessage(() => { return { error: new ParameterNotProvidedError("Email")}})
        .isString()
        .withMessage(() => { return { error: new InvalidFormatError("Email")}})
        .trim()
        .isLength({ min: 1 })
        .withMessage(() => { return { error: new ParameterNotProvidedError("Email")}})
        .isEmail()
        .withMessage(() => { return { error: new InvalidFormatError("Email")}})
        .toLowerCase(),

    body("password")
        .not()
        .isEmpty()
        .withMessage(() => { return { error: new ParameterNotProvidedError("Password")}})
        .isString()
        .withMessage(() => { return { error: new InvalidFormatError("Password")}})
        .isLength({ min: 8, max: 128})
        .withMessage(() => { return { error: new InvalidFormatError("Password")}})
        .matches(PASSWORD_PATTERN)
        .withMessage(() => { return { error: new InvalidFormatError("Password")}}),
];

exports.signInServiceProviderValidator = [
    body('email')
        .not()
        .isEmpty()
        .withMessage(() => { return {error: new ParameterNotProvidedError("Email")}})
        .isString()
        .withMessage(() => { return {error: new InvalidFormatError("Email")}})
        .trim()
        .isLength({ min: 1 })
        .withMessage(() => { return {error: new ParameterNotProvidedError("Email")}})
        .isEmail()
        .withMessage(() => { return {error: new InvalidFormatError("Email")}}),
    body("password")
        .not()
        .isEmpty()
        .withMessage(() => { return { error: new ParameterNotProvidedError("Password")}})
        .isString()
        .withMessage(() => { return { error: new InvalidFormatError("Password")}})
        .isLength({ min: 8, max: 128})
        .withMessage(() => { return { error: new InvalidFormatError("Password")}})
        .matches(PASSWORD_PATTERN)
        .withMessage(() => { return { error: new InvalidFormatError("Password")}})
]

exports.signinValidator = [

    body("email")
        .not()
        .isEmpty()
        .withMessage(() => { return {error: new ParameterNotProvidedError("Email")}})
        .isString()
        .withMessage(() => { return {error: new InvalidFormatError("Email")}})
        .trim()
        .isLength({ min: 1 })
        .withMessage(() => { return {error: new ParameterNotProvidedError("Email")}})
        .custom((email) => {
            if (!isValidEmailOrPhone(email)) {
                throw { error: new InvalidFormatError("Email") };
            }
            return true;
        }),

    body("password")
        .not()
        .isEmpty()
        .withMessage(() => { return { error: new ParameterNotProvidedError("Password")}})
        .isString()
        .withMessage(() => { return { error: new InvalidFormatError("Password")}})
        .isLength({ min: 8, max: 128})
        .withMessage(() => { return { error: new InvalidFormatError("Password")}})
        .matches(PASSWORD_PATTERN)
        .withMessage(() => { return { error: new InvalidFormatError("Password")}})
];

exports.verifyOTPValidator = [

    body("otp")
        .not()
        .isEmpty()
        .withMessage(() => { return {error: new ParameterNotProvidedError("OTP")}})
        .isString()
        .withMessage(() => { return {error: new InvalidFormatError("OTP")}})
        .trim()
        .isLength({ min: 6 })
        .withMessage(() => { return {error: new InvalidFormatError("OTP")}})
        .custom((otp) => {
            if (!isValidOTPCode(otp)) {
                throw { error: new InvalidFormatError("OTP") };
            }
            return true;
        }),
];

exports.forgotPasswordValidator = [

    body("email")
        .not()
        .isEmpty()
        .withMessage(() => { return {error: new ParameterNotProvidedError("Email")}})
        .isString()
        .withMessage(() => { return {error: new InvalidFormatError("Email")}})
        .trim()
        .isLength({ min: 1 })
        .withMessage(() => { return {error: new ParameterNotProvidedError("Email")}})
        .custom((email) => {
            if (!isValidEmailOrPhone(email)) {
                throw { error: new InvalidFormatError("Email") };
            }
            return true;
        }),

];

exports.idTokenValidator = [

    param("id")
        .not()
        .isEmpty()
        .withMessage(() => { return {error: new ParameterNotProvidedError("User")}})
        .trim()
        .isLength({ min: 1})
        .withMessage(() => { return {error: new ParameterNotProvidedError("User")}})
        .isString()
        .withMessage(() => { return {error: new InvalidFormatError("User ID")}})
        .custom(async (id) => {            
            if(!mongoose.isValidObjectId(id)){
                throw { error: new InvalidFormatError("User ID") };
            }
            return true;
        }),

    param("token")
        .isString()
        .withMessage(() => { return {error: new InvalidFormatError("Token")}})
        .trim()
        .isLength({ min: 22, max: 22 })
        .withMessage(() => { return {error: new InvalidFormatError("Token")}})
];

exports.idTokenValidatorWithPassword = [

    param("id")
        .not()
        .isEmpty()
        .withMessage(() => { return {error: new ParameterNotProvidedError("User")}})
        .trim()
        .isLength({ min: 1})
        .withMessage(() => { return {error: new ParameterNotProvidedError("User")}})
        .isString()
        .withMessage(() => { return {error: new InvalidFormatError("User ID")}})
        .custom(async (id) => {                        
            if(!mongoose.isValidObjectId(id)){
                throw { error: new InvalidFormatError("User ID") };
            }
            return true;
        }),

    param("token")
        .isString()
        .withMessage(() => { return {error: new InvalidFormatError("Token")}})
        .trim()
        .isLength({ min: 22, max: 22 })
        .withMessage(() => { return {error: new InvalidFormatError("Token")}}),

    body("password")
        .not()
        .isEmpty()
        .withMessage(() => { return { error: new ParameterNotProvidedError("Password")}})
        .isString()
        .withMessage(() => { return { error: new InvalidFormatError("Password")}})
        .isLength({ min: 8, max: 128})
        .withMessage(() => { return { error: new InvalidFormatError("Password")}})
        .matches(PASSWORD_PATTERN)
        .withMessage(() => { return { error: new InvalidFormatError("Password")}})
];
