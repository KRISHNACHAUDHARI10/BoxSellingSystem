const { Admin } = require("../models/admin");
const { User } = require("../models/users");
const { ImagesUpload } = require("../models/imagesUpload");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// Middleware to verify admin token
const verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res
        .status(401)
        .json({ error: true, msg: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, process.env.JSON_WEB_TOKEN_SECRET_KEY);
    const admin = await Admin.findById(decoded.id);

    if (!admin || !admin.isActive) {
      return res
        .status(401)
        .json({ error: true, msg: "Invalid token or inactive admin." });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(401).json({ error: true, msg: "Invalid token." });
  }
};

// CREATE FIRST ADMIN (Use this for the very first admin)
router.post("/create-first-admin", async (req, res) => {
  try {
    // Check if any admin exists
    const adminCount = await Admin.countDocuments();
    if (adminCount > 0) {
      return res.status(400).json({
        error: true,
        msg: "Admin already exists. Use regular signup.",
      });
    }

    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: true,
        msg: "Name, email and password are required",
      });
    }

    // Check if email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: true,
        msg: "Invalid email format",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const adminData = {
      name,
      email,
      password: hashPassword,
      permissions: [
        "manage_users",
        "manage_products",
        "manage_orders",
        "manage_categories",
        "view_analytics",
      ],
    };

    // Only add phone if provided
    if (phone && phone.trim() !== "") {
      adminData.phone = phone;
    }

    const result = await Admin.create(adminData);

    const token = jwt.sign(
      { email: result.email, id: result._id, role: "admin" },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );

    return res.status(200).json({
      error: false,
      admin: result,
      token: token,
      msg: "First admin created successfully!",
    });
  } catch (error) {
    console.error("Create first admin error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        error: true,
        msg: "Email or phone already exists",
      });
    }
    return res.status(500).json({ error: true, msg: "Something went wrong" });
  }
});

// ADMIN SIGNUP (Public route - stores in Admin table)
router.post("/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        error: true,
        msg: "Name, email and password are required",
      });
    }

    // Check if email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: true,
        msg: "Invalid email format",
      });
    }

    // Check if admin already exists in Admin table
    const existingAdmin = await Admin.findOne({ email: email });
    if (existingAdmin) {
      return res.status(400).json({
        error: true,
        msg: "Admin with this email already exists!",
      });
    }

    // Check phone if provided
    if (phone && phone.trim() !== "") {
      const existingAdminByPhone = await Admin.findOne({ phone: phone });
      if (existingAdminByPhone) {
        return res.status(400).json({
          error: true,
          msg: "Admin with this phone number already exists!",
        });
      }
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10);

    // Prepare admin data
    const adminData = {
      name,
      email,
      password: hashPassword,
      permissions: [
        "manage_users",
        "manage_products",
        "manage_orders",
        "manage_categories",
        "view_analytics",
      ],
    };

    // Only add phone if provided and not empty
    if (phone && phone.trim() !== "") {
      adminData.phone = phone;
    }

    // Create admin in Admin table
    const result = await Admin.create(adminData);

    // Generate token
    const token = jwt.sign(
      { email: result.email, id: result._id, role: "admin" },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );

    return res.status(200).json({
      error: false,
      admin: result,
      token: token,
      msg: "Admin registered successfully!",
    });
  } catch (error) {
    console.error("Admin signup error:", error);
    if (error.code === 11000) {
      return res.status(400).json({
        error: true,
        msg: "Email or phone already exists",
      });
    }
    return res.status(500).json({
      error: true,
      msg: "Something went wrong",
    });
  }
});

// ADMIN SIGNIN (Authenticates against Admin table only)
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: true,
        msg: "Email and password are required",
      });
    }

    // Find admin in Admin table only
    const existingAdmin = await Admin.findOne({
      email: email,
      isActive: true,
    });

    if (!existingAdmin) {
      return res.status(404).json({
        error: true,
        msg: "Admin not found or inactive",
      });
    }

    // Check password
    const matchPassword = await bcrypt.compare(
      password,
      existingAdmin.password
    );

    if (!matchPassword) {
      return res.status(400).json({
        error: true,
        msg: "Wrong password",
      });
    }

    // Update last login
    await Admin.findByIdAndUpdate(existingAdmin._id, {
      lastLogin: new Date(),
    });

    // Generate token
    const token = jwt.sign(
      { email: existingAdmin.email, id: existingAdmin._id, role: "admin" },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );

    return res.status(200).json({
      error: false,
      admin: existingAdmin,
      token: token,
      msg: "Admin login successfully!",
    });
  } catch (error) {
    console.error("Admin signin error:", error);
    return res.status(500).json({
      error: true,
      msg: "Something went wrong",
    });
  }
});

