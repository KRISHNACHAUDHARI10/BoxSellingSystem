const mongoose = require("mongoose");

const imagesUploadSchema = mongoose.Schema({
  images: [
    {
      type: String,
      required: true,
    },
  ],
});
imagesUploadSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

imagesUploadSchema.set("toJSON", {
  virtual: true, // <-- Should be 'virtuals: true' as pointed out in the full code, but not the cause of THIS error
});
exports.ImageUpload = mongoose.model("ImageUpload", imagesUploadSchema); // <--- EXPORT NAME: ImageUpload (singular)
exports.imagesUploadSchema = imagesUploadSchema;
