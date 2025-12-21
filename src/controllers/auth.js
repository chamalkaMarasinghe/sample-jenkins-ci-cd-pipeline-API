const { default: mongoose, Mongoose } = require("mongoose");
const jwt = require("jsonwebtoken");
const { catchAsync } = require("../utils/errors/catchAsync");
const User = require("../models/user");
const handleResponse = require("../utils/response/response");
const sendMail = require("../utils/email/sendEmail");
const {
  roles,
  types,
  emailSendingActionTypes,
  minutesTakenToExpireTheSigninOTP,
  rolesForInquiry,
  documentCounters,
} = require("../constants/commonConstants");
// const { COMMON_ERRORS, NOT_FOUND, FAILURES, INVALID_STATUS, INVALID } = require("../constants/errorMessages");
// const passport = require("../config/passportConfig");
// const { transporter } = require("../config/nodeMailer");
// const sendMail = require("../utils/sendEmail");
// const { getCookieOption } = require("../config/cookie");
const { getNewID } = require("../utils/genCustomID/getNewID");
const currentEnvironment = require("../config/environmentConfig");
const {
  DuplicateRecordsError,
  FailureOccurredError,
  RecordNotFoundError,
  PasswordMismatchError,
  UnauthorizedError,
  TokenError,
  ActionNotAllowedError,
  BadRequestError,
} = require("../utils/errors/CustomErrors");
const ServiceProvider = require("../models/serviceProvider");
// const { getUserInSignInWithDistanceWishlist } = require("../queries/event");
const JWT_SECRET = currentEnvironment.JWT_SECRET;
const SIGNIN_OTP_VERIFICATION = currentEnvironment.SIGNIN_OTP_VERIFICATION;

// NOTE: user
exports.signupAsUser = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, phoneNumber, password } = req.body;

  const userRoles = [`${roles.USER}`];

  const existingUser = await User.findOne({
    $or: [
      { email: email?.toString()?.toLowerCase() },
      { phoneNumber: { $eq: phoneNumber } },
    ],
  });

  if (existingUser)
    return next(new DuplicateRecordsError("Email Or Phone Number"));

  const newId = await getNewID(documentCounters.USER);

  if (!newId) {
    return next(new FailureOccurredError("ID Generation"));
  }

  const user = new User({
    id: newId,
    firstName,
    lastName,
    phoneNumber: phoneNumber,
    roles: userRoles,
    email: email?.toString()?.toLowerCase(),
    password,
  });

  const newUser = await user.save();

  if (!newUser) return next(new FailureOccurredError("User Registeration"));

  const details = {
    _id: newUser._id,
    roles: newUser.roles,
  };

  const accessToken = jwt.sign(details, JWT_SECRET, {
    expiresIn: "1h",
  });

  const userData = {
    _id: newUser._id,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    phoneNumber: newUser?.phoneNumber,
    email: newUser?.email,
  };

  return handleResponse(res, 201, "Signed up Successfully", {
    token: accessToken,
    userData,
  });
});

exports.signin = catchAsync(async (req, res, next) => {

  const { email, password, longitude, latitude } = req.body;
  
  const user = await User.findOne({
    $or: [{ email: email?.toString()?.toLowerCase() }, { phoneNumber: email }],
  }).populate({
    path: "wishList",
    // No `select` means populate **all fields**
    populate: {
      path: "organizer",
      // Exclude the password field with `-password`
      select: "-password",
    },
  });
  
  if (!user || user?.isDeleted) {
    return next(new RecordNotFoundError("User"));
  }

  const match = await user.comparePassword(password);

  if (!match) {
    return next(new PasswordMismatchError());
  }

  if (SIGNIN_OTP_VERIFICATION === "true") {
    const otp = await user.createOtp();

    await sendMail(user.email, "Your Sign-in OTP", {
      topic: `Hi ${user?.firstName || ""} ${user?.lastName || ""}`,
      content: `Your One-Time Password (OTP) for signing in to kidsplan is: ${otp}. This code will expire in ${minutesTakenToExpireTheSigninOTP} minutes. Do not share this code with anyone.`,
    });

    //generate token for verify the otp has not stolen
    const details = {
      _id: user._id,
      type: types.OTP_TOKEN,
    };

    // jwt token will be expired in 15m hour
    const otpToken = jwt.sign(details, JWT_SECRET, {
      expiresIn: `${minutesTakenToExpireTheSigninOTP?.toString()}m`,
    });

    return handleResponse(res, 200, "OTP sent Successfully", {
      token: otpToken,
      OTP: true,
    });
  } else {
    const details = {
      _id: user._id,
      roles: user.roles,
    };

    const accessToken = jwt.sign(details, JWT_SECRET, {
      expiresIn: "1h",
    });

    userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user?.phoneNumber,
      email: user?.email,
      profilePicture: user?.profilePicture,
      wishList: user?.wishList || [],
    };

    const userX = await User.aggregate(getUserInSignInWithDistanceWishlist({
      email,
      userLongitude: longitude,
      userLatitude: latitude,
    }));

    userData.wishList = userData?.wishList?.map(it => {
      const temp = userX[0]?.wishList?.find(el => el?._id?.toString() === it?._id?.toString());
      return {...it._doc, distanceInKm: Math.floor(temp?.distanceInKm)};
    })    

    return handleResponse(res, 200, "Signed-in Successfully", {
      token: accessToken,
      OTP: false,
      userData,
    });
  }
});

