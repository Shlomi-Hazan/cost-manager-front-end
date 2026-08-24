# Cost Manager Front-End — Architecture Decisions

> **Purpose:** Record important project decisions so that Codex, Claude Code, and human contributors do not repeatedly reopen settled architectural choices without a real reason.
>
> This file records **project decisions**, not official course requirements.
>
> Official requirements remain defined in `docs/REQUIREMENTS.md`.

---

# 1. Decision Record Format

Each architecture decision uses this structure:

```text
ID
Status
Date
Decision
Context
Alternatives
Reason
Consequences
Revisit when
```

Statuses:

```text
ACCEPTED
PROVISIONAL
SUPERSEDED
REJECTED
```

A decision marked `PROVISIONAL` is intentionally not fully locked because an official clarification or implementation experiment is still required.

---

# ADR-001 — Use React

**Status:** ACCEPTED  
**Date:** 2026-08-22

## Decision

Use **React** for the main application UI.

## Context

The official project specification permits both:

- React/MUI,
- Vanilla JavaScript.

The application contains multiple interactive views:

- Add Cost,
- Monthly Report,
- Charts,
- Settings.

## Alternatives

1. Vanilla JavaScript UI.
2. React.
3. Larger application framework.

## Reason

React gives us:

- reusable components,
- state-driven UI,
- clean feature separation,
- easy MUI integration,
- good compatibility with AI-assisted development.

It is permitted by the official specification.

## Consequences

- Main application files use `.jsx` where appropriate.
- Core business logic must remain usable outside React.
- Standalone Vanilla `db.js` remains independent from React.

## Revisit when

Only if React itself creates a direct grading/compatibility problem.

---

# ADR-002 — Use Vite

**Status:** ACCEPTED  
**Date:** 2026-08-22

## Decision

Use **Vite** as the development and production build tool.

## Context

A small React application needs:

- development server,
- module support,
- production build.

## Alternatives

1. Manual HTML/JS setup.
2. Create React App.
3. Vite.
4. Full-stack React framework.

## Reason

Vite is lightweight and appropriate for a client-side course project.

It avoids unnecessary framework complexity.

## Consequences

- Development uses Vite scripts.
- Production is a static build.
- The Vanilla grading file must not depend on Vite at runtime.

---

# ADR-003 — Use JavaScript, Not TypeScript

**Status:** ACCEPTED  
**Date:** 2026-08-22

## Decision

Use **JavaScript / JSX** rather than TypeScript.

## Context

The official specification is explicitly centered on JavaScript, HTML, and CSS.

The Vanilla `db.js` must also be plain JavaScript.

## Alternatives

1. JavaScript.
2. TypeScript.

## Reason

JavaScript:

- aligns directly with the course terminology,
- reduces tooling complexity,
- simplifies Vanilla compatibility,
- avoids introducing an unnecessary language layer.

## Consequences

- No `.ts` or `.tsx` files by default.
- Validation and tests must compensate for the absence of static typing where useful.

## Revisit when

Only with explicit project-owner approval and a strong course-compatible reason.

---

# ADR-004 — Use MUI for UI Components

**Status:** ACCEPTED  
**Date:** 2026-08-22

## Decision

Use **MUI** as the main UI component library.

## Context

The official specification explicitly permits MUI with React.

The application needs standard desktop UI components:

- forms,
- navigation,
- cards,
- buttons,
- tables,
- alerts.

## Alternatives

1. Custom CSS only.
2. Bootstrap.
3. MUI.
4. Another component library.

## Reason

MUI is allowed by the course document and reduces time spent rebuilding standard controls.

## Consequences

- UI should remain visually consistent.
- Core logic must not depend on MUI.
- Avoid mixing multiple component libraries without need.

---

# ADR-005 — Use Recharts as the Single Chart Library

**Status:** ACCEPTED  
**Date:** 2026-08-22

## Decision

Use **Recharts** for both the Pie Chart and Bar Chart.

## Context

The project requires:

