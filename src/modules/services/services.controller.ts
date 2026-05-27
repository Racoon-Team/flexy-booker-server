import { NextFunction, Request, Response } from "express";
import * as service from "./services.services";

export const getServices = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const search = req.query.search as string;

    const servicios = await service.getServices(search);

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

export const updateService = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const updated = await service.updateService(Number(id), req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};
