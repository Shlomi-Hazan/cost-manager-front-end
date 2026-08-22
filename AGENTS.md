# AGENTS.md

## Project

**Cost Manager Front-End**  
Final project for the Front-End Development course.

This repository is developed primarily with **Codex**, with occasional review/debugging support from **Claude Code**.

This file contains repository-level operating instructions for Codex.

---

# 1. Read Before Making Changes

Before modifying code, read the following files in this order:

1. `intent.txt`
2. `docs/REQUIREMENTS.md`
3. `docs/ARCHITECTURE.md`
4. `docs/TEST_PLAN.md` — when it exists
5. `docs/DECISIONS.md` — when it exists and when the task touches architecture
6. `docs/SUBMISSION_CHECKLIST.md` — for submission-related tasks

If the current task references a GitHub Issue, read the entire issue before editing.

Do not begin implementation until the relevant requirements and existing code have been inspected.

---

# 2. Source of Truth

Use this priority order when resolving conflicts:

1. Latest official course specification.
2. Official lecturer/course-forum clarifications.
3. `docs/REQUIREMENTS.md`.
4. `docs/ARCHITECTURE.md`.
5. Approved decisions in `docs/DECISIONS.md`.
6. Existing verified tests and API contracts.
7. Existing implementation.

If repository documentation conflicts with an official requirement, do not silently choose one.

Report the conflict and update the documentation only after the correct interpretation is established.

---

# 3. Core Project Requirements That Must Not Be Broken

The following are non-negotiable unless an official course clarification explicitly changes them:

- The application is a front-end Cost Manager.
- User-facing UI is in **English**.
- The main/base currency is **USD**.
- Cost data is persisted using **localStorage**.
- Supported currency identifiers are exactly:

```text
USD
ILS
GBP
EURO
```

Do not replace `EURO` with `EUR`.

- Users can add cost items.
- Each cost includes:
  - `sum`
  - `currency`
  - `category`
  - `description`
  - the date on which it was added
- The original cost currency must remain preserved.
- The application supports:
  - detailed monthly reports,
  - monthly Pie Chart by category,
  - yearly Bar Chart covering all 12 months,
  - currency selection for reports/charts,
  - Fetch-based exchange-rate retrieval,
  - a default exchange-rate URL,
  - a custom exchange-rate URL through Settings.
- The final project must work in the latest Google Chrome.
- The project must be deployable to an Internet-accessible web server.
- Two `db.js` versions are required:
  - module-compatible version,
  - standalone Vanilla JavaScript version.

---

# 4. Protected `db.js` Public Contract

The Vanilla library is externally tested.

The following usage pattern is protected:

```javascript
const ob = db.openCostsDB("costsdb", 1);

ob.addCost({
  sum: 200,
  currency: "USD",
  category: "FOOD",
  description: "pizza"
});

const report = ob.getReport("USD");
```

Required public structure:

```text
db
 └── openCostsDB(databaseName, databaseVersion)
      └── database object
           ├── addCost(cost)
           └── getReport(currency, year, month)
```

Do not:

- move `getReport()` to `db.getReport()`,
- require `await ob.getReport(...)` unless an official clarification explicitly permits it,
- rename required methods,
- change required argument ordering,
- remove global `db` behavior from the Vanilla file,
- make the Vanilla library depend on React, Vite, or runtime imports.

The standalone submitted `db.js` must work through:

```html
<script src="db.js"></script>
```

---

# 5. Architecture Direction

The planned stack is:

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

Do not introduce alternative major technologies without explicit approval.

In particular, do not add by default:

- TypeScript,
- Redux,
- Zustand,
- React Router,
- a second chart library,
- a backend database,
- IndexedDB,
- Firebase,
- another persistence technology.

Architecture changes must be justified and documented in `docs/DECISIONS.md`.

---

# 6. Dependency Direction

Prefer:

```text
React UI
   ↓
services / utilities / db
   ↓
browser APIs
```

Core business logic must not depend on React or MUI.

Examples of logic that should stay outside visual components:

- localStorage persistence,
- currency conversion,
- monthly report calculations,
- category aggregation,
- yearly month aggregation,
- exchange-rate response validation.

Do not read/write localStorage directly from arbitrary UI components when the responsibility belongs to `db.js` or a service.

---

# 7. Scope Discipline

Work only on the requested task, milestone, or GitHub Issue.

Before editing:

- inspect the relevant files,
- inspect current Git state if available,
- identify the requirements affected,
- identify existing tests,
- identify public APIs that must remain stable.

Do not perform unrelated cleanup or refactoring.

A task to implement one feature is not permission to redesign the project.

If a separate problem is discovered:

1. mention it,
2. leave unrelated code unchanged,
3. recommend a separate Issue/task.

---

# 8. Ambiguities: Do Not Guess

Known unresolved questions are tracked in `docs/REQUIREMENTS.md`.

Important examples include:

- `OQ-001` — whether individual report cost sums are converted or remain in original currency.
- `OQ-002` — exact externally returned date shape.
- `OQ-003` — asynchronous Fetch versus synchronous-looking `getReport()` contract.
- `OQ-004` — no official fixed category list.
- `OQ-005` — detailed validation rules are not fully specified.

Do not convert assumptions into “requirements.”

If a task depends on an unresolved ambiguity:

1. identify the ambiguity,
2. preserve compatibility with official examples where possible,
3. avoid irreversible architecture choices,
4. request/record clarification when necessary.

---

# 9. Coding Rules

Use clear, maintainable JavaScript.

General rules:

- Prefer small functions with one responsibility.
- Prefer descriptive names.
- Avoid duplicated business logic.
- Avoid magic strings when a shared constant is appropriate.
- Keep the supported currency list centralized.
- Handle malformed external data defensively.
- Do not swallow errors silently.
- Avoid unnecessary abstractions.
- Keep the implementation understandable for a university code review.

Comments:

- Use normal JavaScript comments only:

```javascript
// comment
```

or:

```javascript
/* comment */
```

- Do not add JSDoc unless explicitly requested.
- Add comments where they clarify non-obvious logic.
- Do not comment obvious syntax line-by-line.

---

# 10. Currency Rules

Use a single canonical supported-currency definition.

Required identifiers:

```text
USD
ILS
GBP
EURO
```

Expected exchange-rate response:

```json
{
  "USD": 1,
  "GBP": 0.6,
  "EURO": 0.7,
  "ILS": 3.4
}
```

This means each value represents how much of that currency equals `1 USD`.

Conceptual conversion formula:

```javascript
amount / rates[sourceCurrency] * rates[targetCurrency]
```

Do not duplicate conversion formulas in pages/components.

---

# 11. localStorage Rules

The project must use localStorage for required persistence.

Do not replace it with another database.

When changing storage structure:

- preserve required behavior,
- consider existing data where relevant,
- update tests,
- document meaningful schema decisions.

The `databaseName` and `databaseVersion` arguments to `openCostsDB()` should not be casually ignored without an intentional implementation decision.

---

# 12. React/UI Rules

The UI is responsible for:

- collecting input,
- displaying output,
- displaying errors/loading states,
- invoking application logic.

The UI should not own persistence/report/conversion algorithms.

Keep state local when possible.

Do not introduce a global state library unless a real need is demonstrated and approved.

Keep all user-facing text in English.

---

# 13. Testing Expectations

When behavior changes, add or update relevant tests.

Eventually the project should cover:

- currency conversion,
- cost validation where applicable,
- `openCostsDB()`,
- `addCost()`,
- `getReport()`,
- current month/year defaults,
- localStorage persistence,
- monthly report calculations,
- category aggregation,
- yearly 12-month aggregation,
- exchange-rate response validation.

The lecturer-provided Vanilla HTML compatibility test is mandatory.

Passing only the exact sample values is insufficient.

Do not hard-code logic to the official sample.

Do not delete, weaken, or skip tests merely to make the task pass.

---

# 14. Validation Before Completing a Task

Run the relevant checks available at that stage.

Once project scripts exist, the normal completion checks are:

```bash
npm run lint
npm test
npm run build
```

Also run targeted tests for the files changed.

For changes to Vanilla `db.js`, verify the standalone HTML compatibility test in Chrome when possible.

For deployment-related changes, perform a production smoke test.

If a check cannot be run, state exactly which check was not run and why.

Do not claim validation that was not actually performed.

---

# 15. Git / GitHub Workflow

Preferred flow:

```text
Requirement
    ↓
GitHub Issue
    ↓
Feature/Task Branch
    ↓
Implementation
    ↓
Tests + Lint + Build
    ↓
Pull Request
    ↓
Review
    ↓
Merge to main
```

Do not push directly to `main` unless explicitly instructed.

Do not merge your own work unless explicitly instructed.

Keep commits focused.

Suggested branch naming:

```text
docs/<topic>
feature/<topic>
fix/<topic>
test/<topic>
chore/<topic>
```

Suggested commit style:

```text
chore: initialize project
docs: add architecture documentation
feat: implement add cost flow
fix: preserve original cost currency
test: add db contract coverage
```

Do not create giant mixed-purpose commits.

---

# 16. Repository Hygiene

Never commit:

- passwords,
- private keys,
- API tokens,
- GitHub tokens,
- private credentials,
- `.env` secrets,
- `node_modules`.

Do not add a secret dependency to a feature that can work using the required static exchange-rate JSON.

---

# 17. Documentation Updates

Update documentation when the implementation changes a documented behavior or architecture decision.

Use the correct document:

```text
intent.txt
→ project purpose and priorities

docs/REQUIREMENTS.md
→ official requirements and ambiguities

docs/ARCHITECTURE.md
→ structure and system boundaries

docs/DECISIONS.md
→ meaningful architecture decisions

docs/TEST_PLAN.md
→ verification strategy

docs/SUBMISSION_CHECKLIST.md
→ final packaging/submission

README.md
→ human-facing setup and usage
```

Avoid duplicating large instruction blocks across documents.

---

# 18. Definition of Done for a Coding Task

A task is complete only when, where applicable:

- requested scope is implemented,
- affected requirements are identified,
- protected APIs remain compatible,
- relevant tests are added/updated,
- relevant tests pass,
- lint passes,
- production build passes,
- no unrelated changes were introduced,
- documentation is updated if necessary,
- unresolved ambiguities are explicitly reported,
- the final summary clearly states what changed and what was verified.

---

# 19. Required Final Response After an Implementation Task

When finishing a coding task, provide a concise report containing:

## Changed

- files changed,
- behavior implemented.

## Requirements

- relevant requirement IDs from `docs/REQUIREMENTS.md`.

## Validation

- tests run,
- lint status,
- build status,
- manual checks performed.

## Remaining Issues

- ambiguities,
- failed checks,
- follow-up work,
- anything intentionally left unchanged.

Do not say “done” without this evidence.

---

# 20. Final Rule

Optimize for:

```text
requirement compliance
        ↓
grader compatibility
        ↓
correctness
        ↓
small controlled changes
        ↓
testing
        ↓
review
        ↓
traceable Git history
```

Do not optimize for maximum code volume, maximum abstraction, or fastest possible completion.
