import { Router } from "express";
import { getServices } from "./servicesController";

const router = Router();

router.get("/", getServices);

export default router;