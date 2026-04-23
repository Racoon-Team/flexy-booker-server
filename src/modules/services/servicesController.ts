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

export const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await service.deleteService(Number(id));
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    console.error("Error in deleteService:", error);
    res.status(500).json({ error: "Error deleting service" });
  }
};

export const createService = async (req: Request, res: Response) => {
  try {
    const newService = await service.createService(req.body);
    res.status(201).json(newService);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    res.status(400).json({ message });
  }
};
