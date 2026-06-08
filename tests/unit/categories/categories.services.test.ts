import * as categoriesRepository from "../../../src/modules/categories/categories.repository";
import {
  getCategoriesTree,
  getCategoryById,
  createCategory,
  updateCategory,
  archiveCategory,
  unarchiveCategory,
  searchCategories,
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
  it("should throw error when name is empty", async () => {
    await expect(
      createCategory({
        name: "",
      }),
    ).rejects.toThrow(AppError);
  });

  it("should create category with generated slug", async () => {
    (
      categoriesRepository.findCategoryBySlug as jest.Mock
    ).mockResolvedValueOnce(null);

    (categoriesRepository.getMaxSortOrder as jest.Mock).mockResolvedValue(0);

    (categoriesRepository.createCategory as jest.Mock).mockResolvedValue({
      id: "1",
      name: "Laptops",
      slug: "laptops",
    });

    const result = await createCategory({
      name: "Laptops",
    });

    expect(result.slug).toBe("laptops");
  });

  it("should throw error when parent category does not exist", async () => {
    (categoriesRepository.findCategoryBySlug as jest.Mock).mockResolvedValue(
      null,
    );

    (categoriesRepository.findCategoryById as jest.Mock).mockResolvedValue(
      null,
    );

    await expect(
      createCategory({
        name: "Laptops",
        parent_id: "123",
      }),
    ).rejects.toThrow("Parent category not found");
  });

  it("should throw error when parent category is not root", async () => {
    (categoriesRepository.findCategoryBySlug as jest.Mock).mockResolvedValue(
      null,
    );

    (categoriesRepository.findCategoryById as jest.Mock).mockResolvedValue({
      id: "1",
      parent_id: "999",
    });

    await expect(
      createCategory({
        name: "Laptops",
        parent_id: "1",
      }),
    ).rejects.toThrow("Only 2 levels of categories are allowed");
  });

  it("should generate correct incremental slug when slug already exists", async () => {
    (categoriesRepository.findCategoryBySlug as jest.Mock)
      .mockResolvedValueOnce({ id: "1", slug: "laptops" })
      .mockResolvedValueOnce(null);

    (categoriesRepository.getMaxSortOrder as jest.Mock).mockResolvedValue(0);

    (categoriesRepository.createCategory as jest.Mock).mockResolvedValue({
      id: "2",
      name: "Laptops",
      slug: "laptops-2",
    });

    const result = await createCategory({
      name: "Laptops",
    });

    expect(result.slug).toBe("laptops-2");
  });

  it("should archive category", async () => {
    (categoriesRepository.findCategoryById as jest.Mock).mockResolvedValue({
      id: "1",
      status: "active",
    });

    (categoriesRepository.updateCategory as jest.Mock).mockResolvedValue({
      id: "1",
      status: "archived",
    });

    const result = await archiveCategory("1");

    expect(result.message).toBe("Category archived successfully");
  });

  it("should unarchive category", async () => {
    (categoriesRepository.findCategoryById as jest.Mock).mockResolvedValue({
      id: "1",
      status: "archived",
    });

    (categoriesRepository.updateCategory as jest.Mock).mockResolvedValue({
      id: "1",
      status: "active",
    });

    const result = await unarchiveCategory("1");

    expect(result.message).toBe("Category unarchived successfully");
  });

  it("should throw error if category not found when archiving", async () => {
    (categoriesRepository.findCategoryById as jest.Mock).mockResolvedValue(
      null,
    );

    await expect(archiveCategory("bad-id")).rejects.toThrow(AppError);
  });

  it("should throw 404 if category to update is not found", async () => {
    (categoriesRepository.findCategoryById as jest.Mock).mockResolvedValue(
      null,
    );

    await expect(updateCategory("non-existent-id", {})).rejects.toThrow(
      "Category not found",
    );
  });

  it("should throw 409 if slug already exists in another category", async () => {
    (categoriesRepository.findCategoryById as jest.Mock).mockResolvedValue({
      id: "uuid-1",
      slug: "reparacion",
      show_on_homepage: false,
    });

    (categoriesRepository.findCategoryBySlug as jest.Mock).mockResolvedValue({
      id: "uuid-2",
      slug: "salud",
    });

    await expect(updateCategory("uuid-1", { slug: "salud" })).rejects.toThrow(
      "Slug already exists",
    );
  });

  it("should throw 422 if featured_on_homepage is true and show_on_homepage is false", async () => {
    (categoriesRepository.findCategoryById as jest.Mock).mockResolvedValue({
      id: "uuid-1",
      slug: "reparacion",
      show_on_homepage: false,
    });

    await expect(
      updateCategory("uuid-1", {
        visibility: { featured_on_homepage: true },
      }),
    ).rejects.toThrow(
      "Cannot feature on homepage if show_on_homepage is false",
    );
  });

  it("should update category successfully", async () => {
    const mockUpdated = { id: "uuid-1", name: "Reparación Updated" };

    (categoriesRepository.findCategoryById as jest.Mock).mockResolvedValue({
      id: "uuid-1",
      slug: "reparacion",
      show_on_homepage: true,
    });

    (categoriesRepository.updateCategory as jest.Mock).mockResolvedValue(
      mockUpdated,
    );

    const result = await updateCategory("uuid-1", {
      name: "Reparación Updated",
    });

    expect(result).toEqual(mockUpdated);
  });

  it("should throw 422 if q is empty", async () => {
    await expect(searchCategories("")).rejects.toThrow(
      "Search query 'q' is required",
    );
  });

  it("should return search results", async () => {
    const mockRows = [
      {
        id: "uuid-1",
        name: "Electrónica & móviles",
        slug: "electronica-moviles",
        icon: null,
        status: "active",
        business_count: 0,
        parent_id: "uuid-p",
        parent_name: "Reparación",
      },
    ];
    (categoriesRepository.searchCategories as jest.Mock).mockResolvedValue(
      mockRows,
    );

    const result = await searchCategories("movil");

    expect(result).toEqual([
      {
        id: "uuid-1",
        name: "Electrónica & móviles",
        slug: "electronica-moviles",
        icon: null,
        status: "active",
        business_count: 0,
        parent: { id: "uuid-p", name: "Reparación" },
      },
    ]);
  });

  it("should return null parent if category has no parent", async () => {
    const mockRows = [
      {
        id: "uuid-1",
        name: "Reparación",
        slug: "reparacion",
        icon: "⚡",
        status: "active",
        business_count: 0,
        parent_id: null,
        parent_name: null,
      },
    ];
    (categoriesRepository.searchCategories as jest.Mock).mockResolvedValue(
      mockRows,
    );

    const result = await searchCategories("repar");

    expect(result[0].parent).toBeNull();
  });

  it("should cap limit at 50", async () => {
    (categoriesRepository.searchCategories as jest.Mock).mockResolvedValue([]);

    await searchCategories("test", 100);

    expect(categoriesRepository.searchCategories).toHaveBeenCalledWith(
      "test",
      50,
    );
  });
});
