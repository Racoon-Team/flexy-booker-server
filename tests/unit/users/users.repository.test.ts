import { db } from "../../../src/db/knex";
import * as usersRepository from "../../../src/modules/users/users.repository";

jest.mock("../../../src/db/knex", () => ({
  db: jest.fn(),
}));

describe("Users Repository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createUser", () => {
    it("should insert user and return rows", async () => {
      const mockUser = {
        id: "uuid-1",
        first_name: "John",
        last_name: null,
        email: "john@test.com",
        role: "client",
      };
      const returningMock = jest.fn().mockResolvedValue([mockUser]);
      const insertMock = jest
        .fn()
        .mockReturnValue({ returning: returningMock });
      (db as unknown as jest.Mock).mockReturnValue({ insert: insertMock });

      const result = await usersRepository.createUser({
        firstName: "John",
        email: "john@test.com",
        passwordHash: "hashed",
        role: "client",
      });

      expect(db).toHaveBeenCalledWith("users");
      expect(insertMock).toHaveBeenCalledWith({
        first_name: "John",
        last_name: undefined,
        email: "john@test.com",
        password_hash: "hashed",
        role: "client",
        phone: undefined,
      });
      expect(returningMock).toHaveBeenCalledWith([
        "id",
        "first_name",
        "last_name",
        "email",
        "role",
      ]);
      expect(result).toEqual({ rows: [mockUser] });
    });

    it("should use default role when not provided", async () => {
      const mockUser = {
        id: "uuid-1",
        first_name: "John",
        last_name: null,
        email: "john@test.com",
        role: "client",
      };
      const returningMock = jest.fn().mockResolvedValue([mockUser]);
      const insertMock = jest
        .fn()
        .mockReturnValue({ returning: returningMock });
      (db as unknown as jest.Mock).mockReturnValue({ insert: insertMock });

      await usersRepository.createUser({
        firstName: "John",
        email: "john@test.com",
        passwordHash: "hashed",
      });

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          role: "client",
        }),
      );
    });
  });

  describe("findUserByEmail", () => {
    it("should find user by email and return rows", async () => {
      const mockUsers = [
        { id: "uuid-1", first_name: "John", email: "john@test.com" },
      ];
      const selectMock = jest.fn().mockResolvedValue(mockUsers);
      const whereMock = jest.fn().mockReturnValue({ select: selectMock });
      (db as unknown as jest.Mock).mockReturnValue({ where: whereMock });

      const result = await usersRepository.findUserByEmail("john@test.com");

      expect(db).toHaveBeenCalledWith("users");
      expect(whereMock).toHaveBeenCalledWith({ email: "john@test.com" });
      expect(selectMock).toHaveBeenCalledWith("*");
      expect(result).toEqual({ rows: mockUsers });
    });

    it("should return empty rows when user not found", async () => {
      const selectMock = jest.fn().mockResolvedValue([]);
      const whereMock = jest.fn().mockReturnValue({ select: selectMock });
      (db as unknown as jest.Mock).mockReturnValue({ where: whereMock });

      const result = await usersRepository.findUserByEmail("nobody@test.com");

      expect(result).toEqual({ rows: [] });
    });
  });

  describe("createSession", () => {
    it("should revoke existing sessions and insert a new one", async () => {
      const updateMock = jest.fn().mockResolvedValue(1);
      const whereNullMock = jest.fn().mockReturnValue({ update: updateMock });
      const whereMockRevoke = jest
        .fn()
        .mockReturnValue({ whereNull: whereNullMock });

      const insertMock = jest.fn().mockResolvedValue([1]);

      (db as unknown as Record<string, unknown>).fn = { now: jest.fn().mockReturnValue("now") };
      (db as unknown as jest.Mock).mockImplementation((table: string) => {
        if (table === "sessions") {
          return {
            where: whereMockRevoke,
            insert: insertMock,
          };
        }
        return {};
      });

      const expiresAt = new Date();
      await usersRepository.createSession("user-1", "token-123", expiresAt);

      expect(db).toHaveBeenCalledWith("sessions");
      expect(whereMockRevoke).toHaveBeenCalledWith({ user_id: "user-1" });
      expect(whereNullMock).toHaveBeenCalledWith("revoked_at");
      expect(updateMock).toHaveBeenCalledWith({ revoked_at: "now" });
      expect(insertMock).toHaveBeenCalledWith({
        user_id: "user-1",
        token_hash: expect.any(String),
        expires_at: expiresAt,
      });
    });
  });

  describe("revokeAllSessions", () => {
    it("should update sessions to set revoked_at", async () => {
      const updateMock = jest.fn().mockResolvedValue(1);
      const whereNullMock = jest.fn().mockReturnValue({ update: updateMock });
      const whereMock = jest.fn().mockReturnValue({ whereNull: whereNullMock });

      (db as unknown as Record<string, unknown>).fn = { now: jest.fn().mockReturnValue("now") };
      (db as unknown as jest.Mock).mockReturnValue({ where: whereMock });

      await usersRepository.revokeAllSessions("user-1");

      expect(db).toHaveBeenCalledWith("sessions");
      expect(whereMock).toHaveBeenCalledWith({ user_id: "user-1" });
      expect(whereNullMock).toHaveBeenCalledWith("revoked_at");
      expect(updateMock).toHaveBeenCalledWith({ revoked_at: "now" });
    });
  });

  describe("findValidSession", () => {
    it("should return a session if valid", async () => {
      const mockSession = { id: 1, user_id: "user-1" };
      const firstMock = jest.fn().mockResolvedValue(mockSession);
      const whereDateMock = jest.fn().mockReturnValue({ first: firstMock });
      const whereNullMock = jest
        .fn()
        .mockReturnValue({ where: whereDateMock });
      const whereMock = jest.fn().mockReturnValue({ whereNull: whereNullMock });

      (db as unknown as Record<string, unknown>).fn = { now: jest.fn().mockReturnValue("now") };
      (db as unknown as jest.Mock).mockReturnValue({ where: whereMock });

      const result = await usersRepository.findValidSession(
        "user-1",
        "token-123",
      );

      expect(db).toHaveBeenCalledWith("sessions");
      expect(whereMock).toHaveBeenCalledWith({
        user_id: "user-1",
        token_hash: expect.any(String),
      });
      expect(whereNullMock).toHaveBeenCalledWith("revoked_at");
      expect(whereDateMock).toHaveBeenCalledWith("expires_at", ">", "now");
      expect(result).toEqual(mockSession);
    });
  });
});
