# Contributing — Cost Manager Front-End

This project is developed as a two-person university team project with Git/GitHub used to preserve a clear collaboration history.

---

# 1. Basic Workflow

For meaningful work:

```text
Requirement / Task
       ↓
GitHub Issue
       ↓
Branch
       ↓
Implementation
       ↓
Tests / Lint / Build
       ↓
Pull Request
       ↓
Review
       ↓
Merge to main
```

Do not develop features directly on `main`.

---

# 2. Before Starting Work

Read:

1. `intent.txt`
2. `docs/REQUIREMENTS.md`
3. `docs/ARCHITECTURE.md`
4. relevant GitHub Issue
5. `AGENTS.md` when using Codex
6. `CLAUDE.md` when using Claude Code

Check:

```bash
git status
git branch --show-current
```

Start from an updated `main`.

---

# 3. Branch Naming

Use:

```text
docs/<topic>
feature/<topic>
fix/<topic>
test/<topic>
chore/<topic>
```

Examples:

```text
docs/project-foundation
feature/add-cost
feature/monthly-report
fix/currency-conversion
test/db-contract
chore/deployment
```

Use lowercase kebab-case.

---

# 4. Commit Messages

Use focused commit messages.

Preferred prefixes:

```text
chore:
docs:
feat:
fix:
test:
refactor:
style:
```

Examples:

```text
chore: initialize Cost Manager project
docs: add project architecture
feat: implement add cost form
fix: preserve original cost currency
test: add getReport contract coverage
```

Avoid:

```text
update
changes
final
stuff
fix everything
project done
```

---

# 5. Commit Scope

A commit should represent one understandable change.

Prefer:

```text
feat: implement addCost persistence
test: cover addCost persistence
```

over one huge commit containing unrelated features, formatting, refactoring, and documentation.

---

# 6. Pull Requests

A Pull Request should:

- explain what changed,
- reference the GitHub Issue,
- list relevant requirement IDs,
- list validation performed,
- identify unresolved questions.

Do not mix unrelated work.

---

# 7. Review Expectations

Review for:

1. official requirement compliance,
2. protected `db.js` API compatibility,
3. correctness,
4. tests,
5. architecture boundaries,
6. maintainability,
7. UI/UX.

Required fixes should be completed before merge.

---

# 8. Validation

When project scripts exist, run:

```bash
npm run lint
npm test
npm run build
```

For Vanilla `db.js` changes, also run the standalone HTML compatibility test in Chrome.

Do not claim a check passed unless it was actually run.

---

# 9. AI-Assisted Development

Codex is the primary coding agent.

Claude Code may be used for:

- review,
- debugging,
- architecture checks,
- second opinions,
- selected implementation work.

Do not have two agents edit the same branch independently at the same time.

All AI-generated work must still be reviewed and tested.

---

# 10. Protected Rules

Do not casually change:

```text
db.openCostsDB(...)
ob.addCost(...)
ob.getReport(...)
USD / ILS / GBP / EURO
localStorage requirement
Fetch requirement
Vanilla global db behavior
```

When a course requirement is ambiguous, record it instead of guessing.

---

# 11. Main Branch

`main` should represent reviewed, working code.

Avoid:

- direct feature commits to `main`,
- force-pushing `main`,
- merging failing builds,
- merging knowingly broken grader compatibility.

---

# 12. Collaboration Evidence

Preserve useful evidence throughout the project:

- Issues,
- assignments,
- branches,
- commits,
- Pull Requests,
- reviews,
- comments.

This supports both project management and the course teamwork requirement.
