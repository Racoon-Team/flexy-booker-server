import { Router } from "express";
import { apiLimiter } from "../../middleware/rateLimiter";
import * as categoriesController from "./categories.controller";

const router = Router();

router.get("/tree", apiLimiter, categoriesController.getCategoriesTree);

export default router;
