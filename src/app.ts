import cors from "cors";
import express, { Application, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";

import { swaggerSpec } from "./config/swagger";
import { isDbReady } from "./db/dbState";
import { requireAuth } from "./middleware/authMiddleware";
import { errorHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimiter";
import { requestLogger } from "./middleware/requestLogger";
import authRoutes from "./modules/auth/auth.routes";
import businessesRoutes from "./modules/businesses/businesses.routes";
import servicesRoutes from "./modules/services/services.routes";
import todoRoutes from "./modules/todo/todo.routes";
import userRoutes from "./modules/users/users.routes";
import { AppError } from "./utils/AppError";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);

app.use((req: Request, res: Response, next) => {
  if (!isDbReady()) {
    return next(new AppError("Database not ready", 500));
  }
  next();
});

app.use("/api", todoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/businesses", apiLimiter, requireAuth, businessesRoutes);
app.use("/api/services", servicesRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Flexy Booker API running" });
});

app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);
export default app;
