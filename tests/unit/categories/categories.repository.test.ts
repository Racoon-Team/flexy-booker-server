import { db } from "../../../src/db/knex";
import {
  getCategoriesTree,
  getCategoryById,
  findCategoryById,
  findCategoryBySlug,
  getMaxSortOrder,
  createCategory,
  updateCategory,
  searchCategories,
  categoryHasTag,
  detachTagFromCategory,
  attachTagToCategory,
  searchTags,
  createTag,
  findTagByName,
  getCategoryStats,
} from "../../../src/modules/categories/categories.repository";

jest.mock("../../../src/db/knex", () => ({
  db: Object.assign(jest.fn(), {
    raw: jest.fn(),
    fn: { now: jest.fn().mockReturnValue("now()") },
  }),
}));

describe("categoriesRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return categories from database", async () => {
    const mockRows = [{ id: "1", name: "Repair", business_count: 10 }];
    (db.raw as jest.Mock).mockResolvedValue({ rows: mockRows });

    const result = await getCategoriesTree();

    expect(db.raw).toHaveBeenCalled();
    expect(result).toEqual(mockRows);
  });

  it("should include archived parameter", async () => {
    (db.raw as jest.Mock).mockResolvedValue({ rows: [] });

    await getCategoriesTree(true);

    expect(db.raw).toHaveBeenCalled();
  });

  it("should find category by id", async () => {
    const mockCategory = { id: "uuid-1", name: "Reparación" };
    const firstMock = jest.fn().mockResolvedValue(mockCategory);
    const whereMock = jest.fn().mockReturnValue({ first: firstMock });
    (db as unknown as jest.Mock).mockReturnValue({ where: whereMock });

    const result = await findCategoryById("uuid-1");

    expect(db).toHaveBeenCalledWith("categories");
    expect(whereMock).toHaveBeenCalledWith({ id: "uuid-1" });
    expect(result).toEqual(mockCategory);
  });

  it("should find category by slug", async () => {
    const mockCategory = { id: "uuid-1", slug: "reparacion" };
    const firstMock = jest.fn().mockResolvedValue(mockCategory);
    const whereMock = jest.fn().mockReturnValue({ first: firstMock });
    (db as unknown as jest.Mock).mockReturnValue({ where: whereMock });

    const result = await findCategoryBySlug("reparacion");

    expect(db).toHaveBeenCalledWith("categories");
    expect(whereMock).toHaveBeenCalledWith({ slug: "reparacion" });
    expect(result).toEqual(mockCategory);
  });

  it("should return max sort order", async () => {
    const firstMock = jest.fn().mockResolvedValue({ max_sort_order: 3 });
    const maxMock = jest.fn().mockReturnValue({ first: firstMock });
    const whereMock = jest.fn().mockReturnValue({ max: maxMock });
    (db as unknown as jest.Mock).mockReturnValue({ where: whereMock });

    const result = await getMaxSortOrder(null);

    expect(result).toBe(3);
  });

  it("should return 0 if no sort order exists", async () => {
    const firstMock = jest.fn().mockResolvedValue({ max_sort_order: null });
    const maxMock = jest.fn().mockReturnValue({ first: firstMock });
    const whereMock = jest.fn().mockReturnValue({ max: maxMock });
    (db as unknown as jest.Mock).mockReturnValue({ where: whereMock });

    const result = await getMaxSortOrder(null);

    expect(result).toBe(0);
  });

  it("should create category and return new row", async () => {
    const mockCategory = { id: "uuid-1", name: "Laptops", slug: "laptops" };
    const returningMock = jest.fn().mockResolvedValue([mockCategory]);
    const insertMock = jest.fn().mockReturnValue({ returning: returningMock });
    (db as unknown as jest.Mock).mockReturnValue({ insert: insertMock });

    const result = await createCategory({
      name: "Laptops",
      slug: "laptops",
      sort_order: 1,
    });

    expect(db).toHaveBeenCalledWith("categories");
    expect(result).toEqual(mockCategory);
  });

  it("should return null if category is not found", async () => {
    const firstMock = jest.fn().mockResolvedValue(undefined);
    const whereMock = jest.fn().mockReturnValue({ first: firstMock });
    const selectMock = jest.fn().mockReturnValue({ where: whereMock });
    const leftJoinMock = jest.fn().mockReturnValue({ select: selectMock });
    (db as unknown as jest.Mock).mockReturnValue({ leftJoin: leftJoinMock });

    const result = await getCategoryById("non-existent-id");

    expect(result).toBeNull();
  });

  it("should return category with tags when found", async () => {
    const mockCategory = {
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
    };
    const mockTags = [{ id: "tag-uuid-1", name: "iphone", slug: "iphone" }];

    const firstMock = jest.fn().mockResolvedValue(mockCategory);
    const whereMock1 = jest.fn().mockReturnValue({ first: firstMock });
    const selectMock1 = jest.fn().mockReturnValue({ where: whereMock1 });
    const leftJoinMock = jest.fn().mockReturnValue({ select: selectMock1 });

    const whereMock2 = jest.fn().mockResolvedValue(mockTags);
    const selectMock2 = jest.fn().mockReturnValue({ where: whereMock2 });
    const joinMock = jest.fn().mockReturnValue({ select: selectMock2 });

    (db as unknown as jest.Mock)
      .mockReturnValueOnce({ leftJoin: leftJoinMock })
      .mockReturnValueOnce({ join: joinMock });

    const result = await getCategoryById("uuid-1");

    expect(result).toEqual({ category: mockCategory, tags: mockTags });
  });

  it("should return empty tags array if category has no tags", async () => {
    const mockCategory = {
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
    };

    const firstMock = jest.fn().mockResolvedValue(mockCategory);
    const whereMock1 = jest.fn().mockReturnValue({ first: firstMock });
    const selectMock1 = jest.fn().mockReturnValue({ where: whereMock1 });
    const leftJoinMock = jest.fn().mockReturnValue({ select: selectMock1 });

    const whereMock2 = jest.fn().mockResolvedValue([]);
    const selectMock2 = jest.fn().mockReturnValue({ where: whereMock2 });
    const joinMock = jest.fn().mockReturnValue({ select: selectMock2 });

    (db as unknown as jest.Mock)
      .mockReturnValueOnce({ leftJoin: leftJoinMock })
      .mockReturnValueOnce({ join: joinMock });

    const result = await getCategoryById("uuid-1");

    expect(result?.tags).toEqual([]);
  });

  it("should update category and return updated row", async () => {
    const mockUpdated = { id: "uuid-1", name: "Reparación Updated" };
    const returningMock = jest.fn().mockResolvedValue([mockUpdated]);
    const updateMock = jest.fn().mockReturnValue({ returning: returningMock });
    const whereMock = jest.fn().mockReturnValue({ update: updateMock });
    (db as unknown as jest.Mock).mockReturnValue({ where: whereMock });

    const result = await updateCategory("uuid-1", {
      name: "Reparación Updated",
    });

    expect(result).toEqual(mockUpdated);
  });

  it("should return null if category to update is not found", async () => {
    const returningMock = jest.fn().mockResolvedValue([]);
    const updateMock = jest.fn().mockReturnValue({ returning: returningMock });
    const whereMock = jest.fn().mockReturnValue({ update: updateMock });
    (db as unknown as jest.Mock).mockReturnValue({ where: whereMock });

    const result = await updateCategory("non-existent-id", { name: "Test" });

    expect(result).toBeNull();
  });

  it("should return search results", async () => {
    const mockRows = [{ id: "uuid-1", name: "Electrónica & móviles" }];
    const limitMock = jest.fn().mockResolvedValue(mockRows);
    const orderByMock = jest.fn().mockReturnValue({ limit: limitMock });
    const groupByMock = jest.fn().mockReturnValue({ orderBy: orderByMock });
    const andWhereMock = jest.fn().mockReturnValue({ groupBy: groupByMock });
    const whereMock = jest.fn().mockReturnValue({ andWhere: andWhereMock });
    const selectMock = jest.fn().mockReturnValue({ where: whereMock });
    const leftJoin2Mock = jest.fn().mockReturnValue({ select: selectMock });
    const leftJoin1Mock = jest
      .fn()
      .mockReturnValue({ leftJoin: leftJoin2Mock });
    (db as unknown as jest.Mock).mockReturnValue({ leftJoin: leftJoin1Mock });

    const result = await searchCategories("movil", 20);

    expect(result).toEqual(mockRows);
  });

  it("should find tag by name (case insensitive)", async () => {
    const mockTag = { id: "tag-1", name: "Phone" };

    const firstMock = jest.fn().mockResolvedValue(mockTag);
    const whereRawMock = jest.fn().mockReturnValue({ first: firstMock });

    (db as unknown as jest.Mock).mockReturnValue({
      whereRaw: whereRawMock,
    });

    const result = await findTagByName("phone");

    expect(whereRawMock).toHaveBeenCalledWith("LOWER(name) = ?", "phone");
    expect(result).toEqual(mockTag);
  });

  it("should create tag", async () => {
    const mockTag = { id: "tag-1", name: "Phone", slug: "phone" };

    const returningMock = jest.fn().mockResolvedValue([mockTag]);
    const insertMock = jest.fn().mockReturnValue({
      returning: returningMock,
    });

    (db as unknown as jest.Mock).mockReturnValue({
      insert: insertMock,
    });

    const result = await createTag({
      name: "Phone",
      slug: "phone",
    });

    expect(insertMock).toHaveBeenCalled();
    expect(result).toEqual(mockTag);
  });

  it("should search tags with limit", async () => {
    const mockTags = [{ id: "1", name: "iphone" }];

    const limitMock = jest.fn().mockReturnValue(mockTags);
    const whereRawMock = jest.fn().mockReturnValue({
      limit: limitMock,
    });

    (db as unknown as jest.Mock).mockReturnValue({
      whereRaw: whereRawMock,
    });

    const result = await searchTags("ip", 5);

    expect(whereRawMock).toHaveBeenCalledWith("LOWER(name) LIKE ?", ["ip%"]);
    expect(limitMock).toHaveBeenCalledWith(5);
    expect(result).toEqual(mockTags);
  });

  it("should attach tag to category", async () => {
    const insertMock = jest.fn().mockResolvedValue({});

    (db as unknown as jest.Mock).mockReturnValue({
      insert: insertMock,
    });

    await attachTagToCategory("cat-1", "tag-1");

    expect(insertMock).toHaveBeenCalledWith({
      category_id: "cat-1",
      tag_id: "tag-1",
    });
  });
  it("should detach tag from category", async () => {
    const deleteMock = jest.fn().mockResolvedValue(1);
    const whereMock = jest.fn().mockReturnValue({
      delete: deleteMock,
    });

    (db as unknown as jest.Mock).mockReturnValue({
      where: whereMock,
    });

    await detachTagFromCategory("cat-1", "tag-1");

    expect(whereMock).toHaveBeenCalledWith({
      category_id: "cat-1",
      tag_id: "tag-1",
    });
  });

  it("should check if category has tag", async () => {
    const firstMock = jest.fn().mockResolvedValue({ id: 1 });

    const whereMock = jest.fn().mockReturnValue({
      first: firstMock,
    });

    (db as unknown as jest.Mock).mockReturnValue({
      where: whereMock,
    });

    const result = await categoryHasTag("cat-1", "tag-1");

    expect(whereMock).toHaveBeenCalledWith({
      category_id: "cat-1",
      tag_id: "tag-1",
    });

    expect(result).toEqual({ id: 1 });
  });

  it("should return category stats", async () => {
    const firstBusinessesMock = jest.fn().mockResolvedValue({
      total: "5",
    });

    const whereBusinessesMock = jest.fn().mockReturnValue({
      count: jest.fn().mockReturnValue({
        first: firstBusinessesMock,
      }),
    });

    const firstServicesMock = jest.fn().mockResolvedValue({
      total: "12",
    });

    const whereServicesMock = jest.fn().mockReturnValue({
      count: jest.fn().mockReturnValue({
        first: firstServicesMock,
      }),
    });

    const joinMock = jest.fn().mockReturnValue({
      where: whereServicesMock,
    });

    (db as unknown as jest.Mock)
      .mockReturnValueOnce({
        where: whereBusinessesMock,
      })
      .mockReturnValueOnce({
        join: joinMock,
      });

    const result = await getCategoryStats("cat-1");

    expect(result).toEqual({
      businesses: {
        total: 5,
        delta: null,
        delta_label: null,
      },
      services_listed: {
        total: 12,
        delta: null,
      },
    });
  });
});