// NOTE: for Servicepro
exports.signupAsServiceProvider = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  const userRoles = [`${roles.SERVICE_PRO}`];

  const existingUser = await ServiceProvider.findOne({
    $or: [{ email: email?.toString()?.toLowerCase() }],
  });

  if (existingUser)
    return next(new DuplicateRecordsError("Email Or Phone Number"));

  const newId = await getNewID(documentCounters.SERVICE_PRO);

  if (!newId) {
    return next(new FailureOccurredError("ID Generation"));
  }

  const user = new ServiceProvider({
    id: newId,
    firstName,
    lastName,
    roles: userRoles,
    email: email?.toString()?.toLowerCase(),
    password,
  });

  const newUser = await user.save();

  if (!newUser)
    return next(new FailureOccurredError("Service Provider Registeration"));

  const details = {
    _id: newUser._id,
    roles: newUser.roles,
  };

  const accessToken = jwt.sign(details, JWT_SECRET, {
    expiresIn: "1h",
  });

  const userData = {
    _id: newUser._id,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    phoneNumber: newUser?.phoneNumber,
    email: newUser?.email,
    isOnboardingCompleted:
      user.isOnboardingCompleted === "undefined" ||
      user.isOnboardingCompleted === ""
        ? false
        : user.isOnboardingCompleted,
    isOnboardingVerified:
      user.isOnboardingVerified === "undefined" ||
      user.isOnboardingVerified === ""
        ? false
        : user.isOnboardingVerified,
    isOnboardingRejected:
      user.isOnboardingRejected === "undefined" ||
      user.isOnboardingRejected === ""
        ? false
        : user.isOnboardingRejected,
    isStillProcessing:
      user.isStillProcessing === "undefined" || user.isStillProcessing === ""
        ? false
        : user.isStillProcessing,
    onboardingRejectionReason:
      user?.isOnboardingRejected === true ? user.onboardingRejectionReason : "",
  };

  return handleResponse(res, 201, "Service Provider Signed up Successfully", {
    token: accessToken,
    userData,
  });
});

