const mongoose = require("mongoose");

const bannerSchema = mongoose.Schema(
  {
    images: [
      {
        type: String,
        required: [true, "At least one image is required"],
        trim: true,
        validate: {
          validator: function (v) {
            return v && v.length > 0;
          },
          message: "Image URL cannot be empty",
        },
      },
    ],
    catId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category ID is required"],
      validate: {
        validator: function (v) {
          return mongoose.Types.ObjectId.isValid(v);
        },
        message: "Invalid category ID format",
      },
    },
    catName: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [100, "Category name cannot exceed 100 characters"],
    },
    subCatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: false,
      default: null,
      validate: {
        validator: function (v) {
          return v === null || mongoose.Types.ObjectId.isValid(v);
        },
        message: "Invalid subcategory ID format",
      },
    },
    subCatName: {
      type: String,
      required: false,
      default: "",
      trim: true,
      maxlength: [100, "Subcategory name cannot exceed 100 characters"],
    },
    dateCreated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // This adds createdAt and updatedAt automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for id
bannerSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// Index for better query performance
bannerSchema.index({ catId: 1, subCatId: 1 });
bannerSchema.index({ dateCreated: -1 });

// Pre-save middleware for validation
bannerSchema.pre("save", function (next) {
  // Ensure images array is not empty
  if (!this.images || this.images.length === 0) {
    return next(new Error("At least one image is required"));
  }

  // Validate that all image URLs are valid strings
  const invalidImages = this.images.filter(
    (img) => !img || typeof img !== "string" || img.trim() === ""
  );
  if (invalidImages.length > 0) {
    return next(new Error("All image URLs must be valid non-empty strings"));
  }

  next();
});

// Static method to find banners by category
bannerSchema.statics.findByCategory = function (catId, subCatId = null) {
  const query = { catId };
  if (subCatId) {
    query.subCatId = subCatId;
  }
  return this.find(query).sort({ dateCreated: -1 });
};

// Instance method to get formatted category display
bannerSchema.methods.getCategoryDisplay = function () {
  if (this.subCatName) {
    return `${this.catName} > ${this.subCatName}`;
  }
  return this.catName;
};

exports.Banners = mongoose.model("Banner", bannerSchema);
exports.bannerSchema = bannerSchema;
