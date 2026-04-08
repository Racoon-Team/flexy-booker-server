import { Request, Response } from "express";
import * as serviceServices from "./serviceServices";

export const createService = async (req: Request, res: Response) => {
  try {
    const service = await serviceServices.createService(req.body);
    res.status(201).json(service);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    res.status(400).json({ message });
  }
};
