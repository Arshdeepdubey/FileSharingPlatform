const AI_BASE_URL = process.env.AI_BASE_URL || "http://127.0.0.1:11434";
const AI_EMBEDDING_MODEL = process.env.AI_EMBEDDING_MODEL || "nomic-embed-text";
const AI_CHAT_MODEL = process.env.AI_CHAT_MODEL || "llama3.1";

module.exports = {
  AI_BASE_URL,
  AI_EMBEDDING_MODEL,
  AI_CHAT_MODEL,
};
