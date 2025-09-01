const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { Banners } = require("../models/banners");

// Create upload directory if it doesn't exist
const uploadDir = "uploads/banners";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "banner-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|webp/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(
      new Error("Only image files (JPEG, JPG, PNG, WEBP) are allowed!"),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5, // Maximum 5 files
  },
  fileFilter: fileFilter,
});

// Upload banner images
router.post("/upload", upload.array("images", 5), (req, res) => {
  try {
    console.log("Upload request received");
    console.log("Files:", req.files);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: "No files uploaded",
      });
    }

    // Return array of file URLs
    const imageUrls = req.files.map((file) => {
      return `/uploads/banners/${file.filename}`;
    });

    console.log("Generated URLs:", imageUrls);

    res.json({
      success: true,
      data: imageUrls,
      images: imageUrls, // Add this for consistency
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Handle multer errors - MOVED BEFORE OTHER ROUTES
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        error: "File size too large. Maximum 10MB allowed.",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        error: "Too many files. Maximum 5 files allowed.",
      });
    }
  }

  if (err.message && err.message.includes("Only image files")) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  // Pass to next error handler
  next(err);
});

// Create banner
router.post("/create", async (req, res) => {
  try {
    console.log("Create banner request:", req.body);

    const { images, catId, catName, subCatId, subCatName } = req.body;

    // Validation
    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one image is required",
      });
    }

    if (!catId || !catName) {
      return res.status(400).json({
        success: false,
        error: "Category is required",
      });
    }

    // Validate ObjectId format for catId
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(catId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid category ID format",
      });
    }

    // Validate ObjectId format for subCatId if provided
    if (subCatId && !mongoose.Types.ObjectId.isValid(subCatId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid subcategory ID format",
      });
    }

    // Create new banner
    const banner = new Banners({
      images: images,
      catId: catId,
      catName: catName,
      subCatId: subCatId || null,
      subCatName: subCatName || "",
      dateCreated: new Date(),
    });

    const savedBanner = await banner.save();

    console.log("Banner saved successfully:", savedBanner);

    res.status(201).json({
      success: true,
      message: "Banner created successfully!",
      data: savedBanner,
    });
  } catch (error) {
    console.error("Create banner error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errorMessages = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        error: `Validation Error: ${errorMessages.join(", ")}`,
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: "Banner with this configuration already exists",
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || "Failed to create banner",
    });
  }
});

// Get all banners
router.get("/", async (req, res) => {
  try {
    console.log("Fetching all banners...");

    // Don't populate if the referenced collections might not exist
    const banners = await Banners.find().sort({ dateCreated: -1 }).lean(); // Use lean() for better performance

    console.log(`Found ${banners.length} banners`);

    res.json({
      success: true,
      data: banners || [],
    });
  } catch (error) {
    console.error("Get banners error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch banners",
    });
  }
});

// Get banner by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid banner ID format",
      });
    }

    const banner = await Banners.findById(id).lean();

    if (!banner) {
      return res.status(404).json({
        success: false,
        error: "Banner not found",
      });
    }

    res.json({
      success: true,
      data: banner,
    });
  } catch (error) {
    console.error("Get banner error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch banner",
    });
  }
});

// Update banner
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { images, catId, catName, subCatId, subCatName } = req.body;

    // Validate ObjectId format
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid banner ID format",
      });
    }

    if (catId && !mongoose.Types.ObjectId.isValid(catId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid category ID format",
      });
    }

    if (subCatId && !mongoose.Types.ObjectId.isValid(subCatId)) {
      return res.status(400).json({
        success: false,
        error: "Invalid subcategory ID format",
      });
    }

    const updatedBanner = await Banners.findByIdAndUpdate(
      id,
      {
        images: images,
        catId: catId,
        catName: catName,
        subCatId: subCatId || null,
        subCatName: subCatName || "",
      },
      { new: true, runValidators: true }
    );

    if (!updatedBanner) {
      return res.status(404).json({
        success: false,
        error: "Banner not found",
      });
    }

    res.json({
      success: true,
      message: "Banner updated successfully!",
      data: updatedBanner,
    });
  } catch (error) {
    console.error("Update banner error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const errorMessages = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        error: `Validation Error: ${errorMessages.join(", ")}`,
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || "Failed to update banner",
    });
  }
});

// Delete banner
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    const mongoose = require("mongoose");
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid banner ID format",
      });
    }

    const banner = await Banners.findByIdAndDelete(id);

    if (!banner) {
      return res.status(404).json({
        success: false,
        error: "Banner not found",
      });
    }

    // Delete associated image files
    if (banner.images && banner.images.length > 0) {
      banner.images.forEach((imageUrl) => {
        try {
          const filename = path.basename(imageUrl);
          const filePath = path.join(uploadDir, filename);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filename}`);
          }
        } catch (fileError) {
          console.error(`Error deleting file ${imageUrl}:`, fileError);
          // Don't fail the request if file deletion fails
        }
      });
    }

    res.json({
      success: true,
      message: "Banner deleted successfully!",
    });
  } catch (error) {
    console.error("Delete banner error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to delete banner",
    });
  }
});

module.exports = router;
