const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    path: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    processingStatus: {
      type: String,
      enum: ["UPLOADED", "PROCESSING", "INDEXED", "FAILED"],
      default: "UPLOADED",
      index: true,
    },
    processingError: {
      type: String,
      default: null,
    },
    downloadCount: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("File", FileSchema);
