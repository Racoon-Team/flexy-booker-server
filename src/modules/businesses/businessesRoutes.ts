import { Router } from "express";
import { getMyBusiness } from "./businessesController";

const router = Router();

router.get("/me", getMyBusiness);

export default router;
