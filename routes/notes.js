const express = require("express");
const Note = require("../models/Note");

const router = express.Router();

function validateNoteInput(title, content) {
  if (!title || !content) {
    return "Title and content are required";
  }

  if (title.trim().length < 3) {
    return "Title must be at least 3 characters";
  }

  if (content.trim().length < 5) {
    return "Content must be at least 5 characters";
  }

  return null;
}

// CREATE
router.post("/", async (req, res) => {
  try {
    const { title, content } = req.body;

    const validationError = validateNoteInput(title, content);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    const note = await Note.create({
      title: title.trim(),
      content: content.trim()
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

// READ ALL
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Notes fetched successfully",
      count: notes.length,
      data: notes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch notes",
      error: error.message
    });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const { title, content } = req.body;

    const validationError = validateNoteInput(title, content);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    const note = await Note.findByIdAndUpdate(
      req.params.id,
      {
        title: title.trim(),
        content: content.trim()
      },
      { new: true, runValidators: true }
    );

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Note updated successfully",
      data: note
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update note",
      error: error.message
    });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Note deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete note",
      error: error.message
    });
  }
});

module.exports = router;