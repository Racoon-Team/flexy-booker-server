import { Request, Response, NextFunction } from "express";
import * as service from "./servicesServices";

export const getServices = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const servicios = await service.getServices();
    res.json(servicios);
  } catch (error) {
    next(error);
  }
};

export const deleteService = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    await service.deleteService(Number(id));
    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const createService = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const newService = await service.createService(req.body);
    res.status(201).json(newService);
  } catch (error) {
    next(error);
  }
};
