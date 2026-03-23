import { Request, Response } from "express";
import * as authService from "./authServices";

export const signUp = async (req: Request, res: Response) => {
  try {
    const user = await authService.signUp(req.body);
    res.status(201).json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    res.status(400).json({ message });
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const user = await authService.signIn(req.body);
    res.status(200).json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    res.status(401).json({ message });
  }
};

export const signOut = async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    await authService.signOut(userId);
    res.status(200).json({ message: "Successfully logged out" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    res.status(400).json({ message });
  }
};