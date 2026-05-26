import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AppError } from "../utils/AppError";
import { logger } from "../config/logger";
import { findValidSession } from "../modules/users/usersRepository";

export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("Auth rejected: no token", { url: req.originalUrl });
      return next(new AppError("Unauthorized - No token", 401));
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    const session = await findValidSession(decoded.userId, token);

    if (!session) {
      logger.warn("Auth rejected: session expired", { userId: decoded.userId, url: req.originalUrl });
      return next(new AppError("Unauthorized - Session expired", 401));
    }

    req.user = decoded;

    next();
  } catch {
    logger.warn("Auth rejected: invalid token", { url: req.originalUrl });
    next(new AppError("Unauthorized - Invalid token", 401));
  }
};
