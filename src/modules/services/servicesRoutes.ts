import { Router } from "express";
import { requireAuth } from "../../middleware/authMiddleware";
import * as servicesController from "./servicesController";

const router = Router();

router.get("/", servicesController.getServices);
router.post("/", requireAuth, servicesController.createService);
router.put("/:id", requireAuth, servicesController.updateService);
router.delete("/:id", requireAuth, servicesController.deleteService);

export default router;
