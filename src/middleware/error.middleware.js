function notFoundHandler(req, res) {
  res.status(404).render("error", {
    message: "Page not found",
    statusCode: 404,
  });
}

function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal server error";

  return res.status(statusCode).render("error", {
    message,
    statusCode,
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
