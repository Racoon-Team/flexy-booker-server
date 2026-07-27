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
      status: data.verified ? "active" : "pending",
      email_verified: data.verified,
    })
    .returning(["id", "first_name", "last_name", "email", "role", "status"]);

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

export const createAuditLog = async (data: {
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  before?: object | null;
  after?: object | null;
  ipAddress: string;
}) => {
  await db("audit_log").insert({
    admin_id: data.adminId,
    action: data.action,
    target_type: data.targetType,
    target_id: data.targetId,
    before: data.before ?? null,
    after: data.after ?? null,
    ip_address: data.ipAddress,
  });
};

export const getUsers = async () => {
  const rows = await db("users")
    .select(
      "id",
      "first_name",
      "last_name",
      "email",
      "role",
      "status",
      "created_at",
    )
    .orderBy("created_at", "desc");

  return { rows };
};
