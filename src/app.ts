import cors from "cors";
import express, { Application, Request, Response } from "express";


import todoRoutes from "./modules/todo/todo.routes";
import userRoutes from "./modules/users/usersRoutes";
import authRoutes from "./modules/auth/authRoutes";
import servicesRoutes from "./modules/services/servicesRoutes";
import { dbReady } from "./server";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use((req: Request, res: Response, next) => {
  if (!dbReady) {
    return res.status(500).json({
      message: "Database not ready",
    });
  }
  next();
});

app.use("/api", todoRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/services", servicesRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Flexy Booker API running" });
});

export default app;