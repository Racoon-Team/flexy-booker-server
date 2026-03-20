import { pool } from "../../db";
import { CreateUserParams } from "./usersModel";

export const createUser = async (data: CreateUserParams) => {
  const query = `
    INSERT INTO users (name, email, password, user_type, address, phone_number)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, name, email
  `;

  const values = [
    data.name,
    data.email,
    data.password,
    data.userType,
    data.address,
    data.phoneNumber,
  ];

  return await pool.query(query, values);
};

export const findUserByEmail = async (email: string) => {
  const query = "SELECT * FROM users WHERE email = $1";
  return await pool.query(query, [email]);
};

export const updateSessionToken = async (
  userId: number,
  token: string | null,
) => {
  const query = "UPDATE users SET session_token = $1 WHERE id = $2";
  return await pool.query(query, [token, userId]);
};