exports.signinAsServiceProvider = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await ServiceProvider.findOne({
    $or: [{ email: email?.toString()?.toLowerCase() }, { phoneNumber: email }],
  });

  if (!user || user?.isDeleted || user?.roles?.includes(roles.ADMIN)) {
    return next(new RecordNotFoundError("User"));
  }

  const match = await user.comparePassword(password);

  if (!match) {
    return next(new PasswordMismatchError());
  }

  if (SIGNIN_OTP_VERIFICATION === "true") {
    const otp = await user.createOtp();

    await sendMail(user.email, "Your Sign-in OTP", {
      topic: `Hi ${user?.firstName || ""} ${user?.lastName || ""}`,
      content: `Your One-Time Password (OTP) for signing in to kidsplan is: ${otp}. This code will expire in ${minutesTakenToExpireTheSigninOTP} minutes. Do not share this code with anyone.`,
    });

    //generate token for verify the otp has not stolen
    const details = {
      _id: user._id,
      type: types.OTP_TOKEN,
    };

    // jwt token will be expired in 15m hour
    const otpToken = jwt.sign(details, JWT_SECRET, {
      expiresIn: `${minutesTakenToExpireTheSigninOTP?.toString()}m`,
    });

    return handleResponse(res, 200, "OTP sent Successfully", {
      token: otpToken,
      OTP: true,
    });
  } else {
    const details = {
      _id: user._id,
      roles: user.roles,
    };

    const accessToken = jwt.sign(details, JWT_SECRET, {
      expiresIn: "1h",
    });

    userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user?.phoneNumber,
      email: user?.email,
      profilePicture: user?.profilePicture,
      isOnboardingCompleted:
        user.isOnboardingCompleted === "undefined" ||
        user.isOnboardingCompleted === ""
          ? false
          : user.isOnboardingCompleted,
      isOnboardingVerified:
        user.isOnboardingVerified === "undefined" ||
        user.isOnboardingVerified === ""
          ? false
          : user.isOnboardingVerified,
      isOnboardingRejected:
        user.isOnboardingRejected === "undefined" ||
        user.isOnboardingRejected === ""
          ? false
          : user.isOnboardingRejected,
      isStillProcessing:
        user.isStillProcessing === "undefined" || user.isStillProcessing === ""
          ? false
          : user.isStillProcessing,
      onboardingRejectionReason:
        user?.isOnboardingRejected === true
          ? user.onboardingRejectionReason
          : "",
      personalInformation: user?.personalInformation,
      businessInformation: user?.businessInformation,
      payoutInformation: user?.payoutInformation,
      stripeAccountId: user?.stripeAccountId
    };

    return handleResponse(res, 200, "Service Provider Signed-in Successfully", {
      token: accessToken,
      OTP: false,
      userData,
    });
  }
});

// NOTE: for user
exports.forgotPasswordUser = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({
    $or: [{ email: email?.toString()?.toLowerCase() }, { phoneNumber: email }],
  });

  if (!user || user?.isDeleted) {
    return next(new RecordNotFoundError("User"));
  }

  const token = await user.getVerifyToken();

  if (!token || token === "") throw new FailureOccurredError("Reset Password");

  await sendMail(
    user.email,
    "Reset Your Password",
    {
      topic: `Hi ${user?.firstName || ""} ${user?.lastName || ""}`,
      content: `${currentEnvironment.CLIENT}/?isReset=${true}&id=${
        user._id
      }&token=${token}`,
    },
    emailSendingActionTypes.RESET_PASSWORD
  );

  return handleResponse(
    res,
    201,
    "Password Reset Link Sent To Your Email Successfully"
  );
});

exports.verifyUserForgot = catchAsync(async (req, res, next) => {
  const { id, token } = req.params;

  const user = await User.findById(id);

  if (!user || user?.isDeleted) {
    return next(new RecordNotFoundError("User"));
  }

  const verified = await user.verify(token);

  if (!(verified === true)) {
    return next(new FailureOccurredError("Token Verification"));
  }

  userData = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user?.phoneNumber,
    email: user.email,
    profilePicture: user?.profilePicture,
    jobTitle: user?.jobTitle,
    location: user?.location,
    taskerRequestedAndStillNotVerified:
      user?.taskerRequestedAndStillNotVerified,
    isSuspended: user?.isSuspended,
  };

  return handleResponse(res, 200, "Token verified", userData);
});

exports.changePasswordUser = catchAsync(async (req, res, next) => {
  const { id, token } = req.params;
  const { password } = req.body;

  const user = await User.findById(id);

  if (!user || user?.isDeleted) {
    return next(new RecordNotFoundError("User"));
  }

  const verified = await user.verify(token);

  if (!(verified === true)) {
    return next(new FailureOccurredError("Token Verification"));
  }

  user.password = password;
  /* clearToken function will update the User Object with updated password*/
  const updatedUser = await user.clearToken({});

  if (!updatedUser) {
    return new FailureOccurredError("Reset Password");
  }

  userData = {
    _id: updatedUser._id,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    phoneNumber: updatedUser?.phoneNumber,
    email: updatedUser.email,
    profilePicture: updatedUser?.profilePicture,
    jobTitle: updatedUser?.jobTitle,
    location: updatedUser?.location,
    taskerRequestedAndStillNotVerified:
      updatedUser?.taskerRequestedAndStillNotVerified,
    isSuspended: user?.isSuspended,
  };

  return handleResponse(res, 200, "Password updated successfully", userData);
});

