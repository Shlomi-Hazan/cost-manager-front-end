# Cost Manager Front-End

Final project for the **Front-End Development** course.

This repository is intentionally being built from the project requirements outward: requirements, architecture, AI-agent instructions, testing strategy, Git/GitHub workflow, implementation, deployment, audit, and submission.

> **Current status:** Milestone 13 — Production Deployment (production-verified).

## Project Goal

Build a client-side Cost Manager application that complies with the official course specification, including:

- English UI
- USD as the main/base currency
- `localStorage` persistence
- Add Cost functionality
- Detailed monthly reports
- Monthly category Pie Chart
- Yearly 12-month Bar Chart
- `USD`, `ILS`, `GBP`, and `EURO`
- Exchange rates retrieved with the Fetch API
- Default and user-configurable exchange-rate URLs
- Module-compatible and standalone Vanilla versions of `db.js`
- Latest Google Chrome compatibility
- Web deployment
- Exact final submission packaging

## Planned Stack

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

The stack is a project architecture decision. Official course requirements remain authoritative.

## Documentation

| Document | Purpose |
|---|---|
| [`intent.txt`](intent.txt) | Project purpose, priorities, and non-negotiable principles |
| [`docs/REQUIREMENTS.md`](docs/REQUIREMENTS.md) | Traceable official requirements and open clarifications |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Planned system structure and boundaries |
| [`docs/DECISIONS.md`](docs/DECISIONS.md) | Architecture Decision Records |
| [`docs/TEST_PLAN.md`](docs/TEST_PLAN.md) | Testing and verification strategy |
| [`docs/MILESTONES.md`](docs/MILESTONES.md) | Full project milestone roadmap |
| [`docs/SUBMISSION_CHECKLIST.md`](docs/SUBMISSION_CHECKLIST.md) | Final packaging and submission gate |
| [`AGENTS.md`](AGENTS.md) | Repository instructions for Codex |
| [`CLAUDE.md`](CLAUDE.md) | Repository instructions for Claude Code |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Git/GitHub collaboration workflow |

### Milestone Roadmaps

- [English roadmap](README_EN.md)
- [Hebrew roadmap](README_HE.md)

## Protected `db.js` Contract

The standalone Vanilla library must preserve this public usage pattern:

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

Conceptual public structure:

```text
db
 └── openCostsDB(databaseName, databaseVersion)
      └── database object
           ├── addCost(cost)
           └── getReport(currency, year, month)
```

## Development Workflow

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

Codex is planned as the primary coding agent. Claude Code is planned mainly for code review, debugging, architecture review, and selected implementation tasks.

## Team

- `@Shlomi-Hazan` — Co-developer / Equal Contributor
- `@eldadsimanian` — Co-developer / Equal Contributor

## Repository Name

`cost-manager-front-end`

## Visibility

Public.

## Current Milestone

### Milestone 13 — Production Deployment

Pull requests into `main` continue to be validated automatically using the
`CI` GitHub Actions workflow (`npm ci`, lint, test, build) before merge.

A separate `Deploy` workflow builds and publishes the application to
GitHub Pages on every push to `main`. The production build is served from a
repository subpath (`/cost-manager-front-end/`), so both the build's asset
base path and the default exchange-rate URL are resolved from Vite's
`BASE_URL` rather than a hard-coded root path.

**Production URL:** https://shlomi-hazan.github.io/cost-manager-front-end/

**Deployment platform:** GitHub Pages (via GitHub Actions).

Production smoke testing has passed: page load and navigation, the default
exchange-rate source, localStorage persistence, Monthly/Yearly reports, the
Pie and Bar charts, and report/chart exports were all verified directly
against the production URL.
