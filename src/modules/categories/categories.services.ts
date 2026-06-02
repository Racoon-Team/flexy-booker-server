import * as categoriesRepository from "./categories.repository";

type CategoryRow = {
  id: string;
  parent_id: string | null;
  name: string;
  slug: string;
  icon: string;
  status: string;
  sort_order: number;
  business_count: number | string;
};

type CategoryTreeNode = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  status: string;
  sort_order: number;
  business_count: number;
  children: CategoryTreeNode[];
};

export const getCategoriesTree = async (includeArchived?: boolean) => {
  const categories: CategoryRow[] =
    await categoriesRepository.getCategoriesTree(includeArchived);

  const parentCategories: CategoryTreeNode[] = categories
    .filter((category: CategoryRow) => category.parent_id === null)
    .map((parentCategory: CategoryRow) => ({
      id: parentCategory.id,
      name: parentCategory.name,
      slug: parentCategory.slug,
      icon: parentCategory.icon,
      status: parentCategory.status,
      sort_order: parentCategory.sort_order,
      business_count: Number(parentCategory.business_count),
      children: [],
    }));

  categories
    .filter((category: CategoryRow) => category.parent_id !== null)
    .forEach((childCategory: CategoryRow) => {
      const matchingParentCategory = parentCategories.find(
        (parentCategory: CategoryTreeNode) =>
          parentCategory.id === childCategory.parent_id,
      );

      if (matchingParentCategory) {
        matchingParentCategory.children.push({
          id: childCategory.id,
          name: childCategory.name,
          slug: childCategory.slug,
          icon: childCategory.icon,
          status: childCategory.status,
          sort_order: childCategory.sort_order,
          business_count: Number(childCategory.business_count),
          children: [],
        });
      }
    });

  return parentCategories;
};
