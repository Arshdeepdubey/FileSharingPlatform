function normalizeText(input) {
  return input.replace(/\r\n/g, "\n").replace(/\t/g, " ").replace(/\u0000/g, "").trim();
}

function chunkText(rawText, options = {}) {
  const maxChunkLength = options.maxChunkLength ?? 1200;
  const overlap = options.overlap ?? 200;

  if (!Number.isInteger(maxChunkLength) || maxChunkLength <= 0) {
    throw new Error("maxChunkLength must be a positive integer");
  }

  if (!Number.isInteger(overlap) || overlap < 0 || overlap >= maxChunkLength) {
    throw new Error("overlap must be an integer from 0 up to maxChunkLength - 1");
  }

  const text = normalizeText(rawText);

  if (!text) {
    return [];
  }

  const chunks = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < text.length) {
    const end = Math.min(start + maxChunkLength, text.length);
    const chunkTextValue = text.slice(start, end).trim();

    if (chunkTextValue) {
      chunks.push({
        chunkIndex,
        text: chunkTextValue,
      });
      chunkIndex += 1;
    }

    if (end >= text.length) {
      break;
    }

    start = Math.max(0, end - overlap);
  }

  return chunks;
}

module.exports = {
  chunkText,
};
