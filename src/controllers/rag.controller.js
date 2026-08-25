const mongoose = require("mongoose");
const File = require("../models/File");
const {
  createConversation,
  getConversationForUser,
  addMessage,
  listConversations,
} = require("../services/conversation.service");
const { answerQuestion } = require("../services/rag.service");

async function renderChat(req, res, next) {
  try {
    const files = await File.find({ ownerId: req.user.id }).sort({ createdAt: -1 }).lean();
    const selectedDocumentId = req.query.documentId || null;
    const selectedConversationId = req.query.conversationId || null;

    let selectedConversation = null;
    if (selectedConversationId && mongoose.Types.ObjectId.isValid(selectedConversationId)) {
      selectedConversation = await getConversationForUser({
        userId: req.user.id,
        conversationId: selectedConversationId,
      });
    }

    const conversations = await listConversations(req.user.id);

    return res.render("chat", {
      files,
      selectedDocumentId,
      conversations,
      selectedConversation,
      error: null,
    });
  } catch (error) {
    return next(error);
  }
}

async function renderConversations(req, res, next) {
  try {
    const conversations = await listConversations(req.user.id);
    return res.render("conversations", {
      conversations,
    });
  } catch (error) {
    return next(error);
  }
}

async function askQuestion(req, res, next) {
  try {
    const { question, documentIds = [], conversationId } = req.body;

    if (!question || typeof question !== "string") {
      return res.status(400).json({ error: "Question is required." });
    }

    const normalizedIds = Array.isArray(documentIds)
      ? documentIds.filter((id) => mongoose.Types.ObjectId.isValid(id))
      : [];

    let conversation = null;
    if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
      conversation = await getConversationForUser({
        userId: req.user.id,
        conversationId,
      });
    }

    if (!conversation) {
      conversation = await createConversation({
        userId: req.user.id,
        title: question.slice(0, 60),
      });
    }

    await addMessage({
      conversation,
      role: "user",
      content: question,
      sources: [],
    });

    const result = await answerQuestion({
      userId: req.user.id,
      question,
      documentIds: normalizedIds,
      conversationMessages: conversation.messages,
    });

    await addMessage({
      conversation,
      role: "assistant",
      content: result.answer,
      sources: result.sources,
    });

    return res.status(200).json({
      conversationId: conversation._id,
      answer: result.answer,
      sources: result.sources,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  renderChat,
  renderConversations,
  askQuestion,
};
