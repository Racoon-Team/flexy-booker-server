import { Router } from "express";
import * as userController from "./usersController";

const router = Router();

router.post("/sign-up", userController.signUp);
router.post("/sign-in", userController.signIn);
router.post("/sign-out", userController.signOut)
export default router;