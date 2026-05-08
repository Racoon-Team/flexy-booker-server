import { Router } from "express";
import * as authController from "./authController";
import { requireAuth } from "../../middleware/authMiddleware";

const router = Router();

router.post("/register", authController.signUp);
router.post("/login", authController.signIn);
router.post("/logout", requireAuth, authController.signOut);

export default router;