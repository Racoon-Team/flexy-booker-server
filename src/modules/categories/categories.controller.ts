import { Request, Response } from "express";
import * as categoriesService from "./categories.services";

export const getCategoriesTree = async (req: Request, res: Response) => {
  const includeArchived = req.query.include_archived === "true";

  const categories = await categoriesService.getCategoriesTree(includeArchived);

  return res.status(200).json(categories);
};
