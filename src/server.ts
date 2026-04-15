import dotenv from "dotenv";
import app from "./app";
import { db } from "./db/knex";

dotenv.config();

const PORT = process.env.PORT || 3000;

let dbReady = false;

async function startServer() {
  try {
    await db.raw("SELECT 1");
    dbReady = true;
    console.log("Database ready");
  } catch (error) {
    console.error("Database not ready:", error);
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

export { dbReady };
startServer();