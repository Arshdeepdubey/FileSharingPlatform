const path = require("path");
const File = require("../models/File");
const { triggerDocumentProcessing } = require("../services/document.service");

async function renderDashboard(req, res, next) {
  try {
    const files = await File.find({ ownerId: req.user.id }).sort({ createdAt: -1 }).lean();

    return res.render("index", {
      files,
      error: null,
    });
  } catch (error) {
    return next(error);
  }
}

async function uploadFile(req, res, next) {
  try {
    if (!req.file) {
      const files = await File.find({ ownerId: req.user.id }).sort({ createdAt: -1 }).lean();
      return res.status(400).render("index", {
        files,
        error: "Please select a file to upload.",
      });
    }

    const file = await File.create({
      ownerId: req.user.id,
      path: req.file.path,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype || "application/octet-stream",
      size: req.file.size,
      processingStatus: "UPLOADED",
    });

    triggerDocumentProcessing(file._id);

    return res.redirect("/");
  } catch (error) {
    return next(error);
  }
}

async function listDocuments(req, res, next) {
  try {
    const files = await File.find({ ownerId: req.user.id }).sort({ createdAt: -1 }).lean();

    return res.render("documents", {
      files,
    });
  } catch (error) {
    return next(error);
  }
}

async function downloadDocument(req, res, next) {
  try {
    const file = await File.findOne({ _id: req.params.id, ownerId: req.user.id });
    if (!file) {
      return res.status(404).render("error", {
        statusCode: 404,
        message: "Document not found.",
      });
    }

    file.downloadCount += 1;
    await file.save();

    return res.download(path.resolve(file.path), file.originalName);
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  renderDashboard,
  uploadFile,
  listDocuments,
  downloadDocument,
};
