# Cost Manager Front-End — Official Requirements Register

> **Purpose:** This file converts the official course specification into a traceable requirements register for development, testing, GitHub Issues, Pull Requests, and the final audit.
>
> **Source of truth:** `fed_hit_final_project_202607.pdf`
>
> **Important:** In the official document, **“should” means “must.”** Requirements in this file marked **Mandatory** therefore must be treated as compulsory.
>
> **Status convention:** All requirements start as `NOT STARTED`. A requirement may be changed to `IN PROGRESS`, `IMPLEMENTED`, and finally `VERIFIED` only after it has been tested against the official requirement.

---

# 1. Requirement Status Legend

| Status | Meaning |
|---|---|
| `NOT STARTED` | No implementation has started |
| `IN PROGRESS` | Work is currently being performed |
| `IMPLEMENTED` | Code exists, but final verification is still required |
| `VERIFIED` | Requirement was implemented and explicitly tested |
| `BLOCKED` | Cannot be completed until a clarification/dependency is resolved |

---

# 2. Document Governance

## R-001 — “Should” Means “Must”

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- Every use of the word **should** in the official project document must be interpreted as **must**.
- Requirements described using “should” are not recommendations.

### Verification

- [ ] All requirements in this register have been reviewed using this interpretation.

---

## R-002 — Monitor Official Clarifications

- **Type:** Mandatory process requirement
- **Status:** `NOT STARTED`
- The official specification may receive clarifications before the deadline.
- Changes are expected to be listed at the bottom of the official document.
- The course forum should be followed to verify interpretations and clarifications.

### Verification

- [ ] Latest version of the specification checked before final audit.
- [ ] Relevant course-forum clarifications reviewed before submission.

---

# 3. General Application Requirements

## R-010 — Application Type

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- The project must implement the **front end of a Cost Manager website/application**.

### Verification

- [ ] Application functions as a client-side Cost Manager.

---

## R-011 — UI Language

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- The user interface must be in **English**.

### Verification

- [ ] All user-facing application UI is in English.

---

## R-012 — Main Currency

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- The application's main currency must be **USD**.

### Verification

- [ ] USD is treated as the main/base currency where required by the specification.

---

## R-013 — Required Web Technologies

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- The application must be developed using:
  - JavaScript
  - HTML
  - CSS

### Notes

React is explicitly permitted by the specification, but it does not replace the requirement that the application is ultimately implemented using JavaScript/HTML/CSS technologies.

### Verification

- [ ] Project uses JavaScript.
- [ ] Project produces HTML.
- [ ] Project uses CSS/styling.

---

# 4. Storage Requirements

## R-020 — Local Storage

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- Application data must be stored in **localStorage**.

### Verification

- [ ] Added costs are persisted in localStorage.
- [ ] Data survives a page refresh in the same browser/origin.

---

## R-021 — `db.js` Storage Wrapper

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- The project must include a separate `db.js` library that wraps the use of localStorage.

### Verification

- [ ] Data access is exposed through the required `db.js` library.
- [ ] Required `db.js` public API works independently from the UI.

---

# 5. Cost Item Requirements

## R-030 — Add New Cost

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- Users must be able to add new cost items.

### Verification

- [ ] Add Cost flow exists and works.

---

## R-031 — Cost Sum

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- Every new cost item must include a `sum`.
- `sum` is specified as a **number** in the `db.js` API.

### Verification

- [ ] Cost object contains numeric `sum`.

---

## R-032 — Cost Currency

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- Every new cost item must include a `currency`.
- `currency` is specified as a **string** in the `db.js` API.

### Verification

- [ ] Cost object contains `currency`.

---

## R-033 — Cost Category

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- Every new cost item must include a `category`.
- `category` is specified as a **string** in the `db.js` API.

### Verification

- [ ] Cost object contains `category`.

---

## R-034 — Cost Description

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- Every new cost item must include a `description`.
- `description` is specified as a **string** in the `db.js` API.

### Verification

- [ ] Cost object contains `description`.

---

## R-035 — Automatic Cost Date

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- The date attached to a cost item must be the date on which that cost item was added.

### Verification

- [ ] Added cost receives its date automatically.
- [ ] Date corresponds to the date the cost was added.

---

## R-036 — Preserve Original Currency

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- Each stored cost item must preserve the currency in which it was originally added.
- Currency conversion for reports/charts must not overwrite the stored original currency.

### Verification

- [ ] Original currency remains unchanged in localStorage after conversions/reports/charts.

