const assert = require("node:assert/strict");
const test = require("node:test");

const { chunkText } = require("../src/services/chunking.service");
const { cosineSimilarity } = require("../src/services/retrieval.service");
const { buildPrompt } = require("../src/services/rag.service");

test("chunkText normalizes whitespace and removes null characters", () => {
  const chunks = chunkText(" first\r\nsecond\tvalue\u0000 ", {
    maxChunkLength: 100,
    overlap: 0,
  });

  assert.deepEqual(chunks, [{ chunkIndex: 0, text: "first\nsecond value" }]);
});

test("chunkText creates overlapping chunks with stable indexes", () => {
  const chunks = chunkText("abcdefghij", { maxChunkLength: 6, overlap: 2 });

  assert.deepEqual(chunks, [
    { chunkIndex: 0, text: "abcdef" },
    { chunkIndex: 1, text: "efghij" },
  ]);
});

test("chunkText returns no chunks for empty input", () => {
  assert.deepEqual(chunkText("   "), []);
});

test("chunkText rejects invalid chunk configuration", () => {
  assert.throws(() => chunkText("content", { maxChunkLength: 0 }), /positive integer/);
  assert.throws(() => chunkText("content", { maxChunkLength: 10, overlap: 10 }), /overlap/);
});

test("cosineSimilarity handles matching, orthogonal, and invalid vectors", () => {
  assert.equal(cosineSimilarity([1, 0], [1, 0]), 1);
  assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
  assert.equal(cosineSimilarity([0, 0], [1, 0]), -1);
  assert.equal(cosineSimilarity([1], [1, 0]), -1);
});

test("buildPrompt includes context and only the latest six history messages", () => {
  const history = Array.from({ length: 7 }, (_, index) => ({
    role: index % 2 === 0 ? "user" : "assistant",
    content: `message-${index}`,
  }));

  const prompt = buildPrompt({
    question: "What is the answer?",
    contextChunks: [{ text: "The answer is Cedar Lantern." }],
    history,
  });

  assert.match(prompt, /Source 1:\nThe answer is Cedar Lantern\./);
  assert.match(prompt, /message-1/);
  assert.doesNotMatch(prompt, /message-0/);
  assert.match(prompt, /Question: What is the answer\?/);
});