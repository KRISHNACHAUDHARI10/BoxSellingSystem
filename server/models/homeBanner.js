// models/homeBanner.js
const mongoose = require("mongoose");

const homeBannerSchema = mongoose.Schema({
  images: [
    {
      type: String,
      required: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

homeBannerSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

homeBannerSchema.set("toJSON", {
  virtuals: true, // Fixed: was 'virtual: true'
});

exports.HomeBanner = mongoose.model("HomeBanner", homeBannerSchema);
exports.homeBannerSchema = homeBannerSchema;
