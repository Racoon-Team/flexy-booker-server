import { Router } from "express";
import * as serviceController from "./serviceController";

const router = Router();

router.post("/create", serviceController.createService);

export default router;
