import { Router } from "express";
import { createUser, getUsers } from "./users.controller";
import { requireAdmin, requireAuth } from "../../middleware/authMiddleware";


const router = Router();
router.get("/", requireAuth, requireAdmin, getUsers);
router.post("/create", requireAuth, requireAdmin, createUser);

export default router;
