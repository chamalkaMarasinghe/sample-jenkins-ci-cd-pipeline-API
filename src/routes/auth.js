const express = require("express");
const router = express.Router();
const {validate} = require("../utils/validations/validate");
const {
    signupAsUserValidator,
    signinValidator,
    verifyOTPValidator,
    forgotPasswordValidator,
    idTokenValidator,
    idTokenValidatorWithPassword,
    signInServiceProviderValidator,
    signupAsServiceProValidator
} = require("../validators/auth");
const {
    signupAsUser,
    signin,
    verifyOtp,
    forgotPassword,
    verifyUserForgot,
    changePassword,
    signinAdmin,
    signupAsServiceProvider,
    signinAsServiceProvider,
    forgotPasswordServicepro,
    verifyServiceproForgot,
    changePasswordServicepro,
    changePasswordUser,
    forgotPasswordUser, forgotPasswordAdmin, verifyAdminForgot, changePasswordAdmin,
    sendOTPForReset,
    verifyOTPForReset,
    resetPasswordWithOTP
} = require("../controllers/auth");
// const { authenticateUser } = require("../middlewares/authenticateUser");
// const { authorizeRoles } = require("../middlewares/authorizeRoles");
// const { authenticateWriter } = require("../middlewares/authenticateWriter");
const { roles } = require("../constants/commonConstants");

// allow any role ------------------------------------------

router.post("/signup/user", signupAsUserValidator, validate, signupAsUser);

router.post("/signup/servicepro", signupAsServiceProValidator, validate, signupAsServiceProvider);

router.post("/signin/user", signinValidator, validate, signin);

router.post("/signin/servicepro", signinValidator, validate, signinAsServiceProvider);

/* ----  OTP reset password flow for mobile ---- */
router.post('/send-reset-otp', sendOTPForReset);

router.post('/verify-reset-otp', verifyOTPForReset);

router.post('/reset-password', resetPasswordWithOTP);

// NOTE : for admin
router.post("/signin/admin", signInServiceProviderValidator, validate, signinAdmin);

router.post("/signin/user/verify-otp", verifyOTPValidator, validate, verifyOtp);

router.post("/forgot-password/admin", forgotPasswordValidator, validate, forgotPasswordAdmin);

router.get("/verify-forgot/admin/:id/:token", idTokenValidator, validate, verifyAdminForgot);

router.post("/change-password/admin/:id/:token", idTokenValidatorWithPassword, validate, changePasswordAdmin);

// NOTE: for user
router.post("/forgot-password/user", forgotPasswordValidator, validate, forgotPasswordUser);

router.get("/verify-forgot/user/:id/:token", idTokenValidator, validate, verifyUserForgot);

router.post("/change-password/user/:id/:token", idTokenValidatorWithPassword, validate, changePasswordUser);

// NOTE: for service pro
router.post("/forgot-password/servicepro", forgotPasswordValidator, validate, forgotPasswordServicepro);

router.get("/verify-forgot/servicepro/:id/:token", idTokenValidator, validate, verifyServiceproForgot);

router.post("/change-password/servicepro/:id/:token", idTokenValidatorWithPassword, validate, changePasswordServicepro);

module.exports = router;