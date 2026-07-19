import { Router } from "express";
import { createUser } from "./users.controller";
import { requireAdmin, requireAuth } from "../../middleware/authMiddleware";

const router = Router();
router.post("/create", requireAuth, requireAdmin, createUser);

export default router;
