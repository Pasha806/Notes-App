const express = require("express");
const protect = require("../middleware/authMiddleware");
const Note = require("../models/Note");

const {
  generateAISummaryAndTags,
  answerQuestionFromNotes,
  generateNoteFromTopic
} = require("../services/aiService");

const router = express.Router();

router.use(protect);

router.get("/debug", async (req, res) => {
  res.json({
    success: true,
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    keyStart: process.env.OPENAI_API_KEY
      ? process.env.OPENAI_API_KEY.slice(0, 7)
      : null
  });
});

// Regenerate summary/tags for one note
router.post("/notes/:id/analyze", async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: "Note not found"
      });
    }

    const aiResult = await generateAISummaryAndTags(note.title, note.content);

    note.summary = aiResult.summary;
    note.tags = aiResult.tags;
    await note.save();

    res.status(200).json({
      success: true,
      message: "AI summary and tags regenerated",
      data: note
    });
  } catch (error) {
    console.error("AI analysis error:", error);

    res.status(500).json({
      success: false,
      message: "AI analysis failed",
      error: error.message
    });
  }
});

// Ask AI about notes
router.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required"
      });
    }

    const notes = await Note.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    if (!notes.length) {
      return res.status(404).json({
        success: false,
        message: "No notes found to ask AI about"
      });
    }

    const answer = await answerQuestionFromNotes(question, notes);

    res.status(200).json({
      success: true,
      message: "AI answer generated",
      answer
    });
  } catch (error) {
    console.error("AI ask error:", error);

    res.status(500).json({
      success: false,
      message: "AI question failed",
      error: error.message
    });
  }
});

// Generate note draft from topic
router.post("/generate-note", async (req, res) => {
  try {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: "Topic is required"
      });
    }

    const aiNote = await generateNoteFromTopic(topic);

    res.status(200).json({
      success: true,
      message: "AI note generated",
      data: aiNote
    });
  } catch (error) {
    console.error("AI note generation error:", error);

    res.status(500).json({
      success: false,
      message: "AI note generation failed",
      error: error.message
    });
  }
});

module.exports = router;