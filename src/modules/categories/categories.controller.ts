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

export const archiveCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as { id: string };

    const result = await categoriesService.archiveCategory(id);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
export const unarchiveCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as { id: string };

    const result = await categoriesService.unarchiveCategory(id);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const searchCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const q = req.query.q as string;
    const limit = req.query.limit ? Number(req.query.limit) : 20;

    const results = await categoriesService.searchCategories(q, limit);
    return res.json(results);
  } catch (error) {
    next(error);
  }
};

export const addTagToCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categoryId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const name = Array.isArray(req.body.name)
      ? req.body.name[0]
      : req.body.name;

    const result = await categoriesService.addTagToCategory(categoryId, name);

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
export const removeTagFromCategory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categoryId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    const tagId = Array.isArray(req.params.tag_id)
      ? req.params.tag_id[0]
      : req.params.tag_id;

    await categoriesService.removeTagFromCategory(categoryId, tagId);

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const searchTags = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const query = String(req.query.query ?? "");
    const limit = Number(req.query.limit ?? 10);

    const result = await categoriesService.searchTags(query, limit);

    return res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getCategoryStats = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params as { id: string };

    const stats = await categoriesService.getCategoryStats(id);

    return res.json(stats);
  } catch (error) {
    next(error);
  }
};
