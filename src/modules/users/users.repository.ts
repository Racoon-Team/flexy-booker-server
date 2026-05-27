import crypto from "crypto";
import { db } from "../../db/knex";
import { CreateUserParams } from "./users.model";

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

export const createUser = async (data: CreateUserParams) => {
  const rows = await db("users")
    .insert({
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      password_hash: data.passwordHash,
      role: data.role ?? "client",
      phone: data.phone,
    })
    .returning(["id", "first_name", "last_name", "email", "role"]);

  return { rows };
};

export const findUserByEmail = async (email: string) => {
  const rows = await db("users").where({ email }).select("*");
  return { rows };
};

export const createSession = async (
  userId: string,
  token: string,
  expiresAt: Date,
) => {
  await db("sessions")
    .where({ user_id: userId })
    .whereNull("revoked_at")
    .update({ revoked_at: db.fn.now() });

  await db("sessions").insert({
    user_id: userId,
    token_hash: hashToken(token),
    expires_at: expiresAt,
  });
};

export const revokeAllSessions = async (userId: string) => {
  await db("sessions")
    .where({ user_id: userId })
    .whereNull("revoked_at")
    .update({ revoked_at: db.fn.now() });
};

export const findValidSession = async (userId: string, token: string) => {
  return db("sessions")
    .where({ user_id: userId, token_hash: hashToken(token) })
    .whereNull("revoked_at")
    .where("expires_at", ">", db.fn.now())
    .first();
};
