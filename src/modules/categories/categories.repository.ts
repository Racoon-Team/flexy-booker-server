import { db } from "../../db/knex";

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

  const rows = await db.raw(query);

  return rows.rows;
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
