import { Request, Response, NextFunction } from "express";
import {
  getCategoriesTree,
  getCategoryById,
  createCategory,
  updateCategory,
  archiveCategory,
  unarchiveCategory,
} from "../../../src/modules/categories/categories.controller";
import * as categoriesService from "../../../src/modules/categories/categories.services";

jest.mock("../../../src/modules/categories/categories.services");

const mockResponse = () => {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  } as unknown as Response;

  (res.status as jest.Mock).mockReturnValue(res);
  (res.json as jest.Mock).mockReturnValue(res);

  return res;
};

describe("categoriesController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return categories tree", async () => {
    const req = {
      query: {},
    } as unknown as Request;

    const res = mockResponse();

    const categories = [
      {
        id: "1",
        name: "Repair",
        children: [],
      },
    ];

    (categoriesService.getCategoriesTree as jest.Mock).mockResolvedValue(
      categories,
    );

    await getCategoriesTree(req, res);

    expect(categoriesService.getCategoriesTree).toHaveBeenCalledWith(false);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(categories);
  });

  it("should include archived categories when query param is true", async () => {
    const req = {
      query: {
        include_archived: "true",
      },
    } as unknown as Request;

    const res = mockResponse();

    (categoriesService.getCategoriesTree as jest.Mock).mockResolvedValue([]);

    await getCategoriesTree(req, res);

    expect(categoriesService.getCategoriesTree).toHaveBeenCalledWith(true);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("should return category by id", async () => {
    const req = {
      params: { id: "uuid-1" },
    } as unknown as Request;

    const res = mockResponse();
    const next = jest.fn() as NextFunction;

    const mockCategory = { id: "uuid-1", name: "Reparación" };
    (categoriesService.getCategoryById as jest.Mock).mockResolvedValue(
      mockCategory,
    );

    await getCategoryById(req, res, next);

    expect(categoriesService.getCategoryById).toHaveBeenCalledWith("uuid-1");
    expect(res.json).toHaveBeenCalledWith(mockCategory);
  });

  it("should call next with error if getCategoryById throws", async () => {
    const req = {
      params: { id: "bad-id" },
    } as unknown as Request;

    const res = mockResponse();
    const next = jest.fn() as NextFunction;

    const error = new Error("Category not found");
    (categoriesService.getCategoryById as jest.Mock).mockRejectedValue(error);

    await getCategoryById(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("should create category", async () => {
    const req = {
      body: {
        name: "Laptops",
      },
    } as Request;

    const res = mockResponse();

    const category = {
      id: "1",
      name: "Laptops",
      slug: "laptops",
    };

    (categoriesService.createCategory as jest.Mock).mockResolvedValue(category);

    await createCategory(req, res);

    expect(categoriesService.createCategory).toHaveBeenCalledWith(req.body);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(category);
  });

  it("should update category", async () => {
    const req = {
      params: { id: "uuid-1" },
      body: { name: "Reparación Updated" },
    } as unknown as Request;

    const res = mockResponse();
    const next = jest.fn() as NextFunction;

    const mockUpdated = { id: "uuid-1", name: "Reparación Updated" };

    (categoriesService.updateCategory as jest.Mock).mockResolvedValue(
      mockUpdated,
    );

    await updateCategory(req, res, next);

    expect(categoriesService.updateCategory).toHaveBeenCalledWith("uuid-1", {
      name: "Reparación Updated",
    });

    expect(res.json).toHaveBeenCalledWith(mockUpdated);
  });

  it("should call next with error if updateCategory throws", async () => {
    const req = {
      params: { id: "bad-id" },
      body: {},
    } as unknown as Request;

    const res = mockResponse();
    const next = jest.fn() as NextFunction;

    const error = new Error("Category not found");

    (categoriesService.updateCategory as jest.Mock).mockRejectedValue(error);

    await updateCategory(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("should archive category", async () => {
    const req = {
      params: { id: "uuid-1" },
    } as unknown as Request;

    const res = mockResponse();
    const next = jest.fn() as NextFunction;

    (categoriesService.archiveCategory as jest.Mock).mockResolvedValue({
      message: "Category archived successfully",
    });

    await archiveCategory(req, res, next);

    expect(categoriesService.archiveCategory).toHaveBeenCalledWith("uuid-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  it("should unarchive category", async () => {
    const req = {
      params: { id: "uuid-1" },
    } as unknown as Request;

    const res = mockResponse();
    const next = jest.fn() as NextFunction;

    (categoriesService.unarchiveCategory as jest.Mock).mockResolvedValue({
      message: "Category unarchived successfully",
    });

    await unarchiveCategory(req, res, next);

    expect(categoriesService.unarchiveCategory).toHaveBeenCalledWith("uuid-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });
});
