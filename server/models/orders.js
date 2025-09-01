const mongoose = require("mongoose");

const orderSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // Fixed typo: "require" -> "required"
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
    amount: {
      // Fixed typo: "ammount" -> "amount"
      type: Number, // Changed to Number for better calculation
      required: true,
    },
    paymentId: {
      type: String,
      required: false, // Made optional for orders pending payment
      default: null,
    },
    email: {
      type: String,
      required: true,
      lowercase: true, // Normalize email to lowercase
    },
    userid: {
      type: String,
      required: true,
    },
    products: [
      {
        productName: {
          type: String,
          required: true,
        },
        productId: {
          type: String, // Added productId for reference
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
          min: 0,
        },
        image: {
          type: String,
        },
        total: {
          type: Number,
          required: true,
          min: 0,
        },
        selectedSize: {
          type: String, // Added for product variants
          default: null,
        },
      },
    ],
    // Enhanced shipping address information
    shippingAddress: {
      fullName: String,
      streetAddressLine1: String,
      streetAddressLine2: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      phoneNumber: String,
    },
    // Order breakdown for transparency
    orderDetails: {
      subtotal: {
        type: Number,
        default: 0,
      },
      shipping: {
        type: Number,
        default: 0,
      },
      tax: {
        type: Number,
        default: 0,
      },
      total: {
        type: Number,
        required: true,
      },
    },
    // Payment information
    razorpayOrderId: {
      type: String,
      default: null,
    },
    razorpaySignature: {
      type: String,
      default: null,
    },
    // Order status tracking
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    // Timestamps
    date: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Fixed typo in virtual method: "toHexSring" -> "toHexString"
orderSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

orderSchema.set("toJSON", {
  virtuals: true,
});

// Pre-save middleware to update timestamps
orderSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
orderSchema.index({ userid: 1, date: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ paymentStatus: 1 });

exports.Orders = mongoose.model("Orders", orderSchema);
