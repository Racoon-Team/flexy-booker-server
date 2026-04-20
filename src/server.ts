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


    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });

  } catch (error) {
    console.error("Database not ready:", error);
     await db.destroy();
    process.exit(1); 
  }
}

export { dbReady };
startServer();