import * as servicesRepository from "./servicesRepository";

export const getServices = async () => {
  const result = await servicesRepository.getServices();
  return result.rows;
};

export const deleteService = async (id: number) => {
  await servicesRepository.deleteService(id);
};

export const createService = async (data: {
  business_id: number;
  name: string;
  description?: string;
  price?: number;
  schedule: string[];
  custom_fields?: object[];
}) => {
  if (!data.business_id) {
    throw new Error("Business ID is required");
  }

  if (!data.name || data.name.trim() === "") {
    throw new Error("Service name is required");
  }

  if (!data.schedule || data.schedule.length === 0) {
    throw new Error("At least one schedule slot is required");
  }

  if (data.price !== undefined && data.price <= 0) {
    throw new Error("Too small: expected number to be >0");
  }
  return await servicesRepository.createService(data);
};
