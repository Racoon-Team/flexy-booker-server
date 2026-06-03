import { AppError } from "../../utils/AppError";
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
    .filter((category) => category.parent_id === null)
    .map((parentCategory) => ({
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
    .filter((category) => category.parent_id !== null)
    .forEach((childCategory) => {
      const matchingParentCategory = parentCategories.find(
        (parentCategory) => parentCategory.id === childCategory.parent_id,
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
export const createCategory = async (data: {
  name: string;
  slug?: string;
  parent_id?: string | null;
  icon?: string;
  description?: string;
}) => {
  if (!data.name || data.name.trim() === "") {
    throw new AppError("Name is required", 422);
  }

  const baseSlug =
    data.slug ??
    data.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  let generatedSlug = baseSlug;
  let slugCounter = 2;

  while (await categoriesRepository.findCategoryBySlug(generatedSlug)) {
    generatedSlug = `${baseSlug}-${slugCounter}`;
    slugCounter++;
  }

  if (data.parent_id) {
    const parentCategory = await categoriesRepository.findCategoryById(
      data.parent_id,
    );

    if (!parentCategory) {
      throw new AppError("Parent category not found", 422);
    }

    if (parentCategory.parent_id) {
      throw new AppError("Only 2 levels of categories are allowed", 422);
    }
  }

  const sortOrder =
    (await categoriesRepository.getMaxSortOrder(data.parent_id ?? null)) + 1;

  return await categoriesRepository.createCategory({
    ...data,
    slug: generatedSlug,
    sort_order: sortOrder,
  });
};

export const updateCategory = async (
  id: string,
  data: {
    name?: string;
    slug?: string;
    icon?: string;
    description?: string;
    parent_id?: string | null;
    visibility?: {
      show_on_homepage?: boolean;
      show_in_search?: boolean;
      allow_new_businesses?: boolean;
      featured_on_homepage?: boolean;
    };
  },
) => {
  const existing = await categoriesRepository.findCategoryById(id);
  if (!existing) {
    throw new AppError("Category not found", 404);
  }

  if (data.slug && data.slug !== existing.slug) {
    const slugExists = await categoriesRepository.findCategoryBySlug(data.slug);
    if (slugExists) {
      throw new AppError("Slug already exists", 409);
    }
  }

  const incomingFeatured = data.visibility?.featured_on_homepage;
  const currentShowOnHomepage = existing.show_on_homepage;
  const incomingShowOnHomepage = data.visibility?.show_on_homepage;

  if (
    incomingFeatured === true &&
    (incomingShowOnHomepage === false ||
      (incomingShowOnHomepage === undefined && !currentShowOnHomepage))
  ) {
    throw new AppError(
      "Cannot feature on homepage if show_on_homepage is false",
      422,
    );
  }

  const { visibility, ...rest } = data;
  const updatePayload = {
    ...rest,
    ...(visibility ?? {}),
  };

  const updated = await categoriesRepository.updateCategory(id, updatePayload);

  return updated;
};

export const archiveCategory = async (id: string) => {
  const category = await categoriesRepository.findCategoryById(id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  if (category.status === "archived") {
    return {
      message: "Category already archived",
    };
  }

  const childrenCount = await categoriesRepository.countActiveChildren(id);

  const warning =
    childrenCount > 0
      ? {
          warning: `This category has ${childrenCount} active subcategories.`,
        }
      : {};

  await categoriesRepository.updateCategory(id, {
    status: "archived",
    show_on_homepage: false,
    featured_on_homepage: false,
    allow_new_businesses: false,
  });

  return {
    message: "Category archived successfully",
    ...warning,
  };
};
export const unarchiveCategory = async (id: string) => {
  const category = await categoriesRepository.findCategoryById(id);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  if (category.status === "active") {
    return {
      message: "Category already active",
    };
  }

  await categoriesRepository.updateCategory(id, {
    status: "active",
  });

  return {
    message: "Category unarchived successfully",
  };
};
