import { db } from "../../../src/db/knex";
import { getCategoriesTree } from "../../../src/modules/categories/categories.repository";

jest.mock("../../../src/db/knex", () => ({
  db: {
    raw: jest.fn(),
  },
}));

describe("categoriesRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return categories from database", async () => {
    const mockRows = [
      {
        id: "1",
        name: "Repair",
        business_count: 10,
      },
    ];

    (db.raw as jest.Mock).mockResolvedValue({
      rows: mockRows,
    });

    const result = await getCategoriesTree();

    expect(db.raw).toHaveBeenCalled();
    expect(result).toEqual(mockRows);
  });

  it("should include archived parameter", async () => {
    (db.raw as jest.Mock).mockResolvedValue({
      rows: [],
    });

    await getCategoriesTree(true);

    expect(db.raw).toHaveBeenCalled();
  });
});
