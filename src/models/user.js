const mongoose = require("mongoose");
const { roles, minutesTakenToExpireTheSigninOTP, minutesTakenToExpireTheForgotPasswordToken, mobileMoneyProviders, banks, categories, cities, paymentTypes } = require("../constants/commonConstants");

const { DateTime } = require("luxon");
const crypto = require("node:crypto");
const bcrypt = require("bcryptjs");
const enviroment_configs = require("../config/environmentConfig");
const { generateToken, verifyToken } = require("../utils/tokens/genToken");
const {
    PASSWORD_VALIDATION,
} = require("../constants/customValidationErrorMessages.js");
const {
    PASSWORD_PATTERN,
} = require("../utils/validations/validationChecks.js");
const {
    FailureOccurredError,
    PermissionDeniedError,
} = require("../utils/errors/CustomErrors.js");
const { type } = require("node:os");
const OTP_HASH_SECRET = enviroment_configs.OTP_HASH_SECRET

const professionalDetailsSchema = new mongoose.Schema(
    {
        categoryName: {
            type: String,
            required: true,
            trim: true,
            enum: categories?.map(item => item?.name || "")
        },
        skills: [
            {
                skillName: {
                    type: String,
                    required: true,
                    trim: true,
                    enum: categories?.flatMap(item => item?.skills)?.map(item => item?.name)
                },
                description: {
                    type: String,
                    required: true,
                    trim: true
                },
            }
        ],
    },
    { timestamps: true }

)

const servingAreasDetailsSchema = new mongoose.Schema(
    {
        cityName: {
            type: String,
            required: true,
            trim: true,
            enum: cities?.map(item => item?.name)
        },
        subcities: {
            type: [String],
            enum: cities?.flatMap(item => item?.subcities)?.map(item => item?.name)
        },
    },
    { timestamps: true }

)

const walletSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            trim: true,
            default: "tasker"
        },
        amount: {
            type: Number,
            required: true,
            default: 0
        },
        pending: {
            type: Number,
            required: true,
            default: 0
        },
    },
    { timestamps: true }
)

const payoutDetailsMobileMoneySchema = new mongoose.Schema(
    {
        mobileMoneyProvider: {
            type: String,
            // required: true,
            trim: true,
            enum: mobileMoneyProviders?.map(item => item?.name || '')
        },
        mobileNumber: {
            type: String,
            // required: true,
            // default: '',
            trim: true,
            // index:true, 
            // unique:true,
            // sparse:true
        },
        accHolderFullName: {
            type: String,
            // required: true,
            // default: '',
            trim: true,
            // index:true, 
            // unique:true,
            // sparse:true
        },
    },
    { timestamps: true }
)

const payoutDetailsBankDetailsSchema = new mongoose.Schema(
    {
        bankName: {
            type: String,
            // required: true,
            trim: true,
        },
        accHolderFullName: {
            type: String,
            // required: true,
            // default: '',
            trim: true,
            // index:true, 
            // unique:true,
            // sparse:true
        },
        accNumber: {
            type: String,
            // required: true,
            // default: '',
            trim: true,
            // index:true, 
            // unique:true,
            // sparse:true
        },
        branchName: {
            type: String,
            trim: true,
        },
    },
    { timestamps: true }
)

const userSchema = new mongoose.Schema(
    {
        id: {
            type: String,
            required: true,
        },
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            required: true,
        },
        phoneNumber: {
            type: String,
            trim: true,
            required: false,
        },
        password: {
            type: String,
            required: true,
            minlength: 8,
        },
        profilePicture: {
            type: String,
            required: false,
            trim: true,
        },
        roles: {
            type: [String],
            required: true,
            default: [roles.USER],
            enum: [roles.USER],
        },
        verifyToken: {
            type: String,
            required: false,
        },
        expiredAt: {
            type: Date,
        },
        otp: {
            type: String
        },
        otpExpiredAt: {
            type: Date,
        },
        otpVerified: {
            type: Boolean,
            default: false,
        },
        isDeleted: {
            type: Boolean,
            required: false,
            default: false
        },
        city: {
            type: String,
            required: false,
        },
        wishList: [
            {
                default: [],
                type: mongoose.Schema.Types.ObjectId,
                ref: "Event",
                required: false,
            }
        ],
        pushToken: {
            type: String,
            required: false,
        },
        pushTokenUpdatedAt: {
            type: Date,
            required: false,
        },
    },
    { timestamps: true }
);

