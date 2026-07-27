import bcrypt from "bcrypt";
import crypto from "crypto";
import {
  createUser as createUserRepository,
  findUserByEmail,
  createAuditLog,
  getUsers as getUsersRepository,
} from "./users.repository";
import { AppError } from "../../utils/AppError";
import { UserRole } from "./users.model";

interface CreateUserServiceParams {
  first_name: string;
  last_name?: string;
  email: string;
  role: UserRole;
  phone?: string;
  verified: boolean;
  sendWelcomeEmail: boolean;
  adminId: string;
  ipAddress: string;
}

export const createUser = async (data: CreateUserServiceParams) => {
  const existing = await findUserByEmail(data.email);

  if (existing.rows.length > 0) {
    throw new AppError("Email already registered", 409);
  }

  const temporaryPassword = crypto.randomBytes(8).toString("hex");

  const passwordHash = await bcrypt.hash(temporaryPassword, 10);

  const result = await createUserRepository({
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    passwordHash,
    role: data.role,
    phone: data.phone,
    verified: data.verified,
  });

  const createdUser = result.rows[0];

  await createAuditLog({
    adminId: data.adminId,
    action: "user.create",
    targetType: "user",
    targetId: createdUser.id,
    before: null,
    after: createdUser,
    ipAddress: data.ipAddress,
  });

  if (data.sendWelcomeEmail) {
    console.log(
      `Welcome email sent to ${data.email}. Temporary password: ${temporaryPassword}`,
    );
  }

  return createdUser;
};

export const getUsers = async () => {
    const result = await getUsersRepository();

    return result.rows;
};