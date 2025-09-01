// routes/category.js

const express = require("express");
const mongoose = require("mongoose");
const slugify = require("slugify");
const { Category } = require("../models/category");
const { Subcategory } = require("../models/Subcategory"); // New import for the Subcategory model

// --- START: Add these imports and initializations ---
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });
// --- END: Add these imports and initializations ---

const router = express.Router();

let customIdCounter = 0;
let customIdMap = new Map();

// This function now handles getting categories and their subcategories from separate collections
const createCategories = async (
  categories,
  subcategories,
  parentId = null,
  parentCustomId = null
) => {
  const categoryList = [];

  const filteredCategories = parentId
    ? categories.filter(
        (cat) => cat.parentId?.toString() === parentId.toString()
      )
    : categories.filter((cat) => !cat.parentId);

  filteredCategories.sort((a, b) => a.name.localeCompare(b.name));

  let childIndex = 1;

  for (const cat of filteredCategories) {
    const mongoIdString = cat._id.toString();
    let currentCustomDisplayId;

    if (parentCustomId) {
      currentCustomDisplayId = `${parentCustomId}-${childIndex++}`;
    } else {
      if (!customIdMap.has(mongoIdString)) {
        customIdCounter++;
        currentCustomDisplayId = customIdCounter.toString();
      } else {
        currentCustomDisplayId = customIdMap.get(mongoIdString);
      }
    }

    customIdMap.set(mongoIdString, currentCustomDisplayId);

    const children = subcategories.filter(
      (subcat) => subcat.parentId?.toString() === mongoIdString
    );

    const childList = children.map((child, index) => ({
      _id: child._id.toString(),
      customId: `${currentCustomDisplayId}-${index + 1}`,
      name: child.name,
      slug: child.slug,
      images: child.images,
      color: child.color,
      children: [], // Subcategories don't have children in this model
    }));

    categoryList.push({
      _id: mongoIdString,
      customId: currentCustomDisplayId,
      name: cat.name,
      slug: cat.slug,
      images: cat.images,
      color: cat.color,
      children: childList,
    });
  }

  return categoryList;
};

// GET all categories with nested structure
router.get("/", async (req, res) => {
  try {
    customIdCounter = 0;
    customIdMap = new Map();

    const allCategories = await Category.find();
    const allSubcategories = await Subcategory.find();

    const nestedCategories = await createCategories(
      allCategories,
      allSubcategories
    );

    res.status(200).json({ categoryList: nestedCategories });
  } catch (err) {
    console.error("Failed to fetch categories:", err);
    res.status(500).json({
      success: false,
      error: "Internal server error fetching categories.",
    });
  }
});

// POST create new category or subcategory
router.post("/create", async (req, res) => {
  try {
    const { name, color, images, parentId } = req.body;

    if (!name || !name.trim()) {
      return res
        .status(400)
        .json({ success: false, error: "Category name is required." });
    }

    if (parentId) {
      // Logic for creating a subcategory
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res
          .status(400)
          .json({ success: false, error: "Invalid parent ID format." });
      }
      const parentExists = await Category.findById(parentId);
      if (!parentExists) {
        return res
          .status(400)
          .json({ success: false, error: "Parent category does not exist." });
      }

      let slug = slugify(name, { lower: true, strict: true });
      slug += `-${parentId}`;

      const existing = await Subcategory.findOne({ slug });
      if (existing) {
        return res.status(400).json({
          success: false,
          error: "Subcategory with this name already exists under this parent.",
        });
      }

      const newSubcategory = new Subcategory({
        name,
        slug,
        color: color || "",
        images: Array.isArray(images) ? images : [],
        parentId,
      });
      await newSubcategory.save();

      // Return updated category list
      const allCategories = await Category.find();
      const allSubcategories = await Subcategory.find();
      const nestedCategories = await createCategories(
        allCategories,
        allSubcategories
      );

      return res.status(201).json({
        success: true,
        message: "Subcategory created successfully!",
        categoryList: nestedCategories,
        newCategory: newSubcategory,
      });
    } else {
      // Logic for creating a top-level category
      let slug = slugify(name, { lower: true, strict: true });
      const existing = await Category.findOne({ slug });
      if (existing) {
        return res.status(400).json({
          success: false,
          error: "Category name already exists (or slug is taken).",
        });
      }

      const newCategory = new Category({
        name,
        slug,
        color: color || "",
        images: Array.isArray(images) ? images : [],
      });
      await newCategory.save();

      // Return updated category list
      const allCategories = await Category.find();
      const allSubcategories = await Subcategory.find();
      const nestedCategories = await createCategories(
        allCategories,
        allSubcategories
      );

      return res.status(201).json({
        success: true,
        message: "Category created successfully!",
        categoryList: nestedCategories,
        newCategory,
      });
    }
  } catch (err) {
    console.error("Failed to create category:", err);
    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ success: false, error: err.message, details: err.errors });
    }
    res.status(500).json({
      success: false,
      error: "Internal server error creating category.",
      details: err.message,
    });
  }
});

