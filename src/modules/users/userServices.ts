import bcrypt from "bcrypt";
import * as userRepository from "./usersRepository";
import { SignUpDataTransferObject, SignInDataTransferObject } from "./usersModel";

export const signUp = async (data: SignUpDataTransferObject) => {
  const { userName, email, password, address, phoneNumber, userType } = data;

  if (!userName || !email || !password) {
    throw new Error("Missing required fields");
  }

  const finalUserType = userType || "cliente";

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await userRepository.createUser({
    name: userName,
    email,
    password: hashedPassword,
    userType: finalUserType,
    address,
    phoneNumber,
  });

  return result.rows[0];
};

export const signIn = async (data: SignInDataTransferObject) => {
  const { email, password } = data;

  const result = await userRepository.findUserByEmail(email);

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  const user = result.rows[0];

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw new Error("Incorrect password");
  }

  return user;
};

export const signOut = async()=>{
    return true;
}