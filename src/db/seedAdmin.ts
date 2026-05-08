import dotenv from "dotenv";

dotenv.config();

import bcrypt from "bcrypt";
import { db } from "./knex";

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await db("users")
    .insert({
      name: "Admin",
      email,
      password: hashedPassword,
      user_type: "empresa",
      address: "N/A",
      phone_number: "00000000",
    })
    .onConflict("email")
    .merge({ password: hashedPassword });

  console.log(`Admin user seeded: ${email}`);
  await db.destroy();
}

seedAdmin();