// CREATE NEW ADMIN (Only Super Admin can create new admins - requires token)
router.post("/create-admin", verifyAdminToken, async (req, res) => {
  const { name, email, phone, password, permissions } = req.body;

  try {
    // Check if requesting admin has permission to create new admins
    if (!req.admin.permissions.includes("manage_users")) {
      return res
        .status(403)
        .json({ error: true, msg: "Insufficient permissions" });
    }

    const existingAdmin = await Admin.findOne({ email: email });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ error: true, msg: "Admin already exists!" });
    }

    if (phone) {
      const existingAdminByPhone = await Admin.findOne({ phone: phone });
      if (existingAdminByPhone) {
        return res
          .status(400)
          .json({ error: true, msg: "Phone number already exists!" });
      }
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const adminData = {
      name,
      email,
      password: hashPassword,
      createdBy: req.admin._id,
    };

    // Only add phone if provided
    if (phone && phone.trim() !== "") {
      adminData.phone = phone;
    }

    // Set permissions if provided, otherwise use default
    if (permissions && Array.isArray(permissions)) {
      adminData.permissions = permissions;
    }

    const result = await Admin.create(adminData);

    const token = jwt.sign(
      { email: result.email, id: result._id, role: "admin" },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );

    return res.status(200).json({
      error: false,
      admin: result,
      token: token,
      msg: "Admin created successfully!",
    });
  } catch (error) {
    console.error("Admin creation error:", error);
    return res.status(500).json({ error: true, msg: "Something went wrong" });
  }
});

// Google Auth for Users (This creates users in User table, not Admin table)
router.post("/authWithGoogle", async (req, res) => {
  const { name, email, images, phone } = req.body;

  try {
    // Check if user already exists in User table
    let existingUser = await User.findOne({ email: email });

    if (existingUser) {
      // User exists, log them in
      const token = jwt.sign(
        { email: existingUser.email, id: existingUser._id, role: "user" },
        process.env.JSON_WEB_TOKEN_SECRET_KEY
      );

      // Update last login
      await User.findByIdAndUpdate(existingUser._id, {
        lastLogin: new Date(),
        images: images ? [images] : existingUser.images,
      });

      return res.status(200).json({
        error: false,
        user: existingUser,
        token: token,
        msg: "Google login successful!",
      });
    } else {
      // Create new user in User table
      const userData = {
        name,
        email,
        images: images ? [images] : [],
        isActive: true,
      };

      // Only add phone if provided
      if (phone && phone.trim() !== "") {
        userData.phone = phone;
      }

      const newUser = await User.create(userData);

      const token = jwt.sign(
        { email: newUser.email, id: newUser._id, role: "user" },
        process.env.JSON_WEB_TOKEN_SECRET_KEY
      );

      return res.status(200).json({
        error: false,
        user: newUser,
        token: token,
        msg: "Google signup successful!",
      });
    }
  } catch (error) {
    console.error("Google auth error:", error);
    return res.status(500).json({
      error: true,
      msg: "Google authentication failed",
    });
  }
});

// Get all admins (only for admins with manage_users permission)
router.get("/", verifyAdminToken, async (req, res) => {
  try {
    if (!req.admin.permissions.includes("manage_users")) {
      return res
        .status(403)
        .json({ error: true, msg: "Insufficient permissions" });
    }

    const adminList = await Admin.find({ isActive: true }).select("-password");
    return res.status(200).json({
      error: false,
      data: adminList,
      msg: "Admins retrieved successfully",
    });
  } catch (error) {
    console.error("Get admins error:", error);
    return res.status(500).json({ error: true, msg: "Something went wrong" });
  }
});

// Admin Delete User Route (add this to your admin.js file)
router.delete("/delete-user/:id", verifyAdminToken, async (req, res) => {
  try {
    console.log("=== ADMIN DELETE USER DEBUG ===");
    console.log("Admin trying to delete user ID:", req.params.id);
    console.log("Admin user:", req.admin.name, req.admin.email);

    // Check if admin has permission to manage users
    if (!req.admin.permissions.includes("manage_users")) {
      return res.status(403).json({
        error: true,
        msg: "Access denied. You need manage_users permission.",
      });
    }

    // Find the user to delete
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      console.log("❌ USER NOT FOUND");
      return res.status(404).json({ error: true, msg: "User not found" });
    }

    console.log("User to delete:", userToDelete.name, userToDelete.email);

    // Perform soft delete
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select("-password");

    console.log("✅ USER DEACTIVATED SUCCESSFULLY BY ADMIN");

    return res.status(200).json({
      error: false,
      msg: "User account deactivated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ ADMIN DELETE USER ERROR:", error);
    return res.status(500).json({
      error: true,
      msg: "Something went wrong: " + error.message,
    });
  }
});

// Get admin by ID
router.get("/:id", verifyAdminToken, async (req, res) => {
  try {
    // Admins can only view their own profile unless they have manage_users permission
    if (
      req.admin._id.toString() !== req.params.id &&
      !req.admin.permissions.includes("manage_users")
    ) {
      return res
        .status(403)
        .json({ error: true, msg: "Insufficient permissions" });
    }

    const admin = await Admin.findById(req.params.id).select("-password");
    if (!admin || !admin.isActive) {
      return res.status(404).json({ error: true, msg: "Admin not found" });
    }

    return res.status(200).json({
      error: false,
      admin: admin,
      msg: "Admin retrieved successfully",
    });
  } catch (error) {
    console.error("Get admin error:", error);
    return res.status(500).json({ error: true, msg: "Something went wrong" });
  }
});

