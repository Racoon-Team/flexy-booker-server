import { Router } from "express";
import { requireAuth } from "../../middleware/authMiddleware";
import { authLimiter } from "../../middleware/rateLimiter";
import * as authController from "./auth.controller";

const router = Router();

router.post("/register", authLimiter, authController.signUp);
router.post("/login", authLimiter, authController.signIn);
router.post("/logout", authLimiter, requireAuth, authController.signOut);

export default router;