- monthly category Pie Chart,
- yearly Bar Chart.

## Alternatives

1. Chart.js.
2. Recharts.
3. Multiple chart libraries.

## Reason

Recharts integrates naturally with React and supports both required chart types.

Using one chart library avoids unnecessary dependencies.

## Consequences

- Do not install Chart.js in parallel unless this decision is revisited.
- Data aggregation remains outside Recharts components.

## Revisit when

If Recharts cannot satisfy a mandatory requirement or causes deployment/browser incompatibility.

---

# ADR-006 — Use localStorage as the Required Persistence Layer

**Status:** ACCEPTED  
**Date:** 2026-08-22

## Decision

All required persisted application data will use **localStorage**.

## Context

This is an explicit official requirement.

## Alternatives

No alternative persistence mechanism may replace localStorage for the required project behavior.

## Reason

Course requirement.

## Consequences

Do not replace required persistence with:

- IndexedDB,
- Firebase,
- backend database,
- SQL,
- another browser database.

Additional temporary in-memory state is allowed, but localStorage remains the persistent source.

---

# ADR-007 — Maintain Two `db.js` Forms

**Status:** ACCEPTED  
**Date:** 2026-08-22

## Decision

Maintain:

```text
src/lib/db.js
vanilla/db.js
```

## Context

The course explicitly requires:

1. module-compatible `db.js`,
2. standalone Vanilla `db.js`.

## Reason

Direct requirement.

## Consequences

Both versions must preserve equivalent required behavior.

The standalone file must:

- work through normal `<script src="db.js"></script>`,
- expose global `db`,
- have no unresolved imports.

Logic drift between versions must be prevented through contract tests.

---

# ADR-008 — Protect the Official `db.js` API

**Status:** ACCEPTED  
**Date:** 2026-08-22

## Decision

Treat the following as an externally owned compatibility contract:

```javascript
const ob = db.openCostsDB("costsdb", 1);
ob.addCost(cost);
ob.getReport(currency, year, month);
```

## Context

The official course document provides grading-compatible sample code and explicitly corrected the call from `db.getReport(...)` to `ob.getReport(...)`.

## Consequences

Do not redesign this API merely for internal elegance.

Required method ownership and argument ordering remain stable.

---

# ADR-009 — No Global State Library Initially

**Status:** ACCEPTED  
**Date:** 2026-08-22

## Decision

Do not add Redux, Zustand, MobX, or another global state library.

## Context

The application is small.

Most state belongs naturally to individual views.

## Reason

A global state library would add complexity without a demonstrated requirement.

## Consequences

Use:

- local component/page state,
- small services,
- `db.js`,
- localStorage where persistence is required.

## Revisit when

Only if shared state becomes genuinely difficult to manage with ordinary React patterns.

---

# ADR-010 — No React Router Initially

**Status:** ACCEPTED  
**Date:** 2026-08-22

## Decision

Do not add React Router during initial implementation.

## Context

The application can function as a small SPA with a navigation control and active view.

The official requirements do not require URL routing.

## Reason

Keep the project simple.

## Consequences

Initial navigation may be controlled by React state.

## Revisit when

If URL-based routes materially improve required behavior or deployment without adding unnecessary risk.

---

# ADR-011 — Keep Business Logic Outside React Components

**Status:** ACCEPTED  
**Date:** 2026-08-22

## Decision

Persistence, conversion, reporting, and chart aggregation logic will live outside visual React components.

## Examples

Belongs outside UI:

```text
currency conversion
localStorage access
report calculations
category aggregation
yearly aggregation
exchange-rate validation
```

## Reason

This improves:

- testability,
- Vanilla compatibility,
- maintainability,
- code review.

## Consequences

Pages should call functions/services rather than reproduce algorithms.

---

# ADR-012 — Centralize Supported Currency Identifiers

**Status:** ACCEPTED  
**Date:** 2026-08-22

## Decision

Maintain one canonical supported-currency list:

```javascript
[
  "USD",
  "ILS",
  "GBP",
  "EURO"
]
```

