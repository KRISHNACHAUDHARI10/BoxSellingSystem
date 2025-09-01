// routes/Newsletter.js
const express = require("express");
const router = express.Router();
const Newsletter = require("../models/Newsletter"); // Make sure this model exists
const { body, validationResult } = require("express-validator");

// Validation middleware
const validateEmail = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email address"),
];

// POST route to subscribe to newsletter
router.post("/subscribe", validateEmail, async (req, res) => {
  try {
    console.log("Newsletter subscribe route hit with:", req.body);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
        errors: errors.array(),
      });
    }

    const { email } = req.body;

    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({ email });
    if (existingSubscriber) {
      return res.status(409).json({
        success: false,
        message: "Email is already subscribed to our newsletter",
      });
    }

    // Create new newsletter subscription
    const newSubscriber = new Newsletter({
      email,
      subscribedAt: new Date(),
      isActive: true,
    });

    await newSubscriber.save();

    // Optional: Send welcome email here
    // await sendWelcomeEmail(email);

    res.status(201).json({
      success: true,
      message: "Successfully subscribed to newsletter!",
      data: {
        email: newSubscriber.email,
        subscribedAt: newSubscriber.subscribedAt,
      },
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to subscribe. Please try again later.",
    });
  }
});

// GET route to fetch all subscribers (admin only)
router.get("/subscribers", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const subscribers = await Newsletter.find({ isActive: true })
      .select("email subscribedAt")
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Newsletter.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        subscribers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalSubscribers: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Fetch subscribers error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch subscribers",
    });
  }
});

// DELETE route to unsubscribe
router.delete(
  "/unsubscribe",
  [body("email").isEmail().normalizeEmail()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Invalid email address",
        });
      }

      const { email } = req.body;

      const result = await Newsletter.findOneAndUpdate(
        { email },
        { isActive: false, unsubscribedAt: new Date() },
        { new: true }
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Email not found in our subscribers list",
        });
      }

      res.json({
        success: true,
        message: "Successfully unsubscribed from newsletter",
      });
    } catch (error) {
      console.error("Unsubscribe error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to unsubscribe. Please try again later.",
      });
    }
  }
);

// Test route to verify the route is working
router.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Newsletter route is working!",
    timestamp: new Date().toISOString(),
  });
});
// Add this DELETE route by ID (paste this in your Newsletter.js file)
// ADD THIS TO YOUR routes/Newsletter.js FILE
// DELETE route by ID
router.delete("/subscriber/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Delete subscriber by ID:", id);

    const result = await Newsletter.findByIdAndUpdate(
      id,
      { isActive: false, unsubscribedAt: new Date() },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found",
      });
    }

    res.json({
      success: true,
      message: "Successfully unsubscribed from newsletter",
      data: result,
    });
  } catch (error) {
    console.error("Delete subscriber error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to unsubscribe. Please try again later.",
    });
  }
});
module.exports = router;