---

# 6. Supported Currencies

## R-040 — Exact Supported Currency Identifiers

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- The supported currencies are exactly:

```text
USD
ILS
GBP
EURO
```

- The specification explicitly says these four values should also be the symbols/identifiers used by the code.

### Verification

- [ ] USD supported.
- [ ] ILS supported.
- [ ] GBP supported.
- [ ] EURO supported.
- [ ] Required code paths use these identifiers.

---

# 7. Detailed Monthly Report

## R-050 — Detailed Report

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- The user must be able to request a detailed report for a specific month and year.

### Verification

- [ ] User can select/request a month.
- [ ] User can select/request a year.
- [ ] Detailed report is returned/displayed.

---

## R-051 — Report Currency Selection

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- The user must be able to request the report in a selected currency.

### Verification

- [ ] Report accepts a target currency.
- [ ] Report total is represented in the selected currency.

---

## R-052 — Report Defaults to Current Month and Year

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- When `getReport` is called without year and month, the report must be generated for the **current month and current year**.

### Required compatibility example

```javascript
const data = ob.getReport("USD");
```

### Verification

- [ ] Omitting year/month selects the current year/month.

---

## R-053 — Required Report Object Shape

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- `getReport(currency, year, month)` must return an object representing the report.
- The official example contains:

```javascript
{
  year: 2025,
  month: 9,
  costs: [
    {
      sum: 200,
      currency: "USD",
      category: "Food",
      description: "Milk 3%",
      date: { day: 12 }
    },
    {
      sum: 120,
      currency: "GBP",
      category: "Education",
      description: "Zooom License",
      date: { day: 18 }
    }
  ],
  total: {
    currency: "USD",
    sum: 440
  }
}
```

### Verification

- [ ] Returned object contains `year`.
- [ ] Returned object contains `month`.
- [ ] Returned object contains `costs`.
- [ ] Returned object contains `total`.
- [ ] `total` contains `currency`.
- [ ] `total` contains `sum`.

### Important

The example is preserved here as given by the course specification. Ambiguities around whether individual report-item sums must be converted are tracked separately under **Open Clarifications** instead of being silently interpreted.

---

# 8. `db.js` Library Requirements

## R-060 — Two Versions of `db.js`

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- Two versions of `db.js` must be developed:
  1. A version compatible with modules/React.
  2. A simple Vanilla JavaScript version for automatic testing.

### Verification

- [ ] Module-compatible version exists.
- [ ] Vanilla version exists.
- [ ] Both expose equivalent required behavior.

---

## R-061 — Submitted Standalone `db.js` Must Be Vanilla

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- The `db.js` file submitted **separately from the ZIP** must be the **Vanilla JavaScript version**.

### Verification

- [ ] Final separately submitted `db.js` is the Vanilla version.

---

## R-062 — Vanilla `db` Must Be Global

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- When the Vanilla library is loaded with:

```html
<script src="db.js"></script>
```

a property named:

```javascript
db
```

must be added to the global object.

### Verification

- [ ] `db` is accessible after loading `db.js` via a normal script element.

---

## R-063 — `openCostsDB(databaseName, databaseVersion)`

- **Type:** Mandatory
- **Status:** `NOT STARTED`

Required signature:

```javascript
db.openCostsDB(databaseName, databaseVersion)
```

Requirements:

- `databaseName` is a string.
- `databaseVersion` is a number.
- The method returns a reference to an object representing the database.

### Verification

- [ ] Required signature exists.
- [ ] Returns a database object/reference.
- [ ] Official sample call succeeds.

---

## R-064 — `addCost(cost)`

- **Type:** Mandatory
- **Status:** `NOT STARTED`

The database object returned by `openCostsDB` must provide:

```javascript
ob.addCost(cost)
```

Input object properties:

```javascript
{
  sum: Number,
  currency: String,
  category: String,
  description: String
}
```

The method must return an object representing the newly added cost item.

The official specification explicitly names the returned object's properties as:

- `sum`
- `currency`
- `category`
- `description`

### Verification

- [ ] Method exists on the database object.
- [ ] Official sample cost can be added.
- [ ] Returned value is truthy/object-like as required by the official sample.
- [ ] Returned object contains the specified properties.

---

## R-065 — `getReport(currency, year, month)`

- **Type:** Mandatory
- **Status:** `NOT STARTED`

The database object returned by `openCostsDB` must provide:

```javascript
ob.getReport(currency, year, month)
```

Arguments described by the specification:

