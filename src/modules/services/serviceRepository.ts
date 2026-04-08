import { db } from "../../db/knex";
import { CreateServiceDTO } from "./serviceModel";

export const createService = async (data: CreateServiceDTO) => {
  const rows = await db("services")
    .insert({
      business_id: data.businessId,
      name: data.name,
      description: data.description,
      price: data.price,
      schedule: data.schedule,
      custom_fields: data.customFields,
    })
    .returning(["id", "name", "description", "price", "schedule"]);

  return { rows };
};
