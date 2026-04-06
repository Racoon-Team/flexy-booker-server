import { Request, Response } from "express";
import * as service from "./servicesServices";

export const getServices = async (req: Request, res: Response) => {
  try {
    const servicios = await service.getServices();
    res.json(servicios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error getting services" });
  }
};

