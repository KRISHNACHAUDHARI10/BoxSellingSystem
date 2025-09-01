// ========================================
// BACKEND FIX - users.js router
// ========================================

const { User } = require("../models/users");
const { ImagesUpload } = require("../models/imagesUpload");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const fs = require("fs");
const { error } = require("console");
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

// Enhanced Middleware to verify user token with debugging
const verifyUserToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    console.log("=== TOKEN VERIFICATION DEBUG ===");
    console.log("Token received:", token ? "Yes" : "No");
    console.log(
      "Token preview:",
      token ? `${token.substring(0, 20)}...` : "None"
    );

    if (!token) {
      console.log("❌ NO TOKEN PROVIDED");
      return res.status(401).json({
        error: true,
        msg: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JSON_WEB_TOKEN_SECRET_KEY);
    console.log("Decoded token:", JSON.stringify(decoded, null, 2));

    const user = await User.findById(decoded.id);
    console.log(
      "User from DB:",
      user
        ? {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
          }
        : "Not found"
    );

    if (!user || !user.isActive) {
      console.log("❌ INVALID TOKEN OR INACTIVE USER");
      return res.status(401).json({
        error: true,
        msg: "Invalid token or inactive user.",
      });
    }

    req.user = user;
    console.log("✅ TOKEN VERIFIED SUCCESSFULLY");
    next();
  } catch (error) {
    console.error("❌ TOKEN VERIFICATION ERROR:", error);
    return res.status(401).json({ error: true, msg: "Invalid token." });
  }
};

// Enhanced Middleware to verify admin token
const verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({
        error: true,
        msg: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JSON_WEB_TOKEN_SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: true,
        msg: "Invalid token or inactive user.",
      });
    }

    // Check if user is admin
    if (user.role !== "admin") {
      return res.status(403).json({
        error: true,
        msg: "Access denied. Admin privileges required.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: true, msg: "Invalid token." });
  }
};

// Upload Route
router.post(`/upload`, upload.array("images"), async (req, res) => {
  let imagesArr = [];
  try {
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

      // remove local file after upload
      fs.unlinkSync(`uploads/${req.files[i].filename}`);
    }

    let imagesUpload = new ImagesUpload({
      images: imagesArr,
    });
    await imagesUpload.save();

    return res.status(200).json(imagesArr);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: true, msg: "Image upload failed" });
  }
});

// User Signup Route
router.post("/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    const existingUser = await User.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ error: true, msg: "User already exists!" });
    }

    if (phone) {
      const existingUserByPh = await User.findOne({ phone: phone });
      if (existingUserByPh) {
        return res
          .status(400)
          .json({ error: true, msg: "Phone number already exists!" });
      }
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const userData = {
      name,
      email,
      password: hashPassword,
    };

    // Only add phone if provided and not empty
    if (phone && phone.trim() !== "") {
      userData.phone = phone;
    }

    const result = await User.create(userData);

    const token = jwt.sign(
      { email: result.email, id: result._id, role: result.role || "user" },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );

    return res.status(200).json({
      error: false,
      user: result,
      token: token,
      msg: "User registered successfully!",
    });
  } catch (error) {
    console.error("User signup error:", error);
    return res.status(500).json({ error: true, msg: "Something went wrong" });
  }
});

// User Signin Route
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email: email, isActive: true });
    if (!existingUser) {
      return res
        .status(404)
        .json({ error: true, msg: "User not found or inactive" });
    }

    const matchPassword = await bcrypt.compare(password, existingUser.password);
    if (!matchPassword) {
      return res.status(400).json({ error: true, msg: "Wrong password" });
    }

    // Update last login
    await User.findByIdAndUpdate(existingUser._id, { lastLogin: new Date() });

    const token = jwt.sign(
      {
        email: existingUser.email,
        id: existingUser._id,
        role: existingUser.role || "user",
      },
      process.env.JSON_WEB_TOKEN_SECRET_KEY
    );

    return res.status(200).json({
      error: false,
      user: existingUser,
      token: token,
      msg: "User Login Successfully!",
    });
  } catch (error) {
    console.error("User signin error:", error);
    return res.status(500).json({ error: true, msg: "Something went wrong" });
  }
});

// Google Auth Route
router.post("/authWithGoogle", async (req, res) => {
  console.log("Received payload:", req.body);
  const { name, phone, email, password, images } = req.body;

  try {
    let existingUser = await User.findOne({ email });

    if (!existingUser) {
      const userData = {
        name,
        email,
        password: password || "",
        images,
      };

      if (phone && phone.trim() !== "") {
        userData.phone = phone;
      }

      console.log("Creating user with data:", userData);

      const result = await User.create(userData);

      const token = jwt.sign(
        { email: result.email, id: result._id, role: result.role || "user" },
        process.env.JSON_WEB_TOKEN_SECRET_KEY
      );

      return res.status(200).json({
        error: false,
        user: result,
        token,
        msg: "User registered & logged in with Google!",
      });
    } else {
      // Update last login
      await User.findByIdAndUpdate(existingUser._id, { lastLogin: new Date() });

      const token = jwt.sign(
        {
          email: existingUser.email,
          id: existingUser._id,
          role: existingUser.role || "user",
        },
        process.env.JSON_WEB_TOKEN_SECRET_KEY
      );

      return res.status(200).json({
        error: false,
        user: existingUser,
        token,
        msg: "User logged in successfully with Google!",
      });
    }
  } catch (error) {
    console.error("Google Auth Error:", error);
    return res.status(500).json({
      error: true,
      msg: "Google auth failed: " + error.message,
    });
  }
});

