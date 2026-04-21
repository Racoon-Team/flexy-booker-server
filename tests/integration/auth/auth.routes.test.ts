import express from "express";
import request from "supertest";
import * as authController from "../../../src/modules/auth/authController";
import router from "../../../src/modules/auth/authRoutes";

// Mock the controller layer
jest.mock("../../../src/modules/auth/authController");

const app = express();
app.use(express.json());
app.use("/auth", router);

describe("Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /auth/register", () => {
    it("should call signUp and return 201", async () => {
      (authController.signUp as jest.Mock).mockImplementation((req, res) => {
        return res.status(201).json({ message: "registered" });
      });

      const res = await request(app).post("/auth/register").send({
        userName: "John",
        email: "test@test.com",
        password: "123456",
      });

      expect(res.status).toBe(201);
      expect(res.body.message).toBe("registered");
      expect(authController.signUp).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST /auth/login", () => {
    it("should call signIn and return 200", async () => {
      (authController.signIn as jest.Mock).mockImplementation((req, res) => {
        return res.status(200).json({ token: "abc" });
      });

      const res = await request(app).post("/auth/login").send({
        email: "test@test.com",
        password: "123456",
      });

      expect(res.status).toBe(200);
      expect(res.body.token).toBe("abc");
      expect(authController.signIn).toHaveBeenCalledTimes(1);
    });
  });

  describe("POST /auth/logout", () => {
    it("should call signOut and return 200", async () => {
      (authController.signOut as jest.Mock).mockImplementation((req, res) => {
        return res.status(200).json({ message: "Successfully logged out" });
      });

      const res = await request(app).post("/auth/logout").send({ userId: 1 });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Successfully logged out");
      expect(authController.signOut).toHaveBeenCalledTimes(1);
    });
  });
});
