const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { AUTH_COOKIE_NAME, JWT_EXPIRES_IN, JWT_SECRET } = require("../config/auth");

function renderLogin(req, res) {
  if (req.user) {
    return res.redirect("/");
  }

  return res.render("login", {
    error: null,
  });
}

function renderRegister(req, res) {
  if (req.user) {
    return res.redirect("/");
  }

  return res.render("register", {
    error: null,
  });
}

async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).render("register", { error: "Name, email, and password are required." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() }).lean();
    if (existingUser) {
      return res.status(409).render("register", { error: "An account with this email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ name, email: email.toLowerCase(), passwordHash });

    return res.redirect("/login");
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).render("login", { error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).render("login", { error: "Invalid credentials." });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).render("login", { error: "Invalid credentials." });
    }

    const token = jwt.sign(
      {
        sub: user._id.toString(),
        email: user.email,
        name: user.name,
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );

    res.cookie(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.redirect("/");
  } catch (error) {
    return next(error);
  }
}

function logout(req, res) {
  res.clearCookie(AUTH_COOKIE_NAME);
  return res.redirect("/login");
}

module.exports = {
  renderLogin,
  renderRegister,
  register,
  login,
  logout,
};
