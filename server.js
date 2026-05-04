const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const noteRoutes = require("./routes/notes");
const authRoutes = require("./routes/auth");

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("API is running");
});

app.use("/api/notes", noteRoutes);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
  });