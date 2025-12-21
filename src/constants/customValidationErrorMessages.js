exports.COMMON_ERRORS = {
  UNAUTHORIZED_ACCESS: "Unauthorized Access",
  INVALID_TOKEN: "Invalid Token; Unauthorized Access",
  SPECIFY_ROLES: "Specify Desired Roles to Validate",
  NO_PERMISSION: "Unauthorized Access. You Have Not Permission",
};

exports.NOT_FOUND = {
  SIGNED_USER: "Signed User Not Found",
};

const customErrorMessages = [
  "cannot be empty",
  "cannot be empty",
  "should be a string",
  "no account found",
  "does not exist",
  "should be an email address",
  "select a valid country",
  "state does not exist in the selected country",
  "must be an array",
  "invalid value in array",
  "should be a valid mobile phone",
  "date is in the wrong format",
  "should be a positive integer",
  "dhould be a positive integer between 1 and 50",
];

module.exports = { customErrorMessages };

exports.PASSWORD_VALIDATION =
  "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character";
