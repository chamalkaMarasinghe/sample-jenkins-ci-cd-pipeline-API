const ErrorCodes = require("../../constants/errorCodes");
const AppError = require("./AppError");

class CustomInternalServerError extends AppError {
  constructor(message = ErrorCodes.CUSTOM_INTERNAL_SERVER_ERROR.message) {
    super(
      message,
      ErrorCodes.CUSTOM_INTERNAL_SERVER_ERROR.code,
      ErrorCodes.CUSTOM_INTERNAL_SERVER_ERROR.httpStatus
    );
  }
}

class CustomError extends AppError {
  constructor(message = ErrorCodes.FAILURE_OCCURED.message) {
    super(
      message,
      ErrorCodes.FAILURE_OCCURED.code,
      ErrorCodes.FAILURE_OCCURED.httpStatus
    );
  }
}

class RecordNotFoundError extends AppError {
  constructor(message = `Record ${ErrorCodes.RECORD_NOT_FOUND.message}`) {
    super(
      `${message} ${ErrorCodes.RECORD_NOT_FOUND.message}`,
      ErrorCodes.RECORD_NOT_FOUND.code,
      ErrorCodes.RECORD_NOT_FOUND.httpStatus
    );
  }
}

class ValidationFailureError extends AppError {
  constructor(message = ErrorCodes.VALIDATION_FAILURE.message) {
    super(
      message,
      ErrorCodes.VALIDATION_FAILURE.code,
      ErrorCodes.VALIDATION_FAILURE.httpStatus
    );
  }
}

class ParameterNotProvidedError extends AppError {
  constructor(
    message = `Some Information Are ${ErrorCodes.PARAMETER_NOT_PROVIDED.message}`
  ) {
    super(
      `${message} ${ErrorCodes.PARAMETER_NOT_PROVIDED.message}`,
      ErrorCodes.PARAMETER_NOT_PROVIDED.code,
      ErrorCodes.PARAMETER_NOT_PROVIDED.httpStatus
    );
  }
}

class InvalidFormatError extends AppError {
  constructor(
    message = `Some Information Are In ${ErrorCodes.INVALID_FORMAT.message}`
  ) {
    super(
      `${ErrorCodes.INVALID_FORMAT.message} ${message}`,
      ErrorCodes.INVALID_FORMAT.code,
      ErrorCodes.INVALID_FORMAT.httpStatus
    );
  }
}

class DuplicateRecordsError extends AppError {
  constructor(message = `Some Information`) {
    super(
      `${ErrorCodes.DUPLICATE_ENTRIES.message} Of ${message}`,
      ErrorCodes.DUPLICATE_ENTRIES.code,
      ErrorCodes.DUPLICATE_ENTRIES.httpStatus
    );
  }
}

class FailureOccurredError extends AppError {
  constructor(message = `${ErrorCodes.FAILURE_OCCURED.message} Unexpectedly`) {
    super(
      `${ErrorCodes.FAILURE_OCCURED.message} During ${message}`,
      ErrorCodes.FAILURE_OCCURED.code,
      ErrorCodes.FAILURE_OCCURED.httpStatus
    );
  }
}

class BadRequestError extends AppError {
  constructor(message = ErrorCodes.BAD_REQUEST.message) {
    super(
      message,
      ErrorCodes.BAD_REQUEST.code,
      ErrorCodes.BAD_REQUEST.httpStatus
    );
  }
}

class EmailSendingError extends AppError {
  constructor(message = ErrorCodes.SENDING_EMAIL.message) {
    super(
      message,
      ErrorCodes.SENDING_EMAIL.code,
      ErrorCodes.SENDING_EMAIL.httpStatus
    );
  }
}

class TokenError extends AppError {
  constructor(message = `${ErrorCodes.TOKEN_INVALID.message} Error`) {
    super(
      `${message} ${ErrorCodes.TOKEN_INVALID.message}`,
      ErrorCodes.TOKEN_INVALID.code,
      ErrorCodes.TOKEN_INVALID.httpStatus
    );
  }
}

class OTPError extends AppError {
  constructor(message = `${ErrorCodes.OTP_INVALID.message} Error`) {
    super(
      `${message} ${ErrorCodes.OTP_INVALID.message}`,
      ErrorCodes.OTP_INVALID.code,
      ErrorCodes.OTP_INVALID.httpStatus
    );
  }
}

class PasswordMismatchError extends AppError {
  constructor(message = ErrorCodes.PASSWORD_MISMATCH.message) {
    super(
      message,
      ErrorCodes.PASSWORD_MISMATCH.code,
      ErrorCodes.PASSWORD_MISMATCH.httpStatus
    );
  }
}

class ActionNotAllowedError extends AppError {
  constructor(message = ErrorCodes.ACTION_NOT_ALLOWED.message) {
    super(
      message,
      ErrorCodes.ACTION_NOT_ALLOWED.code,
      ErrorCodes.ACTION_NOT_ALLOWED.httpStatus
    );
  }
}

class PermissionDeniedError extends AppError {
  constructor(message = ErrorCodes.PERMISSION_DENIED.message) {
    super(
      message,
      ErrorCodes.PERMISSION_DENIED.code,
      ErrorCodes.PERMISSION_DENIED.httpStatus
    );
  }
}

class UnauthorizedError extends AppError {
  constructor(message = ErrorCodes.UNAUTHORIZED.message) {
    super(
      message,
      ErrorCodes.UNAUTHORIZED.code,
      ErrorCodes.UNAUTHORIZED.httpStatus
    );
  }
}

class SuspendedTaskerError extends AppError {
  constructor(message = ErrorCodes.SUSPENDED.message) {
    super(
      message,
      ErrorCodes.SUSPENDED.code,
      ErrorCodes.SUSPENDED.httpStatus
    );
  }
}

class DeletionAbandoned extends AppError {
  constructor(message = '') {
    super(
      `${ErrorCodes.DELETION_ABANDONED.message} ${message?.length > 0 ? `Due to ${message}` : ``}`?.trim(),
      ErrorCodes.DELETION_ABANDONED.code,
      ErrorCodes.DELETION_ABANDONED.httpStatus
    );
  }
}

class InvalidRoleError extends AppError {
  constructor(message = ErrorCodes.INVALID_ROLE.message) {
    super(
      message,
      ErrorCodes.INVALID_ROLE.code,
      ErrorCodes.INVALID_ROLE.httpStatus
    );
  }
}

class InvalidStatusError extends AppError {
  constructor(message = ErrorCodes.INVALID_STATUS.message) {
    super(
      message,
      ErrorCodes.INVALID_STATUS.code,
      ErrorCodes.INVALID_STATUS.httpStatus
    );
  }
}

module.exports = {
  CustomInternalServerError,
  CustomError,
  RecordNotFoundError,
  ValidationFailureError,
  ParameterNotProvidedError,
  InvalidFormatError,
  DuplicateRecordsError,
  FailureOccurredError,
  BadRequestError,
  EmailSendingError,
  TokenError,
  OTPError,
  PasswordMismatchError,
  ActionNotAllowedError,
  PermissionDeniedError,
  UnauthorizedError,
  SuspendedTaskerError,
  DeletionAbandoned,
  InvalidRoleError,
  InvalidStatusError,
};
