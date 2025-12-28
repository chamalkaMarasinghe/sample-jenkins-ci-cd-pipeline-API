const { catchAsync } = require("../utils/errors/catchAsync");
const handleResponse = require("../utils/response/response");
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
const currentEnvironment = require("../config/environmentConfig");
const cloudinaryConfig = require("../config/cloudinary")
console.log(cloudinaryConfig);


exports.signature = catchAsync(async (req, res, next) => {

    const timestamp = Math.round(new Date().getTime() / 1000);

    const signature = cloudinaryConfig.utils.api_sign_request(
        {
            timestamp,
            folder: "samples/assets",
        },
        process.env.CLOUDINARY_API_SECRET
    );

    return handleResponse(res, 200, "Signed Successfully", {
        timestamp,
        signature,
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY,
    });
});
