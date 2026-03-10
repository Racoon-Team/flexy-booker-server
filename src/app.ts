import express, { Application, Request, Response } from "express";
import cors from "cors";
import authRouter from "./routes/auth";

const app: Application = express();

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Flexy Booker API running" });
});

app.use("/api/auth", authRouter);

export default app;