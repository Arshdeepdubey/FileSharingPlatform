require("dotenv").config();
const multer = require("multer");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const File = require("./models/File")

const express = require("express");
// const req = require("express/lib/request");
const app = express();

const upload = multer({ dest: "uploads" });

mongoose.connect(process.env.DATABASE_URL);

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", upload.single("file"), async (req, res) => {
  // res.send("hi");
  const fileData = {
    path: req.file.path,
    originalName: req.file.originalname,
  };
  if (req.body.password != null && req.body.password !== "") {
    fileData.password = bcrypt.hash(req.body.password, 10);
  }

  const file = await File.create(fileData);
  console.log(file);
  res.send(file.originalName);
});

app.listen(process.env.PORT);