// =======================================================================
//                    API ROUTES (for Image Upload)
// =======================================================================
router.post("/upload", upload.array("images"), async (req, res) => {
  let imagesArr = [];
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, msg: "No files uploaded." });
    }

    for (let i = 0; i < req.files.length; i++) {
      const filePath = req.files[i].path;
      const result = await cloudinary.uploader.upload(filePath, {
        use_filename: true,
        unique_filename: false,
        overwrite: false,
        folder: "BoxManufacturing",
      });
      console.log("Cloudinary upload result:", result);
      imagesArr.push(result.secure_url);
      fs.unlinkSync(filePath);
    }
    res.status(200).json({ success: true, images: imagesArr });
  } catch (error) {
    console.error("Upload error:", error);
    res
      .status(500)
      .json({ success: false, msg: "Upload failed", error: error.message });
  }
});

// GET /api/category/get/count - Get count of top-level categories
router.get("/get/count", async (req, res) => {
  try {
    const count = await Category.countDocuments();
    res.status(200).json({ categoryCount: count });
  } catch (error) {
    console.error("Failed to get top-level category count:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error getting category count.",
    });
  }
});

// GET /api/category/subCat/get/count - Get count of subcategories
router.get("/subCat/get/count", async (req, res) => {
  try {
    const count = await Subcategory.countDocuments();
    res.status(200).json({ categoryCount: count });
  } catch (error) {
    console.error("Failed to get subcategory count:", error);
    res.status(500).json({
      success: false,
      error:
        error.message || "Internal server error getting subcategory count.",
    });
  }
});

// GET /api/category/:id - Get a single category by its MongoDB _id
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid ID format." });
    }

    const category = await Category.findById(req.params.id);
    if (!category) {
      const subcategory = await Subcategory.findById(req.params.id);
      if (!subcategory) {
        return res.status(404).json({ success: false, message: "Not found." });
      }
      return res.status(200).json(subcategory);
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("Error fetching single item:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error fetching single item.",
    });
  }
});

// PUT /api/category/:id - Update an existing category by its MongoDB _id
router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid ID format for update.",
      });
    }

    const { name, color, images, parentId } = req.body;

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Name is required for update.",
      });
    }

    // Check if the ID belongs to a top-level category or a subcategory
    let isSubcategory = false;
    let existingItem = await Category.findById(req.params.id);
    if (!existingItem) {
      existingItem = await Subcategory.findById(req.params.id);
      if (!existingItem) {
        return res
          .status(404)
          .json({ success: false, message: "Item not found for update." });
      }
      isSubcategory = true;
    }

    // Handle updates for both categories and subcategories
    if (isSubcategory) {
      // Subcategory update logic
      let updatedSlug = slugify(name, { lower: true, strict: true });
      updatedSlug = `${updatedSlug}-${existingItem.parentId}`;

      const existingWithSameSlug = await Subcategory.findOne({
        slug: updatedSlug,
        _id: { $ne: req.params.id },
      });
      if (existingWithSameSlug) {
        return res.status(400).json({
          success: false,
          error: "Another subcategory with this name already exists.",
        });
      }

      const updated = await Subcategory.findByIdAndUpdate(
        req.params.id,
        { name, slug: updatedSlug, color, images },
        { new: true, runValidators: true }
      );
      res.status(200).json({
        success: true,
        message: "Subcategory updated successfully!",
        category: updated,
      });
    } else {
      // Category update logic
      let updatedSlug = slugify(name, { lower: true, strict: true });

      const existingWithSameSlug = await Category.findOne({
        slug: updatedSlug,
        _id: { $ne: req.params.id },
      });
      if (existingWithSameSlug) {
        return res.status(400).json({
          success: false,
          error: "Another category with this name already exists.",
        });
      }

      const updated = await Category.findByIdAndUpdate(
        req.params.id,
        { name, slug: updatedSlug, color, images },
        { new: true, runValidators: true }
      );
      res.status(200).json({
        success: true,
        message: "Category updated successfully!",
        category: updated,
      });
    }
  } catch (error) {
    console.error("Error updating category:", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ success: false, error: error.message, details: error.errors });
    }
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error updating category.",
    });
  }
});

