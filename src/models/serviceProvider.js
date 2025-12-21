// const mongoose = require("mongoose");
// const { roles, minutesTakenToExpireTheSigninOTP, minutesTakenToExpireTheForgotPasswordToken, mobileMoneyProviders, banks, categories, cities, paymentTypes, serviceProIdTypes } = require("../constants/commonConstants");

// const { DateTime } = require("luxon");
// const crypto = require("node:crypto");
// const bcrypt = require("bcryptjs");
// const enviroment_configs = require("../config/environmentConfig");
// const { generateToken, verifyToken } = require("../utils/tokens/genToken");
// const {
//     PASSWORD_VALIDATION,
// } = require("../constants/customValidationErrorMessages.js");
// const {
//     PASSWORD_PATTERN,
// } = require("../utils/validations/validationChecks.js");
// const {
//     FailureOccurredError,
//     PermissionDeniedError,
// } = require("../utils/errors/CustomErrors.js");
// const { type } = require("node:os");
// const OTP_HASH_SECRET = enviroment_configs.OTP_HASH_SECRET

// const personalInformationSchema = new mongoose.Schema(
//     {
//         firstName: {
//             type: String,
//             trim: true,
//             required: true,
//         },
//         lastName: {
//             type: String,
//             trim: true,
//             required: true
//         },
//         email: {
//             type: String,
//             trim: true,
//             required: true,
//             index: true,
//             unique: true,
//             sparse: true
//         },
//         phoneNumber: {
//             type: String,
//             trim: true,
//             required: false,
//             index: true,
//             unique: true,
//             sparse: true
//         },
//         idType: {
//             type: String,
//             trim: true,
//             required: true,
//             // enum: Object.values(serviceProIdTypes)
//         },
//         idNumber: {
//             type: String,
//             trim: true,
//             required: false,
//             index: true,
//             unique: true,
//             sparse: true
//         },
//         idPhotos: {
//             type: [String],
//             required: true
//         },
//         address: {
//             type: String,
//             trim: true,
//             required: true,
//         },
//         addressProof: {
//             type: [String],
//             required: true
//         },
//     },
//     { timestamps: true }
// )

// const businessInformationSchema = new mongoose.Schema(
//     {
//         name: {
//             type: String,
//             trim: true,
//             required: true,
//         },
//         taxId: {
//             type: String,
//             trim: true,
//             required: true
//         },
//         address: {
//             type: String,
//             trim: true,
//             required: true
//         },
//         placeId: {
//             type: String,
//             trim: true,
//             required: true
//         },
//         location: {
//             type: {
//                 type: String,
//                 enum: ['Point'],
//                 required: true,
//                 default: 'Point'
//             },
//             coordinates: {
//                 type: [Number], // [longitude, latitude]
//                 required: true
//             }
//         },
//         logo: {
//             type: [String],
//             required: true
//         },
//         cover: {
//             type: [String],
//             required: true
//         },
//         gallery: {
//             type: [String],
//             required: true
//         },
//         link: {
//             type: String,
//             trim: true,
//         },
//         expirience: {
//             type: Number,
//             min: 0,
//             required: true,
//             default: 0
//         },
//         category: {
//             type: String,
//             trim: true,
//             required: true,
//         },
//         description: {
//             type: String,
//             trim: true,
//         },
//     },
//     { timestamps: true }
// )

// const payoutInformationSchema = new mongoose.Schema(
//     {
//         firstName: {
//             type: String,
//             trim: true,
//             required: true,
//         },
//     },
//     { timestamps: true }
// )

// const walletSchema = new mongoose.Schema(
//     {
//         amount: {
//             type: Number,
//             required: true,
//             default: 0
//         },
//         pending: {
//             type: Number,
//             required: true,
//             default: 0
//         },
//     },
//     { timestamps: true }
// )

