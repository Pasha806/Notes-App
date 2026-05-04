const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server started");
});

const mongoose = require("mongoose");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

  const noteRoutes = require("./routes/notes");
    app.use("/api/notes", noteRoutes);