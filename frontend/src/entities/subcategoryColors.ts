import { categoryColors } from "../shared/lib/constants";
import type { ISkillCategory } from "./types";

export function getSubcategoryColor(
  categories: ISkillCategory[],
  subcategoryId: number,
) {
  const category = categories.find((category) =>
    category.subcategories.some((subcat) => subcat.id === subcategoryId),
  );

  return category?.id ? categoryColors[category.id] : "var(--tag-add-color)";
}
