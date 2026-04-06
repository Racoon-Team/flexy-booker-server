import { db } from "../../db/knex";

export const getServices = async () => {
  const rows = await db("services")
    .select("id", "name", "description", "date", "time")
    .orderBy("id");

  return { rows };
};