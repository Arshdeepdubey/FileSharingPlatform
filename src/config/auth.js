const developmentSecret = "dev-secret-change-me";
const JWT_SECRET = process.env.JWT_SECRET || developmentSecret;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
const AUTH_COOKIE_NAME = "docurag_token";

if (process.env.NODE_ENV === "production" && JWT_SECRET === developmentSecret) {
  throw new Error("JWT_SECRET must be set to a private value in production");
}

module.exports = {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  AUTH_COOKIE_NAME,
};
