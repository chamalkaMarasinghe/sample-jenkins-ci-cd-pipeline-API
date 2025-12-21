const jwt = require("jsonwebtoken");
// const { catchAsync } = require("../utils/catchAsync");
// const handleResponse = require("../utils/response");
const User = require("../models/user");
const ServiceProvider = require("../models/serviceProvider");
const currentEnvironment = require('../config/environmentConfig');
const { TOKEN_INVALID, UNAUTHORIZED } = require("../constants/errorCodes");
// const { COMMON_ERRORS, INVALID_STATUS } = require("../constants/errorMessages");
// const { roles, writerStatus } = require("../constants/commonConstants");
// const { catchAsyncSocket } = require("../utils/errors/catchAsyncSocket");.
const JWT_SECRET = currentEnvironment.JWT_SECRET;

exports.authenticateSocket = async (socket, next) => {
  
  try {
    const token = socket.handshake.auth?.token;    
    //only validating the stage of stablish the connection   

    let userDecoded = jwt.verify(token, JWT_SECRET);

    let user = null;

    user = await User.findById(userDecoded?._id);

    if(!user){
        user = await ServiceProvider.findById(userDecoded?._id);
    }
    
    if(!user){
        throw new Error(TOKEN_INVALID.message, {cause: "logical"});
    }

    if(user.isDeleted){
        throw new Error(UNAUTHORIZED.message, {cause: "logical"});
    }
    
    if(!user._id && !user.roles){
        throw new Error(UNAUTHORIZED.message, {cause: "logical"});
    }
    
    next();
    
  } catch (error) {
    console.log('in authentication middleware');
    
    console.log(error);    
    next(new Error(UNAUTHORIZED.message, {cause: "logical"}));
  }
}
