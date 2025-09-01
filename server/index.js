require("dotenv").config();
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const colors = require("colors");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// Store user socket connections
const userSockets = new Map();

// Socket.IO connection handling
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User joins their personal room for order updates
  socket.on("join_user_room", (userId) => {
    socket.join(`user_${userId}`);
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} joined their room`);
  });

  // Handle admin joining admin room (for future admin features)
  socket.on("join_admin_room", () => {
    socket.join("admin_room");
    console.log("Admin joined admin room");
  });

  socket.on("disconnect", () => {
    // Remove user from map when they disconnect
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

// Make io available globally for use in routes
global.io = io;

// CORS setup
app.use(
  cors({
    origin: "http://localhost:3000", // frontend
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Middleware
app.use(bodyParser.json());
app.use(express.json());

// Static files (for serving images from the 'uploads' folder)
app.use("/uploads", express.static("uploads"));

// Routes
const homeBannerRoutes = require("./routes/HomeBanner.js");
const categoryRoutes = require("./routes/categories");
const imageUploadRoutes = require("./helper/imageUpload");
const productWeightRoutes = require("./routes/productWeight");
const productsRoutes = require("./routes/product");
const userRoutes = require("./routes/users.js");
const cartSchema = require("./routes/cart.js");
const productReview = require("./routes/productreviews.js");
const bannerroute = require("./routes/banners.js");
const watchlistroutes = require("./routes/watchlist.js");
const Checkout = require("./routes/checkout.js");
const searchRoutes = require("./routes/search.js");
const contactRoutes = require("./routes/contact.js"); // Corrected spelling
const adminroute = require("./routes/admin.js");
const newsletterRoute = require("./routes/Newsletter.js");
app.use("/api/banners", bannerroute);
app.use("/api/category", categoryRoutes);
app.use("/api/imageUpload", imageUploadRoutes);
app.use("/api/productWeight", productWeightRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/homeBanner", homeBannerRoutes);
app.use("/api/watchlist", watchlistroutes);
app.use("/api/admin", adminroute);
app.use("/api/cart", cartSchema);
app.use("/api/users", userRoutes);
app.use("/api/productReviews", productReview);
app.use("/api/orders", Checkout);
app.use("/api/contacts", contactRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/newsletter", newsletterRoute);
// Root route
app.get("/", (req, res) => {
  res.send("Hello, World! Your API is running.");
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    socketConnections: userSockets.size,
  });
});

// IMPORTANT: Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error("--- START SERVER ERROR ---");
  console.error(err.stack);
  console.error("--- END SERVER ERROR ---");

  res.status(500).json({
    message: "Internal Server Error",
  });
});

// DB Connection and Server Start
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Database connected successfully!".bgYellow);
    const PORT = process.env.PORT || 3001;

    // Use server.listen instead of app.listen for Socket.IO
    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`.bgGreen);
      console.log(`Socket.IO server ready for connections`.bgBlue);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
  });
});
