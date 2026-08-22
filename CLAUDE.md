# CLAUDE.md

@intent.txt
@docs/REQUIREMENTS.md
@docs/ARCHITECTURE.md

# Claude Code — Repository Instructions

This repository contains the **Cost Manager Front-End** final project for the Front-End Development course.

Claude Code is primarily used as:

- a code reviewer,
- debugging assistant,
- architecture reviewer,
- edge-case finder,
- second implementation agent when explicitly requested.

Codex is expected to perform much of the primary implementation work, so preserve compatibility with the repository's documented architecture and existing work.

---

# 1. Before Working

Before changing code:

1. Read the imported project documents above.
2. Read `docs/TEST_PLAN.md` if it exists and the task changes behavior.
3. Read `docs/DECISIONS.md` if it exists and the task touches architecture.
4. Inspect the relevant implementation.
5. Inspect relevant tests.
6. If the request corresponds to a GitHub Issue or PR, read its full scope before editing.

Do not begin by rewriting code.

Understand the current implementation first.

---

# 2. Role in This Repository

When asked to **review**:

- review the actual diff/current code,
- identify correctness issues,
- identify requirement violations,
- identify API compatibility problems,
- identify untested edge cases,
- distinguish blockers from optional improvements.

Do not modify code during a review-only task.

When asked to **implement**:

- work only within the requested scope,
- preserve existing verified behavior,
- follow the repository architecture,
- add/update relevant tests,
- avoid unrelated refactors.

When asked to **debug**:

- identify the root cause before proposing broad changes,
- prefer the smallest correct fix,
- verify the fix with tests or a reproducible manual check.

---

# 3. Source of Truth

Resolve conflicts in this order:

1. Latest official course specification.
2. Official lecturer/course-forum clarifications.
3. `docs/REQUIREMENTS.md`.
4. `docs/ARCHITECTURE.md`.
5. Approved records in `docs/DECISIONS.md`.
6. Verified tests and protected public contracts.
7. Existing implementation.

If the code conflicts with a documented official requirement, the code is not automatically correct merely because it already exists.

---

# 4. Non-Negotiable Course Compatibility

Do not break these requirements:

- UI is in English.
- Main/base currency is USD.
- Required persistence uses localStorage.
- Required currency identifiers are exactly:

```text
USD
ILS
GBP
EURO
```

- Costs preserve their original currency.
- Exchange rates are retrieved through the Fetch API.
- The app has a default rate source.
- Settings can provide a custom rate source.
- Monthly detailed reports are supported.
- Monthly category Pie Chart is supported.
- Yearly 12-month Bar Chart is supported.
- Latest Google Chrome is a grading target.
- Two `db.js` versions are required.
- The standalone submitted `db.js` is Vanilla JavaScript.

---

# 5. Protected Vanilla `db.js` Contract

Treat this as externally owned API:

```javascript
const ob = db.openCostsDB("costsdb", 1);
ob.addCost(cost);
ob.getReport(currency, year, month);
```

Protected structure:

```text
db
 └── openCostsDB(databaseName, databaseVersion)
      └── database object
           ├── addCost(cost)
           └── getReport(currency, year, month)
```

Do not “clean up” this API into a different design.

In particular:

- do not move `getReport()` onto `db`,
- do not rename methods,
- do not reorder required arguments,
- do not make the required direct `getReport()` call incompatible by returning only a Promise unless an official clarification allows it,
- do not remove the global `db` property in the Vanilla build,
- do not add runtime module/import dependencies to the standalone Vanilla file.

The official sample test is not the entire contract; do not optimize only for its exact sample values.

---

# 6. Architecture Constraints

Current planned stack:

```text
JavaScript / JSX
React
Vite
MUI
Recharts
localStorage
Fetch API
Vitest
ESLint
Git / GitHub
```

Do not introduce major new dependencies by default.

Do not add without explicit approval:

- TypeScript,
- React Router,
- Redux,
- Zustand,
- another chart library,
- backend database services,
- IndexedDB,
- Firebase.

If you believe one is needed, explain the problem first and propose it as an architecture decision rather than silently installing it.

---

# 7. Keep Business Logic Outside UI Components

Preferred dependency direction:

```text
UI
 ↓
services / db / utilities
 ↓
browser APIs
```

Do not place core algorithms directly in pages/components if they belong in reusable logic.

Examples:

- currency conversion,
- monthly filtering,
- report totals,
- category aggregation,
- yearly aggregation,
- rates validation,
- persistence.

Avoid direct localStorage access from random components when a repository/service layer owns the concern.

---

# 8. Review Priorities

When reviewing Codex-generated code, review in this order:

1. **Official requirement compliance**
2. **Protected API compatibility**
3. **Correctness**
4. **Data integrity**
5. **Edge cases**
6. **Tests**
7. **Architecture boundaries**
8. **Maintainability**
9. **UI polish**
10. **Optional refactoring**

A stylistic improvement is not more important than grader compatibility.

---

# 9. Known Ambiguities

Do not silently resolve unresolved course questions.

Important open items include:

```text
OQ-001
Whether report item sums are converted or preserve original values/currencies.

OQ-002
Exact externally returned report date structure.

OQ-003
How asynchronous Fetch integrates with the synchronous-looking getReport()
grading contract.

OQ-004
No official fixed category list is currently defined.

OQ-005
Detailed validation constraints are not fully specified.
```

If code relies on an interpretation, identify it explicitly.

