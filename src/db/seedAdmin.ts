import dotenv from "dotenv";

dotenv.config();

import bcrypt from "bcrypt";
import { db } from "./knex";

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const firstName = process.env.ADMIN_FIRST_NAME ?? "Admin";

  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await db("users")
    .insert({
      first_name: firstName,
      email,
      password_hash: passwordHash,
      role: "admin",
      status: "active",
    })
    .onConflict("email")
    .merge({ password_hash: passwordHash, role: "admin", status: "active" })
    .returning("id");

  console.log(`Admin user seeded: ${email} (id: ${user.id})`);

  await db.destroy();
}

seedAdmin();
