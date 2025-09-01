// routes/homeBanner.js
const { HomeBanner } = require("../models/homeBanner");
const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Helper function to extract public ID from Cloudinary URL
function extractPublicId(url) {
  try {
    const parts = url.split("/");
    const uploadIndex = parts.findIndex((part) => part === "upload");
    if (uploadIndex === -1) return null;

    const publicIdParts = parts.slice(uploadIndex + 2);
    const filename = publicIdParts.join("/");
    const publicId =
      filename.substring(0, filename.lastIndexOf(".")) || filename;

    return publicId;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
}

// Get all banners
router.get("/", async (req, res) => {
  try {
    const banners = await HomeBanner.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: banners,
      count: banners.length,
    });
  } catch (err) {
    console.error("Get banners error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Get banner by ID
router.get("/:id", async (req, res) => {
  try {
    const banner = await HomeBanner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }
    res.status(200).json({
      success: true,
      data: banner,
    });
  } catch (err) {
    console.error("Get banner by ID error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Create new banner
router.post("/create", async (req, res) => {
  const { images } = req.body;

  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Images array is required and must not be empty",
    });
  }

  try {
    const newBanner = new HomeBanner({ images });
    const savedBanner = await newBanner.save();

    res.status(201).json({
      success: true,
      data: savedBanner,
      message: "Banner created successfully",
    });
  } catch (err) {
    console.error("Create banner error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Delete banner by ID (and all its images)
router.delete("/:id", async (req, res) => {
  try {
    const banner = await HomeBanner.findById(req.params.id);
    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    // Delete images from Cloudinary
    const deletePromises = banner.images.map(async (imgUrl) => {
      const publicId = extractPublicId(imgUrl);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (error) {
          console.warn(`Failed to delete image ${imgUrl}:`, error);
        }
      }
    });

    await Promise.allSettled(deletePromises);
    await HomeBanner.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Banner and associated images deleted successfully",
    });
  } catch (err) {
    console.error("Delete banner error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// Update banner images by ID
router.put("/:id", async (req, res) => {
  const { images } = req.body;

  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Images array is required and must not be empty",
    });
  }

  try {
    const updatedBanner = await HomeBanner.findByIdAndUpdate(
      req.params.id,
      { images },
      { new: true, runValidators: true }
    );

    if (!updatedBanner) {
      return res.status(404).json({
        success: false,
        message: "Banner not found",
      });
    }

    res.status(200).json({
      success: true,
      data: updatedBanner,
      message: "Banner updated successfully",
    });
  } catch (err) {
    console.error("Update banner error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

module.exports = router;