- `currency` — string.
- `year` — number.
- `month` — number.

If `year` and `month` are omitted, current year/month must be used.

### Verification

- [ ] Method exists on the database object.
- [ ] `ob.getReport("USD")` works.
- [ ] Explicit year/month call works.

---

## R-066 — Required Method Ownership

- **Type:** Mandatory / clarified by document update
- **Status:** `NOT STARTED`

The official document was corrected on August 18 from:

```javascript
db.getReport("USD")
```

to:

```javascript
ob.getReport("USD")
```

Therefore `getReport()` is required on the object returned by `openCostsDB()`.

### Verification

- [ ] `const ob = db.openCostsDB(...); ob.getReport("USD")` works.

---

## R-067 — Additional `db.js` Functions Are Allowed

- **Type:** Explicitly allowed
- **Status:** `NOT STARTED`
- The course Q&A explicitly permits additional functions in `db.js`.
- The required functions must still remain compatible with the documented API.

### Verification

- [ ] Any added functions do not break `openCostsDB`, `addCost`, or `getReport`.

---

# 9. Pie Chart Requirements

## R-070 — Monthly Pie Chart

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- Users must be able to display a Pie Chart showing total costs for a selected month and year, grouped according to categories.

### Verification

- [ ] Month selectable.
- [ ] Year selectable.
- [ ] Totals grouped by category.
- [ ] Pie Chart displayed.

---

## R-071 — Pie Chart Currency Selection

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- The user must be able to select the currency in which the Pie Chart is displayed.

### Verification

- [ ] Pie Chart supports target currency selection.

---

# 10. Bar Chart Requirements

## R-080 — Yearly Twelve-Month Bar Chart

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- Users must be able to display a Bar Chart showing the total costs in each of the twelve months of a selected year.

### Verification

- [ ] User can select year.
- [ ] Chart represents all twelve months.
- [ ] Each month represents total costs for that month.

---

## R-081 — Bar Chart Currency Selection

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- The user must be able to select the currency in which the Bar Chart is displayed.

### Verification

- [ ] Bar Chart supports target currency selection.

---

# 11. Exchange-Rate Requirements

## R-090 — Retrieve Exchange Rates Using Fetch API

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- Exchange rates must be retrieved from a server using the **Fetch API**.

### Verification

- [ ] Application performs exchange-rate retrieval via `fetch`.

---

## R-091 — Team-Provided Web-Hosted Rate Source

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- The server-side/source for exchange rates must be something developed/provided and deployed by the team on the web.
- The specification states that a simple static JSON file placed on an Internet-connected server is sufficient.

### Verification

- [ ] Team-controlled rate source exists on the web.
- [ ] Application can fetch it.

---

## R-092 — Default Exchange-Rate Source

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- The Cost Manager must be able to retrieve exchange rates from a server using Fetch even when the user does **not** provide a URL through Settings.

### Verification

- [ ] Fresh application works without a user-supplied rate URL.
- [ ] A default web-hosted rate source is used.

---

## R-093 — Custom Exchange-Rate URL Setting

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- The application must include a Settings option allowing the user to specify a URL for retrieving exchange rates.

### Verification

- [ ] Settings exposes an exchange-rate URL option.
- [ ] Configured URL can be used by the application.

---

## R-094 — Expected Custom Rate JSON Shape

- **Type:** Mandatory compatibility requirement
- **Status:** `NOT STARTED`
- The application must support a response shaped as:

```json
{
  "USD": 1,
  "GBP": 0.6,
  "EURO": 0.7,
  "ILS": 3.4
}
```

The official interpretation is:

```text
ILS 3.4 = USD 1
EURO 0.7 = USD 1
GBP 0.6 = USD 1
USD 1 = USD 1
```

### Verification

- [ ] Application correctly interprets this data model.

---

## R-095 — CORS Assumption for User-Supplied URL

- **Type:** Allowed assumption
- **Status:** `NOT STARTED`
- The implementation may assume the user-supplied URL returns:

```text
Access-Control-Allow-Origin: *
```

### Verification

- [ ] No non-required workaround is necessary for missing CORS according to the official assumption.

---

# 12. User Interface Requirements

## R-100 — React and MUI Are Permitted

- **Type:** Optional / explicitly allowed
- **Status:** `NOT STARTED`
- The UI **may** be built with React and MUI.
- A Vanilla JavaScript UI is also allowed.

### Project decision

The project architecture may choose React/MUI, but this is a **project decision**, not a mandatory course requirement.

---

