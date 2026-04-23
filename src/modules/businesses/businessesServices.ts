import * as businessesRepository from "./businessesRepository";

export const getMyBusiness = async (userId: number) => {
  const business = await businessesRepository.findBusinessByUserId(userId);

  if (!business) {
    throw new Error("Business not found for this user");
  }

  return business;
};
