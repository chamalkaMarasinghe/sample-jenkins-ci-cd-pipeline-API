const ErrorCodes = Object.freeze({
  DEFAULT_ERROR: {
    code: "500",
    message: "An Error Occurred",
    httpStatus: 500,
  },
  CUSTOM_INTERNAL_SERVER_ERROR: {
    code: "4000",
    message: "Internal Service Failure",
    httpStatus: 500,
  },
  FAILURE_OCCURED: {
    code: "5070",
    message: "Failure Occurred",
    httpStatus: 503,
  },
  RECORD_NOT_FOUND: {
    code: "5005",
    message: "Not Found",
    httpStatus: 404,
  },
  VALIDATION_FAILURE: {
    code: "5010",
    message: "Validation Failure. Invalid Arguments",
    httpStatus: 400,
  },
  PARAMETER_NOT_PROVIDED: {
    code: "5065",
    message: "Not Provided",
    httpStatus: 400,
  },
  INVALID_FORMAT: {
    code: "5015",
    message: "Invalid Format",
    httpStatus: 400,
  },
  DUPLICATE_ENTRIES: {
    code: "5020",
    message: "Duplicating Entries",
    httpStatus: 409,
  },
  BAD_REQUEST: {
    code: "5025",
    message: "Bad Request",
    httpStatus: 400,
  },
  SENDING_EMAIL: {
    code: "5075",
    message: "Error Occurred During Sending Email",
    httpStatus: 502,
  },
  PASSWORD_MISMATCH: {
    code: "5050",
    message: "Password Mismatch. Please Try again",
    httpStatus: 400,
  },
  TOKEN_INVALID: {
    code: "5080",
    message: "Invalid Token",
    httpStatus: 400,
  },
  OTP_INVALID: {
    code: "5085",
    message: "OTP",
    httpStatus: 400,
  },
  ACTION_NOT_ALLOWED: {
    code: "5090",
    message: "Action Not Allowed",
    httpStatus: 400,
  },
  PERMISSION_DENIED: {
    code: "5055",
    message: "Permission Denied",
    httpStatus: 403,
  },
  UNAUTHORIZED: {
    code: "5060",
    message: "Authentication Required",
    httpStatus: 401,
  },
  SUSPENDED: {
    code: "6010",
    message: "Suspended Service Provider",
    httpStatus: 403,
  },
  DELETION_ABANDONED: {
    code: "6015",
    message: "Deletion Abandoned",
    httpStatus: 400,
  },
  INVALID_ROLE: {
    code: "5095",
    message: "Invalid Role or Insufficient Permissions",
    httpStatus: 403,
  },
  INVALID_STATUS: {
    code: "5100",
    message: "Not in a Valid Status ",
    httpStatus: 400,
  },
});

module.exports = ErrorCodes;
