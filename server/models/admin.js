const mongoose = require("mongoose");

const adminSchema = mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, unique: true, sparse: true }, // sparse allows multiple null values
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Required for admins
  images: [{ type: String, default: [] }],
  role: { type: String, default: "admin" }, // Admin role identifier
  permissions: [
    {
      type: String,
      enum: [
        "manage_users",
        "manage_products",
        "manage_orders",
        "manage_categories",
        "view_analytics",
      ],
      default: [
        "manage_users",
        "manage_products",
        "manage_orders",
        "manage_categories",
        "view_analytics",
      ],
    },
  ],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }, // Reference to admin who created this admin
});

adminSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

adminSchema.set("toJSON", {
  virtuals: true,
});

// Index for better query performance
adminSchema.index({ email: 1 });
adminSchema.index({ isActive: 1 });

exports.Admin = mongoose.model("Admin", adminSchema);
exports.adminSchema = adminSchema;
