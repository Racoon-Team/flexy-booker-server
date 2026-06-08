import { Router } from "express";
import { apiLimiter } from "../../middleware/rateLimiter";
import * as categoriesController from "./categories.controller";

const router = Router();

router.get("/tree", apiLimiter, categoriesController.getCategoriesTree);
router.get("/search", apiLimiter, categoriesController.searchCategories);
router.get("/:id", apiLimiter, categoriesController.getCategoryById);
router.post("/", apiLimiter, categoriesController.createCategory);
router.patch("/:id", apiLimiter, categoriesController.updateCategory);
router.patch("/:id/archive", apiLimiter, categoriesController.archiveCategory);
router.patch(
  "/:id/unarchive",
  apiLimiter,
  categoriesController.unarchiveCategory,
);

export default router;
