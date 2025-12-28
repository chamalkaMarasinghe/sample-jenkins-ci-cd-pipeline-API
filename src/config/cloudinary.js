const cloudinary = require("cloudinary").v2;
const currentEnvironment = require("./environmentConfig");

cloudinary.config({
    cloud_name: currentEnvironment.CLOUDINARY_CLOUD_NAME,
    api_key: currentEnvironment.CLOUDINARY_API_KEY,
    api_secret: currentEnvironment.CLOUDINARY_API_SECRET,
});

module.exports = cloudinary;
