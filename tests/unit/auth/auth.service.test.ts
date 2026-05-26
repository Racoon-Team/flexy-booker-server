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
      (usersRepository.createSession as jest.Mock).mockResolvedValue(undefined);

      (usersRepository.createUser as jest.Mock).mockResolvedValue({
        rows: [{ id: "uuid-1", first_name: "John", last_name: null, email: "test@test.com", role: "client" }],
      });

      const result = await authService.signUp({
        firstName: "John",
        email: "test@test.com",
        password: "123456",
      });

      expect(result.token).toBe("token");
      expect(result.user.userName).toBe("John");
    });

    it("should throw if required fields are missing", async () => {
      await expect(
        authService.signUp({ email: "test@test.com" } as any),
      ).rejects.toThrow("Missing required fields");
    });

    it("should default role to 'client'", async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashed");
      (jwt.sign as jest.Mock).mockReturnValue("token");
      (usersRepository.createSession as jest.Mock).mockResolvedValue(undefined);

      (usersRepository.createUser as jest.Mock).mockResolvedValue({
        rows: [{ id: "uuid-1", first_name: "John", last_name: null, email: "test@test.com", role: "client" }],
      });

      await authService.signUp({
        firstName: "John",
        email: "test@test.com",
        password: "123456",
      });

      expect(usersRepository.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "client",
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
      ).rejects.toThrow("Invalid credentials");
    });

    it("should throw if password is incorrect", async () => {
      (usersRepository.findUserByEmail as jest.Mock).mockResolvedValue({
        rows: [{ id: "uuid-1", password_hash: "hashed" }],
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.signIn({ email: "test@test.com", password: "wrong" }),
      ).rejects.toThrow("Invalid credentials");
    });

    it("should return token on success", async () => {
      (usersRepository.findUserByEmail as jest.Mock).mockResolvedValue({
        rows: [
          {
            id: "uuid-1",
            first_name: "John",
            last_name: null,
            email: "test@test.com",
            password_hash: "hashed",
            role: "admin",
            avatar_url: null,
          },
        ],
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue("token");
      (usersRepository.createSession as jest.Mock).mockResolvedValue(undefined);

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
    it("should revoke all sessions", async () => {
      (usersRepository.revokeAllSessions as jest.Mock).mockResolvedValue(undefined);

      const result = await authService.signOut("uuid-1");

      expect(usersRepository.revokeAllSessions).toHaveBeenCalledWith("uuid-1");
      expect(result).toBe(true);
    });
  });
});
