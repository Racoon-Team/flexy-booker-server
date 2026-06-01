import { db } from "../../../src/db/knex";
import {
  getCategoriesTree,
  getCategoryById,
} from "../../../src/modules/categories/categories.repository";

jest.mock("../../../src/db/knex", () => ({
  db: Object.assign(jest.fn(), { raw: jest.fn() }),
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
});
