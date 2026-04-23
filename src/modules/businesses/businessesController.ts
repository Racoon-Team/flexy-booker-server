import { Request, Response } from "express";
import * as businessesServices from "./businessesServices";

export const getMyBusiness = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);

    const business = await businessesServices.getMyBusiness(userId);
    res.status(200).json(business);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    res.status(404).json({ message });
  }
};