// IMPORTANT: Put specific routes BEFORE parameterized routes

// Get User Count
router.get(`/get/count`, async (req, res) => {
  try {
    const userCount = await User.countDocuments({ isActive: true });
    return res.status(200).json({ userCount: userCount });
  } catch (error) {
    console.error("Get user count error:", error);
    return res.status(500).json({ error: true, msg: "Something went wrong" });
  }
});

// Get All Users - ADMIN ONLY (moved before /:id route)
router.get("/all", verifyAdminToken, async (req, res) => {
  try {
    const userList = await User.find({})
      .select(
        "_id name email phone images role isActive createdAt lastLogin address dateOfBirth gender"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json(userList);
  } catch (error) {
    console.error("Get all users error:", error);
    return res.status(500).json({ error: true, msg: "Something went wrong" });
  }
});

// Get All Users (for public listings - limit data shown)
router.get("/", async (req, res) => {
  try {
    const userList = await User.find({ isActive: true })
      .select("_id name email phone images role isActive createdAt lastLogin")
      .sort({ createdAt: -1 });

    return res.status(200).json(userList);
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({ error: true, msg: "Something went wrong" });
  }
});

// Update User Profile
router.put(
  "/:id",
  verifyUserToken,
  upload.array("images"),
  async (req, res) => {
    const { name, phone, email, address, dateOfBirth, gender } = req.body;

    try {
      // Users can only update their own profile OR admins can update any profile
      if (
        req.user._id.toString() !== req.params.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({ error: true, msg: "Access denied" });
      }

      const userExist = await User.findById(req.params.id);
      if (!userExist) {
        return res.status(404).json({ error: true, msg: "User not found" });
      }

      let imagesArr = userExist.images || [];

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

      let newPassword = userExist.password;
      if (req.body.password) {
        newPassword = await bcrypt.hash(req.body.password, 10);
      }

      const updateData = {
        name: name || userExist.name,
        email: email || userExist.email,
        password: newPassword,
        images: imagesArr,
      };

      // Only add phone if provided and not empty, otherwise set to null
      if (phone !== undefined) {
        updateData.phone = phone.trim() === "" ? null : phone;
      }

      // Update additional fields if provided
      if (address) updateData.address = address;
      if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
      if (gender) updateData.gender = gender;

      const user = await User.findByIdAndUpdate(req.params.id, updateData, {
        new: true,
      }).select("-password");

      return res.status(200).json({
        error: false,
        user: user,
        msg: "Profile updated successfully!",
      });
    } catch (error) {
      console.error("Update user error:", error);
      return res.status(500).json({ error: true, msg: "Something went wrong" });
    }
  }
);

// Get User by ID
router.get("/:id", verifyUserToken, async (req, res) => {
  try {
    // Users can only view their own profile OR admins can view any profile
    if (
      req.user._id.toString() !== req.params.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ error: true, msg: "Access denied" });
    }

    const user = await User.findById(req.params.id).select("-password");
    if (!user || !user.isActive) {
      return res.status(404).json({ error: true, msg: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({ error: true, msg: "Something went wrong" });
  }
});

// FIXED: Enhanced Deactivate User Account (soft delete) with proper debugging
router.delete("/:id", verifyUserToken, async (req, res) => {
  try {
    console.log("=== DELETE USER DEBUG INFO ===");
    console.log("Target user ID:", req.params.id);
    console.log("Current user ID:", req.user._id.toString());
    console.log("Current user role:", req.user.role);
    console.log("Current user name:", req.user.name);
    console.log("Is same user?", req.user._id.toString() === req.params.id);
    console.log("Is admin?", req.user.role === "admin");

    // Check if user is admin OR trying to delete their own account
    const isAdmin = req.user.role === "admin";
    const isSameUser = req.user._id.toString() === req.params.id;

    if (!isAdmin && !isSameUser) {
      console.log("❌ ACCESS DENIED: Not admin and not same user");
      return res.status(403).json({
        error: true,
        msg: "Access denied. You can only delete your own account or you need admin privileges.",
      });
    }

    // Find the user to delete
    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      console.log("❌ USER NOT FOUND");
      return res.status(404).json({ error: true, msg: "User not found" });
    }

    console.log("User to delete:", userToDelete.name, userToDelete.email);

    // Prevent admin from deleting themselves (optional safety check)
    if (isAdmin && isSameUser) {
      console.log("⚠️ WARNING: Admin trying to delete own account");
      // Uncomment the next line if you want to prevent this
      // return res.status(400).json({ error: true, msg: "You cannot delete your own admin account" });
    }

    // Perform soft delete
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select("-password");

    console.log("✅ USER DEACTIVATED SUCCESSFULLY");

    return res.status(200).json({
      error: false, // ← This was missing!
      msg: "User account deactivated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ DELETE USER ERROR:", error);
    return res.status(500).json({
      error: true,
      msg: "Something went wrong: " + error.message,
    });
  }
});

// Delete Image Route
router.delete("/deleteImage", async (req, res) => {
  const imgUrl = req.query.img;

  const urlArr = imgUrl.split("/");
  const image = urlArr[urlArr.length - 1];
  const imageName = image.split(".")[0];

  const response = await cloudinary.uploader.destroy(
    imageName,
    (error, result) => {
      //console.log(error,res)
    }
  );

  if (response) {
    res.status(200).send(response);
  }
});

module.exports = router;
