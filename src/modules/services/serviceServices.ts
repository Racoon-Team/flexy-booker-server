import * as serviceRepository from "./serviceRepository";
import { CreateServiceDTO } from "./serviceModel";

export const createService = async (data: CreateServiceDTO) => {
  if (!data.name) {
    throw new Error("Service name is required");
  }

  if (!data.businessId) {
    throw new Error("Business ID is required");
  }

  const result = await serviceRepository.createService(data);
  const service = result.rows[0];

  return service;
};
