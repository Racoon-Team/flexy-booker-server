import dotenv from "dotenv";

dotenv.config();

import app from "./app";
import { db } from "./db/knex";
import { setDbReady } from "./db/dbState";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await db.raw("SELECT 1");
    setDbReady(true);
    console.log("Database ready");


    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });

  } catch (error) {
    console.error("Database not ready:", error);
     await db.destroy();
    process.exit(1); 
  }
}

startServer();