## Reason

The official specification uses these exact identifiers.

## Consequences

- Do not use `EUR`.
- UI, validation, services, and calculations should share the same canonical values.

---

# ADR-013 — Use One Reusable Currency Conversion Utility

**Status:** ACCEPTED  
**Date:** 2026-08-22

## Decision

Currency conversion logic should be implemented in one reusable non-UI module.

Conceptual API:

```javascript
convertCurrency(
  amount,
  sourceCurrency,
  targetCurrency,
  rates
)
```

## Reason

Avoid:

- duplicated formulas,
- inconsistent chart/report behavior,
- hard-to-test conversions.

## Consequences

Reports and charts should consume the same conversion behavior.

---

# ADR-014 — Use GitHub Issues + Branches + Pull Requests

**Status:** ACCEPTED  
**Date:** 2026-08-22

## Decision

Meaningful development work will follow:

```text
Requirement
↓
Issue
↓
Branch
↓
Implementation
↓
Tests
↓
Pull Request
↓
Review
↓
Merge
```

## Reason

The project should be documented from the beginning and preserve teamwork/development evidence.

## Consequences

Avoid direct feature development on `main`.

Keep changes scoped.

---

# ADR-015 — Codex Is the Primary Coding Agent

**Status:** ACCEPTED  
**Date:** 2026-08-22

## Decision

Use **Codex** as the primary AI implementation agent.

Use **Claude Code** mainly for:

- code review,
- debugging,
- architecture review,
- second opinion,
- selected implementation tasks.

## Reason

This matches the intended development workflow.

## Consequences

Codex reads `AGENTS.md`.

Claude Code reads `CLAUDE.md`.

Both must use the same official requirements and architecture sources.

Do not have both agents independently modify the same branch at the same time.

---

# ADR-016 — Use Vitest for Automated Unit Tests

**Status:** ACCEPTED  
**Date:** 2026-08-22

## Decision

Use **Vitest** for application-level automated unit tests.

## Context

The project uses Vite.

## Reason

Vitest integrates well with Vite and is sufficient for the project's small test suite.

## Consequences

Critical pure logic should be testable without launching the full browser UI.

The official Vanilla HTML test remains separate and mandatory.

---

# ADR-017 — Use ESLint

**Status:** ACCEPTED  
**Date:** 2026-08-22

## Decision

Use ESLint for automated JavaScript/JSX quality checks.

## Reason

Supports maintainability and helps catch common mistakes before merge.

## Consequences

Pull Requests should eventually require lint to pass.

ESLint configuration should remain practical and not become a project unto itself.

---

# ADR-018 — Default Exchange-Rate Source Is Team-Controlled

**Status:** ACCEPTED  
**Date:** 2026-08-22

## Decision

Provide a default Internet-accessible static exchange-rate JSON source controlled/deployed by the project team.

## Context

The application must work even if the user never supplies a Settings URL.

## Consequences

The default source must be:

- publicly accessible,
- Fetch-compatible,
- stable during grading,
- shaped according to the required JSON model.

The final hosting location will be decided during the exchange-rate/deployment milestone.

---

# ADR-019 — Persist Custom Exchange-Rate URL

**Status:** ACCEPTED  
**Date:** 2026-08-22

## Decision

Persist the user-configured exchange-rate URL in localStorage.

## Context

The project includes a Settings option for the URL.

## Reason

Settings should survive page refresh and browser reopening on the same origin.

## Consequences

Rate-source selection becomes:

```text
custom URL exists
    ↓ yes
use custom URL

custom URL absent
    ↓
use default URL
```

---

# ADR-020 — Cache Last Valid Exchange Rates

**Status:** PROVISIONAL  
**Date:** 2026-08-22

## Decision

Plan to cache the latest successfully fetched and validated exchange rates in localStorage.

## Context

The project must retrieve exchange rates through Fetch, while the official sample calls `getReport()` synchronously.

A validated cache may allow:

