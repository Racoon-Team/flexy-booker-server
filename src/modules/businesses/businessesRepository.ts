import { db } from "../../db/knex";

export const findBusinessByUserId = async (userId: string) => {
  const rows = await db("businesses")
    .select("id", "owner_id", "name", "description", "status")
    .where("owner_id", userId)
    .first();

  return rows;
};
