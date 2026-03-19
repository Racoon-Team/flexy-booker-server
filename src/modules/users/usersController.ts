import { Request, Response } from "express";
import * as userService from "./userServices";

export const signUp = async (req: Request, res: Response) => {
      console.log("Body recibido:", req.body); 
  try {
    const user = await userService.signUp(req.body);

    res.status(201).json({
      token: "faketoken",
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unknown error" });
    }
  }
};

export const signIn = async (req: Request, res: Response) => {
  try {
    const user = await userService.signIn(req.body);

    res.status(200).json({
      token: "faketoken",
      user: {
        userName: user.name,
        email: user.email,
      },
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(401).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Unknown error" });
    }
  }
};

export const signOut = async (req: Request, res: Response) => {
    try {
        res.status(200).json({message:"Logged out successfully"});

    }catch{
        res.status(500).json({message:"Logout error"});
    }
};