// NOTE: for Servicepro
exports.forgotPasswordServicepro = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await ServiceProvider.findOne({
    $or: [{ email: email?.toString()?.toLowerCase() }],
  });

  if (!user || user?.isDeleted || !user?.roles?.includes(`${roles.SERVICE_PRO}`)) {
    return next(new RecordNotFoundError("User"));
  }

  const token = await user.getVerifyToken();

  if (!token || token === "") throw new FailureOccurredError("Reset Password");

  await sendMail(
    user.email,
    "Reset Your Password",
    {
      topic: `Hi ${user?.firstName || ""} ${user?.lastName || ""}`,
      content: `${currentEnvironment.SERVICE_PROVIDER}/reset-password?id=${user._id}&token=${token}`,
    },
    emailSendingActionTypes.RESET_PASSWORD
  );

  return handleResponse(
    res,
    201,
    "Sertvice Provider Password Reset Link Sent To Your Email Successfully"
  );
});

exports.verifyServiceproForgot = catchAsync(async (req, res, next) => {
  const { id, token } = req.params;

  const user = await ServiceProvider.findById(id);

  if (!user || user?.isDeleted) {
    return next(new RecordNotFoundError("User"));
  }

  const verified = await user.verify(token);

  if (!(verified === true)) {
    return next(new FailureOccurredError("Token Verification"));
  }

  userData = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user?.phoneNumber,
    email: user.email,
    profilePicture: user?.profilePicture,
    jobTitle: user?.jobTitle,
    location: user?.location,
    taskerRequestedAndStillNotVerified:
      user?.taskerRequestedAndStillNotVerified,
    isSuspended: user?.isSuspended,
  };

  return handleResponse(res, 200, "Service Provider Token verified", userData);
});

exports.changePasswordServicepro = catchAsync(async (req, res, next) => {
  const { id, token } = req.params;
  const { password } = req.body;

  const user = await ServiceProvider.findById(id);

  if (!user || user?.isDeleted) {
    return next(new RecordNotFoundError("User"));
  }

  const verified = await user.verify(token);

  if (!(verified === true)) {
    return next(new FailureOccurredError("Token Verification"));
  }

  user.password = password;
  /* clearToken function will update the User Object with updated password*/
  const updatedUser = await user.clearToken({});

  if (!updatedUser) {
    return new FailureOccurredError("Reset Password");
  }

  userData = {
    _id: updatedUser._id,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    phoneNumber: updatedUser?.phoneNumber,
    email: updatedUser.email,
    profilePicture: updatedUser?.profilePicture,
    jobTitle: updatedUser?.jobTitle,
    location: updatedUser?.location,
    taskerRequestedAndStillNotVerified:
      updatedUser?.taskerRequestedAndStillNotVerified,
    isSuspended: user?.isSuspended,
    isOnboardingCompleted:
      user.isOnboardingCompleted === "undefined"
        ? false
        : user.isOnboardingCompleted,
    isOnboardingVerified:
      user.isOnboardingVerified === "undefined"
        ? false
        : user.isOnboardingVerified,
    isOnboardingRejected:
      user.isOnboardingRejected === "undefined"
        ? false
        : user.isOnboardingRejected,
    isStillProcessing:
      user.isStillProcessing === "undefined" ? false : user.isStillProcessing,
    onboardingRejectionReason:
      user?.isOnboardingRejected === true ? user.onboardingRejectionReason : "",
  };

  return handleResponse(
    res,
    200,
    "Service Provider Password updated successfully",
    userData
  );
});

