import {
  signIn,
  signOut,
  signUp,
} from "../../../src/modules/auth/authController";
import * as authService from "../../../src/modules/auth/authServices";

jest.mock("../../../src/modules/auth/authServices");

const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("authController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ======================
  // SIGN UP
  // ======================

  describe("signUp", () => {
    it("should return 201 on success", async () => {
      const req: any = { body: { email: "test@test.com" } };
      const res = mockResponse();

      (authService.signUp as jest.Mock).mockResolvedValue({ token: "abc" });

      await signUp(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ token: "abc" });
    });

    it("should return 400 on Error", async () => {
      const req: any = { body: {} };
      const res = mockResponse();

      (authService.signUp as jest.Mock).mockRejectedValue(new Error("fail"));

      await signUp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "fail" });
    });

    it("should return 400 on unknown error", async () => {
      const req: any = { body: {} };
      const res = mockResponse();

      (authService.signUp as jest.Mock).mockRejectedValue("weird");

      await signUp(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "unknown error" });
    });
  });

  // ======================
  // SIGN IN
  // ======================

  describe("signIn", () => {
    it("should return 200 on success", async () => {
      const req: any = { body: { email: "test@test.com" } };
      const res = mockResponse();

      (authService.signIn as jest.Mock).mockResolvedValue({ token: "abc" });

      await signIn(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ token: "abc" });
    });

    it("should return 401 on Error", async () => {
      const req: any = { body: {} };
      const res = mockResponse();

      (authService.signIn as jest.Mock).mockRejectedValue(new Error("invalid"));

      await signIn(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "invalid" });
    });

    it("should return 401 on unknown error", async () => {
      const req: any = { body: {} };
      const res = mockResponse();

      (authService.signIn as jest.Mock).mockRejectedValue("oops");

      await signIn(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: "unknown error" });
    });
  });

  // ======================
  // SIGN OUT
  // ======================

  describe("signOut", () => {
    it("should return 200 on success", async () => {
      const req: any = { body: { userId: 1 } };
      const res = mockResponse();

      (authService.signOut as jest.Mock).mockResolvedValue(true);

      await signOut(req, res);

      expect(authService.signOut).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Successfully logged out",
      });
    });

    it("should return 400 on Error", async () => {
      const req: any = { body: { userId: 1 } };
      const res = mockResponse();

      (authService.signOut as jest.Mock).mockRejectedValue(new Error("fail"));

      await signOut(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "fail" });
    });

    it("should return 400 on unknown error", async () => {
      const req: any = { body: { userId: 1 } };
      const res = mockResponse();

      (authService.signOut as jest.Mock).mockRejectedValue(null);

      await signOut(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "unknown error" });
    });
  });
});
