const mongoose = require("mongoose");

const productWeightSchema = mongoose.Schema({
  productWeight: {
    type: String,
  
    required: true,
  },
});

// Virtual for 'id' to convert _id to a string when converting to JSON
productWeightSchema.virtual("id").get(function () {
  return this._id.toHexString();
});

// FIX: Corrected typo: `toJson` should be `toJSON` (case-sensitive)
// FIX: Corrected property name: `virtual` should be `virtuals`
productWeightSchema.set("toJSON", {
  virtuals: true,
});

// Export the Mongoose Model
exports.ProductWeight = mongoose.model("ProductWeight", productWeightSchema);


