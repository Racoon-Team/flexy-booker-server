import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as usersRepository from "../users/usersRepository";
import { SignUpDataTransferObject, SignInDataTransferObject } from "../users/usersModel";
import { env } from "../../config/env";
import { AppError } from "../../utils/AppError";
import { logger } from "../../config/logger";

export const signUp = async (data: SignUpDataTransferObject) => {
  const { userName, email, password, address, phoneNumber, userType } = data;

  if (!userName || !email || !password) {
    throw new Error("Missing required fields");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const finalUserType = userType || "cliente";

  const result = await usersRepository.createUser({
    name: userName,
    email,
    password: hashedPassword,
    userType: finalUserType,
    address,
    phoneNumber,
  });

  const user = result.rows[0];

  const token = jwt.sign(
    { userId: user.id, userType: finalUserType },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn } as jwt.SignOptions
  );

  await usersRepository.updateSessionToken(user.id, token);

  logger.info("User signed up", { userId: user.id, email, userType: finalUserType });

  return {
    token,
    user: {
      userId: user.id,
      userName: user.name,
      email: user.email,
      authority: [finalUserType],
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

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    logger.warn("Sign-in failed: wrong password", { email });
    throw new AppError("Invalid credentials", 401);
  }

  const token = jwt.sign(
    { userId: user.id, userType: user.user_type },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn } as jwt.SignOptions
  );

  await usersRepository.updateSessionToken(user.id, token);

  logger.info("User signed in", { userId: user.id, email });

  return {
    token,
    user: {
      userId: user.id,
      userName: user.name,
      email: user.email,
      authority: [user.user_type || "cliente"],
      avatar: "",
    },
  };
};

export const signOut = async (userId: number) => {
  await usersRepository.updateSessionToken(userId, null);
  logger.info("User signed out", { userId });
  return true;
};