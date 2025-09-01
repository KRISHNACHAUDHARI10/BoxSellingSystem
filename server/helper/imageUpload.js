const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;
const { ImageUpload } = require("../models/imagesUpload");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Configure Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only JPEG, JPG, PNG, and WEBP are allowed."
        ),
        false
      );
    }
  },
});

// POST /api/imageUpload/upload - General image upload
router.post("/upload", upload.array("images"), async (req, res) => {
  const uploadedImages = [];
  const tempFilePaths = [];

  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: "No files uploaded",
      });
    }

    for (const file of req.files) {
      tempFilePaths.push(file.path);

      const result = await cloudinary.uploader.upload(file.path, {
        use_filename: true,
        unique_filename: false,
        overwrite: false,
        folder: "general_images", // Different folder for general uploads
      });

      uploadedImages.push(result.secure_url);
    }

    // Clean up temporary files
    tempFilePaths.forEach((path) => {
      try {
        fs.unlinkSync(path);
      } catch (err) {
        console.error("Error deleting temp file:", err);
      }
    });

    // Save to database if using ImageUpload model
    try {
      const newImages = new ImageUpload({ images: uploadedImages });
      await newImages.save();
    } catch (dbError) {
      console.error("Database save error:", dbError);
      // Continue even if DB save fails, return the URLs
    }

    res.status(200).json({ images: uploadedImages });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);

    // Clean up temporary files in case of error
    tempFilePaths.forEach((path) => {
      try {
        if (fs.existsSync(path)) {
          fs.unlinkSync(path);
        }
      } catch (err) {
        console.error("Error cleaning up temp file:", err);
      }
    });

    res.status(500).json({
      error: "Image upload failed: " + error.message,
    });
  }
});

// DELETE /api/imageUpload/deleteImage
router.delete("/deleteImage", async (req, res) => {
  try {
    const imageUrl = req.query.img;

    if (!imageUrl) {
      return res.status(400).json({
        error: "Image URL is required",
      });
    }

    // Extract the public ID from the Cloudinary URL
    // Handle different folder structures
    const urlParts = imageUrl.split("/");
    const fileWithExtension = urlParts[urlParts.length - 1];
    const folderName = urlParts[urlParts.length - 2];
    const fileName = fileWithExtension.split(".")[0];

    // Construct the public ID with folder
    const publicIdWithFolder = `${folderName}/${fileName}`;

    // Delete the image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicIdWithFolder);

    if (result.result === "ok") {
      // Optional: Remove the URL from your database model
      try {
        await ImageUpload.updateOne(
          { images: imageUrl },
          { $pull: { images: imageUrl } }
        );
      } catch (dbError) {
        console.error("Database update error:", dbError);
        // Continue even if DB update fails
      }

      res.status(200).json({
        message: "Image deleted successfully!",
        success: true,
      });
    } else {
      console.error("Cloudinary deletion result:", result);
      res.status(400).json({
        error: "Failed to delete image from Cloudinary",
        result: result,
      });
    }
  } catch (error) {
    console.error("Cloudinary Deletion Error:", error);
    res.status(500).json({
      error: "Image deletion failed: " + error.message,
    });
  }
});

module.exports = router;
