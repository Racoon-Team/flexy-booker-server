import { Request, Response } from "express";
import { getCategoriesTree } from "../../../src/modules/categories/categories.controller";
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
});
