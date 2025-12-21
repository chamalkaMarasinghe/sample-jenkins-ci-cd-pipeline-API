const jwt = require("jsonwebtoken");

const currentEnvironment = require("../config/environmentConfig");
const JWT_SECRET = currentEnvironment.JWT_SECRET;

const User = require("../models/user");
const ServiceProvider = require("../models/serviceProvider");

const { catchAsync } = require("../utils/errors/catchAsync");

const {
    UnauthorizedError,
    RecordNotFoundError,
    ActionNotAllowedError,
    SuspendedTaskerError,
} = require("../utils/errors/CustomErrors");

exports.authenticateServiceProvider = (options = {}) => catchAsync(async (req, res, next) => {
    
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return next(new UnauthorizedError());
    }

    const decodedToken = jwt.verify(token, JWT_SECRET);

    const user = await ServiceProvider.findById(decodedToken._id).select("-password");

    if (!user) {
        return next(new RecordNotFoundError("User"));
    }

    if (user?.isDeleted) {
        return next(new UnauthorizedError());
    }

    if(options.checkSuspension && user?.isSuspended){
        return next(new SuspendedTaskerError());
    }

    if (user._id && user.roles) {
        req.user = { _id: user?._id, roles: user?.roles, email: user?.email, isSuspended: user?.isSuspended, isDeleted: user?.isDeleted};
    } else {
        return next(new UnauthorizedError());
    }

    next();
});