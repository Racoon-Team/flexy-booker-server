import { NextFunction, Request, Response } from "express";
import * as categoriesService from "./categories.services";

export const getCategoriesTree = async (req: Request, res: Response) => {
  const includeArchived = req.query.include_archived === "true";
  const categories = await categoriesService.getCategoriesTree(includeArchived);
  return res.status(200).json(categories);
};

export const getCategoryById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as { id: string };
    const category = await categoriesService.getCategoryById(id);
    res.json(category);
  } catch (error) {
    next(error);
  }
};
export const createCategory = async (req: Request, res: Response) => {
  const category = await categoriesService.createCategory(req.body);

  return res.status(201).json(category);
};

export const updateCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as { id: string };
    const updated = await categoriesService.updateCategory(id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};
