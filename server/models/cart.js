// Fixed Cart Model (cart.js)
const mongoose = require("mongoose");

const cartSchema = mongoose.Schema(
  {
    productTitle: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    subTotal: {
      type: Number,
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.Mixed, // Allow both String and Number
      required: true,
    },
    countInStock: {
      type: Number,
      required: true,
      default: 0,
    },
    userId: {
      type: mongoose.Schema.Types.Mixed, // Allow both String and Number
      required: true,
    },
  },
  {
    timestamps: true, // Add createdAt and updatedAt automatically
  }
);

cartSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

cartSchema.set("toJSON", {
  virtuals: true,
});

exports.Cart = mongoose.model("Cart", cartSchema);
exports.c;
