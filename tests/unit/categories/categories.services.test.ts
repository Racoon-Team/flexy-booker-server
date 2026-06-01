import * as categoriesRepository from "../../../src/modules/categories/categories.repository";
import { getCategoriesTree } from "../../../src/modules/categories/categories.services";

jest.mock("../../../src/modules/categories/categories.repository");

describe("categoriesServices", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should build categories tree with parent and child categories", async () => {
    (categoriesRepository.getCategoriesTree as jest.Mock).mockResolvedValue([
      {
        id: "1",
        parent_id: null,
        name: "Repair",
        slug: "repair",
        icon: "repair-icon",
        status: "active",
        sort_order: 0,
        business_count: 10,
      },
      {
        id: "2",
        parent_id: "1",
        name: "Electronics",
        slug: "electronics",
        icon: "electronics-icon",
        status: "active",
        sort_order: 1,
        business_count: 5,
      },
    ]);

    const result = await getCategoriesTree();

    expect(result).toHaveLength(1);

    expect(result[0].id).toBe("1");
    expect(result[0].children).toHaveLength(1);

    expect(result[0].children[0]).toEqual({
      id: "2",
      name: "Electronics",
      slug: "electronics",
      icon: "electronics-icon",
      status: "active",
      sort_order: 1,
      business_count: 5,
      children: [],
    });
  });

  it("should return parent categories without children", async () => {
    (categoriesRepository.getCategoriesTree as jest.Mock).mockResolvedValue([
      {
        id: "1",
        parent_id: null,
        name: "Repair",
        slug: "repair",
        icon: "repair-icon",
        status: "active",
        sort_order: 0,
        business_count: 10,
      },
    ]);

    const result = await getCategoriesTree();

    expect(result).toHaveLength(1);
    expect(result[0].children).toEqual([]);
  });
});
