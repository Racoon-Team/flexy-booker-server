import * as servicesRepository from "./servicesRepository";

export const getServices = async () => {
  const result = await servicesRepository.getServices();
  return result.rows;
};