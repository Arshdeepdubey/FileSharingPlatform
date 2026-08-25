const express = require("express");
const { requireAuth } = require("../middleware/auth.middleware");
const ragController = require("../controllers/rag.controller");

const router = express.Router();

router.get("/chat", requireAuth, ragController.renderChat);
router.get("/conversations", requireAuth, ragController.renderConversations);
router.post("/api/rag/ask", requireAuth, ragController.askQuestion);

module.exports = router;
