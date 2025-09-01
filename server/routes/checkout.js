const { Orders } = require("../models/orders");
const express = require("express");
const router = express.Router();

// Get all orders with pagination
router.get(`/`, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const perPage = 8;
    const totalPosts = await Orders.countDocuments();
    const totalPages = Math.ceil(totalPosts / perPage);

    if (page > totalPages) {
      return res.status(404).json({ message: "No data found" });
    }

    const orderList = await Orders.find()
      .sort({ date: -1 }) // Sort by date, newest first
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    if (!orderList) {
      return res.status(500).json({ success: false });
    }

    return res.status(200).json({
      success: true,
      orderList: orderList,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get orders by user ID
router.get(`/user/:userId`, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const perPage = 10;

    const totalPosts = await Orders.countDocuments({ userid: userId });
    const totalPages = Math.ceil(totalPosts / perPage);

    const orderList = await Orders.find({ userid: userId })
      .sort({ date: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .exec();

    return res.status(200).json({
      success: true,
      orderList: orderList,
      totalPages: totalPages,
      page: page,
    });
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get single order by ID
router.get(`/:id`, async (req, res) => {
  try {
    const order = await Orders.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Create new order - FIXED to match frontend data structure
// Create new order - FIXED to handle all required fields properly
router.post("/", async (req, res) => {
  try {
    console.log("Received order data:", req.body); // Debug log

    // Extract data with correct field names from frontend
    const {
      userid, // Frontend sends 'userid'
      items,
      shippingAddress,
      email,
      subtotal,
      shipping,
      tax,
      total,
      paymentId,
      orderId,
      signature,
    } = req.body;

    // Validation with correct field names
    const requiredFields = [
      { field: "userid", value: userid },
      { field: "email", value: email },
      { field: "shippingAddress", value: shippingAddress },
      { field: "items", value: items },
      { field: "total", value: total },
    ];

    // Check for missing required fields
    for (const { field, value } of requiredFields) {
      if (!value) {
        return res.status(400).json({
          success: false,
          message: `Missing required field: ${field}`,
          receivedFields: Object.keys(req.body), // Debug info
        });
      }
    }

    // Additional validation for nested objects
    if (!shippingAddress.fullName || !shippingAddress.streetAddressLine1) {
      return res.status(400).json({
        success: false,
        message:
          "Shipping address is incomplete - missing fullName or streetAddressLine1",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Items array is required and cannot be empty",
      });
    }

    // Transform cart items to order products format
    const products = items.map((item) => ({
      productName: item.productTitle || item.name || "Unknown Product", // Provide fallback
      quantity: parseInt(item.quantity) || 1,
      price: parseFloat(item.price) || 0,
      image: item.image || "",
      total: (parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1),
      productId: item.productId || item._id || "", // Provide fallback
      selectedSize: item.selectedSize || null,
    }));

    // Create new order with proper field mapping - FIXED ALL REQUIRED FIELDS
    let order = new Orders({
      // Basic order info - ALL REQUIRED FIELDS MUST HAVE VALUES
      name: shippingAddress.fullName || "Unknown Customer", // Required field
      phoneNumber: shippingAddress.phoneNumber || "Not provided", // Required field
      address:
        `${shippingAddress.streetAddressLine1 || ""} ${
          shippingAddress.streetAddressLine2 || ""
        }`.trim() || "Address not provided", // Required field
      pincode: shippingAddress.zipCode || "000000", // Required field
      amount: parseFloat(total) || 0, // Required field
      paymentId: paymentId || null,
      email: email || "noemail@example.com", // Required field
      userid: userid, // Required field - this should be present

      // Products array
      products: products,

      // Shipping address object
      shippingAddress: {
        fullName: shippingAddress.fullName || "",
        streetAddressLine1: shippingAddress.streetAddressLine1 || "",
        streetAddressLine2: shippingAddress.streetAddressLine2 || "",
        city: shippingAddress.city || "",
        state: shippingAddress.state || "",
        zipCode: shippingAddress.zipCode || "",
        country: shippingAddress.country || "",
        phoneNumber: shippingAddress.phoneNumber || "",
      },

      // Order details breakdown
      orderDetails: {
        subtotal: parseFloat(subtotal) || 0,
        shipping: parseFloat(shipping) || 0,
        tax: parseFloat(tax) || 0,
        total: parseFloat(total) || 0,
      },

      // Payment info
      razorpayOrderId: orderId || null,
      razorpaySignature: signature || null,

      // Status
      orderStatus: "confirmed",
      paymentStatus: paymentId ? "paid" : "pending",

      // Date
      date: new Date(),
    });

    console.log("About to save order with data:", {
      name: order.name,
      phoneNumber: order.phoneNumber,
      address: order.address,
      pincode: order.pincode,
      amount: order.amount,
      email: order.email,
      userid: order.userid,
      productsCount: order.products.length,
    });

    const savedOrder = await order.save();
    console.log("Order saved successfully:", savedOrder._id);

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: savedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    console.error("Error details:", error.message);
    console.error("Error stack:", error.stack);

    // Handle validation errors with more detail
    if (error.name === "ValidationError") {
      console.error("Validation error details:", error.errors);
      const validationErrors = Object.keys(error.errors).map((key) => ({
        field: key,
        message: error.errors[key].message,
        value: error.errors[key].value,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation error - missing required fields",
        errors: validationErrors,
        receivedData: {
          userid: req.body.userid,
          email: req.body.email,
          hasShippingAddress: !!req.body.shippingAddress,
          hasItems: !!req.body.items,
          total: req.body.total,
        },
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: error.message,
    });
  }
});

// Add this to your checkout.js (Orders route file)

// Update order status with real-time notification
router.put("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    // Find and update the order
    const order = await Orders.findByIdAndUpdate(
      req.params.id,
      {
        orderStatus: status,
        updatedAt: new Date(), // Add timestamp for tracking changes
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Emit real-time update to the specific user via WebSocket
    if (global.io && order.userid) {
      console.log(`Emitting order status update to user: ${order.userid}`);

      global.io.to(`user_${order.userid}`).emit("order_status_updated", {
        orderId: order._id,
        newStatus: status,
        orderData: {
          _id: order._id,
          orderStatus: status,
          amount: order.amount,
          date: order.date,
          products: order.products,
        },
        message: `Your order #${order._id
          .toString()
          .slice(-8)} status has been updated to: ${status.toUpperCase()}`,
        timestamp: new Date(),
      });

      // Also emit to admin room for admin dashboard updates
      global.io.to("admin_room").emit("order_updated", {
        orderId: order._id,
        newStatus: status,
        userId: order.userid,
        timestamp: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order: order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
// Get Order Count

// Add these routes to your orders route file (before the /:id route)

// Get Order Count
router.get(`/get/count`, async (req, res) => {
  try {
    const orderCount = await Orders.countDocuments();
    return res.status(200).json({ orderCount: orderCount });
  } catch (error) {
    console.error("Get order count error:", error);
    return res.status(500).json({ error: true, msg: "Something went wrong" });
  }
});

// Get Total Revenue (sum of all order amounts)
router.get(`/get/revenue`, async (req, res) => {
  try {
    const result = await Orders.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" },
        },
      },
    ]);

    const totalRevenue = result.length > 0 ? result[0].totalRevenue : 0;
    return res.status(200).json({ totalRevenue: totalRevenue });
  } catch (error) {
    console.error("Get total revenue error:", error);
    return res.status(500).json({ error: true, msg: "Something went wrong" });
  }
});
// Optional: Add a route to get real-time order updates for testing
router.get("/test-emit/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (global.io) {
      global.io.to(`user_${userId}`).emit("test_notification", {
        message: "This is a test notification",
        timestamp: new Date(),
      });

      res.json({
        success: true,
        message: `Test notification sent to user ${userId}`,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "WebSocket not available",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Optional: Get connected users count (for admin dashboard)
router.get("/socket-status", (req, res) => {
  try {
    const connectedUsers = global.io ? global.io.sockets.adapter.rooms.size : 0;
    res.json({
      success: true,
      connectedUsers: connectedUsers,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// Delete order
router.delete("/:id", async (req, res) => {
  try {
    const deletedOrder = await Orders.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
      return res.status(404).json({
        message: "Order Not Found!",
        success: false,
      });
    }

    res.status(200).json({
      success: true,
      message: "Order Deleted Successfully",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

module.exports = router;
