import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError";
import { logger } from "../config/logger";

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  logger.error("Unhandled error", { error: err });

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: string }).code === "23505"
  ) {
    return res.status(409).json({
      success: false,
      message: "A record with that value already exists",
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
};