// <============ excluding isDeleted: true records from all types of CRUD oprations and from aggeragation pipelines ========>

// Middleware to exclude deleted users from find operations
// userSchema.pre(/^find/, function (next) {
//     this.where({ isDeleted: { $ne: true } });
//     next();
// });

// userSchema.pre(/^findOne/, function (next) {
//     this.where({ isDeleted: { $ne: true } });
//     next();
// });

// userSchema.pre("aggregate", function (next) {
//     const pipeline = this.pipeline();
//     // Add a $match stage at the beginning to exclude isDeleted: true
//     pipeline.unshift({ $match: { isDeleted: { $ne: true } } });
//     next();
// });

// Hash password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password") || !this.password) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Hash password during modifications
userSchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate();

    if (update && update.$set && update.$set.password) {
        update.$set.password = await bcrypt.hash(update.$set.password, 12);
    }
    next();
});

// Compare password for login
userSchema.methods.comparePassword = function (candidatePassword) {
    if (!this.password) {
        throw new AppError(COMMON_ERRORS.NO_PASSWORD, 400);
    }
    return bcrypt.compare(candidatePassword, this.password);
};

// user schema middleware functions for authentication tasks
userSchema.methods.getVerifyToken = async function (session = null) {
    try {
        const tokenDuration = {
            minutes: minutesTakenToExpireTheForgotPasswordToken,
        };

        const { token, hash, expiredAt } = generateToken({
            duration: tokenDuration,
        });

        this.verifyToken = hash;
        this.expiredAt = expiredAt;

        const updatedUser = await this.save({ session });

        if (!updatedUser) {
            throw new FailureOccurredError("Token Generation");
        }

        return token;
    } catch (error) {
        throw new FailureOccurredError("Token Generation");
    }
};

userSchema.methods.verify = async function (token) {
    if (!this.verifyToken || !this.expiredAt) {
        throw new PermissionDeniedError();
    }

    const verified = verifyToken({
        hash: this.verifyToken,
        token: token,
        expiredAt: this.expiredAt,
    });

    return verified;
};

userSchema.methods.clearToken = async function ({
    session = undefined,
    verifyEmail = false,
}) {
    try {
        this.verifyToken = undefined;
        this.expiredAt = undefined;

        if (verifyEmail) {
            this.emailVerified = true;
        }

        const user = await this.save({ session });
        return user;
    } catch (error) {
        throw new FailureOccurredError("Removing Token");
    }
};

userSchema.methods.createOtp = async function (session = null) {
    try {
        const otpDuration = { minutes: minutesTakenToExpireTheSigninOTP };

        const {
            token: otp,
            hash,
            expiredAt,
        } = generateToken({
            otp: true,
            duration: otpDuration,
        });

        this.otp = hash;
        this.otpExpiredAt = expiredAt;

        const updatedUser = await this.save({ session });

        if (!updatedUser) {
            throw new FailureOccurredError("OTP Generation");
        }

        return otp;
    } catch (error) {
        throw new FailureOccurredError("OTP Generation");
    }
};

userSchema.methods.verifyOtp = function (otp) {
    if (!this.otp || !this.otpExpiredAt) {
        throw new PermissionDeniedError();
    }

    const verified = verifyToken({
        hash: this.otp,
        token: otp,
        expiredAt: this.otpExpiredAt,
        otp: true,
    });

    return verified;
};

userSchema.methods.clearOTP = async function (session = null) {
    try {
        this.otp = undefined;
        this.otpExpiredAt = undefined;

        const user = await this.save({ session });
        return user;
    } catch (error) {
        throw new FailureOccurredError("OTP removing");
    }
};

// userSchema.index({ "idNumber.primary": 1 }, { unique: true, sparse: true });
// userSchema.index({ "idNumber.secondary": 1 }, { unique: true, sparse: true });

const User = new mongoose.model("User", userSchema);
module.exports = User;