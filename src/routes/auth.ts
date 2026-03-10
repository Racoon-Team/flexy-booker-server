import bcrypt from "bcrypt";
import { Router, Request, Response } from "express";
import { pool } from "../db";

const router = Router();

router.post("/sign-up", async (req: Request, res: Response) => {
  try {
   const { userName, email, password, address, phoneNumber, userType } = req.body;

const finalUserType = userType || "cliente";

    if (!userName || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (name, email, password, user_type, address,phone_number)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email
    `;

    const values = [
      userName,
      email,
      hashedPassword,
      finalUserType,
      address,
      phoneNumber,
    ];
    const result = await pool.query(query, values);

    const user = result.rows[0];

    res.status(201).json({
      token: "faketoken",
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/sign-in", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const query = "SELECT * FROM users WHERE email = $1";
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    res.status(200).json({
      token: "faketoken",
      user: {
        userName: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
