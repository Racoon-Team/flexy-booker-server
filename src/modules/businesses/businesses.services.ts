import { AppError } from "../../utils/AppError";
import * as businessesRepository from "./businesses.repository";

export const getMyBusiness = async (userId: string) => {
  const business = await businessesRepository.findBusinessByUserId(userId);

  if (!business) {
    throw new AppError("Business not found for this user", 404);
  }

  return business;
};