## R-101 — Desktop Browser Compatibility

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- The UI must be compatible with desktop web browsers.

### Verification

- [ ] Desktop layout works correctly.

---

# 13. Deployment Requirements

## R-110 — Web Deployment

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- The final project must be deployed on a server connected to the web.
- The document provides Render as an example, not as the only allowed host.

### Verification

- [ ] Publicly reachable project URL exists.

---

## R-111 — Latest Google Chrome Compatibility

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- The project must work correctly in the latest Google Chrome.
- The official grading will use the latest Google Chrome browser.

### Verification

- [ ] Final production smoke test passes in latest Chrome.

---

# 14. JavaScript Code Style Requirements

## R-120 — Professional JavaScript Style Guide

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- JavaScript code must follow the guidelines listed in the course-referenced **Professional JavaScript Guide**.

### Verification

- [ ] Code review performed against the applicable course style guidelines.

---

## R-121 — Code Comments Required

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- Comments must be added to the code where appropriate.

### Verification

- [ ] Required explanatory comments exist.

---

## R-122 — No JSDoc Requirement; Use Normal JS Comments

- **Type:** Clarified by official Q&A
- **Status:** `NOT STARTED`
- JSDoc comments are not required.
- The official Q&A says comments should use:

```javascript
/* ... */
```

or:

```javascript
// ...
```

### Verification

- [ ] Project comments use the permitted comment styles.

---

# 15. Official Vanilla `db.js` Compatibility Test

## R-130 — Official Sample Must Run Successfully

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- The Vanilla `db.js` must work successfully with the official sample test.

Core calls from the sample:

```javascript
const ob = db.openCostsDB("costsdb", 1);

const result1 = ob.addCost({
  sum: 200,
  currency: "USD",
  category: "FOOD",
  description: "pizza"
});

const result2 = ob.addCost({
  sum: 400,
  currency: "USD",
  category: "CAR",
  description: "fuel"
});

const data = ob.getReport("USD");
console.log(data.total.sum);
```

### Verification

- [ ] `ob` created.
- [ ] First cost added.
- [ ] Second cost added.
- [ ] `ob.getReport("USD")` returns an object.
- [ ] `data.total.sum` is accessible.
- [ ] No exception is thrown.

---

## R-131 — Grader May Use Different Test Code

- **Type:** Mandatory compatibility consideration
- **Status:** `NOT STARTED`
- The official sample is only an example.
- The grading process may use different test code.
- Implementation must therefore follow the documented API contract rather than only hard-code behavior for the sample.

### Verification

- [ ] Unit/contract tests cover behavior beyond the exact sample values.

---

# 16. Submission Requirements

## R-140 — Demo Video

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- Create a short video showing how the project runs.
- The document says to try to keep it up to approximately **60 seconds**.
- Upload it to YouTube as **Unlisted**.

### Verification

- [ ] Video created.
- [ ] Video uploaded as Unlisted.
- [ ] Link works.

---

## R-141 — Exactly Three Moodle Files

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- The submission must consist of **three files**:

```text
1. Project ZIP
2. Source-code PDF
3. Vanilla db.js
```

- Uploading one ZIP containing everything does not satisfy the requirement.

### Verification

- [ ] Exactly three required files prepared separately.

---

## R-142 — Remove `node_modules` Before ZIP

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- `node_modules` must be deleted/excluded before creating the project ZIP.

### Verification

- [ ] ZIP does not contain `node_modules`.

---

## R-143 — Source-Code PDF

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- Create a PDF containing all code files coded by the team.
- The name of each file must appear next to its code.
- Code lines must not be broken in a way that harms review.
- The PDF must be properly organized for code review.

### Verification

- [ ] All required code files included.
- [ ] Each file clearly named.
- [ ] Layout checked for broken/wrapped code lines.

---

## R-144 — PDF Filename

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- PDF filename must contain the team manager's first and last name:
  - lowercase only
  - `_` between names

Example:

```text
haim_michael.pdf
```

### Verification

- [ ] Final PDF filename follows required convention.

---

## R-145 — PDF Team Manager Identity

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- At the beginning of the PDF, include the first and last name of the development team manager.

---

## R-146 — PDF Team Member Details

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- For every team member include:
  - First Name
  - Last Name
  - ID
  - Mobile Number
  - Email Address

---

## R-147 — PDF Clickable Video Link

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- The PDF must include a clickable link to the demo video.

---

## R-148 — PDF May Include Additional Notes