```text
Fetch asynchronously
↓
store latest valid rates
↓
synchronous report calculation consumes cached rates
```

## Alternatives

1. Make `getReport()` asynchronous.
2. Use cached rates.
3. Separate network preparation from report generation.
4. Another approach after lecturer clarification.

## Reason

Changing the official-looking `getReport()` contract to Promise-based behavior could break grading compatibility.

## Consequences

This decision is not fully locked.

Do not implement irreversible behavior until `OQ-003` is resolved or the approach is validated.

## Revisit when

During the `db.js` + exchange-rate design milestone or after course clarification.

---

# ADR-021 — Proposed Internal Cost Date Stores Day, Month, and Year

**Status:** PROVISIONAL  
**Date:** 2026-08-22

## Decision

Proposed internal stored date structure:

```javascript
date: {
  day: 22,
  month: 8,
  year: 2026
}
```

## Context

Monthly/yearly filtering requires month and year.

The official report example only visibly shows:

```javascript
date: { day: 12 }
```

## Reason

The storage layer needs enough information to identify the selected month/year.

## Consequences

Internal storage may contain more date information than the report object exposes.

The exact external report date shape remains unresolved under `OQ-002`.

## Revisit when

Before finalizing `getReport()` output.

---

# ADR-022 — Do Not Define a Fixed Category List Yet

**Status:** ACCEPTED  
**Date:** 2026-08-22

## Decision

Do not make the core `db.js` API depend on a closed predefined category list.

## Context

The official document requires a category string but does not define an official category set.

## Reason

A closed list could incorrectly reject grader input.

## Consequences

The UI may later provide convenient choices, but core required behavior must remain compatible with category strings unless the lecturer clarifies otherwise.

---

# ADR-023 — Keep Validation Conservative

**Status:** ACCEPTED  
**Date:** 2026-08-22

## Decision

Add sensible UI validation, but do not impose undocumented restrictions that could break required API compatibility.

## Context

The specification defines basic types but not detailed validation limits.

## Examples

Potentially safe UI validation:

```text
required fields
numeric sum
supported currency
```

Potentially risky without clarification:

```text
description max 30 characters
only predefined categories
minimum/maximum cost values
```

## Consequences

Detailed validation changes should be documented and tested.

---

# ADR-024 — Use GitHub Actions for CI

**Status:** ACCEPTED  
**Date:** 2026-08-22

## Decision

After project scripts exist, GitHub Pull Requests should run:

```bash
npm ci
npm run lint
npm test
npm run build
```

## Reason

Prevent broken changes from entering `main`.

## Consequences

CI is required by our workflow, though not by the course itself.

Manual Vanilla/Chrome tests still remain necessary.

---

# ADR-025 — Deploy as a Static Front-End

**Status:** ACCEPTED  
**Date:** 2026-08-22

## Decision

Deploy the main application as a static front-end build.

## Context

The project does not require a dynamic application backend.

The only server-side requirement can be satisfied by an Internet-hosted static exchange-rate JSON file.

## Consequences

Hosting should support:

- HTTPS,
- stable public URL,
- static assets,
- Fetch to the exchange-rate source.

Exact platform remains open until deployment milestone.

---

# ADR-026 — Do Not Add Secrets for Core Project Operation

**Status:** ACCEPTED  
**Date:** 2026-08-22

## Decision

Core required functionality should not depend on API keys or secrets.

## Reason

The required exchange-rate source can be a static JSON file.

## Consequences

- no secret needed for required exchange-rate retrieval,
- no API key committed,
- `.env` remains ignored if introduced for optional development purposes.

---

# ADR-027 — Documentation Has Separate Sources of Responsibility

**Status:** ACCEPTED  
**Date:** 2026-08-22

## Decision

Avoid duplicating the same long instructions across documentation.

Document responsibilities:

