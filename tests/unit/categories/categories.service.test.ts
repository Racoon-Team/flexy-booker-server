import * as categoriesRepository from "../../../src/modules/categories/categories.repository";
import * as categoriesService from "../../../src/modules/categories/categories.service";
import { AppError } from "../../../src/utils/AppError";

jest.mock("../../../src/modules/categories/categories.repository");

describe("categoriesService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getCategoryById", () => {
    it("should throw AppError 404 if category is not found", async () => {
      (categoriesRepository.getCategoryById as jest.Mock).mockResolvedValue(
        null,
      );

      await expect(
        categoriesService.getCategoryById("non-existent-id"),
      ).rejects.toThrow(AppError);

      await expect(
        categoriesService.getCategoryById("non-existent-id"),
      ).rejects.toThrow("Category not found");
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

      const result = await categoriesService.getCategoryById("uuid-1");

      expect(result.parent).toBeNull();
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

      const result = await categoriesService.getCategoryById("uuid-2");

      expect(result.parent).toEqual({
        id: "uuid-1",
        name: "Reparación",
        slug: "reparacion",
      });
    });

    it("should return empty tags array if category has no tags", async () => {
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

      const result = await categoriesService.getCategoryById("uuid-1");

      expect(result.tags).toEqual([]);
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

      const result = await categoriesService.getCategoryById("uuid-1");

      expect(result.visibility).toEqual({
        show_on_homepage: false,
        show_in_search: true,
        allow_new_businesses: true,
        featured_on_homepage: false,
      });
    });

    it("should return tags when category has tags", async () => {
      const mockTags = [
        { id: "tag-uuid-1", name: "iphone", slug: "iphone" },
        { id: "tag-uuid-2", name: "android", slug: "android" },
      ];

      (categoriesRepository.getCategoryById as jest.Mock).mockResolvedValue({
        category: {
          id: "uuid-1",
          name: "Electrónica & móviles",
          slug: "electronica-moviles",
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
        tags: mockTags,
      });

      const result = await categoriesService.getCategoryById("uuid-1");

      expect(result.tags).toEqual(mockTags);
    });
  });
});
