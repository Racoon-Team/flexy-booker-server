import { db } from "../../db/knex";

export const findBusinessByUserId = async (userId: number) => {
  const rows = await db("businesses")
    .select("id", "user_id", "business_name", "category", "description")
    .where("user_id", userId)
    .first();

  return rows;
};