// DELETE /api/category/:id - Delete a category or subcategory
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid ID format for deletion.",
      });
    }

    const category = await Category.findById(req.params.id);
    if (category) {
      // It's a top-level category, check for subcategories before deleting
      const childrenCount = await Subcategory.countDocuments({
        parentId: req.params.id,
      });
      if (childrenCount > 0) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot delete a category with existing subcategories. Delete its subcategories first.",
          childrenCount,
        });
      }

      // Delete images and the category document
      await deleteImagesFromCloudinary(category.images);
      await Category.deleteOne({ _id: req.params.id });

      return res
        .status(200)
        .json({ success: true, message: "Category deleted successfully!" });
    }

    const subcategory = await Subcategory.findById(req.params.id);
    if (subcategory) {
      // It's a subcategory, safe to delete. No need to check for children.
      await deleteImagesFromCloudinary(subcategory.images);
      await Subcategory.deleteOne({ _id: req.params.id });

      return res
        .status(200)
        .json({ success: true, message: "Subcategory deleted successfully!" });
    }

    return res.status(404).json({
      success: false,
      message: "Category or subcategory not found.",
    });
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).json({
      message: "Deletion failed",
      error: err.message || "Internal server error deleting item.",
    });
  }
});
// Example of a new backend route in your category router file
// DELETE /api/category/delete-image?imgUrl=...
router.delete("/delete-image", async (req, res) => {
  try {
    const imgUrl = req.query.imgUrl;
    if (!imgUrl) {
      return res
        .status(400)
        .json({ success: false, message: "Image URL is missing." });
    }

    // Attempt to delete the image from Cloudinary
    const publicId = extractPublicIdFromUrl(imgUrl);
    await cloudinary.uploader.destroy(publicId);

    // After deleting the image from Cloudinary, remove its reference from the database.
    // We need to check both Category and Subcategory models.
    const categoryUpdate = await Category.updateOne(
      { images: imgUrl },
      { $pull: { images: imgUrl } }
    );

    const subcategoryUpdate = await Subcategory.updateOne(
      { images: imgUrl },
      { $pull: { images: imgUrl } }
    );

    // Check if the image reference was found and removed from either model
    if (
      categoryUpdate.modifiedCount === 0 &&
      subcategoryUpdate.modifiedCount === 0
    ) {
      return res.status(404).json({
        success: false,
        message: "Image not found in any category or subcategory.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Image deleted successfully from Cloudinary and database.",
    });
  } catch (err) {
    console.error("Error deleting image:", err);
    res
      .status(500)
      .json({ message: "Image deletion failed.", error: err.message });
  }
});

// Helper function to extract the public ID from the Cloudinary URL
const extractPublicIdFromUrl = (url) => {
  const parts = url.split("/");
  const folder = parts[parts.length - 2];
  const filenameWithExtension = parts[parts.length - 1];
  return `${folder}/${filenameWithExtension.split(".")[0]}`;
};
// Helper function to delete images from Cloudinary
const deleteImagesFromCloudinary = async (images) => {
  if (images && images.length > 0) {
    for (const img of images) {
      try {
        const parts = img.split("/");
        const filenameWithExtension = parts[parts.length - 1];
        const folder = parts[parts.length - 2];
        const publicId = `${folder}/${filenameWithExtension.split(".")[0]}`;
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudinaryErr) {
        console.warn(
          `Failed to delete Cloudinary image ${img}:`,
          cloudinaryErr.message
        );
      }
    }
  }
};

module.exports = router;
