const DocumentChunk = require("../models/DocumentChunk");

function cosineSimilarity(a, b) {
  if (!a.length || !b.length || a.length !== b.length) {
    return -1;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return -1;
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function findRelevantChunks({ ownerId, documentIds = [], queryEmbedding, limit = 5 }) {
  const filter = {
    ownerId,
  };

  if (documentIds.length > 0) {
    filter.documentId = { $in: documentIds };
  }

  const candidates = await DocumentChunk.find(filter)
    .select("documentId chunkIndex text embedding metadata")
    .lean();

  const scored = candidates
    .map((candidate) => ({
      ...candidate,
      score: cosineSimilarity(queryEmbedding, candidate.embedding || []),
    }))
    .filter((candidate) => candidate.score >= 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

module.exports = {
  cosineSimilarity,
  findRelevantChunks,
};
