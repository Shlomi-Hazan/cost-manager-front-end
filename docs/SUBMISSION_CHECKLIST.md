# Cost Manager Front-End — Submission Checklist

> **Purpose:** Final packaging and submission checklist based on the official course specification.
>
> **Source of truth:** `docs/REQUIREMENTS.md` and the latest official course document.
>
> **Important:** Before submission, re-check the latest version of the course document and relevant course-forum clarifications.

---

# 1. Submission Principle

The project is not considered ready for submission merely because the application works.

Submission readiness requires all of the following:

```text
Requirements verified
        ↓
Tests passing
        ↓
Production verified
        ↓
Video ready
        ↓
PDF ready
        ↓
ZIP ready
        ↓
Vanilla db.js ready
        ↓
Exactly 3 Moodle files
        ↓
Final manual verification
```

---

# 2. Final Requirement Audit

Before packaging anything:

- [ ] Review the latest official project specification.
- [ ] Review relevant lecturer/course-forum clarifications.
- [ ] Update `docs/REQUIREMENTS.md` if needed.
- [ ] Verify every mandatory requirement.
- [ ] Complete the requirement traceability table.
- [ ] Resolve or explicitly document remaining ambiguities.
- [ ] Confirm no required behavior was replaced by a project preference.

---

# 3. Repository Readiness

Before creating submission artifacts:

- [ ] `main` contains the final reviewed version.
- [ ] All required Pull Requests are merged.
- [ ] No required work remains only on feature branches.
- [ ] `git status` is clean.
- [ ] No uncommitted code changes remain.
- [ ] No secrets are present.
- [ ] No personal tokens/keys are committed.
- [ ] Documentation reflects the final implementation.
- [ ] Final tag/release may be created if the team chooses to use one.

Recommended final repository checkpoint:

```text
final/submission-ready
```

or an equivalent Git tag such as:

```text
v1.0.0
```

This is a project workflow choice, not a course requirement.

---

# 4. Automated Validation

Run from a clean checkout/install:

```bash
npm install
npm run lint
npm test
npm run build
```

Verify:

- [ ] installation succeeds.
- [ ] lint succeeds.
- [ ] automated tests succeed.
- [ ] production build succeeds.

If the project uses:

```bash
npm ci
```

for CI, verify it also works from the committed lockfile.

---

# 5. Vanilla `db.js` Verification

This is one of the most important final checks.

The separately submitted file must be the **Vanilla** version.

Verify:

- [ ] file is standalone.
- [ ] no `import` statements remain.
- [ ] no React dependency.
- [ ] no Vite runtime dependency.
- [ ] normal script loading works:

```html
<script src="db.js"></script>
```

- [ ] global `db` exists.
- [ ] required call works:

```javascript
const ob = db.openCostsDB("costsdb", 1);
```

- [ ] `ob.addCost(...)` works.
- [ ] `ob.getReport(...)` works.
- [ ] `ob.getReport("USD")` works with default current month/year behavior.
- [ ] `data.total.sum` is accessible.
- [ ] no JavaScript exception is thrown.

---

# 6. Official Vanilla HTML Test

Open the final official compatibility test in the latest Google Chrome.

Verify:

- [ ] `db.js` loads.
- [ ] database object is created.
- [ ] first cost item is added.
- [ ] second cost item is added.
- [ ] report is generated.
- [ ] total sum is accessible.
- [ ] Console contains no blocking errors.

Do not submit immediately after copying/rebuilding `db.js`.

Always re-run this test against the exact file that will be uploaded to Moodle.

---

# 7. Production Application Verification

Open the actual production URL.

Test:

```text
Open application
↓
Add cost
↓
Refresh page
↓
Generate monthly report
↓
Open Pie Chart
↓
Open Bar Chart
↓
Change currency
↓
Open Settings
↓
Test exchange-rate retrieval
```

Verify:

