const { default: mongoose, Mongoose } = require("mongoose");
const jwt = require("jsonwebtoken");
const { catchAsync } = require("../utils/errors/catchAsync");
const User = require("../models/user");
const handleResponse = require("../utils/response/response");
const sendMail = require("../utils/email/sendEmail");
const {
    roles,
    types,
    emailSendingActionTypes,
    minutesTakenToExpireTheSigninOTP,
    rolesForInquiry,
    documentCounters,
} = require("../constants/commonConstants");
const { getNewID } = require("../utils/genCustomID/getNewID");
const currentEnvironment = require("../config/environmentConfig");
const {
    DuplicateRecordsError,
    FailureOccurredError,
    RecordNotFoundError,
    PasswordMismatchError,
    UnauthorizedError,
    TokenError,
    ActionNotAllowedError,
    BadRequestError,
} = require("../utils/errors/CustomErrors");
const ServiceProvider = require("../models/serviceProvider");
const { log } = require("winston");
const JWT_SECRET = currentEnvironment.JWT_SECRET;
const SIGNIN_OTP_VERIFICATION = currentEnvironment.SIGNIN_OTP_VERIFICATION;

exports.signature = catchAsync(async (req, res, next) => {
    const siganture = "##Signature#"

    console.log(currentEnvironment.CLOUDINARY_CLOUD_NAME);
    console.log(currentEnvironment.CLOUDINARY_API_KEY);
    console.log(currentEnvironment.CLOUDINARY_API_SECRET);
    
    return handleResponse(res, 200, "Signed Successfully", {
        siganture,
    });
});