- **Type:** Optional / explicitly allowed
- **Status:** `NOT STARTED`
- Additional comments/guidelines may be placed at the beginning of the PDF, similar to traditional `readme.txt` notes.

---

## R-149 — Collaborative Tools Summary

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- The PDF must include a summary of the use of **at least two collaborative tools**.
- The summary must be **no more than 100 words**.

### Verification

- [ ] At least two collaborative tools covered.
- [ ] Summary ≤ 100 words.

---

## R-150 — Team Manager Submits

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- Only the team manager should submit the project to the Moodle assignment box.

---

## R-151 — Treat Moodle Deadline as 30 Minutes Earlier

- **Type:** Mandatory submission precaution stated by course
- **Status:** `NOT STARTED`
- Because of possible server-time differences, the deadline should be treated as if it were **30 minutes earlier** than the time shown in Moodle.

---

# 17. Team Requirements

## R-160 — Team of Two Students

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- The project is intended to be carried out by a team of **two students**.

---

## R-161 — Same Course Group

- **Type:** Mandatory
- **Status:** `NOT STARTED`
- Team members must be students from the same group.

---

## R-162 — Teamwork Assessment

- **Type:** Mandatory grading requirement
- **Status:** `NOT STARTED`
- The project includes a **10% teamwork assessment** using collaborative tools presented during the course.

### Verification

- [ ] Collaboration evidence preserved during development.
- [ ] Required collaborative-tool summary prepared for final PDF.

---

# 18. Open Clarifications / Do Not Guess

The following points are **not resolved explicitly enough by the uploaded official document**. They must not be silently converted into “official requirements.”

## OQ-001 — Are Individual Report Cost Sums Converted?

The specification says the report is requested “in a specific currency,” but its example keeps:

```javascript
{
  sum: 120,
  currency: "GBP"
}
```

inside a report whose total is:

```javascript
{
  currency: "USD",
  sum: 440
}
```

### Current safe interpretation

The example appears to preserve original item currency/value while converting the report total, but this is an **interpretation**, not a statement that should be treated as confirmed course policy.

### Action

- [ ] Check course forum / ask instructor before finalizing report semantics.

---

## OQ-002 — Exact Stored/Returned Date Shape

The specification requires every cost item to receive the date on which it was added.

The report example shows:

```javascript
date: { day: 12 }
```

but does not fully define the internal/stored date schema.

### Action

- [ ] Decide an internal representation that supports required month/year filtering.
- [ ] Preserve compatibility with the official report shape.
- [ ] Ask for clarification if exact returned date structure matters.

---

## OQ-003 — Fetch Is Asynchronous but Official `getReport` Example Is Synchronous

Exchange rates must be retrieved using Fetch, but the official sample uses:

```javascript
const data = ob.getReport("USD");
```

rather than an awaited Promise.

### Action

- [ ] Design architecture without breaking the synchronous official test contract.
- [ ] Ask instructor/course forum if needed before locking the final implementation.

---

## OQ-004 — Category List

The specification requires a `category` string but does not provide an official fixed list of categories.

### Action

- [ ] Do not claim a fixed category list is required by the specification.
- [ ] Any chosen UI category strategy must remain compatible with arbitrary category strings accepted by the required API unless clarified otherwise.

---

## OQ-005 — Input Validation Rules

The official specification gives input types but does not define detailed UI validation rules such as minimum sum, maximum description length, or permitted category names.

### Action

- [ ] Sensible validation may be added as a project decision.
- [ ] Validation must not make the required API incompatible with the grader.

---

# 19. Team Extension Requirements — Not Official Requirements

The following requirements are team-approved extensions for Milestone 9.5. They
support cost maintenance, richer reporting, and exports, but they are not
official course requirements unless the lecturer later confirms them.

## X-001 — Stable Cost Identity

- **Type:** Team extension
- **Status:** `IN PROGRESS`
- New application cost records must include a generated stable string `id`.
- IDs are generated internally; callers of `addCost()` must not provide IDs.
- IDs must distinguish otherwise identical costs.

### Verification

- [ ] Adding two identical costs creates two different IDs.
- [ ] The same ID is returned by CRUD reads after storage/reload.
- [ ] Existing official `addCost()` input remains compatible.

---

## X-002 — Cost Editing Foundation

- **Type:** Team extension
- **Status:** `IN PROGRESS`
- The database object returned by `openCostsDB()` should support `updateCost(id, cost)`.
- `updateCost()` uses a full editable payload containing `sum`, `currency`,
  `category`, `description`, and full date/time.
