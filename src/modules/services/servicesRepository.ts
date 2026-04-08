import { db } from "../../db/knex";

export const getServices = async () => {
  const rows = await db("services")
    .select(
      "id",
      "business_id",
      "name",
      "description",
      "price",
      "schedule",
      "is_active",
      "custom_fields",
      "created_at"
    )
    .orderBy("id");

 return rows;
};