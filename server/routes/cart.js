// Fixed Cart Routes (cart.js routes)
const { Cart } = require("../models/cart");
const express = require("express");
const router = express.Router();

// Get all cart items with proper filtering
router.get("/", async (req, res) => {
  try {
    console.log("GET /api/cart - Query params:", req.query);

    // Build query object
    let query = {};
    if (req.query.userId) {
      query.userId = req.query.userId;
    }

    const cartList = await Cart.find(query);
    console.log(`Found ${cartList.length} cart items for query:`, query);

    return res.status(200).json({
      success: true,
      data: cartList,
      count: cartList.length,
    });
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({
      success: false,
      error: error.message,
      msg: "Failed to fetch cart items",
    });
  }
});

// Add item to cart
router.post("/add", async (req, res) => {
  try {
    console.log("POST /api/cart/add - Request body:", req.body);

    // Validate required fields
    const requiredFields = ["productId", "userId", "price", "quantity"];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          success: false,
          msg: `${field} is required`,
        });
      }
    }

    // Check if item already exists in cart with same size/variant
    const existingCartItem = await Cart.findOne({
      productId: req.body.productId,
      userId: req.body.userId,
      selectedSize: req.body.selectedSize || null,
    });

    if (existingCartItem) {
      // Update quantity if item already exists
      const newQuantity =
        existingCartItem.quantity + parseInt(req.body.quantity);
      existingCartItem.quantity = newQuantity;
      existingCartItem.subTotal =
        parseFloat(existingCartItem.price) * newQuantity;

      const updatedCart = await existingCartItem.save();
      console.log("Updated existing cart item:", updatedCart);

      return res.status(200).json({
        success: true,
        msg: "Cart updated successfully",
        data: updatedCart,
        isUpdate: true,
      });
    } else {
      // Create new cart item
      const cartData = {
        productTitle: req.body.productTitle,
        image: req.body.image,
        rating: parseFloat(req.body.rating) || 0,
        price: parseFloat(req.body.price),
        quantity: parseInt(req.body.quantity),
        subTotal: parseFloat(req.body.price) * parseInt(req.body.quantity),
        productId: req.body.productId,
        userId: req.body.userId,
        countInStock: parseInt(req.body.countInStock) || 999,
        selectedSize: req.body.selectedSize || null,
      };

      let newCartItem = new Cart(cartData);
      const savedCart = await newCartItem.save();
      console.log("Created new cart item:", savedCart);

      return res.status(201).json({
        success: true,
        msg: "Item added to cart successfully",
        data: savedCart,
        isUpdate: false,
      });
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({
      success: false,
      status: false,
      msg: "Failed to add item to cart",
      error: error.message,
    });
  }
});

// Update cart item (PUT /:id)
router.put("/:id", async (req, res) => {
  try {
    console.log(`PUT /api/cart/${req.params.id} - Request body:`, req.body);

    const cartItem = await Cart.findById(req.params.id);

    if (!cartItem) {
      console.log(`Cart item not found with ID: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        msg: "Cart item not found",
      });
    }

    // Validate quantity
    const newQuantity = parseInt(req.body.quantity);
    if (newQuantity <= 0) {
      return res.status(400).json({
        success: false,
        msg: "Quantity must be greater than 0",
      });
    }

    // Update fields
    cartItem.productTitle = req.body.productTitle || cartItem.productTitle;
    cartItem.image = req.body.image || cartItem.image;
    cartItem.rating =
      req.body.rating !== undefined
        ? parseFloat(req.body.rating)
        : cartItem.rating;
    cartItem.price =
      req.body.price !== undefined
        ? parseFloat(req.body.price)
        : cartItem.price;
    cartItem.quantity = newQuantity;
    cartItem.subTotal = cartItem.price * cartItem.quantity;
    cartItem.productId = req.body.productId || cartItem.productId;
    cartItem.userId = req.body.userId || cartItem.userId;
    cartItem.countInStock =
      req.body.countInStock !== undefined
        ? parseInt(req.body.countInStock)
        : cartItem.countInStock;
    cartItem.selectedSize =
      req.body.selectedSize !== undefined
        ? req.body.selectedSize
        : cartItem.selectedSize;

    const updatedCart = await cartItem.save();
    console.log("Updated cart item:", updatedCart);

    return res.status(200).json({
      success: true,
      msg: "Cart item updated successfully",
      data: updatedCart,
    });
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to update cart item",
      error: error.message,
    });
  }
});

// Delete cart item (DELETE /:id)
router.delete("/:id", async (req, res) => {
  try {
    console.log(`DELETE /api/cart/${req.params.id}`);

    const cartItem = await Cart.findById(req.params.id);

    if (!cartItem) {
      console.log(`Cart item not found with ID: ${req.params.id}`);
      return res.status(404).json({
        success: false,
        msg: "The cart item with given id is not found",
      });
    }

    const deletedItem = await Cart.findByIdAndDelete(req.params.id);
    console.log("Deleted cart item:", deletedItem);

    res.status(200).json({
      success: true,
      message: "Cart Item Deleted Successfully",
      data: deletedItem,
    });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to delete cart item",
      error: error.message,
    });
  }
});

// Get single cart item (GET /:id)
router.get("/:id", async (req, res) => {
  try {
    console.log(`GET /api/cart/${req.params.id}`);

    const cartItem = await Cart.findById(req.params.id);

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "The cart item with the given ID was not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: cartItem,
    });
  } catch (error) {
    console.error("Error fetching cart item:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Clear all cart items for a user
router.delete("/clear/:userId", async (req, res) => {
  try {
    console.log(`DELETE /api/cart/clear/${req.params.userId}`);

    const result = await Cart.deleteMany({ userId: req.params.userId });
    console.log("Cleared cart items:", result);

    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} items from cart`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error clearing cart:", error);
    res.status(500).json({
      success: false,
      msg: "Failed to clear cart",
      error: error.message,
    });
  }
});

module.exports = router;
