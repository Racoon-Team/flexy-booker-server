import { db } from "../../db/knex";
import { CreateUserParams } from "./usersModel";

export const createUser = async (data: CreateUserParams) => {
  const rows = await db("users")
    .insert({
      name: data.name,
      email: data.email,
      password: data.password,
      user_type: data.userType,
      address: data.address,
      phone_number: data.phoneNumber,
    })
    .returning(["id", "name", "email"]);

  return { rows };
};

export const findUserByEmail = async (email: string) => {
  const rows = await db("users").where({ email }).select("*");

  return { rows };
};

export const updateSessionToken = async (userId: number, token: string | null) => {
  await db("users").where({ id: userId }).update({ session_token: token });
};