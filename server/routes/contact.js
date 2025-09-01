const express = require("express");
const router = express.Router();
const Contact = require("../models/contact.js");

// Debug log to confirm route file is loaded
console.log("📞 Contact routes loaded successfully");

// POST /api/contacts - Create new contact message
router.post("/", async (req, res) => {
  try {
    const { fullName, email, message, phone } = req.body;

    if (!fullName || !email || !message) {
      return res.status(400).json({
        error: "Full name, email, and message are required.",
      });
    }

    const contact = new Contact({
      fullName,
      email,
      message,
      phone: phone || "",
    });

    await contact.save();

    res.status(201).json({
      message: "Contact message sent successfully!",
      contact: {
        id: contact._id,
        fullName: contact.fullName,
        email: contact.email,
        createdAt: contact.createdAt,
      },
    });
  } catch (error) {
    console.error("Contact creation error:", error);
    res.status(500).json({
      error: "Failed to send message. Please try again.",
    });
  }
});

// GET /api/contacts - List all contact messages
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // For now, return all contacts (you can implement pagination later)
    const contacts = await Contact.find()
      .sort({ createdAt: -1 })
      .select("-__v");

    const total = contacts.length;

    // Simple pagination
    const paginatedContacts = contacts.slice(skip, skip + limit);

    res.json({
      success: true,
      data: {
        contacts: paginatedContacts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalContacts: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Contacts fetch error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch contact messages",
    });
  }
});

// GET /api/contacts/:id - Get single contact message
router.get("/:id", async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        error: "Contact message not found",
      });
    }

    res.json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error("Contact fetch error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch contact message",
    });
  }
});

// DELETE /api/contacts/:id - Delete contact message
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Delete contact by ID:", id);

    const result = await Contact.findByIdAndDelete(id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    res.json({
      success: true,
      message: "Contact message successfully deleted",
      data: result,
    });
  } catch (error) {
    console.error("Delete contact error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete contact message. Please try again later.",
    });
  }
});

// PUT /api/contacts/:id - Update contact status (optional)
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["new", "replied", "pending"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required (new, replied, pending)",
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    res.json({
      success: true,
      message: "Contact status updated successfully",
      data: contact,
    });
  } catch (error) {
    console.error("Update contact error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update contact status",
    });
  }
});

module.exports = router;
