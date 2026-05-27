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
});