// Update admin
router.put(
  "/:id",
  verifyAdminToken,
  upload.array("images"),
  async (req, res) => {
    const { name, phone, email, permissions } = req.body;

    try {
      // Admins can only update their own profile unless they have manage_users permission
      if (
        req.admin._id.toString() !== req.params.id &&
        !req.admin.permissions.includes("manage_users")
      ) {
        return res
          .status(403)
          .json({ error: true, msg: "Insufficient permissions" });
      }

      const adminExist = await Admin.findById(req.params.id);
      if (!adminExist) {
        return res.status(404).json({ error: true, msg: "Admin not found" });
      }

      let imagesArr = adminExist.images || [];

      // Handle image uploads if files are provided
      if (req.files && req.files.length > 0) {
        imagesArr = [];
        for (let i = 0; i < req.files.length; i++) {
          const options = {
            use_filename: true,
            unique_filename: false,
            overwrite: false,
          };

          const result = await cloudinary.uploader.upload(
            req.files[i].path,
            options
          );
          imagesArr.push(result.secure_url);
          fs.unlinkSync(`uploads/${req.files[i].filename}`);
        }
      }

      let newPassword = adminExist.password;
      if (req.body.password) {
        newPassword = await bcrypt.hash(req.body.password, 10);
      }

      const updateData = {
        name: name || adminExist.name,
        email: email || adminExist.email,
        password: newPassword,
        images: imagesArr,
      };

      // Only add phone if provided and not empty
      if (phone !== undefined) {
        updateData.phone = phone.trim() === "" ? null : phone;
      }

      // Only allow permission updates if user has manage_users permission
      if (permissions && req.admin.permissions.includes("manage_users")) {
        updateData.permissions = permissions;
      }

      const admin = await Admin.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
      }).select("-password");

      return res.status(200).json({
        error: false,
        admin: admin,
        msg: "Admin updated successfully!",
      });
    } catch (error) {
      console.error("Update admin error:", error);
      return res.status(500).json({ error: true, msg: "Something went wrong" });
    }
  }
);

// Deactivate admin (soft delete)
router.delete("/:id", verifyAdminToken, async (req, res) => {
  try {
    if (!req.admin.permissions.includes("manage_users")) {
      return res
        .status(403)
        .json({ error: true, msg: "Insufficient permissions" });
    }

    // Prevent admin from deactivating themselves
    if (req.admin._id.toString() === req.params.id) {
      return res
        .status(400)
        .json({ error: true, msg: "Cannot deactivate your own account" });
    }

    const admin = await Admin.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select("-password");

    if (!admin) {
      return res.status(404).json({ error: true, msg: "Admin not found" });
    }

    return res.status(200).json({
      error: false,
      msg: "Admin deactivated successfully",
      admin: admin,
    });
  } catch (error) {
    console.error("Delete admin error:", error);
    return res.status(500).json({ error: true, msg: "Something went wrong" });
  }
});

// Get admin count
router.get("/get/count", verifyAdminToken, async (req, res) => {
  try {
    if (!req.admin.permissions.includes("manage_users")) {
      return res
        .status(403)
        .json({ error: true, msg: "Insufficient permissions" });
    }

    const adminCount = await Admin.countDocuments({ isActive: true });
    return res.status(200).json({
      error: false,
      adminCount: adminCount,
    });
  } catch (error) {
    console.error("Get admin count error:", error);
    return res.status(500).json({ error: true, msg: "Something went wrong" });
  }
});

router.get("/users/all", verifyAdminToken, async (req, res) => {
  try {
    if (!req.admin.permissions.includes("manage_users")) {
      return res
        .status(403)
        .json({ error: true, msg: "Insufficient permissions" });
    }

    // Remove the isActive filter to get ALL users (active and inactive)
    const userList = await User.find({})
      .select(
        "_id name email phone images role isActive createdAt lastLogin address dateOfBirth gender"
      )
      .sort({ createdAt: -1 }); // Sort by newest first

    return res.status(200).json({
      error: false,
      data: userList,
      total: userList.length,
      msg: "Users retrieved successfully",
    });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({ error: true, msg: "Something went wrong" });
  }
});
// Get user count (admin only)
router.get("/users/count", verifyAdminToken, async (req, res) => {
  try {
    if (!req.admin.permissions.includes("manage_users")) {
      return res
        .status(403)
        .json({ error: true, msg: "Insufficient permissions" });
    }

    const userCount = await User.countDocuments({ isActive: true });
    return res.status(200).json({
      error: false,
      userCount: userCount,
    });
  } catch (error) {
    console.error("Get user count error:", error);
    return res.status(500).json({ error: true, msg: "Something went wrong" });
  }
});

module.exports = router;
