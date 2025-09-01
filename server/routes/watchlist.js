const express = require("express");
const router = express.Router();
const Watchlist = require("../models/watchlist");

// Add item to watchlist
router.post("/add", async (req, res) => {
  try {
    const {
      productTitle,
      images,
      rating,
      price,
      productId,
      userId,
      brand,
      oldPrice,
    } = req.body;

    console.log("Received watchlist data:", req.body);

    // Validate required fields
    if (!productTitle || !productId || !userId || !price) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: productTitle, productId, userId, and price are required",
      });
    }

    // Check if item already exists in watchlist
    const existingItem = await Watchlist.findOne({ userId, productId });

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: "Item already in watchlist!",
      });
    }

    const watchlistItem = new Watchlist({
      productTitle,
      images: images || [],
      rating: rating || 0,
      price,
      productId,
      userId,
      brand: brand || "",
      oldPrice: oldPrice || null,
    });

    await watchlistItem.save();
    console.log("Watchlist item saved successfully:", watchlistItem);

    res.status(201).json({
      success: true,
      message: "Added to watchlist successfully!",
      data: watchlistItem,
    });
  } catch (error) {
    console.error("Add to watchlist error:", error);

    // Handle validation errors
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        success: false,
        message: "Validation error: " + validationErrors.join(", "),
        errors: validationErrors,
      });
    }

    // Handle cast errors (like invalid ObjectId)
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: `Invalid ${error.path}: ${error.value}. Please provide a valid ${error.path}.`,
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to add to watchlist",
      error: error.message,
    });
  }
});

// Get all watchlist items for a user
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching watchlist for userId:", userId);

    // Validate userId format if using ObjectId
    if (!userId || userId.length !== 24) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const watchlistItems = await Watchlist.find({ userId }).sort({
      createdAt: -1,
    });

    console.log(
      `Found ${watchlistItems.length} watchlist items for user ${userId}`
    );

    res.status(200).json({
      success: true,
      data: watchlistItems,
      count: watchlistItems.length,
    });
  } catch (error) {
    console.error("Get watchlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch watchlist",
      error: error.message,
    });
  }
});

// Delete item by ID
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting watchlist item with ID:", id);

    // Validate ID format
    if (!id || id.length !== 24) {
      return res.status(400).json({
        success: false,
        message: "Invalid item ID format",
      });
    }

    const deletedItem = await Watchlist.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({
        success: false,
        message: "Item not found in watchlist",
      });
    }

    console.log("Watchlist item deleted successfully:", deletedItem);

    res.status(200).json({
      success: true,
      message: "Item removed from watchlist successfully!",
    });
  } catch (error) {
    console.error("Delete watchlist item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from watchlist",
      error: error.message,
    });
  }
});

// Delete all items for a user
router.delete("/clear/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Clearing watchlist for userId:", userId);

    // Validate userId format
    if (!userId || userId.length !== 24) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const result = await Watchlist.deleteMany({ userId });
    console.log(
      `Cleared ${result.deletedCount} items from watchlist for user ${userId}`
    );

    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} items from watchlist!`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Clear watchlist error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear watchlist",
      error: error.message,
    });
  }
});

// Get watchlist count for a user
router.get("/count/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || userId.length !== 24) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format",
      });
    }

    const count = await Watchlist.countDocuments({ userId });

    res.status(200).json({
      success: true,
      count: count,
    });
  } catch (error) {
    console.error("Get watchlist count error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get watchlist count",
      error: error.message,
    });
  }
});

module.exports = router;
