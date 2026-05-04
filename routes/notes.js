const express = require("express");
const Note = require("../models/Note");
const protect = require("../middleware/authMiddleware");

const router = express.Router();
router.use(protect);

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
    content: content.trim(),
    user: req.user._id
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

// READ ALL + SEARCH + DATE FILTER + PAGINATION
router.get("/", async (req, res) => {
  try {
    const search = req.query.search || "";
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    let filter = {
    user: req.user._id
    };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } }
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};

      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }

      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const totalNotes = await Note.countDocuments(filter);

    const notes = await Note.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      message: "Notes fetched successfully",
      count: notes.length,
      totalNotes,
      currentPage: page,
      totalPages: Math.ceil(totalNotes / limit),
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

    const note = await Note.findOneAndUpdate(
     {
     _id: req.params.id,
      user: req.user._id
    },
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
    const note = await Note.findOneAndDelete({
  _id: req.params.id,
  user: req.user._id
});

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