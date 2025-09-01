const { ProductWeight } = require("../models/productWeight");
const express = require("express");
const router = express.Router();

// GET all product weights (General GET for the collection)
router.get("/", async (req, res) => {
  try {
    const productWeightList = await ProductWeight.find();
    if (!productWeightList || productWeightList.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No product weights found." });
    }
    return res.status(200).json(productWeightList);
  } catch (error) {
    console.error("Error fetching product weights:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal Server Error",
    });
  }
});

// This route is specifically for creating a new item
router.post("/create", async (req, res) => {
  try {
    console.log("Backend received data for new product weight:", req.body); // Added more specific log

    // Ensure req.body.productWeight exists and is not empty before creating
    if (
      !req.body.productWeight ||
      typeof req.body.productWeight !== "string" ||
      req.body.productWeight.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Product weight is required and must be a non-empty string.",
      });
    }

    let productWeight = new ProductWeight({
      productWeight: req.body.productWeight,
    });

    productWeight = await productWeight.save(); // This MUST execute successfully

    if (!productWeight) {
      return res.status(400).json({
        success: false,
        message: "Product weight could not be saved to the database.",
      });
    }

    return res.status(201).json(productWeight); // 201 Created for successful creation
  } catch (error) {
    console.error("Error during product weight creation:", error); // Specific error log
    if (error.name === "ValidationError") {
      // Catches errors from Mongoose schema (e.g., 'required: true' failing)
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({
      success: false,
      error: error.message || "Internal Server Error",
    });
  }
});

// GET a single product weight by ID (Dynamic route, comes after specific /create)
router.get("/:id", async (req, res) => {
  try {
    // This is the route that was previously getting "create" as an ID
    const item = await ProductWeight.findById(req.params.id);
    if (!item) {
      return res
        .status(404)
        .json({ message: "The item with the given ID was not found" });
    }
    return res.status(200).send(item);
  } catch (error) {
    // This specific error handling will catch the CastError if it somehow still happens here
    console.error("Error fetching single product weight by ID:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product weight ID format provided.",
      });
    }
    return res.status(500).json({
      success: false,
      error: error.message || "Internal Server Error",
    });
  }
});

// DELETE a product weight by ID (Dynamic route)
router.delete("/:id", async (req, res) => {
  try {
    const deleteItem = await ProductWeight.findByIdAndDelete(req.params.id);
    if (!deleteItem) {
      return res
        .status(404)
        .json({ message: "Item not found for deletion", success: false });
    }
    return res
      .status(200)
      .json({ success: true, message: "Item Deleted Successfully" });
  } catch (error) {
    console.error("Error deleting product weight:", error);
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product weight ID format for deletion.",
      });
    }
    return res.status(500).json({
      success: false,
      error: error.message || "Internal Server Error",
    });
  }
});

// UPDATE a product weight by ID (Dynamic route)
router.put("/:id", async (req, res) => {
  try {
    // Ensure req.body.productWeight exists and is not empty before updating
    if (
      !req.body.productWeight ||
      typeof req.body.productWeight !== "string" ||
      req.body.productWeight.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Product weight is required for update.",
      });
    }

    const item = await ProductWeight.findByIdAndUpdate(
      req.params.id,
      { productWeight: req.body.productWeight },
      { new: true, runValidators: true } // 'new: true' returns the updated document, 'runValidators: true' applies schema validation
    );
    if (!item) {
      return res
        .status(404)
        .json({ message: "Item not found for update", success: false });
    }
    return res.status(200).send(item);
  } catch (error) {
    console.error("Error updating product weight:", error);
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product weight ID format for update.",
      });
    }
    return res.status(500).json({
      success: false,
      error: error.message || "Internal Server Error",
    });
  }
});

module.exports = router;
