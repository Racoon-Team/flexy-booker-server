import { Router } from "express";
import { apiLimiter } from "../../middleware/rateLimiter";
import { getMyBusiness } from "./businesses.controller";

const router = Router();

router.get("/me", apiLimiter, getMyBusiness);

export default router;
