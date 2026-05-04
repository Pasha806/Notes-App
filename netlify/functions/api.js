const express = require("express");
const serverless = require("serverless-http");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("../../routes/auth");
const noteRoutes = require("../../routes/notes");

const app = express();

app.use(express.json());

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/notes", noteRoutes);

module.exports.handler = serverless(app);