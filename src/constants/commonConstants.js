
exports.environmentTypes = {
  DEV: "DEV",
  PROD: "PROD",
};

exports.roles = {
  USER: "USER",
  ADMIN: "ADMIN",
};

exports.limitation = {
  FILES_LIMIT: 5,
  ID_LIMIT: 2,
};

exports.documentCounters = {
  THREAD: "Thread",
  OFFER: "Offer",
  ORDER: "Order",
  EVENT: "Event",
  PAYMENT: "Payment",
  REVISION: "Revision",
  COMPLAINT: "Complaint",
  BOOKING: "Booking",
  // REVIEW: "Review",
  USER: "User",
  PAYMENT_HISTORY: "PaymentHistory"
};

exports.documentCountersMountingCount = 1000;
// exports.emailSenderNickName = "KIdsPlan Team";

exports.emailSendingActionTypes = {
  RESET_PASSWORD: "reset-password",
  CONTACT_FORM: "contact-form",
};

exports.types = {
  OTP_TOKEN: "otp_token",
};

exports.minutesTakenToExpireTheSigninOTP = 5;
exports.minutesTakenToExpireTheForgotPasswordToken = 6;

exports.threadStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
};