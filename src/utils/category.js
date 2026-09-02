/*
 * TEAM EXTENSION: category is free text (see constants/categories.js), but
 * "FOOD", "food", and "Food" should all aggregate into one Pie Chart slice
 * rather than three. This module defines that case-insensitive grouping
 * and the display-name normalization used whenever a category is shown or
 * grouped, without ever rejecting a category db.js would otherwise accept.
 */
import { commonCategories } from '../constants/categories.js';

function cleanCategory(category) {
  if (typeof category !== 'string') {
    throw new TypeError('category must be a string.');
  }

  return category.trim().replace(/\s+/g, ' ');
}

/**
 * The grouping key used by chart aggregation: trimmed, whitespace-collapsed,
 * lowercased. Two categories with the same key are treated as the same
 * category for totals, even if their original casing/spacing differed.
 * @param {string} category - Raw category text.
 * @returns {string} Normalized grouping key.
 */
export function getCategoryKey(category) {
  return cleanCategory(category).toLocaleLowerCase('en-US');
}

/**
 * The label actually shown to the user. If the cleaned category matches one
 * of the common suggestions (case-insensitively), its canonical suggestion
 * spelling is used ("food" -> "Food"); otherwise the user's own free-text
 * spelling is preserved as-is.
 * @param {string} category - Raw category text.
 * @returns {string} Display-ready category label.
 */
export function getCategoryDisplayName(category) {
  const cleanedCategory = cleanCategory(category);
  const categoryKey = getCategoryKey(cleanedCategory);

  return commonCategories.find((commonCategory) => {
    return getCategoryKey(commonCategory) === categoryKey;
  }) ?? cleanedCategory;
}

// Applied when a cost is saved, so the value stored in db.js is already in
// its normalized display form rather than needing normalization every time
// it is later read back.
export function normalizeCategoryInput(category) {
  return getCategoryDisplayName(category);
}
