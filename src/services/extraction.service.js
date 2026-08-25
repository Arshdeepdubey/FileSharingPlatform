const fs = require("fs/promises");
const path = require("path");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

async function extractText(file) {
  const extension = path.extname(file.originalName || "").toLowerCase();
  const buffer = await fs.readFile(file.path);

  if (extension === ".txt" || file.mimeType === "text/plain") {
    return {
      text: buffer.toString("utf8"),
      metadata: {
        sourceType: "txt",
      },
    };
  }

  if (extension === ".pdf" || file.mimeType === "application/pdf") {
    const parsed = await pdfParse(buffer);
    return {
      text: parsed.text || "",
      metadata: {
        sourceType: "pdf",
        pages: parsed.numpages,
      },
    };
  }

  if (
    extension === ".docx" ||
    file.mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return {
      text: result.value || "",
      metadata: {
        sourceType: "docx",
      },
    };
  }

  return {
    text: buffer.toString("utf8"),
    metadata: {
      sourceType: "fallback",
      warning: "Unsupported type parsed as utf8",
    },
  };
}

module.exports = {
  extractText,
};
