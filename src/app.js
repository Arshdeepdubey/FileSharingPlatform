require("dotenv").config();

const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const { optionalAuth } = require("./middleware/auth.middleware");
const authRoutes = require("./routes/auth.routes");
const fileRoutes = require("./routes/file.routes");
const documentRoutes = require("./routes/document.routes");
const ragRoutes = require("./routes/rag.routes");
const { notFoundHandler, errorHandler } = require("./middleware/error.middleware");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(optionalAuth);

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

app.use(authRoutes);
app.use(fileRoutes);
app.use(documentRoutes);
app.use(ragRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
