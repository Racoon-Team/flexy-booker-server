import {
  signIn,
  signOut,
  signUp,
} from "../../../src/modules/auth/authController";
import * as authService from "../../../src/modules/auth/authServices";
import { Request, Response } from "express";

jest.mock("../../../src/modules/auth/authServices");

const mockResponse = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  } as unknown as Response;
  (res.status as jest.Mock).mockReturnValue(res);
  (res.json as jest.Mock).mockReturnValue(res);
  return res;
};

describe("authController", () => {
  let next: jest.Mock;

  beforeEach(() => {
    next = jest.fn();
    jest.clearAllMocks();
  });

  // ======================
  // SIGN UP
  // ======================

  describe("signUp", () => {
    it("should return 201 on success", async () => {
      const req = { body: { email: "test@test.com" } } as Request;
      const res = mockResponse();

      (authService.signUp as jest.Mock).mockResolvedValue({ token: "abc" });

      await signUp(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ token: "abc" });
    });

    it("should call next on error", async () => {
      const req = { body: {} } as Request;
      const res = mockResponse();
      const error = new Error("fail");

      (authService.signUp as jest.Mock).mockRejectedValue(error);

      await signUp(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ======================
  // SIGN IN
  // ======================

  describe("signIn", () => {
    it("should return 200 on success", async () => {
      const req = { body: { email: "test@test.com" } } as Request;
      const res = mockResponse();

      (authService.signIn as jest.Mock).mockResolvedValue({ token: "abc" });

      await signIn(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ token: "abc" });
    });

    it("should call next on error", async () => {
      const req = { body: {} } as Request;
      const res = mockResponse();
      const error = new Error("Invalid credentials");

      (authService.signIn as jest.Mock).mockRejectedValue(error);

      await signIn(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ======================
  // SIGN OUT
  // ======================

  describe("signOut", () => {
    it("should return 200 on success", async () => {
      const req = { user: { userId: "uuid-1" } } as unknown as Request;
      const res = mockResponse();

      (authService.signOut as jest.Mock).mockResolvedValue(true);

      await signOut(req, res, next);

      expect(authService.signOut).toHaveBeenCalledWith("uuid-1");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Successfully logged out",
      });
    });

    it("should call next on error", async () => {
      const req = { user: { userId: "uuid-1" } } as unknown as Request;
      const res = mockResponse();
      const error = new Error("fail");

      (authService.signOut as jest.Mock).mockRejectedValue(error);

      await signOut(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
