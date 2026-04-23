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
  if (!data.name || data.name.trim() === "") {
    throw new Error("Service name is required");
  }

  if (!data.schedule || data.schedule.length === 0) {
    throw new Error("At least one schedule slot is required");
  }

  return await servicesRepository.createService(data);
};
