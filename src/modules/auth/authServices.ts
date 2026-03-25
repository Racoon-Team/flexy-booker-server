import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as usersRepository from "../users/usersRepository";
import { SignUpDataTransferObject, SignInDataTransferObject } from "../users/usersModel";
import { env } from "../../config/env";

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
    throw new Error("User not found");
  }

  const user = result.rows[0];

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new Error("Incorrect password");
  }

  const token = jwt.sign(
    { userId: user.id, userType: user.user_type },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn } as jwt.SignOptions
  );

  await usersRepository.updateSessionToken(user.id, token);

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
  return true;
};