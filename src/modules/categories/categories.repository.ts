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
