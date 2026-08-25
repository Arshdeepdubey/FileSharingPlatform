const { AI_BASE_URL, AI_EMBEDDING_MODEL } = require("../config/ai");

async function embedText(input) {
  const response = await fetch(`${AI_BASE_URL}/api/embeddings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: AI_EMBEDDING_MODEL,
      prompt: input,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Embedding request failed: ${response.status} ${message}`);
  }

  const payload = await response.json();
  if (!payload.embedding || !Array.isArray(payload.embedding)) {
    throw new Error("Embedding response did not include a valid vector");
  }

  return payload.embedding;
}

module.exports = {
  embedText,
};
