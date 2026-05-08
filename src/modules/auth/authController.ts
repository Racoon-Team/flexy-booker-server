import { Request, Response, NextFunction } from "express";
import { JwtPayload } from "jsonwebtoken";
import * as authService from "./authServices";

export const signUp = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.signUp(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const signIn = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.signIn(req.body);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const signOut = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user as JwtPayload;
    await authService.signOut(userId);
    res.status(200).json({ message: "Successfully logged out" });
  } catch (error) {
    next(error);
  }
};