// NOTE: for admin
exports.signinAdmin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const admin = await ServiceProvider.findOne({
    email: email?.toString().toLowerCase(),
  });

  if (!admin || admin?.isDeleted) {
    return next(new RecordNotFoundError("Admin"));
  }

  const match = await admin.comparePassword(password);

  if (!match) {
    return next(new PasswordMismatchError());
  }

  if (!admin?.roles?.includes(roles.ADMIN)) {
    return next(new RecordNotFoundError("Admin"));
  }

  if (SIGNIN_OTP_VERIFICATION === "true") {
    const otp = await admin.createOtp();

    await sendMail(admin.email, "Sign-in OTP Code", {
      topic: `Hello ${admin?.firstName || ""} ${admin?.lastName || ""}`,
      content: `Use this OTP to verif your signin: ${otp}. Please concern that, this OTP is only valid for ${minutesTakenToExpireTheSigninOTP} minutes.`,
    });

    //generate token for verify the otp has not stolen
    const details = {
      _id: admin._id,
      type: types.OTP_TOKEN,
    };

    // jwt token will be expired in 15m hour
    const otpToken = jwt.sign(details, JWT_SECRET, {
      expiresIn: `${minutesTakenToExpireTheSigninOTP?.toString()}m`,
    });

    return handleResponse(res, 200, "OTP sent Successfully", {
      token: otpToken,
      OTP: true,
    });
  } else {
    const details = {
      _id: admin._id,
      roles: admin.roles,
    };

    const accessToken = jwt.sign(details, JWT_SECRET, {
      expiresIn: "1h",
    });

    adminData = {
      _id: admin._id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      phoneNumber: admin?.phoneNumber,
      email: admin?.email,
      profilePicture: admin?.profilePicture,
    };

    return handleResponse(res, 200, "Admin Signed-in in Successfully", {
      token: accessToken,
      OTP: false,
      adminData,
    });
  }
});

exports.verifyOtp = catchAsync(async (req, res, next) => {
  const { otp } = req.body;

  const bearerToken = req.header("Authorization");

  if (!bearerToken) {
    return next(new TokenError("Missing"));
  }

  const token = bearerToken?.toString()?.split(" ")[1];

  if (!token) {
    return next(new TokenError("Missing"));
  }

  const { _id, type } = jwt.verify(token, JWT_SECRET);

  if (type !== types.OTP_TOKEN) {
    return next(new TokenError("Invalid"));
  }

  if (!mongoose.isValidObjectId(_id)) {
    return next(new TokenError("Invalid"));
  }

  let user = await User.findById(_id);

  if (!user || user?.isDeleted) {
    return next(new RecordNotFoundError("User"));
  }

  const verified = user.verifyOtp(otp);
  // const verified = true;

  if (!verified) {
    return next(new FailureOccurredError("OTP Verification"));
  }

  user = await user.clearOTP();

  const details = {
    _id: user._id,
    roles: user.roles,
  };

  const accessToken = jwt.sign(details, JWT_SECRET, {
    expiresIn: "1h",
  });

  userData = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user?.phoneNumber,
    email: user.email,
    profilePicture: user?.profilePicture,
    jobTitle: user?.jobTitle,
    location: user?.location,
    taskerRequestedAndStillNotVerified:
      user?.taskerRequestedAndStillNotVerified,
    isSuspended: user?.isSuspended,
  };

  return handleResponse(res, 200, "Login successful", {
    token: accessToken,
    userData,
  });
});

exports.forgotPasswordAdmin = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await ServiceProvider.findOne({
    $or: [{ email: email?.toString()?.toLowerCase() }],
  });

  if (!user || user?.isDeleted || !user?.roles?.includes(`${roles.ADMIN}`)) {
    return next(new RecordNotFoundError("Admin"));
  }

  const token = await user.getVerifyToken();

  if (!token || token === "") throw new FailureOccurredError("Reset Password");

  await sendMail(
    user.email,
    "Reset Your Password",
    {
      topic: `Hi ${user?.firstName || ""} ${user?.lastName || ""}`,
      content: `${currentEnvironment.ADMIN}/reset-password?id=${user._id}&token=${token}`,
    },
    emailSendingActionTypes.RESET_PASSWORD
  );

  return handleResponse(
    res,
    201,
    "Admin Password Reset Link Sent To Your Email Successfully"
  );
});

exports.verifyAdminForgot = catchAsync(async (req, res, next) => {
  const { id, token } = req.params;

  const user = await ServiceProvider.findById(id);

  if (!user || user?.isDeleted) {
    return next(new RecordNotFoundError("User"));
  }

  const verified = await user.verify(token);

  if (!(verified === true)) {
    return next(new FailureOccurredError("Token Verification"));
  }

  userData = {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    phoneNumber: user?.phoneNumber,
    email: user.email,
    profilePicture: user?.profilePicture,
    jobTitle: user?.jobTitle,
    location: user?.location,
    taskerRequestedAndStillNotVerified:
      user?.taskerRequestedAndStillNotVerified,
    isSuspended: user?.isSuspended,
  };

  return handleResponse(res, 200, "Admin Token verified", userData);
});

