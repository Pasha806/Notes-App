const express = require("express");
const Note = require("../models/Note");

const router = express.Router();

// Add note to MongoDB
router.post("/", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: "Title and content are required"
      });
    }

    const note = await Note.create({
      title,
      content
    });

    res.status(201).json({
      success: true,
      message: "Note added successfully",
      data: note
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add note",
      error: error.message
    });
  }
});

module.exports = router;