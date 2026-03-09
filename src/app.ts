import cors from "cors";
import express, { Application, Request, Response } from "express";
import todoRoutes from "./modules/todo/todo.routes";
import authRouter from "./routes/auth";


const app: Application = express();

app.use(cors());
app.use(express.json());

app.use("/api", todoRoutes);

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Flexy Booker API running" });
});

app.use("/api/auth", authRouter);

export default app;