```text
intent.txt
→ purpose and priorities

REQUIREMENTS.md
→ official requirements

ARCHITECTURE.md
→ system structure

DECISIONS.md
→ why major choices were made

AGENTS.md
→ Codex operating rules

CLAUDE.md
→ Claude Code operating rules

TEST_PLAN.md
→ verification strategy

SUBMISSION_CHECKLIST.md
→ final submission process

README.md
→ human-facing project overview
```

## Consequences

Update the appropriate source document instead of copying changes everywhere.

---

# ADR-028 — Requirement Compliance Beats Visual Complexity

**Status:** ACCEPTED  
**Date:** 2026-08-22

## Decision

Optional visual/UX features must never put mandatory requirements at risk.

## Reason

The project is graded against explicit requirements.

## Consequences

Development order:

```text
correctness
↓
requirements
↓
testing
↓
deployment
↓
UI polish
↓
optional enhancements
```

---

# ADR-029 — Start a Clean Application Cost Schema With Database Version 2

**Status:** ACCEPTED

**Date:** 2026-08-24

## Decision

The React application uses `costsdb` version `2` for the cost database namespace.

Version 2 stores new cost records with stable IDs and time metadata. Existing
version 1 application cost records are left untouched in localStorage but are no
longer read by the current application singleton.

## Reason

The earlier schema did not include IDs or hour/minute metadata. A clean versioned
namespace avoids destructive migration risk and preserves Settings and
exchange-rate cache data.

## Consequences

- Do not call `localStorage.clear()` in application code.
- Do not migrate or rewrite version 1 cost records.
- Tests must prove version 1 app costs are not visible through the version 2 app
  database.

---

# ADR-030 — Generate Stable Cost IDs Inside `db.js`

**Status:** ACCEPTED

**Date:** 2026-08-24

## Decision

New stored costs receive an internal generated non-empty string `id`.

Use `crypto.randomUUID()` when available, with a small dependency-free fallback
for browser compatibility.

## Reason

Editing and deleting costs by visible field values is unsafe because two costs
may have identical sums, categories, descriptions, currencies, and dates.

## Consequences

- `addCost()` input remains the official `{ sum, currency, category, description }`
  shape.
- The generated ID is stable after storage.
- Duplicate-looking costs can be updated/deleted independently.

---

# ADR-031 — Store Hour and Minute for New Cost Records

**Status:** ACCEPTED

**Date:** 2026-08-24

## Decision

New stored costs use:

```javascript
date: {
  day,
  month,
  year,
  hour,
  minute
}
```

The required report item shape remains compatible with the official example and
continues to expose only:

```javascript
date: {
  day
}
```

## Reason

Cost maintenance and future detailed reports benefit from a fuller timestamp,
while `OQ-002` means the external report date shape should remain conservative.

## Consequences

- UI report tables must not invent returned month/year/hour/minute fields.
- `getReport()` continues to filter by stored month/year.
- `OQ-002` remains open.

---

# ADR-032 — Add CRUD Methods to the Existing Database Object

**Status:** ACCEPTED

**Date:** 2026-08-24

## Decision

The object returned by `openCostsDB()` keeps `addCost()` and `getReport()` and
also exposes:

```text
getAllCosts()
getCostById(id)
updateCost(id, cost)
deleteCost(id)
```

The module and Vanilla `db.js` implementations must remain behaviorally aligned.

## Reason

Future Manage Costs UI work needs a stable data foundation, but the protected
official API must remain compatible for automatic graders.

## Consequences

- `getReport()` remains synchronous.
- `updateCost()` validates full editable date/time and preserves ID.
- Missing valid IDs return `null`; invalid ID values throw.

---

# ADR-033 — Group Monthly and Yearly Reports Under Reports Navigation

**Status:** ACCEPTED

**Date:** 2026-08-24

## Decision

The top-level application navigation uses:

```text
Dashboard
Add Cost
Reports
Charts
Settings
```

`Reports` contains Monthly and Yearly tabs. Monthly remains functional. Yearly is
a placeholder until the detailed yearly report milestone.

## Reason

The application now has more than one report-oriented feature, so grouping them
improves navigation without starting future reporting logic prematurely.

## Consequences

