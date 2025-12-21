const jwt = require("jsonwebtoken");
// const { catchAsync } = require("../utils/errors/catchAsync");
// const handleResponse = require("../utils/response/response");
const User = require("../../models/user");
const ServiceProvider = require("../../models/serviceProvider");
const { UNAUTHORIZED, TOKEN_INVALID } = require("../../constants/errorCodes");
const currentEnvironment = require('../../config/environmentConfig');
const JWT_SECRET = currentEnvironment.JWT_SECRET;
// const { COMMON_ERRORS, INVALID_STATUS } = require("../constants/errorMessages");
// const { roles, writerStatus } = require("../constants/commonConstants");
// const { catchAsyncSocket } = require("../utils/catchAsyncSocket");

exports.verifyTokenUtility = async({token = null, mode = 'emit'}) => {
    
    if (!token || token?.length < 1) {
        throw new Error(UNAUTHORIZED.message, {cause: "logical"});
    }

    let user = null;

    let userDecoded = jwt.verify(token, JWT_SECRET);
    
    if(!userDecoded){
        throw new Error(TOKEN_INVALID.message, {cause: "logical"});
    }

    if(mode === 'listen'){
        if(!userDecoded._id || !userDecoded.roles || userDecoded.roles?.length < 1){
            throw new Error(UNAUTHORIZED.message, {cause: "logical"});
        }
        return true;
    }

    user = await User.findById(userDecoded?._id);

    if(!user){
        user = await ServiceProvider.findById(userDecoded?._id);
    }

    if(!user){
        throw new Error(TOKEN_INVALID.message, {cause: "logical"});
    }

    if(user?.isDeleted){
        throw new Error(UNAUTHORIZED.message, {cause: "logical"});
    }
    
    if(!user._id || !user.roles || user.roles?.length < 1){
        throw new Error(UNAUTHORIZED.message, {cause: "logical"});
    }

    return true;
}