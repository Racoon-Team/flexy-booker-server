import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AppError } from "../utils/AppError";
import { db } from "../db/knex";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Unauthorized - No token", 401));
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    const user = await db("users")
      .where({ id: decoded.userId })
      .select("session_token")
      .first();

    if (!user || user.session_token !== token) {
      return next(new AppError("Unauthorized - Session expired", 401));
    }

    req.user = decoded;

    next();
  } catch (err) {
    next(new AppError("Unauthorized - Invalid token", 401));
  }
};