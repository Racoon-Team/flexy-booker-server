import { db } from "../../db/knex";
import { CATEGORY_STATUS } from "./categories.constants";
export const getCategoriesTree = async (includeArchived = false) => {
  const query = `
    WITH RECURSIVE tree AS (
      SELECT
        c.id,
        c.parent_id,
        c.name,
        c.slug,
        c.icon,
        c.status,
        c.sort_order,
        0 AS depth
      FROM categories c
      WHERE c.parent_id IS NULL
      ${includeArchived ? "" : "AND c.status != 'archived'"}

      UNION ALL

      SELECT
        c.id,
        c.parent_id,
        c.name,
        c.slug,
        c.icon,
        c.status,
        c.sort_order,
        t.depth + 1
      FROM categories c
      INNER JOIN tree t ON c.parent_id = t.id
      ${includeArchived ? "" : "WHERE c.status != 'archived'"}
    )

    SELECT
      t.id,
      t.parent_id,
      t.name,
      t.slug,
      t.icon,
      t.status,
      t.sort_order,
      t.depth,
      COUNT(b.id)::int AS business_count
    FROM tree t
    LEFT JOIN businesses b
      ON b.category_id = t.id
    GROUP BY
      t.id,
      t.parent_id,
      t.name,
      t.slug,
      t.icon,
      t.status,
      t.sort_order,
      t.depth
    ORDER BY t.depth ASC, t.sort_order ASC;
  `;

  const result = await db.raw(query);

  return result.rows;
};

export const findCategoryById = async (id: string) => {
  return await db("categories").where({ id }).first();
};

export const findCategoryBySlug = async (slug: string) => {
  return await db("categories").where({ slug }).first();
};

export const getMaxSortOrder = async (parentId: string | null) => {
  const result = await db("categories")
    .where({ parent_id: parentId })
    .max("sort_order as max_sort_order")
    .first();

  return Number(result?.max_sort_order ?? 0);
};

export const createCategory = async (data: {
  name: string;
  slug: string;
  parent_id?: string | null;
  icon?: string;
  description?: string;
  sort_order: number;
  show_on_homepage?: boolean;
  show_in_search?: boolean;
  allow_new_businesses?: boolean;
  featured_on_homepage?: boolean;
}) => {
  const rows = await db("categories")
    .insert({
      name: data.name,
      slug: data.slug,
      parent_id: data.parent_id,
      icon: data.icon,
      description: data.description,
      sort_order: data.sort_order,
      show_on_homepage: data.show_on_homepage,
      show_in_search: data.show_in_search,
      allow_new_businesses: data.allow_new_businesses,
      featured_on_homepage: data.featured_on_homepage,
    })
    .returning("*");

  return rows[0];
};

export const getCategoryById = async (id: string) => {
  const category = await db("categories as c")
    .leftJoin("categories as p", "c.parent_id", "p.id")
    .select(
      "c.id",
      "c.name",
      "c.slug",
      "c.icon",
      "c.description",
      "c.status",
      "c.sort_order",
      "c.show_on_homepage",
      "c.show_in_search",
      "c.allow_new_businesses",
      "c.featured_on_homepage",
      "c.created_at",
      "c.updated_at",
      "p.id as parent_id",
      "p.name as parent_name",
      "p.slug as parent_slug",
    )
    .where("c.id", id)
    .first();

  if (!category) return null;

  const tags = await db("category_tags as ct")
    .join("tags as t", "ct.tag_id", "t.id")
    .select("t.id", "t.name", "t.slug")
    .where("ct.category_id", id);

  return { category, tags };
};

export const updateCategory = async (
  id: string,
  data: {
    name?: string;
    slug?: string;
    icon?: string;
    description?: string;
    parent_id?: string | null;
    status?: string;
    show_on_homepage?: boolean;
    show_in_search?: boolean;
    allow_new_businesses?: boolean;
    featured_on_homepage?: boolean;
  },
) => {
  const [updated] = await db("categories")
    .where({ id })
    .update({
      ...data,
      updated_at: db.fn.now(),
    })
    .returning("*");

  return updated ?? null;
};
export const countActiveChildren = async (parentId: string) => {
  const result = await db("categories")
    .where({
      parent_id: parentId,
      status: CATEGORY_STATUS.ACTIVE,
    })
    .count("* as count")
    .first();

  return Number(result?.count ?? 0);
};

export const searchCategories = async (q: string, limit: number) => {
  const rows = await db("categories as c")
    .leftJoin("categories as p", "c.parent_id", "p.id")
    .leftJoin("businesses as b", "b.category_id", "c.id")
    .select(
      "c.id",
      "c.name",
      "c.slug",
      "c.icon",
      "c.status",
      "p.id as parent_id",
      "p.name as parent_name",
      db.raw("COUNT(b.id)::int AS business_count"),
    )
    .where("c.status", "!=", "archived")
    .andWhere(function () {
      this.whereILike("c.name", `%${q}%`).orWhereILike("c.slug", `%${q}%`);
    })
    .groupBy("c.id", "c.name", "c.slug", "c.icon", "c.status", "p.id", "p.name")
    .orderBy("c.name")
    .limit(limit);

  return rows;
};
export const findTagByName = async (name: string) => {
  return db("tags").whereRaw("LOWER(name) = ?", name.toLowerCase()).first();
};

export const createTag = async (data: { name: string; slug: string }) => {
  const [tag] = await db("tags").insert(data).returning("*");
  return tag;
};
export const searchTags = async (query: string, limit: number) => {
  return db("tags")
    .whereRaw("LOWER(name) LIKE ?", [`${query.toLowerCase()}%`])
    .limit(limit);
};

export const attachTagToCategory = async (
  categoryId: string,
  tagId: string,
) => {
  return db("category_tags").insert({
    category_id: categoryId,
    tag_id: tagId,
  });
};

export const detachTagFromCategory = async (
  categoryId: string,
  tagId: string,
) => {
  return db("category_tags")
    .where({
      category_id: categoryId,
      tag_id: tagId,
    })
    .delete();
};

export const categoryHasTag = async (categoryId: string, tagId: string) => {
  return db("category_tags")
    .where({
      category_id: categoryId,
      tag_id: tagId,
    })
    .first();
};
