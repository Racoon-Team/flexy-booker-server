import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import * as authService from "../../../src/modules/auth/authServices";
import * as usersRepository from "../../../src/modules/users/usersRepository";

jest.mock("bcrypt");
jest.mock("jsonwebtoken");
jest.mock("../../../src/modules/users/usersRepository");

describe("authService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ======================
  // SIGN UP
  // ======================

  describe("signUp", () => {
    it("should create user and return token", async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");
      (jwt.sign as jest.Mock).mockReturnValue("token");

      (usersRepository.createUser as jest.Mock).mockResolvedValue({
        rows: [{ id: 1, name: "John", email: "test@test.com" }],
      });

      const result = await authService.signUp({
        userName: "John",
        email: "test@test.com",
        password: "123456",
      } as any);

      expect(result.token).toBe("token");
      expect(result.user.userName).toBe("John");
    });

    it("should throw if required fields are missing", async () => {
      await expect(
        authService.signUp({ email: "test@test.com" } as any),
      ).rejects.toThrow("Missing required fields");
    });

    it("should use default userType 'cliente'", async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");
      (jwt.sign as jest.Mock).mockReturnValue("token");

      (usersRepository.createUser as jest.Mock).mockResolvedValue({
        rows: [{ id: 1, name: "John", email: "test@test.com" }],
      });

      await authService.signUp({
        userName: "John",
        email: "test@test.com",
        password: "123456",
      } as any);

      expect(usersRepository.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          userType: "cliente",
        }),
      );
    });
  });

  // ======================
  // SIGN IN
  // ======================

  describe("signIn", () => {
    it("should throw if user not found", async () => {
      (usersRepository.findUserByEmail as jest.Mock).mockResolvedValue({
        rows: [],
      });

      await expect(
        authService.signIn({ email: "test@test.com", password: "123" }),
      ).rejects.toThrow("User not found");
    });

    it("should throw if password is incorrect", async () => {
      (usersRepository.findUserByEmail as jest.Mock).mockResolvedValue({
        rows: [{ id: 1, password: "hashed" }],
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.signIn({ email: "test@test.com", password: "wrong" }),
      ).rejects.toThrow("Incorrect password");
    });

    it("should return token on success", async () => {
      (usersRepository.findUserByEmail as jest.Mock).mockResolvedValue({
        rows: [
          {
            id: 1,
            name: "John",
            email: "test@test.com",
            password: "hashed",
            user_type: "admin",
          },
        ],
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue("token");

      const result = await authService.signIn({
        email: "test@test.com",
        password: "123456",
      });

      expect(result.token).toBe("token");
      expect(result.user.userName).toBe("John");
    });
  });

  // ======================
  // SIGN OUT
  // ======================

  describe("signOut", () => {
    it("should clear session token", async () => {
      (usersRepository.updateSessionToken as jest.Mock).mockResolvedValue(true);

      const result = await authService.signOut(1);

      expect(usersRepository.updateSessionToken).toHaveBeenCalledWith(1, null);
      expect(result).toBe(true);
    });
  });
});
