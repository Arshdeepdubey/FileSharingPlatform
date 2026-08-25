const File = require("../models/File");

async function getDocument(req, res, next) {
  try {
    const file = await File.findOne({ _id: req.params.id, ownerId: req.user.id }).lean();

    if (!file) {
      return res.status(404).render("error", {
        statusCode: 404,
        message: "Document not found.",
      });
    }

    return res.render("document", {
      file,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getDocument,
};
