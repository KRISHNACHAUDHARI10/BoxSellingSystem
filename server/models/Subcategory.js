// models/Subcategory.js
const mongoose = require("mongoose");

const subcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    images: [
      {
        type: String,
      },
    ],
    color: {
      type: String,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // This is the crucial part: it references the "Category" collection
      required: true, // A subcategory must have a parent category
    },
  },
  { timestamps: true }
);

subcategorySchema.virtual("id").get(function () {
  return this._id.toHexString();
});

subcategorySchema.set("toJSON", {
  virtuals: true,
});

exports.Subcategory = mongoose.model("Subcategory", subcategorySchema);