- [ ] production URL is public and reachable.
- [ ] application loads in latest Google Chrome.
- [ ] user-facing UI is in English.
- [ ] cost can be added.
- [ ] localStorage persists after refresh.
- [ ] USD works.
- [ ] ILS works.
- [ ] GBP works.
- [ ] EURO works.
- [ ] original cost currencies remain preserved.
- [ ] monthly report works.
- [ ] Pie Chart works.
- [ ] Bar Chart works for all 12 months.
- [ ] Settings works.
- [ ] default exchange-rate URL works.
- [ ] custom exchange-rate URL works.
- [ ] Fetch succeeds in production.
- [ ] no blocking Console errors.
- [ ] no failed required assets.
- [ ] no broken layout in desktop Chrome.

---

# 8. Exchange-Rate Source Verification

Before submission:

- [ ] default rate URL is still online.
- [ ] URL is accessible without authentication.
- [ ] Fetch works from the production origin.
- [ ] CORS behavior is compatible.
- [ ] JSON is valid.
- [ ] required fields exist:

```json
{
  "USD": 1,
  "GBP": 0.6,
  "EURO": 0.7,
  "ILS": 3.4
}
```

- [ ] no accidental `EUR` substitution.
- [ ] values are valid numbers.
- [ ] source is expected to remain online during grading.

---

# 9. Demo Video

Official requirement:

- short video demonstrating how the application runs,
- try to keep it around/up to 60 seconds,
- uploaded to YouTube,
- visibility set to **Unlisted**.

Checklist:

- [ ] record final production version.
- [ ] keep video concise.
- [ ] demonstrate core functionality.
- [ ] upload to YouTube.
- [ ] set visibility to `Unlisted`.
- [ ] verify link while signed out/incognito if practical.
- [ ] save final link.
- [ ] include clickable link in the submission PDF.

Suggested demo flow:

```text
0–5s   Open Cost Manager
5–15s  Add a cost
15–25s Monthly report
25–35s Pie Chart
35–45s Bar Chart
45–55s Settings / currency behavior
55–60s Final application overview
```

The exact timing is a recommendation, not an official requirement.

---

# 10. Source-Code PDF — Required Front Matter

At the beginning of the PDF include:

## Team Manager

- [ ] first name.
- [ ] last name.

## Every Team Member

- [ ] first name.
- [ ] last name.
- [ ] ID.
- [ ] mobile number.
- [ ] email address.

## Video

- [ ] clickable link to YouTube demo.

## Collaborative Tools

- [ ] summary describes at least two collaborative tools.
- [ ] summary is no more than 100 words.

## Optional

- [ ] additional relevant notes/guidelines if useful.

---

# 11. Collaborative Tools Summary

The project should preserve evidence throughout development.

Before writing the ≤100-word final summary, collect examples from:

- [ ] GitHub Issues.
- [ ] Pull Requests.
- [ ] reviews.
- [ ] comments.
- [ ] branches.
- [ ] commits.
- [ ] assignments/project board if used.
- [ ] second collaborative tool approved/presented in the course.

Do not fabricate collaboration history at submission time.

---

# 12. Source-Code PDF — Code Section

The PDF must contain all code files coded by the team.

For every included code file:

- [ ] show the file name.
- [ ] show the code.
- [ ] keep formatting readable.
- [ ] avoid damaging line wrapping.
- [ ] preserve indentation.
- [ ] make it easy for the grader to identify where one file ends and the next begins.

Suggested organization:

```text
src/
  App.jsx
  main.jsx
  ...

src/lib/
  db.js

src/services/
  ...

src/utils/
  ...

vanilla/
  db.js

other coded/config files as appropriate
```

Before export:

- [ ] inspect multiple pages manually.
- [ ] verify long code lines are readable.
- [ ] verify no file is accidentally omitted.
- [ ] verify no generated dependency code is included unnecessarily.

---

# 13. PDF Filename

The official naming convention requires:

```text
firstname_lastname.pdf
```

Rules:

- [ ] team manager's first name.
- [ ] `_` between first and last name.
- [ ] lowercase only.

Example:

```text
haim_michael.pdf
```

Final filename:

```text
____________________________.pdf
```

---

# 14. Project ZIP

