const File = require("../models/File");
const DocumentChunk = require("../models/DocumentChunk");
const { extractText } = require("./extraction.service");
const { chunkText } = require("./chunking.service");
const { embedText } = require("./embedding.service");

async function processDocument(documentId) {
  const file = await File.findById(documentId);
  if (!file) {
    return;
  }

  try {
    file.processingStatus = "PROCESSING";
    file.processingError = null;
    await file.save();

    const extracted = await extractText(file);
    const chunks = chunkText(extracted.text);

    if (chunks.length === 0) {
      throw new Error("No text could be extracted from document");
    }

    await DocumentChunk.deleteMany({ documentId: file._id });

    const chunksWithEmbeddings = await Promise.all(
      chunks.map(async (chunk) => {
        const embedding = await embedText(chunk.text);
        return {
          documentId: file._id,
          ownerId: file.ownerId,
          chunkIndex: chunk.chunkIndex,
          text: chunk.text,
          embedding,
          metadata: {
            ...(extracted.metadata || {}),
          },
        };
      })
    );

    await DocumentChunk.insertMany(chunksWithEmbeddings);

    file.processingStatus = "INDEXED";
    file.processingError = null;
    await file.save();
  } catch (error) {
    file.processingStatus = "FAILED";
    file.processingError = error.message;
    await file.save();
  }
}

function triggerDocumentProcessing(documentId) {
  setImmediate(async () => {
    try {
      await processDocument(documentId);
    } catch (error) {
      console.error(`Document processing failed for ${documentId}:`, error);
    }
  });
}

module.exports = {
  triggerDocumentProcessing,
  processDocument,
};

