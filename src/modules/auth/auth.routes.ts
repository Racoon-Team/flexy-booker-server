import { Router } from "express";
import { requireAuth } from "../../middleware/authMiddleware";
import * as authController from "./auth.controller";

const router = Router();

router.post("/register", authController.signUp);
router.post("/login", authController.signIn);
router.post("/logout", requireAuth, authController.signOut);

export default router;
