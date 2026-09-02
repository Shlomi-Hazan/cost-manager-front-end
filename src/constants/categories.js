/*
 * TEAM EXTENSION: the official course document requires `category` to be a
 * string but defines no fixed/official category list (OQ-004 in
 * docs/REQUIREMENTS.md). This list only powers UI suggestions in Add Cost —
 * it is not a closed official category set, and a custom category typed by
 * the user remains fully supported.
 *
 * db.js's own validateCost() accepts any string category, including an
 * empty one, matching only the documented type-level contract. The Add
 * Cost UI applies a stricter rule on top of that (rejecting blank/
 * whitespace-only category input) as a project/UI decision, not because
 * db.js itself requires non-empty content.
 */
export const commonCategories = [
  'Food',
  'Transportation',
  'Housing',
  'Bills',
  // Remaining suggestions, alphabetically unordered on purpose (most-used first).
  'Shopping',
  'Health',
  'Entertainment',
  'Education',
  'Travel',
  'Other'
];