exports.changePasswordAdmin = catchAsync(async (req, res, next) => {
  const { id, token } = req.params;
  const { password } = req.body;

  const user = await ServiceProvider.findById(id);

  if (!user || user?.isDeleted) {
    return next(new RecordNotFoundError("User"));
  }

  const verified = await user.verify(token);

  if (!(verified === true)) {
    return next(new FailureOccurredError("Token Verification"));
  }

  user.password = password;
  /* clearToken function will update the User Object with updated password*/
  const updatedUser = await user.clearToken({});

  if (!updatedUser) {
    return new FailureOccurredError("Reset Password");
  }

  userData = {
    _id: updatedUser._id,
    firstName: updatedUser.firstName,
    lastName: updatedUser.lastName,
    phoneNumber: updatedUser?.phoneNumber,
    email: updatedUser.email,
    profilePicture: updatedUser?.profilePicture,
    jobTitle: updatedUser?.jobTitle,
    location: updatedUser?.location,
    taskerRequestedAndStillNotVerified:
      updatedUser?.taskerRequestedAndStillNotVerified,
    isSuspended: user?.isSuspended,
    isOnboardingCompleted:
      user.isOnboardingCompleted === "undefined"
        ? false
        : user.isOnboardingCompleted,
    isOnboardingVerified:
      user.isOnboardingVerified === "undefined"
        ? false
        : user.isOnboardingVerified,
    isOnboardingRejected:
      user.isOnboardingRejected === "undefined"
        ? false
        : user.isOnboardingRejected,
    isStillProcessing:
      user.isStillProcessing === "undefined" ? false : user.isStillProcessing,
    onboardingRejectionReason:
      user?.isOnboardingRejected === true ? user.onboardingRejectionReason : "",
  };

  return handleResponse(
    res,
    200,
    "Admin Password updated successfully",
    userData
  );
});

// ---------- Password reset with OTP for mobile users ----------

// Send OTP for password reset
exports.sendOTPForReset = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new BadRequestError("Email is required"));
  }

  const user = await User.findOne({ email });
  if (!user || user?.isDeleted) {
    return next(new RecordNotFoundError("User not found"));
  }

  // Generate OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
  const expiresIn = Date.now() + 5 * 60 * 1000; // valid for 5 minutes (milliseconds)

  user.otp = otp;
  user.otpExpiredAt = expiresIn;
  await user.save();

  // Send OTP via email
  await sendMail(user.email, "Your OTP for Password Reset", {
    topic: `Hi ${user.firstName || ""} ${user.lastName || ""}`,
    content: `Your One-Time Password (OTP) for resetting your password is: ${otp}. This code will expire in 5 minutes. Do not share this code with anyone.`,
  });

  return handleResponse(res, 200, "OTP sent successfully", {
    resetOTPExpiry: Math.floor(expiresIn / 1000), // Convert to seconds
  });
});

// Verify OTP for password reset
exports.verifyOTPForReset = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new BadRequestError("Please provide your email and OTP"));
  }

  const user = await User.findOne({ email });

  if (!user || user?.isDeleted) {
    return next(new RecordNotFoundError("User not found"));
  }

  if (!user || user.otp != otp || user.otpExpiredAt < Date.now()) {
    return next(
      new BadRequestError("OTP is invalid or has expired, please try again")
    );
  }

  // clear OTP after verification
  user.otp = null;
  user.otpExpiredAt = null;
  user.otpVerified = true;
  await user.save();

  return handleResponse(res, 200, "OTP verified successfully");
});

// Reset password using OTP
exports.resetPasswordWithOTP = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new BadRequestError("Email and new password required"));
  }

  const user = await User.findOne({ email });

  if (!user || !user.otpVerified) {
    return next(new BadRequestError("OTP verification required"));
  }

  // Check if the user account is deleted
  if (user?.isDeleted) {
      return next(new ActionNotAllowedError("User account is deleted"));
  }

  user.password = password;
  user.otpVerified = false; // reset OTP verification flag
  await user.save();

  return handleResponse(res, 200, "Password reset successfully");
});