Do not present an inference as if the lecturer stated it.

---

# 10. Currency Review Rules

Canonical identifiers:

```text
USD
ILS
GBP
EURO
```

Expected rates shape:

```json
{
  "USD": 1,
  "GBP": 0.6,
  "EURO": 0.7,
  "ILS": 3.4
}
```

Expected conceptual conversion:

```javascript
amount / rates[sourceCurrency] * rates[targetCurrency]
```

Check for:

- inverted conversion formulas,
- accidental use of `EUR`,
- mutation of original cost currency,
- rounding done too early,
- duplicated conversion implementations,
- missing validation for malformed rate responses.

---

# 11. Chart Review Rules

## Pie Chart

Verify that data represents:

```text
selected month
+
selected year
+
selected target currency
+
totals grouped by category
```

## Bar Chart

Verify that data represents:

```text
selected year
+
selected target currency
+
all 12 months
```

Months with no costs should still produce zero values in chart aggregation.

Chart components should receive prepared data rather than contain the full aggregation algorithm.

---

# 12. Testing Expectations

When implementation changes behavior, expect relevant tests.

Important areas:

- `openCostsDB`,
- `addCost`,
- `getReport`,
- localStorage persistence,
- default current month/year,
- currency conversion,
- rates validation,
- category aggregation,
- yearly aggregation,
- multiple costs,
- mixed currencies where official behavior is established.

Never recommend deleting a failing test merely because the implementation currently disagrees with it.

First determine whether the test or implementation matches the official requirement.

---

# 13. Vanilla Compatibility Testing

Changes affecting `db.js` require special attention.

The project must maintain a standalone HTML test path such as:

```text
vanilla/db-test.html
```

The Vanilla file must work without:

- React,
- Vite runtime,
- npm imports,
- ES module script mode unless the official grading environment explicitly supports it.

Review for browser-global compatibility.

---

# 14. Error Handling

Prefer explicit, understandable failure behavior.

Review for:

- malformed localStorage data,
- unavailable rate server,
- malformed exchange-rate JSON,
- unsupported currency values,
- invalid form data,
- missing report data,
- accidental crashes on empty datasets.

Do not overengineer.

A small clear error path is better than a complex abstraction.

---

# 15. Code Style

Use maintainable JavaScript suitable for academic review.

Prefer:

- descriptive names,
- small functions,
- single responsibility,
- centralized constants,
- clear control flow,
- minimal duplication.

Avoid:

- clever one-liners that reduce readability,
- unnecessary design patterns,
- excessive abstraction,
- giant components,
- hidden side effects.

Comments should use:

```javascript
// ...
```

or:

```javascript
/* ... */
```

Do not add JSDoc unless explicitly requested.

---

# 16. Scope Control

If asked to review Issue #X, do not broaden the work into redesigning unrelated modules.

If you notice unrelated problems:

- mention them separately,
- label them as follow-up,
- do not modify them unless requested.

Do not use review findings as justification for a repository-wide rewrite.

---

# 17. Git / PR Awareness

Preferred workflow:

```text
Issue
 ↓
Branch
 ↓
Implementation
 ↓
Tests
 ↓
Review
 ↓
PR
 ↓
CI
 ↓
Merge
```

During PR review, pay attention to:

- unrelated files changed,
- hidden API changes,
- missing tests,
- documentation drift,
- accidental dependency additions,
- direct changes to generated/submission-only files,
- secrets or environment data.

---

# 18. Validation Before Declaring Success

When scripts exist, expect:

```bash
npm run lint
npm test
npm run build
```

For changes affecting the Vanilla library, also verify the standalone browser test where possible.

For deployment changes, verify the production URL in Chrome.

If you cannot run a check, say so.

Do not claim a test passed unless it was actually run or the result was directly provided.

---

# 19. Review Output Format

For code-review tasks, structure findings as:

## Blocking

Issues that can violate requirements, break behavior, lose data, break the grader API, or prevent submission.

## Important

Correctness, testing, maintainability, or meaningful UX issues that should be fixed before merge.

## Optional

Non-essential improvements that do not block the requested task.

For every finding, include:

- file/path,
- relevant code/behavior,
- why it matters,
- related requirement ID when applicable,
- smallest recommended fix.

If there are no blocking findings, explicitly say so.

---

# 20. Implementation Completion Format

When you implement rather than review, finish with:

## Changed

What was implemented.

## Files

Which files changed.

## Requirements

Relevant requirement IDs.

## Validation

Exactly what was run and whether it passed.

## Notes

Remaining ambiguity, assumptions, or follow-up tasks.

---

# 21. Documentation Discipline

Use the correct source document:

```text
intent.txt
→ project purpose

docs/REQUIREMENTS.md
→ official requirements

docs/ARCHITECTURE.md
→ system design

docs/DECISIONS.md
→ architecture decisions

docs/TEST_PLAN.md
→ testing strategy

docs/SUBMISSION_CHECKLIST.md
→ submission preparation

README.md
→ human project documentation
```

Do not duplicate entire sections unnecessarily.

If a course clarification changes behavior, update `docs/REQUIREMENTS.md` before treating the new behavior as canonical.

---

# 22. Final Principle

The objective is not to make the code “more sophisticated.”

The objective is to produce the smallest, clearest implementation that:

```text
meets the official specification
+
preserves grader compatibility
+
works correctly
+
is testable
+
is easy to review
+
is safe to submit
```
