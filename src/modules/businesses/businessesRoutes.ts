import { Router } from "express";
import { getMyBusiness } from "./businessesController";

const router = Router();

router.get("/user/:userId", getMyBusiness);

export default router;
