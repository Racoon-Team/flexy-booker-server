import { Request, Response, NextFunction } from "express";
import * as usersService from "./users.services";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const {
      first_name,
      last_name,
      email,
      role,
      phone,
      verified = false,
      sendWelcomeEmail = false,
    } = req.body;

    if (!first_name || !email || !role) {
      return res.status(400).json({
        message: "first_name, email and role are required",
      });
    }

    const user = await usersService.createUser({
      first_name,
      last_name,
      email,
      role,
      phone,
      verified,
      sendWelcomeEmail,
      adminId: req.user!.userId,
      ipAddress: req.ip || "unknown",
    });

    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};
