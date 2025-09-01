const { Subcategory } = require("../models/Subcategory.js");
const { Category } = require("../models/category.js");
const { Product } = require("../models/product.js");

const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

// ✅ Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ✅ Multer configuration for temporary file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
const upload = multer({ storage: storage });

// ✅ Image Upload Endpoint
router.post("/upload", upload.array("images"), async (req, res) => {
  let imagesArr = [];
  try {
    for (let file of req.files) {
      const filePath = file.path;
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "BoxManufacturing",
        use_filename: true,
        unique_filename: false,
        overwrite: false,
      });
      imagesArr.push(result.secure_url);
      fs.unlinkSync(filePath);
    }
    res.status(200).json(imagesArr);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, msg: "Upload failed", error });
  }
});

// ✅ Product Create Route
// Corrected Backend: /routes/products.js

router.post("/create", async (req, res) => {
  try {
    console.log("--- Product Create Request Received ---");
    console.log("Request body:", req.body);

    const {
      name,
      description,
      brand,
      price,
      oldPrice,
      catId,
      subCatId,
      countInStock,
      rating,
      isFeatured,
      discount,
      productWeight,
      location,
      images,
    } = req.body;

    // --- Start of New, Better Validation ---

    // 1. Validate Category and Subcategory first
    if (!catId || catId.length !== 24) {
      return res
        .status(400)
        .json({ success: false, error: "A valid category ID is required." });
    }
    const category = await Category.findById(catId);
    if (!category) {
      return res
        .status(400)
        .json({ success: false, error: "Category not found." });
    }

    let subCategory = null;
    if (subCatId) {
      if (subCatId.length !== 24) {
        return res.status(400).json({
          success: false,
          error: "The provided subcategory ID is invalid.",
        });
      }
      subCategory = await Subcategory.findById(subCatId);
      if (!subCategory) {
        return res
          .status(400)
          .json({ success: false, error: "Subcategory not found." });
      }
    }

    // 2. Validate Required Fields with Specific Error Messages
    if (!name?.trim())
      return res
        .status(400)
        .json({ success: false, error: "Product name is required." });
    if (!description?.trim())
      return res
        .status(400)
        .json({ success: false, error: "Product description is required." });
    if (!brand?.trim())
      return res
        .status(400)
        .json({ success: false, error: "Product brand is required." });
    if (!Array.isArray(productWeight) || productWeight.length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one product weight is required.",
      });
    }

    if (!location?.trim())
      return res
        .status(400)
        .json({ success: false, error: "Product location is required." });

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        error: "At least one product image is required.",
      });
    }

    // 3. Validate Numeric and Boolean Fields
    if (isNaN(price) || price <= 0)
      return res
        .status(400)
        .json({ success: false, error: "Price must be a positive number." });
    if (countInStock == null || isNaN(countInStock) || countInStock < 0)
      return res.status(400).json({
        success: false,
        error: "Stock count must be a non-negative number.",
      });
    if (typeof isFeatured !== "boolean")
      return res.status(400).json({
        success: false,
        error: "isFeatured must be either true or false.",
      });

    // 4. Validate Optional fields ONLY if they are provided
    if (oldPrice != null && oldPrice !== "" && isNaN(oldPrice)) {
      return res.status(400).json({
        success: false,
        error: "If provided, Old Price must be a number.",
      });
    }
    if (rating != null && (isNaN(rating) || rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        error: "Rating must be a number between 1 and 5.",
      });
    }
    if (
      discount != null &&
      (isNaN(discount) || discount < 0 || discount > 100)
    ) {
      return res.status(400).json({
        success: false,
        error: "Discount must be a number between 0 and 100.",
      });
    }

    // --- End of New Validation ---

    // Save Product
    const product = new Product({
      name: name.trim(),
      description: description.trim(),
      brand: brand.trim(),
      price: parseFloat(price),
      oldPrice:
        oldPrice != null && oldPrice !== "" ? parseFloat(oldPrice) : null,
      category: catId,
      subCategory: subCatId || null,
      catName: category.name,
      subCat: subCategory?.name || "",
      countInStock: parseInt(countInStock),
      rating: parseFloat(rating),
      isFeatured,
      discount: parseInt(discount),
      productWeight: Array.isArray(productWeight)
        ? productWeight
        : [productWeight.trim()],
      location: location.trim(),
      images,
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    console.error("Product creation error:", err);
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res
        .status(400)
        .json({ success: false, error: messages.join(", ") });
    }
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: `Invalid ID for ${err.path}: ${err.value}`,
      });
    }
    res
      .status(500)
      .json({ success: false, error: "An internal server error occurred." });
  }
});

