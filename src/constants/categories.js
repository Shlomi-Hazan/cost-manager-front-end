/*
 * TEAM EXTENSION: the official course document requires `category` to be a
 * string but defines no fixed/official category list (OQ-004 in
 * docs/REQUIREMENTS.md). This list only powers UI suggestions in Add Cost —
 * the db.js layer accepts any non-empty string, so a user typing a category
 * not on this list is fully supported, not an error.
 */
export const COMMON_CATEGORIES = [
  "Food",
  "Transportation",
  "Housing",
  "Bills",
  "Shopping",
  "Health",
  "Entertainment",
  "Education",
  "Travel",
  "Other"
];
