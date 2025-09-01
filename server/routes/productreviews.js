const { ProductReviews } = require("../models/productReviews");
const express = require("express");
const router = express.Router();

// Get reviews - existing route
router.get("/", async (req, res) => {
  try {
    let reviews = [];

    if (
      req.query.productId !== undefined &&
      req.query.productId !== null &&
      req.query.productId !== ""
    ) {
      reviews = await ProductReviews.find({ productId: req.query.productId });
    } else {
      reviews = await ProductReviews.find();
    }

    if (!reviews) {
      return res.status(500).json({ success: false });
    }

    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get reviews count - existing route
router.get("/get/count", async (req, res) => {
  try {
    const productReviews = await ProductReviews.countDocuments();

    if (!productReviews) {
      return res.status(500).json({ success: false });
    }

    res.send({
      productReviews: productReviews,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get single review - existing route
router.get("/:id", async (req, res) => {
  try {
    const review = await ProductReviews.findById(req.params.id);

    if (!review) {
      return res
        .status(404)
        .json({ message: "The review with the given ID was not found" });
    }

    return res.status(200).send(review);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Add review - existing route
router.post("/add", async (req, res) => {
  try {
    // Check if user already has a review for this product
    const existingReview = await ProductReviews.findOne({
      customerId: req.body.customerId,
      productId: req.body.productId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message:
          "You have already reviewed this product. You can edit your existing review.",
      });
    }

    let review = new ProductReviews({
      customerId: req.body.customerId,
      customerName: req.body.customerName,
      review: req.body.review,
      customerRating: req.body.customerRating,
      productId: req.body.productId,
    });

    review = await review.save();

    return res.status(201).json(review);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Edit/Update review
router.put("/edit/:id", async (req, res) => {
  try {
    const review = await ProductReviews.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if the user owns this review
    if (review.customerId !== req.body.customerId) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own reviews",
      });
    }

    const updatedReview = await ProductReviews.findByIdAndUpdate(
      req.params.id,
      {
        review: req.body.review,
        customerRating: req.body.customerRating,
        dateCreated: new Date(), // Update the timestamp
      },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review: updatedReview,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Delete review
router.delete("/delete/:id", async (req, res) => {
  try {
    const review = await ProductReviews.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if the user owns this review
    // You can get customerId from req.body or from authentication middleware
    const customerId = req.body.customerId || req.query.customerId;

    if (review.customerId !== customerId) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own reviews",
      });
    }

    await ProductReviews.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Get reviews by customer (to show user their own reviews)
router.get("/customer/:customerId", async (req, res) => {
  try {
    const reviews = await ProductReviews.find({
      customerId: req.params.customerId,
    });

    return res.status(200).json(reviews);
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
