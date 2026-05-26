import * as businessesRepository from "./businessesRepository";
import { AppError } from "../../utils/AppError";

export const getMyBusiness = async (userId: string) => {
  const business = await businessesRepository.findBusinessByUserId(userId);

  if (!business) {
    throw new AppError("Business not found for this user", 404);
  }

  return business;
};
