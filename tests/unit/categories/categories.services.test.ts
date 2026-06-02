import * as categoriesRepository from "../../../src/modules/categories/categories.repository";
import {
  getCategoriesTree,
  getCategoryById,
} from "../../../src/modules/categories/categories.services";
import { AppError } from "../../../src/utils/AppError";

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

  it("should throw AppError 404 if category is not found", async () => {
    (categoriesRepository.getCategoryById as jest.Mock).mockResolvedValue(null);

    await expect(getCategoryById("non-existent-id")).rejects.toThrow(AppError);
    await expect(getCategoryById("non-existent-id")).rejects.toThrow(
      "Category not found",
    );
  });

  it("should return category with null parent if it is a root category", async () => {
    (categoriesRepository.getCategoryById as jest.Mock).mockResolvedValue({
      category: {
        id: "uuid-1",
        name: "Reparación",
        slug: "reparacion",
        icon: "⚡",
        description: null,
        status: "active",
        sort_order: 1,
        parent_id: null,
        parent_name: null,
        parent_slug: null,
        show_on_homepage: false,
        show_in_search: true,
        allow_new_businesses: true,
        featured_on_homepage: false,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
      tags: [],
    });

    const result = await getCategoryById("uuid-1");

    expect(result.parent).toBeNull();
  });

  it("should return visibility fields always present", async () => {
    (categoriesRepository.getCategoryById as jest.Mock).mockResolvedValue({
      category: {
        id: "uuid-1",
        name: "Reparación",
        slug: "reparacion",
        icon: null,
        description: null,
        status: "active",
        sort_order: 1,
        parent_id: null,
        parent_name: null,
        parent_slug: null,
        show_on_homepage: false,
        show_in_search: true,
        allow_new_businesses: true,
        featured_on_homepage: false,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
      tags: [],
    });

    const result = await getCategoryById("uuid-1");

    expect(result.visibility).toEqual({
      show_on_homepage: false,
      show_in_search: true,
      allow_new_businesses: true,
      featured_on_homepage: false,
    });
  });

  it("should ignore child category if its parent is not in the list", async () => {
    (categoriesRepository.getCategoriesTree as jest.Mock).mockResolvedValue([
      {
        id: "2",
        parent_id: "non-existent-parent",
        name: "Electronics",
        slug: "electronics",
        icon: "electronics-icon",
        status: "active",
        sort_order: 1,
        business_count: 5,
      },
    ]);

    const result = await getCategoriesTree();

    expect(result).toHaveLength(0);
  });

  it("should return category with parent data if it has a parent", async () => {
    (categoriesRepository.getCategoryById as jest.Mock).mockResolvedValue({
      category: {
        id: "uuid-2",
        name: "Electrónica & móviles",
        slug: "electronica-moviles",
        icon: null,
        description: null,
        status: "active",
        sort_order: 1,
        parent_id: "uuid-1",
        parent_name: "Reparación",
        parent_slug: "reparacion",
        show_on_homepage: false,
        show_in_search: true,
        allow_new_businesses: true,
        featured_on_homepage: false,
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
      tags: [],
    });

    const result = await getCategoryById("uuid-2");

    expect(result.parent).toEqual({
      id: "uuid-1",
      name: "Reparación",
      slug: "reparacion",
    });
  });
});
