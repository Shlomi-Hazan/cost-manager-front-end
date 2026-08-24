import { COMMON_CATEGORIES } from "../constants/categories.js";

function cleanCategory(category) {
  if (typeof category !== "string") {
    throw new TypeError("category must be a string.");
  }

  return category.trim().replace(/\s+/g, " ");
}

export function getCategoryKey(category) {
  return cleanCategory(category).toLocaleLowerCase("en-US");
}

export function getCategoryDisplayName(category) {
  const cleanedCategory = cleanCategory(category);
  const categoryKey = getCategoryKey(cleanedCategory);

  return COMMON_CATEGORIES.find((commonCategory) => {
    return getCategoryKey(commonCategory) === categoryKey;
  }) ?? cleanedCategory;
}

export function normalizeCategoryInput(category) {
  return getCategoryDisplayName(category);
}
