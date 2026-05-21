import dotenv from "dotenv";

dotenv.config();

import app from "./app";
import { db } from "./db/knex";
import { setDbReady } from "./db/dbState";
import { logger } from "./config/logger";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await db.raw("SELECT 1");
    setDbReady(true);
    logger.info("Database connected");

    app.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    logger.error("Failed to connect to database", { error });
    await db.destroy();
    process.exit(1);
  }
}

startServer();