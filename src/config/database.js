const mongoose = require("mongoose");

async function connectDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not set");
  }

  await mongoose.connect(databaseUrl);
}

module.exports = {
  connectDatabase,
};
