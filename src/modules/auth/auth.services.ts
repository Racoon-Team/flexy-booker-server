import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { AppError } from "../../utils/AppError";
import {
  SignInDataTransferObject,
  SignUpDataTransferObject,
} from "../users/users.model";
import * as usersRepository from "../users/users.repository";

const sessionExpiresAt = () => {
  const ms = parseDuration(env.jwt.expiresIn);
  return new Date(Date.now() + ms);
};

const parseDuration = (d: string): number => {
  const match = d.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const n = parseInt(match[1]);
  const units: Record<string, number> = {
    s: 1000,
    m: 60000,
    h: 3600000,
    d: 86400000,
  };
  return n * units[match[2]];
};

export const signUp = async (data: SignUpDataTransferObject) => {
  const { firstName, lastName, email, password, phone, role } = data;

  if (!firstName || !email || !password) {
    throw new Error("Missing required fields");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const finalRole = role ?? "client";

  const result = await usersRepository.createUser({
    firstName,
    lastName,
    email,
    passwordHash,
    role: finalRole,
    phone,
  });

  const user = result.rows[0];

  const token = jwt.sign({ userId: user.id, role: user.role }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  } as jwt.SignOptions);

  await usersRepository.createSession(user.id, token, sessionExpiresAt());

  logger.info("User signed up", { userId: user.id, email, role: finalRole });

  return {
    token,
    user: {
      userId: user.id,
      userName: [user.first_name, user.last_name].filter(Boolean).join(" "),
      email: user.email,
      authority: [user.role],
      avatar: "",
    },
  };
};

export const signIn = async (data: SignInDataTransferObject) => {
  const { email, password } = data;

  const result = await usersRepository.findUserByEmail(email);

  if (result.rows.length === 0) {
    logger.warn("Sign-in failed: email not found", { email });
    throw new AppError("Invalid credentials", 401);
  }

  const user = result.rows[0];

  const passwordMatch = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatch) {
    logger.warn("Sign-in failed: wrong password", { email });
    throw new AppError("Invalid credentials", 401);
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  } as jwt.SignOptions);

  await usersRepository.createSession(user.id, token, sessionExpiresAt());

  logger.info("User signed in", { userId: user.id, email });

  return {
    token,
    user: {
      userId: user.id,
      userName: [user.first_name, user.last_name].filter(Boolean).join(" "),
      email: user.email,
      authority: [user.role],
      avatar: user.avatar_url ?? "",
    },
  };
};

export const signOut = async (userId: string) => {
  await usersRepository.revokeAllSessions(userId);
  logger.info("User signed out", { userId });
  return true;
};
