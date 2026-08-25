const jwt = require("jsonwebtoken");
const { AUTH_COOKIE_NAME, JWT_SECRET } = require("../config/auth");
const User = require("../models/User");

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies ? req.cookies[AUTH_COOKIE_NAME] : null;
    const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7) : null;
    const token = bearerToken || cookieToken;

    const expectsJson = req.path.startsWith("/api/") || req.headers.accept === "application/json";

    if (!token) {
      if (expectsJson) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      return res.status(401).redirect("/login");
    }

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.sub).lean();

    if (!user) {
      if (expectsJson) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      return res.status(401).redirect("/login");
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
    };

    res.locals.currentUser = req.user;
    return next();
  } catch (error) {
    const expectsJson = req.path.startsWith("/api/") || req.headers.accept === "application/json";
    if (expectsJson) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    return res.status(401).redirect("/login");
  }
}

function optionalAuth(req, res, next) {
  const token = req.cookies ? req.cookies[AUTH_COOKIE_NAME] : null;
  if (!token) {
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
    res.locals.currentUser = req.user;
  } catch (error) {
    res.clearCookie(AUTH_COOKIE_NAME);
  }

  return next();
}

module.exports = {
  requireAuth,
  optionalAuth,
};
