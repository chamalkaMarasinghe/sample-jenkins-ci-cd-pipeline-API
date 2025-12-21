// const GHANA_PHONE_NUMBER_PATTERN = /^(?:\+233|0)[2356789]\d{8}$/;
// const GHANA_PHONE_NUMBER_PATTERN = /^\d{5,}$/;
const GHANA_PHONE_NUMBER_PATTERN = /^\+?[0-9\s\-().]{7,20}$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
const VALID_EMAIL_OR_GHANA_PHONE_NUMBER_PATTERN = /^(?:(?:\+233|0)[2356789]\d{8}|\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b)$/;
const IMAGE_URL_REGEX = /^https?:\/\/.*\.(jpeg|jpg|png)$/i;
const FIREBASE_STORAGE_REGEX = /^https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^/]+\/o\/[^?]+/;
const TIME_VALUE_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/

exports.GHANA_PHONE_NUMBER_PATTERN = GHANA_PHONE_NUMBER_PATTERN;
exports.PASSWORD_PATTERN = PASSWORD_PATTERN;
exports.VALID_EMAIL_OR_GHANA_PHONE_NUMBER_PATTERN = VALID_EMAIL_OR_GHANA_PHONE_NUMBER_PATTERN;
exports.IMAGE_URL_REGEX = IMAGE_URL_REGEX;
exports.FIREBASE_STORAGE_REGEX = FIREBASE_STORAGE_REGEX;
exports.TIME_VALUE_PATTERN = TIME_VALUE_PATTERN;

exports.isOnlyAlphebetic = (stringPhrase) => {

    if(!stringPhrase || stringPhrase?.trim()?.length < 1){
        return false;
    }

    const regex = /^[A-Za-z\s.]+$/;
    return regex.test(stringPhrase);
}

exports.isAlphaNumeric = (stringPhrase) => {
    if(!stringPhrase || stringPhrase?.trim()?.length < 1){
        return false;
    }

    const regex = /^[A-Za-z0-9\s.]+$/;
    return regex.test(stringPhrase);
}

exports.isValidMoneyAmount = (input) => {
    const moneyPattern = /^[0-9]+(\.[0-9]+)?$/;
    return moneyPattern.test(`${input}`);
}

exports.isOnlyDigits = (input) => {
    const digitPattern = /^[0-9]+(\.[0-9]+)?$/;
    return digitPattern.test(`${input}`);
}

exports.isValidPassword = (password) => {
    const passwordPattern = PASSWORD_PATTERN;
    return passwordPattern.test(`${password}`);
} 

exports.isValidTime = (time) => {
    const timePattern = TIME_VALUE_PATTERN;
    return timePattern.test(`${time}`);
} 

exports.isValidEmailOrPhone = (emailOrPhone) => {
    const emailOrPhonePattern = VALID_EMAIL_OR_GHANA_PHONE_NUMBER_PATTERN;
    return emailOrPhonePattern.test(`${emailOrPhone}`);
} 

exports.isValidOTPCode = (input) => {
    if(!input || input?.toString()?.trim()?.length !== 6){        
        return false;
    }
    const digitPattern = /^[0-9]+$/;
    return digitPattern.test(`${input}`);
}
