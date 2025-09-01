const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, unique: true, sparse: true }, // sparse allows multiple null values
  email: { type: String, required: true, unique: true },
  password: { type: String }, // Optional for users (Google auth users might not have password)
  images: [{ type: String, default: [] }],
  // Remove isAdmin field since we have separate Admin model
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ["male", "female", "other"] },
});

userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

userSchema.set("toJSON", {
  virtuals: true,
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ isActive: 1 });

exports.User = mongoose.model("User", userSchema);
exports.userSchema = userSchema;
