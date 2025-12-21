// const { FAILURES, COMMON_ERRORS } = require("../../constants/errorMessages");
const enviroment_configs = require("../../config/environmentConfig");
const OTP_HASH_SECRET = enviroment_configs.OTP_HASH_SECRET
const crypto = require("node:crypto");
const { DateTime } = require("luxon");
const { FailureOccurredError, TokenMismatchError, TokenError, OTPError } = require("../errors/CustomErrors");
// const AppError = require("../AppError");

exports.generateToken = ({tokenLength = 16, otp = false, duration = {minutes: 15}} = {} ) => {

    let value;

    if(otp){
        value = crypto.randomInt(100000,999999).toString();

    }else{
        value = crypto.randomBytes(tokenLength).toString('base64url')    
    }

    const hash = crypto.createHmac("sha256", OTP_HASH_SECRET).update(value).digest("hex");

    if(!value || !hash){
        throw new FailureOccurredError("OTP Generation"); 
    }

    expiredAt = DateTime.utc().plus(duration)

    return {token: value, hash, expiredAt};
}    

exports.verifyToken = ({hash, token, expiredAt, otp = false}) => {

    const hashedToken = crypto.createHmac("sha256", OTP_HASH_SECRET).update(token).digest("hex");


    if(!(hashedToken === hash)){
        if(otp){
            throw new OTPError("Mismatching");
        }else{
            throw new TokenError("Mismatching")
        }
    }
    
    if(DateTime.utc() > expiredAt){
        if(otp){
            throw new OTPError("Expired");
        }else{
            throw new TokenError("Expired")
        }
    }

    return true;    

}