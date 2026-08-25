const app = require("./app");
const { connectDatabase } = require("./config/database");

const port = process.env.PORT || 3000;

async function startServer() {
  await connectDatabase();
  app.listen(port, () => {
    console.log(`DocuRAG listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