// ... (your existing /upload and /deleteImage routes, make sure they are after the create route if this is one file)
// Make sure you also define your Product model correctly with these fields:
// For example:
// const productSchema = mongoose.Schema({
//   // ...
//   category: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Category', // Ensure this matches your Category model name
//     required: true,
//   },
//   subCategory: { // If subcategory is a separate ref
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Category', // Or whatever your subcategory model is called
//     required: false, // Or true, depending on your business logic
//   },
//   // ...
// });
// const Product = mongoose.model('Product', productSchema);

// --- Other product routes can be defined here ---
router.get("/", async (req, res) => {
  try {
    // Initialize an empty query object
    const query = {};

    // Build the query object based on the presence of query parameters
    if (req.query.catId) query.category = req.query.catId;
    if (req.query.subCatId) query.subCatId = req.query.subCatId;
    if (req.query.location && req.query.location !== "All")
      query.location = req.query.location;
    if (req.query.rating) query.rating = req.query.rating;
    if (req.query.isFeatured) query.isFeatured = req.query.isFeatured;

    let productList;
    let totalPages;

    if (req.query.page && req.query.perPage) {
      const page = parseInt(req.query.page) || 1;
      const perPage = parseInt(req.query.perPage);
      const totalPosts = await Product.countDocuments(query);
      totalPages = Math.ceil(totalPosts / perPage);

      if (page > totalPages && totalPosts > 0) {
        return res.status(404).json({ message: "Page not found" });
      }

      productList = await Product.find(query)
        .populate("category")
        .skip((page - 1) * perPage)
        .limit(perPage)
        .exec();
    } else if (req.query.minPrice || req.query.maxPrice) {
      // Handle price range filtering
      const priceQuery = {};
      if (req.query.minPrice) priceQuery.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) priceQuery.$lte = parseFloat(req.query.maxPrice);

      query.price = priceQuery;
      productList = await Product.find(query).populate("category");
    } else {
      // Default case: find all products matching the query
      productList = await Product.find(query).populate("category");
    }

    if (!productList) {
      return res.status(500).json({ success: false });
    }

    res.status(200).json({
      products: productList,
      totalPages: totalPages,
      page: req.query.page ? parseInt(req.query.page) : 1,
    });
  } catch (err) {
    console.error("Error retrieving products:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve products." });
  }
});

router.get("/get/count", async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    if (!productCount) {
      return res.status(500).json({ success: false });
    }
    return res.send({
      productCount: productCount,
    });
  } catch (err) {
    console.error("Error getting product count:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to get product count." });
  }
});

router.get("/featured", async (req, res) => {
  try {
    let productList = "";
    const query = { isFeatured: true };
    if (req.query.location && req.query.location !== "All") {
      query.location = req.query.location;
    }
    productList = await Product.find(query);
    if (!productList) {
      return res.status(500).json({ success: false });
    }
    return res.status(200).json(productList);
  } catch (err) {
    console.error("Error getting featured products:", err);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve featured products.",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category");
    if (!product) {
      return res
        .status(404)
        .json({ message: "The product with the given ID was not found" });
    }
    return res.status(200).send(product);
  } catch (err) {
    console.error("Error getting product by ID:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to retrieve product." });
  }
});

router.delete("/deleteImage", async (req, res) => {
  try {
    const imgUrl = req.query.img;
    const urlArr = imgUrl.split("/");
    const image = urlArr[urlArr.length - 1];
    const imageName = image.split(".")[0];

    const response = await cloudinary.uploader.destroy(imageName);
    if (response) {
      res.status(200).send(response);
    }
  } catch (err) {
    console.error("Error deleting image:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete image." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found", success: false });
    }

    const images = product.images;
    for (const img of images) {
      const imgUrl = img;
      const urlArr = imgUrl.split("/");
      const image = urlArr[urlArr.length - 1];
      const imageName = image.split(".")[0];
      if (imageName) {
        await cloudinary.uploader.destroy(imageName);
      }
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Product Deleted",
    });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete product.",
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description,
        images: req.body.images,
        brand: req.body.brand,
        price: req.body.price,
        oldPrice: req.body.oldPrice,
        subCatId: req.body.subCatId,
        catId: req.body.catId,
        catName: req.body.catName,
        subCat: req.body.subCat,
        category: req.body.category,
        countInStock: req.body.countInStock,
        rating: req.body.rating,
        isFeatured: req.body.isFeatured,
        discount: req.body.discount,
        productWeight: req.body.productWeight,
        location: req.body.location,
      },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({
        message: "The product cannot be updated",
        status: false,
      });
    }
    res.status(200).json({
      message: "The product is updated",
      status: true,
      product: product,
    });
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update product.",
    });
  }
});

module.exports = router;
