import { Request, Response } from "express";
import * as servicesController from "../../../src/modules/services/services.controller";
import * as servicesService from "../../../src/modules/services/services.services";

jest.mock("../../../src/modules/services/services.services");

describe("Services Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = { query: {} };
    res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe("getServices", () => {
    it("should return services", async () => {
      const mockServices = [{ id: 1, name: "Service" }];
      (servicesService.getServices as jest.Mock).mockResolvedValue(
        mockServices,
      );

      await servicesController.getServices(
        req as Request,
        res as Response,
        next,
      );

      expect(res.json).toHaveBeenCalledWith(mockServices);
    });

    it("should pass search query to service", async () => {
      req.query = { search: "test" };
      (servicesService.getServices as jest.Mock).mockResolvedValue([]);

      await servicesController.getServices(
        req as Request,
        res as Response,
        next,
      );

      expect(servicesService.getServices).toHaveBeenCalledWith("test");
    });

    it("should call next on error", async () => {
      const error = new Error("fail");
      (servicesService.getServices as jest.Mock).mockRejectedValue(error);

      await servicesController.getServices(
        req as Request,
        res as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("createService", () => {
    it("should create service", async () => {
      req.body = { name: "Service", schedule: ["10:00"] };
      const mockService = { id: 1 };
      (servicesService.createService as jest.Mock).mockResolvedValue(
        mockService,
      );

      await servicesController.createService(
        req as Request,
        res as Response,
        next,
      );

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockService);
    });

    it("should call next on error", async () => {
      req.body = {};
      const error = new Error("Service name is required");
      (servicesService.createService as jest.Mock).mockRejectedValue(error);

      await servicesController.createService(
        req as Request,
        res as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteService", () => {
    it("should delete service", async () => {
      req.params = { id: "1" };
      (servicesService.deleteService as jest.Mock).mockResolvedValue(undefined);

      await servicesController.deleteService(
        req as Request,
        res as Response,
        next,
      );

      expect(res.json).toHaveBeenCalledWith({
        message: "Service deleted successfully",
      });
    });

    it("should call next on error", async () => {
      req.params = { id: "1" };
      const error = new Error("fail");
      (servicesService.deleteService as jest.Mock).mockRejectedValue(error);

      await servicesController.deleteService(
        req as Request,
        res as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("updateService", () => {
    it("should update service", async () => {
      req.params = { id: "1" };
      req.body = { name: "Updated", schedule: ["10:00"] };
      const mockService = { id: 1, name: "Updated" };
      (servicesService.updateService as jest.Mock).mockResolvedValue(
        mockService,
      );

      await servicesController.updateService(
        req as Request,
        res as Response,
        next,
      );

      expect(res.json).toHaveBeenCalledWith(mockService);
    });

    it("should call next on error", async () => {
      req.params = { id: "1" };
      req.body = {};
      const error = new Error("Service name is required");
      (servicesService.updateService as jest.Mock).mockRejectedValue(error);

      await servicesController.updateService(
        req as Request,
        res as Response,
        next,
      );

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