- Updating a cost must preserve its original `id`.

### Verification

- [ ] Existing cost can be updated by ID.
- [ ] Missing valid ID returns `null`.
- [ ] Invalid ID throws a validation error.
- [ ] Invalid editable payload is rejected.

---

## X-003 — Cost Deletion Foundation

- **Type:** Team extension
- **Status:** `IN PROGRESS`
- The database object returned by `openCostsDB()` should support `deleteCost(id)`.
- Deletion is ID-based so duplicate-looking costs remain distinguishable.

### Verification

- [ ] Existing cost can be deleted by ID.
- [ ] Deleting one duplicate-looking cost does not delete the other.
- [ ] Missing valid ID returns `null`.
- [ ] Invalid ID throws a validation error.

---

## X-004 — Cost Time Metadata

- **Type:** Team extension
- **Status:** `IN PROGRESS`
- New application cost records should store:

```javascript
date: {
  day,
  month,
  year,
  hour,
  minute
}
```

- The current official report-facing compatibility shape remains:

```javascript
date: {
  day
}
```

### Verification

- [ ] Newly added costs store day/month/year/hour/minute.
- [ ] Monthly filtering continues to use month/year.
- [ ] Official report item compatibility remains day-only while `OQ-002`
      remains open.

---

## X-005 — Manage Costs UI

- **Type:** Team extension
- **Status:** `NOT STARTED`
- Users should be able to view, edit, and delete saved costs in a dedicated UI.
- This is tracked separately from the database foundation.

---

## X-006 — Detailed Yearly Report

- **Type:** Team extension
- **Status:** `NOT STARTED`
- Users should be able to generate a detailed yearly report after the Reports
  navigation foundation exists.

---

## X-007 — Report Sorting

- **Type:** Team extension
- **Status:** `NOT STARTED`
- Monthly and yearly report tables should support consistent sorting controls.

---

## X-008 — Report and Chart Export

- **Type:** Team extension
- **Status:** `NOT STARTED`
- Users should be able to export relevant reports/charts to Excel and PDF formats.

---

## X-009 — Reports Navigation Group

- **Type:** Team extension
- **Status:** `IN PROGRESS`
- The application navigation should expose a top-level `Reports` section with
  Monthly and Yearly report tabs.
- Monthly remains functional; Yearly may stay a placeholder until the detailed
  yearly report milestone.

### Verification

- [ ] Top-level navigation shows `Reports`.
- [ ] Monthly Report remains usable under `Reports`.
- [ ] Yearly Report placeholder is present without implementing future logic.

---

# 20. Project Decisions — Not Official Requirements

These decisions belong in `docs/ARCHITECTURE.md` / `docs/DECISIONS.md` and must remain clearly separate from the official course requirements.

Planned decisions currently include:

```text
React
Vite
JavaScript / JSX
MUI
One charting library
Vitest
ESLint
GitHub Issues + feature branches + Pull Requests
Codex as primary coding agent
Claude Code as reviewer / secondary coding agent
```

None of these should be described as a course requirement unless the official specification explicitly says so.

---

# 21. Final Traceability Template

As development progresses, every mandatory requirement should be traceable:

| Requirement | GitHub Issue | Implementation | Test | Status |
|---|---|---|---|---|
| R-010 | TBD | TBD | TBD | `NOT STARTED` |
| R-020 | TBD | TBD | TBD | `NOT STARTED` |
| R-030 | TBD | TBD | TBD | `NOT STARTED` |
| R-050 | TBD | TBD | TBD | `NOT STARTED` |
| R-060 | TBD | TBD | TBD | `NOT STARTED` |
| R-070 | TBD | TBD | TBD | `NOT STARTED` |
| R-080 | TBD | TBD | TBD | `NOT STARTED` |
| R-090 | TBD | TBD | TBD | `NOT STARTED` |
| R-110 | TBD | TBD | TBD | `NOT STARTED` |
| R-130 | TBD | TBD | TBD | `NOT STARTED` |
| R-140 | TBD | TBD | TBD | `NOT STARTED` |
| R-160 | TBD | TBD | TBD | `NOT STARTED` |

---

# 21. Rule for AI Agents

Codex, Claude Code, or any other coding agent must **not reinterpret or weaken a mandatory requirement**.

When an ambiguity exists:

```text
Do not guess
    ↓
Record the ambiguity
    ↓
Use the official course forum / instructor clarification
    ↓
Update REQUIREMENTS.md
    ↓
Then implement
```
