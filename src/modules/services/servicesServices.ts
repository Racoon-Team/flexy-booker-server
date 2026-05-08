import * as servicesRepository from "./servicesRepository";
import * as businessesRepository from "../businesses/businessesRepository";

export const getServices = async (userId: number) => {
  const business = await businessesRepository.findBusinessByUserId(userId);

  if (!business) {
    throw new Error("No business found for this user");
  }

  const result = await servicesRepository.getServices(business.id);
  return result.rows;
};

export const deleteService = async (id: number) => {
  await servicesRepository.deleteService(id);
};

export const updateService = async (
  id: number,
  data: {
    name: string;
    description?: string;
    price?: number;
    schedule: string[];
  },
) => {
  if (!data.name || data.name.trim() === "") {
    throw new Error("Service name is required");
  }

  if (!data.schedule || data.schedule.length === 0) {
    throw new Error("At least one schedule slot is required");
  }

  if (data.price !== undefined && data.price <= 0) {
    throw new Error("Too small: expected number to be >0");
  }

  return await servicesRepository.updateService(id, data);
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
