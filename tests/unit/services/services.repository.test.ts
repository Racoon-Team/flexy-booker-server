import { db } from "../../../src/db/knex";
import * as servicesRepository from "../../../src/modules/services/services.repository";

jest.mock("../../../src/db/knex", () => ({
  db: jest.fn(),
}));

describe("Services Repository", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getServices", () => {
    it("should return all services without search", async () => {
      const mockRows = [{ id: 1, name: "Haircut" }];
      const orderByMock = jest.fn().mockResolvedValue(mockRows);
      const selectMock = jest.fn().mockReturnValue({ orderBy: orderByMock });
      (db as unknown as jest.Mock).mockReturnValue({ select: selectMock });

      const result = await servicesRepository.getServices();

      expect(db).toHaveBeenCalledWith("services");
      expect(orderByMock).toHaveBeenCalledWith("id");
      expect(result).toEqual({ rows: mockRows });
    });

    it("should apply whereILike filter when search is provided", async () => {
      const mockRows = [{ id: 1, name: "Haircut" }];
      const whereILikeMock = jest.fn().mockResolvedValue(mockRows);
      const orderByMock = jest
        .fn()
        .mockReturnValue({ whereILike: whereILikeMock });
      const selectMock = jest.fn().mockReturnValue({ orderBy: orderByMock });
      (db as unknown as jest.Mock).mockReturnValue({ select: selectMock });

      const result = await servicesRepository.getServices("hair");

      expect(whereILikeMock).toHaveBeenCalledWith("name", "%hair%");
      expect(result).toEqual({ rows: mockRows });
    });
  });

  describe("deleteService", () => {
    it("should delete service by id", async () => {
      const delMock = jest.fn().mockResolvedValue(undefined);
      const whereMock = jest.fn().mockReturnValue({ del: delMock });
      (db as unknown as jest.Mock).mockReturnValue({ where: whereMock });

      await servicesRepository.deleteService(1);

      expect(db).toHaveBeenCalledWith("services");
      expect(whereMock).toHaveBeenCalledWith({ id: 1 });
      expect(delMock).toHaveBeenCalled();
    });
  });

  describe("updateService", () => {
    it("should update service and return updated row", async () => {
      const mockService = { id: 1, name: "Updated" };
      const returningMock = jest.fn().mockResolvedValue([mockService]);
      const updateMock = jest
        .fn()
        .mockReturnValue({ returning: returningMock });
      const whereMock = jest.fn().mockReturnValue({ update: updateMock });
      (db as unknown as jest.Mock).mockReturnValue({ where: whereMock });

      const result = await servicesRepository.updateService(1, {
        name: "Updated",
        schedule: ["10:00"],
      });

      expect(db).toHaveBeenCalledWith("services");
      expect(whereMock).toHaveBeenCalledWith({ id: 1 });
      expect(updateMock).toHaveBeenCalledWith({
        name: "Updated",
        schedule: ["10:00"],
        custom_fields: "[]",
      });
      expect(result).toEqual(mockService);
    });
  });

  describe("createService", () => {
    it("should insert service and return new row", async () => {
      const mockService = { id: 1, name: "Haircut" };
      const returningMock = jest.fn().mockResolvedValue([mockService]);
      const insertMock = jest
        .fn()
        .mockReturnValue({ returning: returningMock });
      (db as unknown as jest.Mock).mockReturnValue({ insert: insertMock });

      const result = await servicesRepository.createService({
        business_id: 1,
        name: "Haircut",
        schedule: ["10:00"],
      });

      expect(db).toHaveBeenCalledWith("services");
      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          business_id: 1,
          name: "Haircut",
          schedule: ["10:00"],
          custom_fields: "[]",
        }),
      );
      expect(result).toEqual(mockService);
    });

    it("should JSON-stringify custom_fields when provided", async () => {
      const mockService = { id: 1, name: "Haircut" };
      const returningMock = jest.fn().mockResolvedValue([mockService]);
      const insertMock = jest
        .fn()
        .mockReturnValue({ returning: returningMock });
      (db as unknown as jest.Mock).mockReturnValue({ insert: insertMock });

      const customFields = [{ label: "Note", type: "text" }];

      await servicesRepository.createService({
        business_id: 1,
        name: "Haircut",
        schedule: ["10:00"],
        custom_fields: customFields,
      });

      expect(insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          custom_fields: JSON.stringify(customFields),
        }),
      );
    });
  });
});
