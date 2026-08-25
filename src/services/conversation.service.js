const Conversation = require("../models/Conversation");

async function createConversation({ userId, title }) {
  const conversation = await Conversation.create({
    userId,
    title,
    messages: [],
  });

  return conversation;
}

async function getConversationForUser({ userId, conversationId }) {
  return Conversation.findOne({ _id: conversationId, userId });
}

async function addMessage({ conversation, role, content, sources = [] }) {
  conversation.messages.push({
    role,
    content,
    sources,
    createdAt: new Date(),
  });

  await conversation.save();
}

async function listConversations(userId) {
  return Conversation.find({ userId }).sort({ updatedAt: -1 }).lean();
}

module.exports = {
  createConversation,
  getConversationForUser,
  addMessage,
  listConversations,
};
