import { Router } from "express";
import rateLimit from "express-rate-limit";
import { requireAuth } from "../../middleware/authMiddleware";
import * as authController from "./auth.controller";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, authController.signUp);
router.post("/login", authLimiter, authController.signIn);
router.post("/logout", authLimiter, requireAuth, authController.signOut);

export default router;
