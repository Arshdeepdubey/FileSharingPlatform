const express = require("express");
const { upload } = require("../config/upload");
const { requireAuth } = require("../middleware/auth.middleware");
const fileController = require("../controllers/file.controller");

const router = express.Router();

router.get("/", requireAuth, fileController.renderDashboard);
router.post("/upload", requireAuth, upload.single("file"), fileController.uploadFile);
router.get("/documents", requireAuth, fileController.listDocuments);
router.get("/documents/:id/download", requireAuth, fileController.downloadDocument);

module.exports = router;
