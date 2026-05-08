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

  const [user] = await db("users")
    .insert({
      name: "Admin",
      email,
      password: hashedPassword,
      user_type: "empresa",
      address: "N/A",
      phone_number: "00000000",
    })
    .onConflict("email")
    .merge({ password: hashedPassword })
    .returning("id");

  console.log(`Admin user seeded: ${email}`);

  let business = await db("businesses").where({ user_id: user.id }).first();

  if (!business) {
    [business] = await db("businesses")
      .insert({
        user_id: user.id,
        business_name: "Demo Business",
        category: "General",
        description: "Seeded demo business",
      })
      .returning("id");

    console.log(`Business seeded for user ${user.id}`);
  }

  const existingServices = await db("services")
    .where({ business_id: business.id })
    .count("id as count")
    .first();

  if (Number(existingServices?.count) === 0) {
    await db("services").insert([
      {
        business_id: business.id,
        name: "Service A",
        description: "Demo service A",
        price: 100,
        schedule: ["Monday", "Wednesday", "Friday"],
      },
      {
        business_id: business.id,
        name: "Service B",
        description: "Demo service B",
        price: 200,
        schedule: ["Tuesday", "Thursday"],
      },
    ]);

    console.log(`Services seeded for business ${business.id}`);
  }

  await db.destroy();
}

seedAdmin();
