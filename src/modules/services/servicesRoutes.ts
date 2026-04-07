import { Router } from "express";
import * as servicesController from "./servicesController";

const router = Router();

router.get("/", servicesController.getServices);

router.delete("/:id", servicesController.deleteService);

export default router;