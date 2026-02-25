import dotenv from "dotenv";
import app from "./app";
import { pool } from "./db";

dotenv.config();

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await pool.query("SELECT 1");
    console.log("Database ready");

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("DB connection error:", error);
  }
}

startServer();