- Do not implement the detailed yearly report in this foundation milestone.
- App shell tests should verify the Reports navigation behavior.

---

# ADR-034 — Provisional Shared Sorting Behavior for Reports

**Status:** PROVISIONAL

**Date:** 2026-08-24

## Decision

Future monthly and yearly report sorting should be implemented as shared
report-table behavior rather than separate one-off sort algorithms in each page.

## Reason

Users should get consistent date, category, description, sum, and currency
sorting when sortable reports are implemented.

## Consequences

- This does not implement sorting yet.
- Detailed behavior remains for the dedicated sorting milestone.

---

# ADR-035 — Provisional Export Architecture

**Status:** PROVISIONAL

**Date:** 2026-08-24

## Decision

Future Excel/PDF export should consume already-prepared report/chart data from
application services or page state instead of re-reading localStorage directly.

Excel exports should contain structured report/chart data. PDF exports should
contain human-readable report content. Chart PDFs should include the chart
visualization plus the relevant supporting data.

## Reason

Exports should match what users see and should not duplicate report, chart, or
currency-conversion logic.

## Consequences

- This does not implement export yet.
- Exact export libraries remain undecided until Milestone 9.5E.
- Do not install or select export libraries before the export milestone.

---

# ADR-036 — Detailed Reports Compose Rich Rows Outside `db.js`

**Status:** ACCEPTED

**Date:** 2026-08-24

## Decision

Detailed Monthly and Yearly report screens should use a small reporting service
that composes rich row data from `costsDatabase.getAllCosts()` with converted
totals from the existing synchronous `costsDatabase.getReport()` API.

The protected `db.js` `getReport()` contract remains unchanged: report items
continue to expose the current compatibility date shape while richer application
views may use stored cost IDs and full date/time from `getAllCosts()`.

## Reason

The official report contract is externally sensitive, especially for the
standalone Vanilla `db.js`. Rich application reports need IDs and timestamps, but
adding those fields to `getReport()` would blur the current `OQ-002`
compatibility boundary.

## Consequences

- React pages must not read cost localStorage directly.
- Report total conversion remains owned by `getReport()`.
- Detailed report rows can display stored IDs internally and date/time values
  without changing the official report-facing payload.
- `OQ-001`, `OQ-002`, and `OQ-003` remain formally open.

---

# 2. Open Decisions

The following decisions remain intentionally unresolved.

## OD-001 — Exact Deployment Provider

Candidates may include:

```text
Render
Vercel
GitHub Pages
other suitable static hosting
```

Decision criteria:

- stable public URL,
- simple GitHub deployment,
- HTTPS,
- compatible with Vite static output,
- reliable during grading.

---

## OD-002 — Exact Default Exchange-Rate JSON Hosting

Possible choices:

```text
same deployment
GitHub Pages
Vercel/static host
another team-controlled public static URL
```

Must satisfy official Fetch/web-hosting requirements.

---

## OD-003 — Final `getReport()` + Fetch Integration

Blocked/provisional because of `OQ-003`.

Do not make the official grading API incompatible before this is resolved.

---

## OD-004 — Exact Report Item Currency Conversion Semantics

Blocked by `OQ-001`.

Do not lock tests or UI assumptions until resolved.

---

## OD-005 — Exact External Date Shape

Blocked by `OQ-002`.

Internal storage may need day/month/year, but externally returned report shape must remain course-compatible.

---

# 3. How to Change a Decision

Do not silently replace an accepted architecture choice.

For a meaningful change:

1. Identify the ADR.
2. Explain why the existing choice is insufficient.
3. Compare alternatives.
4. Verify course compatibility.
5. Update this file.
6. Mark old decision `SUPERSEDED` if necessary.
7. Update architecture/tests.
8. Make the implementation change in a dedicated Issue/PR.

Example:

```text
ADR-005 — Recharts
Status: SUPERSEDED

ADR-029 — Chart.js
Status: ACCEPTED
```

This creates an auditable history instead of architecture drift.