The entire project must be packed into a ZIP.

Before creating it:

- [ ] delete/exclude `node_modules`.
- [ ] include project source code.
- [ ] include `package.json`.
- [ ] include lockfile if used.
- [ ] include public assets.
- [ ] include required configuration files.
- [ ] include project documentation if intended.
- [ ] exclude unnecessary local build/cache files.
- [ ] exclude secrets.
- [ ] exclude IDE/user-specific files where appropriate.

Then:

- [ ] create ZIP.
- [ ] extract ZIP into a temporary folder.
- [ ] confirm extraction succeeds.
- [ ] run a fresh install from extracted project if practical.
- [ ] run build from extracted project.
- [ ] verify `node_modules` is not inside ZIP.

---

# 15. Separately Submitted `db.js`

The third Moodle file is the Vanilla version.

Checklist:

- [ ] copy/export the final Vanilla file.
- [ ] filename is exactly `db.js`.
- [ ] confirm this is not `src/lib/db.js` by mistake.
- [ ] open the exact file.
- [ ] inspect top/bottom for unresolved imports/export syntax.
- [ ] run official HTML test using this exact file.
- [ ] keep it outside the ZIP as a separate Moodle upload.

---

# 16. Exactly Three Moodle Files

The final Moodle submission must contain three files:

```text
1. <project>.zip
2. firstname_lastname.pdf
3. db.js
```

Verify:

- [ ] ZIP present.
- [ ] PDF present.
- [ ] Vanilla `db.js` present.
- [ ] no fourth unnecessary file.
- [ ] no single combined ZIP used as a replacement for the three-file requirement.

---

# 17. Team Manager Submission

Only the team manager should submit the project.

Before submission:

- [ ] confirm who is the team manager.
- [ ] confirm Moodle account.
- [ ] confirm all final files are available on the team manager's computer/account.
- [ ] confirm teammate does not independently submit a duplicate project.

---

# 18. Deadline Safety

The official document instructs students to treat the Moodle deadline as if it were **30 minutes earlier** because of possible server-time differences.

Checklist:

- [ ] record official deadline.
- [ ] subtract at least 30 minutes for internal deadline.
- [ ] target completion earlier than the minimum buffer.
- [ ] do not leave video upload/PDF generation/ZIP creation to the final minutes.

Internal submission target:

```text
Official Moodle deadline: __________________
Internal latest submission time: __________
Preferred team target: _____________________
```

---

# 19. Final Three-File Manual Inspection

Immediately before uploading:

## ZIP

- [ ] opens.
- [ ] contains expected project.
- [ ] does not contain `node_modules`.
- [ ] does not contain secrets.

## PDF

- [ ] opens.
- [ ] filename correct.
- [ ] team details correct.
- [ ] clickable video link works.
- [ ] collaboration summary ≤100 words.
- [ ] all code readable.

## `db.js`

- [ ] opens.
- [ ] Vanilla version.
- [ ] global `db`.
- [ ] official HTML test already rerun.

---

# 20. After Uploading to Moodle

Do not assume upload success.

Verify:

- [ ] exactly three files are visible in the submission.
- [ ] filenames are correct.
- [ ] uploaded file sizes look reasonable.
- [ ] submission status is confirmed.
- [ ] submission timestamp is before the safe deadline.
- [ ] confirmation/receipt page is saved or captured if available.

---

# 21. Final Submission Gate

Do not submit until every critical item below is true:

```text
Requirements audit complete               ✅
Tests pass                                ✅
Lint passes                               ✅
Build passes                              ✅
Vanilla db.js official test passes        ✅
Production Chrome QA passes               ✅
Default rates URL works                   ✅
Custom rates URL works                    ✅
Video uploaded Unlisted                   ✅
Video link verified                       ✅
PDF complete                              ✅
PDF filename correct                      ✅
ZIP excludes node_modules                 ✅
Vanilla db.js separated                   ✅
Exactly 3 Moodle files                    ✅
Team manager ready to submit              ✅
30-minute deadline buffer respected       ✅
```
