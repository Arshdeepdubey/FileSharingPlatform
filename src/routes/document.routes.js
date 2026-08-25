const express = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const documentController = require("../controllers/document.controller");

const router = express.Router();

router.get("/documents/:id", requireAuth, documentController.getDocument);

module.exports = router;
