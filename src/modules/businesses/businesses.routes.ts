import { Router } from "express";
import { getMyBusiness } from "./businesses.controller";

const router = Router();

router.get("/me", getMyBusiness);

export default router;
