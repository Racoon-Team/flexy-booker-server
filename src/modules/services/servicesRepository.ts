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
      "created_at",
    )
    .orderBy("id");

  return { rows };
};

export const deleteService = async (id: number) => {
  await db("services").where({ id }).del();
};

export const createService = async (data: {
  business_id: number;
  name: string;
  description?: string;
  price?: number;
  schedule: string[];
  custom_fields?: object[];
}) => {
  const [newService] = await db("services")
    .insert({
      ...data,
      custom_fields: data.custom_fields
        ? JSON.stringify(data.custom_fields)
        : JSON.stringify([]),
    })
    .returning([
      "id",
      "business_id",
      "name",
      "description",
      "price",
      "schedule",
      "is_active",
      "custom_fields",
      "created_at",
    ]);

  return newService;
};
