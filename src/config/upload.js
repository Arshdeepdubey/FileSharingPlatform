const multer = require("multer");
const path = require("path");

const uploadDirectory = path.join(process.cwd(), "uploads");

const upload = multer({
  dest: uploadDirectory,
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

module.exports = {
  upload,
};