// const ServiceProviderSchema = new mongoose.Schema(
//     {
//         id: {
//             type: String,
//             required: true,
//         },
//         firstName: {
//             type: String,
//             required: true,
//             trim: true,
//         },
//         lastName: {
//             type: String,
//             required: true,
//             trim: true
//         },
//         email: {
//             type: String,
//             trim: true,
//             required: true,
//             // index:true, 
//             // unique:true,
//             // sparse:true
//         },
//         password: {
//             type: String,
//             required: true,
//             minlength: 8,
//         },
//         roles: {
//             type: [String],
//             required: true,
//             default: [roles.SERVICE_PRO],
//             enum: [roles.SERVICE_PRO, roles.ADMIN],
//         },
//         stripeAccountId: {
//             type: String,
//             required: false,
//         },
//         profilePicture: {
//             type: String,
//             trim: true,
//             required: false
//         },
//         personalInformation: {
//             type: personalInformationSchema, // NOTEe: service provider personal information
//             required: false
//         },
//         businessInformation: {
//             type: businessInformationSchema, // NOTEe: service provider business information
//             required: false
//         },
//         payoutInformation: {
//             type: payoutInformationSchema, // NOTEe: service provider payout information
//             required: false
//         },
//         wallet: {
//             type: walletSchema,
//             required: true,
//             default: {
//                 amount: 0,
//                 pending: 0
//             }
//         },
//         isOnboardingCompleted: {
//             type: Boolean,
//             required: true,
//             default: false,
//         },
//         isOnboardingVerified: {
//             type: Boolean,
//             required: true,
//             default: false,
//         },
//         isOnboardingRejected: {
//             type: Boolean,
//             required: true,
//             default: false,
//         },
//         isStillProcessing: {
//             type: Boolean,
//             required: true,
//             default: false,
//         },
//         onboardingRejectionReason: {
//             type: String,
//         },
//         onboardingRequestdAt: {
//             type: Date,
//         },
//         onboardingApprovedAt: {
//             type: Date,
//         },
//         onboardingRejectedAt: {
//             type: Date,
//         },
//         verifyToken: {
//             type: String,
//             required: false,
//         },
//         expiredAt: {
//             type: Date,
//         },
//         otp: {
//             type: String
//         },
//         otpExpiredAt: {
//             type: Date,
//         },
//         isDeleted: {
//             type: Boolean,
//             required: false,
//             default: false
//         },
//         deletedAt: {
//             type: Date,
//         },
//         city:{
//             type:String,
//             required:false,
//         },
//         phoneNumber: {
//             type: String,
//             required: false,
//         }
//     },
//     { timestamps: true }
// );

// // Hash password before saving
// ServiceProviderSchema.pre("save", async function (next) {
//     if (!this.isModified("password") || !this.password) return next();
//     this.password = await bcrypt.hash(this.password, 12);
//     next();
// });

// // Hash password during modifications
// ServiceProviderSchema.pre("findOneAndUpdate", async function (next) {
//     const update = this.getUpdate();

//     if (update && update.$set && update.$set.password) {
//         update.$set.password = await bcrypt.hash(update.$set.password, 12);
//     }
//     next();
// });

// // Compare password for login
// ServiceProviderSchema.methods.comparePassword = function (candidatePassword) {
//     if (!this.password) {
//         throw new AppError(COMMON_ERRORS.NO_PASSWORD, 400);
//     }
//     return bcrypt.compare(candidatePassword, this.password);
// };

// // user schema middleware functions for authentication tasks
// ServiceProviderSchema.methods.getVerifyToken = async function (session = null) {
//     try {
//         const tokenDuration = {
//             minutes: minutesTakenToExpireTheForgotPasswordToken,
//         };

//         const { token, hash, expiredAt } = generateToken({
//             duration: tokenDuration,
//         });

//         this.verifyToken = hash;
//         this.expiredAt = expiredAt;

//         const updatedUser = await this.save({ session });

//         if (!updatedUser) {
//             throw new FailureOccurredError("Token Generation");
//         }

//         return token;
//     } catch (error) {
//         throw new FailureOccurredError("Token Generation");
//     }
// };

// ServiceProviderSchema.methods.verify = async function (token) {
//     if (!this.verifyToken || !this.expiredAt) {
//         throw new PermissionDeniedError();
//     }

//     const verified = verifyToken({
//         hash: this.verifyToken,
//         token: token,
//         expiredAt: this.expiredAt,
//     });

//     return verified;
// };

// ServiceProviderSchema.methods.clearToken = async function ({
//     session = undefined,
//     verifyEmail = false,
// }) {
//     try {
//         this.verifyToken = undefined;
//         this.expiredAt = undefined;

//         if (verifyEmail) {
//             this.emailVerified = true;
//         }

//         const user = await this.save({ session });
//         return user;
//     } catch (error) {
//         throw new FailureOccurredError("Removing Token");
//     }
// };

// ServiceProviderSchema.methods.createOtp = async function (session = null) {
//     try {
//         const otpDuration = { minutes: minutesTakenToExpireTheSigninOTP };

//         const {
//             token: otp,
//             hash,
//             expiredAt,
//         } = generateToken({
//             otp: true,
//             duration: otpDuration,
//         });

//         this.otp = hash;
//         this.otpExpiredAt = expiredAt;

//         const updatedUser = await this.save({ session });

//         if (!updatedUser) {
//             throw new FailureOccurredError("OTP Generation");
//         }

//         return otp;
//     } catch (error) {
//         throw new FailureOccurredError("OTP Generation");
//     }
// };

// ServiceProviderSchema.methods.verifyOtp = function (otp) {
//     if (!this.otp || !this.otpExpiredAt) {
//         throw new PermissionDeniedError();
//     }

//     const verified = verifyToken({
//         hash: this.otp,
//         token: otp,
//         expiredAt: this.otpExpiredAt,
//         otp: true,
//     });

//     return verified;
// };

// ServiceProviderSchema.methods.clearOTP = async function (session = null) {
//     try {
//         this.otp = undefined;
//         this.otpExpiredAt = undefined;

//         const user = await this.save({ session });
//         return user;
//     } catch (error) {
//         throw new FailureOccurredError("OTP removing");
//     }
// };

// const ServiceProvider = new mongoose.model("Serviceprovider", ServiceProviderSchema);
// module.exports = ServiceProvider;
