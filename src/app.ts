import cors from "cors";
import express, { Application, Request, Response } from "express";

import todoRoutes from "./modules/todo/todo.routes";
import userRoutes from "./modules/users/usersRoutes";
import authRoutes from "./modules/auth/authRoutes";
import servicesRoutes from "./modules/services/servicesRoutes";
import { dbReady } from "./server";
import businessesRoutes from "./modules/businesses/businessesRoutes";
import { requireAuth } from "./middleware/authMiddleware";
import { AppError } from "./utils/AppError";
import { errorHandler } from "./middleware/errorHandler";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use((req: Request, res: Response, next) => {
  if (!dbReady) {
    return next(new AppError("Database not ready", 500));
  }
  next();
});

app.use("/api", todoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/businesses", businessesRoutes);
app.use("/api/services", requireAuth, servicesRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Flexy Booker API running" });
});

app.use((req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

app.use(errorHandler);
export default app;
