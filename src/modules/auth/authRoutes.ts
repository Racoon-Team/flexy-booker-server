import { Router } from "express";
import * as authController from "./authController";

const router = Router();

router.post("/register", authController.signUp);
router.post("/login", authController.signIn);
router.post("/logout", authController.signOut);

export default router;