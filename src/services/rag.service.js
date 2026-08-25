const File = require("../models/File");
const { AI_BASE_URL, AI_CHAT_MODEL } = require("../config/ai");
const { embedText } = require("./embedding.service");
const { findRelevantChunks } = require("./retrieval.service");

function buildPrompt({ question, contextChunks, history }) {
  const contextBlock = contextChunks
    .map((chunk, index) => `Source ${index + 1}:\n${chunk.text}`)
    .join("\n\n");

  const historyBlock = history
    .slice(-6)
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n");

  return [
    "You are DocuRAG, a helpful assistant that answers only from provided context.",
    "If context is insufficient, clearly say so.",
    "Cite source numbers when possible.",
    "",
    "Conversation history:",
    historyBlock || "(none)",
    "",
    "Context:",
    contextBlock || "(none)",
    "",
    `Question: ${question}`,
  ].join("\n");
}

async function generateAnswer(prompt) {
  const response = await fetch(`${AI_BASE_URL}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: AI_CHAT_MODEL,
      prompt,
      stream: false,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`LLM request failed: ${response.status} ${message}`);
  }

  const payload = await response.json();
  return payload.response || "I could not generate an answer.";
}

async function answerQuestion({ userId, question, documentIds = [], conversationMessages = [] }) {
  const documents = await File.find({
    ownerId: userId,
    _id: { $in: documentIds },
  })
    .select("_id originalName processingStatus")
    .lean();

  const allowedDocumentIds = documents
    .filter((doc) => doc.processingStatus === "INDEXED")
    .map((doc) => doc._id);

  if (allowedDocumentIds.length === 0) {
    return {
      answer: "No indexed documents are available for this question yet.",
      sources: [],
    };
  }

  const queryEmbedding = await embedText(question);
  const chunks = await findRelevantChunks({
    ownerId: userId,
    documentIds: allowedDocumentIds,
    queryEmbedding,
    limit: 5,
  });

  const prompt = buildPrompt({
    question,
    contextChunks: chunks,
    history: conversationMessages,
  });

  const answer = await generateAnswer(prompt);

  const sourceDocumentMap = new Map(documents.map((doc) => [doc._id.toString(), doc.originalName]));
  const sources = chunks.map((chunk) => ({
    documentId: chunk.documentId,
    document: sourceDocumentMap.get(chunk.documentId.toString()) || "Unknown",
    chunkIndex: chunk.chunkIndex,
    score: Number(chunk.score.toFixed(4)),
  }));

  return {
    answer,
    sources,
  };
}

module.exports = {
  answerQuestion,
  buildPrompt,
};
