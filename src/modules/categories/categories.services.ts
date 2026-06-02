import * as categoriesRepository from "./categories.repository";
import { AppError } from "../../utils/AppError";

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

export const getCategoryById = async (id: string) => {
  const result = await categoriesRepository.getCategoryById(id);

  if (!result) {
    throw new AppError("Category not found", 404);
  }

  const { category, tags } = result;

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    icon: category.icon,
    description: category.description,
    status: category.status,
    sort_order: category.sort_order,
    parent: category.parent_id
      ? {
          id: category.parent_id,
          name: category.parent_name,
          slug: category.parent_slug,
        }
      : null,
    visibility: {
      show_on_homepage: category.show_on_homepage,
      show_in_search: category.show_in_search,
      allow_new_businesses: category.allow_new_businesses,
      featured_on_homepage: category.featured_on_homepage,
    },
    tags,
    created_at: category.created_at,
    updated_at: category.updated_at,
  };
};
