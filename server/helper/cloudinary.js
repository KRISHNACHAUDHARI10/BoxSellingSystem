const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // ✅ match .env key exactly
  api_key: process.env.CLOUDINARY_API_KEY, // ✅ match .env key exactly
  api_secret: process.env.CLOUDINARY_API_SECRET, // ✅ match .env key exactly
  secure: true,
});

module.exports = cloudinary;
