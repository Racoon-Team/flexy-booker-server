import { Router } from "express";
import { requireAuth } from "../../middleware/authMiddleware";
import { apiLimiter } from "../../middleware/rateLimiter";
import * as servicesController from "./services.controller";

const router = Router();

router.get("/", apiLimiter, servicesController.getServices);
router.post("/", apiLimiter, requireAuth, servicesController.createService);
router.put("/:id", apiLimiter, requireAuth, servicesController.updateService);
router.delete("/:id", apiLimiter, requireAuth, servicesController.deleteService);

export default router;
