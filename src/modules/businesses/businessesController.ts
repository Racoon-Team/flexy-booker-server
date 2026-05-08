import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import * as businessesServices from "./businessesServices";

export const getMyBusiness = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user as JwtPayload;

    const business = await businessesServices.getMyBusiness(userId);
    res.status(200).json(business);
  } catch (error) {
    next(error);
  }
};
