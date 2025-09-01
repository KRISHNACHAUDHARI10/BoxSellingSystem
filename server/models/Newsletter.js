// models/Newsletter.js
const mongoose = require("mongoose");

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "Please enter a valid email address",
      },
    },
    subscribedAt: {
      type: Date,
      default: Date.now,
    },
    unsubscribedAt: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    source: {
      type: String,
      default: "website", // Could be 'website', 'mobile-app', 'social-media', etc.
    },
    preferences: {
      frequency: {
        type: String,
        enum: ["daily", "weekly", "monthly"],
        default: "weekly",
      },
      categories: [
        {
          type: String,
          enum: ["general", "offers", "new-products", "updates"],
        },
      ],
    },
  },
  {
    timestamps: true,
    collection: "newsletter_subscribers",
  }
);

// Index for better query performance
newsletterSchema.index({ email: 1 });
newsletterSchema.index({ isActive: 1, subscribedAt: -1 });

// Instance method to check if subscription is active
newsletterSchema.methods.isActiveSubscriber = function () {
  return this.isActive && !this.unsubscribedAt;
};

// Static method to find active subscribers
newsletterSchema.statics.findActiveSubscribers = function () {
  return this.find({ isActive: true, unsubscribedAt: null });
};

// Pre-save middleware
newsletterSchema.pre("save", function (next) {
  if (this.isModified("email")) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

const Newsletter = mongoose.model("Newsletter", newsletterSchema);

module.exports = Newsletter;
