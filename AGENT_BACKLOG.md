# Agent Backlog — Governance & Spec Improvements

> A standing list of self-contained, hand-off-ready tasks for AI agents working on the **governance layer** of this project (acceptance criteria, rule files, agent-facing docs). This is *not* a product backlog — feature work continues to bind to `AC-xx` IDs in [`ACCEPTANCE_CRITERIA.md`](ACCEPTANCE_CRITERIA.md) per [`.cursor/rules/sdd.mdc`](.cursor/rules/sdd.mdc).

## Concept model — `AC-xx` vs. `GOV-xx`

These look parallel but describe different things. Keep them separate:

- **`AC-xx`** in [`ACCEPTANCE_CRITERIA.md`](ACCEPTANCE_CRITERIA.md) — *what the shipped product must do.* A durable behavioral contract. IDs are immutable and live as long as the widget does.
- **`GOV-xx`** in this file — *work to improve our governance over that contract.* An ephemeral chore. IDs are immutable but the tasks themselves become historical once completed.

Rules that follow from the distinction:

- A `GOV-xx` task may **edit** `ACCEPTANCE_CRITERIA.md` as its output (that's the whole point of most of them), but ACs are never tasks and GOV items are never contracts.
- A `GOV-xx` task may **produce** new `AC-xx` IDs (e.g. `GOV-06` mints `AC-Nx` negative ACs). The produced ACs are durable; the GOV task that created them is ephemeral.
- When a `GOV-xx` task touches **product behavior** (rare — most don't), it binds to the affected `AC-xx` per [`.cursor/rules/sdd.mdc`](.cursor/rules/sdd.mdc), same as any other product change.
- Prompts operate on **tasks** (`GOV-xx`) or on **artifacts** (the AC set, Figma), never both. See [`scripts/prompts/`](scripts/prompts/).

## How to use this file

### As the human
- Pick a task by ID (e.g. `GOV-03`) and paste one of the prompts below into a fresh agent session.
- Tasks can be worked in any order within their dependency constraints — the **Depends on** row is the only hard ordering.
- After an agent finishes, update **Status** in the index table and the task body. Add a one-line completion note with the PR/commit and date.
- If an agent marks a task `blocked`, read the blocker note and decide: unblock, defer, or cancel.

### As an agent picking up a task
1. Read the full task section below (not just the title) — it contains scope, steps, and stop-and-ask triggers.
2. Read any files listed under **Scope**.
3. Check **Depends on** — if any blocker is not `done`, stop and tell the human.
4. Follow **Steps**. Do not expand scope. Do not touch files outside **Scope**.
5. Verify each bullet under **Done when** before reporting completion.
6. If any **Stop and ask** trigger fires, halt and surface the question.
7. Update this file: mark the task `done`, add a completion note (date + one-line summary). Keep edits **localized and append-only** per the concurrency hygiene rules in [`scripts/prompts/backlog-worker.md`](scripts/prompts/backlog-worker.md) — other agents may be editing this file in parallel branches.

### Standard handoff prompt (copy into a new session)

```
Work on task GOV-XX from AGENT_BACKLOG.md in this repo. Read the full task
section, follow its steps exactly, respect the stop-and-ask triggers, and
stay within the declared scope. When finished, update the task status to
"done" and add a one-line completion note.
```

---

## Status index

| ID | Title | Size | Severity | Depends on | Status |
|----|-------|------|----------|------------|--------|
| GOV-01 | AC catalog table at top of `ACCEPTANCE_CRITERIA.md` | XS | High | — | done |
| GOV-02 | Promote AC-100 (60KB bundle budget) into `AGENTS.md` | XS | High | — | done |
| GOV-03 | Tag every AC with `@stable` / `@evolving` / `@aspirational` | S | High | GOV-01 | done |
| GOV-04 | Extract construction rules out of ACs into rule files | S | High | GOV-01 | done |
| GOV-05 | Split compound ACs into one-behavior-per-ID | M | High | GOV-01, GOV-04 | done |
| GOV-06 | Elevate §12 Non-Goals into negative AC-IDs | S | Medium | GOV-05 | todo |
| GOV-07 | Bind each AC to verification evidence | M | Critical | GOV-05 | todo |
| GOV-08 | Replace visual prose with Figma node links | S | Medium | GOV-07 | todo |
| GOV-09 | Audit rule files for differential impact | M | Medium | — | todo |
| GOV-10 | Adopt amendment-logging convention | XS | Medium | — | todo |
| GOV-11 | Require PR descriptions list AC-IDs touched | S | Medium | GOV-09 | todo |
| GOV-12 | Document immutable-ID + tombstone convention | XS | Medium | — | todo |
| GOV-13 | Test-naming convention tied to AC intent | XS | Low | — | todo |
| GOV-14 | Delete-and-watch experiment on flagged rules | M | Low | GOV-09 | todo |
| GOV-15 | Quarterly AC decay review (set up + first run) | XS/S | Low | GOV-03 | todo |

Status values: `todo` · `in-progress` · `blocked` · `done` · `cancelled`.

---

## Tasks

### GOV-01 — AC catalog table at top of `ACCEPTANCE_CRITERIA.md`

**Status:** done · **Size:** XS · **Severity:** High · **Depends on:** —
**Blocks:** GOV-03, GOV-04, GOV-05

**Why**
A flat index makes every later task (tagging, evidence binding, audits) cheap. Humans and agents currently must scroll 750+ lines to locate an AC by ID.

**Scope**
- Edit: `ACCEPTANCE_CRITERIA.md` (add new section near the top, after the intro, before §1).
- Do not edit: any AC body, any rule file.

**Steps**
1. Read `ACCEPTANCE_CRITERIA.md` end-to-end and enumerate every `AC-xx` ID, including lettered variants (e.g. `AC-20d`).
2. Add a new `## AC Catalog` section after the intro. One markdown table with columns: `ID | One-line summary | Section | Status`.
3. Populate the summary from the first sentence of each AC (keep it ≤ 100 chars).
4. Use a relative anchor link for the `Section` column pointing at the heading the AC lives under (e.g. `[§3.2](#32-compact-hero-mode)`).
5. `Status` column: put `active` for all existing ACs. Reserved values for future use: `deprecated`, `superseded`.

**Done when**
- [x] Every existing AC-ID appears exactly once in the catalog.
- [x] All section anchor links resolve (manually clicked in a markdown preview).
- [x] `ACCEPTANCE_CRITERIA.md` still renders cleanly (no broken tables).
- [x] No AC body text was changed.

**Stop and ask if**
- You find duplicate or ambiguous AC-IDs (flag them for GOV-05 rather than fixing now).
- The intro currently references something that should go *after* the catalog instead of before.

---

### GOV-02 — Promote AC-100 into `AGENTS.md`

**Status:** done · **Size:** XS · **Severity:** High · **Depends on:** —

**Why**
AC-100 (combined gzipped JS + CSS ≤ 60 KB) is the highest-consequence invariant on the project and is currently easy to miss because it sits deep inside `ACCEPTANCE_CRITERIA.md`. Redundancy here is desirable.

**Scope**
- Edit: `AGENTS.md` only.
- Do not edit: `ACCEPTANCE_CRITERIA.md` (AC-100 stays there as the source of truth).

**Steps**
1. Find the AC-100 statement in `ACCEPTANCE_CRITERIA.md` §8 Performance.
2. In `AGENTS.md`, add a short, bold callout near the top of the **Key Decisions & Constraints** section (or equivalent high-visibility location) restating AC-100.
3. Link from the callout to the authoritative AC-100 section.
4. Do not restate other ACs — AC-100 is uniquely high-consequence; resist scope creep.

**Done when**
- [x] `AGENTS.md` has a visible AC-100 callout within the first ~100 lines.
- [x] The callout links back to `ACCEPTANCE_CRITERIA.md#8-performance` (or the correct anchor).
- [x] Wording matches the AC-100 body (no drift).

**Stop and ask if**
- The AC-100 budget number has changed since last read; confirm with the human before propagating.

---

### GOV-03 — Tag every AC with stability marker

**Status:** done · **Size:** S · **Severity:** High · **Depends on:** GOV-01
**Blocks:** GOV-15

**Why**
Not all ACs deserve strict enforcement. A stability tag tells reviewers (human or AI) how hard to push back on a change.

**Definitions**
- `@stable` — behavior is shipped and known to work; regressions are bugs.
- `@evolving` — actively being refined; spec and code may drift by design.
- `@aspirational` — target state, not yet implemented or verified.

**Scope**
- Edit: `ACCEPTANCE_CRITERIA.md` only.
- Add a `Stability` column to the catalog from GOV-01.
- Add an inline tag (e.g. trailing `**@stable**`) to each AC heading or first line.

**Steps**
1. Add a short **Stability markers** subsection under the catalog explaining the three values.
2. Walk the doc top to bottom. For each AC, choose exactly one tag based on: does the current code implement this? has it shipped? is it still being debated?
3. Update both the inline AC and the catalog row.
4. Default to `@stable` only when you're confident — prefer `@evolving` when unsure.

**Done when**
- [x] Every AC has exactly one stability tag inline.
- [x] Catalog `Stability` column is populated for every row.
- [x] Definitions section is present and accurate.

**Stop and ask if**
- More than ~20% of ACs would be `@aspirational` — that's a signal the doc is ahead of the code and may need a broader discussion before tagging.

---

### GOV-04 — Extract construction rules out of ACs into rule files

**Status:** done · **Size:** S · **Severity:** High · **Depends on:** GOV-01

**Why**
ACs describe *what the product does*. Rules describe *how the code is written*. Mixing them bloats the AC doc and weakens both. Items like "use `onInput` not `onChange`" or "import from `'react'` not `'preact'`" are construction rules.

**Scope**
- Edit: `ACCEPTANCE_CRITERIA.md` (remove items).
- Edit: `.cursor/rules/code-governance.mdc` (or the most appropriate existing rule file) to add anything not already covered.
- Do not create new rule files.

**Steps**
1. Scan `ACCEPTANCE_CRITERIA.md` for statements that describe *code style, import conventions, framework gotchas, or file layout* rather than user-visible behavior. Candidates: strict TypeScript, no `any`, CSS Modules, `onInput`, `currentTarget`, Preact compat imports.
2. For each, check if `code-governance.mdc` or another rule file already covers it. If yes, delete from the AC. If no, move the prose into the matching rule file first, then delete from the AC.
3. Preserve AC-IDs if the *behavioral* part of a mixed AC remains — just trim the construction prose.
4. Update the catalog (GOV-01) if any AC's summary changes.

**Done when**
- [x] No remaining AC contains prose about import paths, event handler naming, type strictness, or CSS module conventions.
- [x] All such items are covered by a rule file.
- [x] No AC-IDs were renumbered or deleted (only trimmed).

**Stop and ask if**
- You're unsure whether an item is "construction" or "behavior" (e.g. accessibility ACs can look like both). Default to keeping it in the AC and flag for discussion.

---

### GOV-05 — Split compound ACs into one-behavior-per-ID

**Status:** done · **Size:** M · **Severity:** High · **Depends on:** GOV-01, GOV-04

**Why**
An AC that asserts two things cannot be individually verified. "Submit empty is a no-op AND Enter submits AND Shift+Enter adds newline" should be three ACs, not one.

**Scope**
- Edit: `ACCEPTANCE_CRITERIA.md` only.
- Update the GOV-01 catalog as IDs change.

**Steps**
1. Read each AC. Flag any containing "and", "also", or bullet lists of multiple assertions that aren't variations of the same behavior.
2. For each flagged AC, decide: split into new IDs (preferred) or rewrite as a single behavior.
3. When splitting: **never reuse or renumber existing IDs**. Allocate new IDs by extending the numeric range or using lettered suffixes (`AC-15`, `AC-15b`, `AC-15c`).
4. Leave the original ID in place as a tombstone if its meaning changed materially: `AC-15: [SPLIT 2026-MM — see AC-15a, AC-15b]`.
5. Update the catalog.

**Done when**
- [x] No AC asserts more than one independently-testable behavior.
- [x] No AC-ID was reused for different content.
- [x] Tombstones exist wherever a split changed the original meaning.
- [x] Catalog reflects every new ID.

**Stop and ask if**
- Splitting an AC would cause > 5 new IDs from one original — that probably indicates a deeper rewrite is needed; surface for human review.

---

### GOV-06 — Elevate §12 Non-Goals into negative AC-IDs

**Status:** todo · **Size:** S · **Severity:** Medium · **Depends on:** GOV-05

**Why**
"MUST NOT attach globals to window" is a contract, not a note. Making it an AC-ID gives it traceability and lets reviewers/tests reference it.

**Scope**
- Edit: `ACCEPTANCE_CRITERIA.md` only.

**Steps**
1. Read §12 Non-Goals.
2. For each genuine invariant (not just "we're not doing feature X right now"), mint a negative AC-ID. Use a `AC-N1`, `AC-N2`, … prefix to make them visually distinct.
3. Write each as a MUST NOT statement with a concrete, testable boundary.
4. Leave the §12 prose but reference the AC-IDs from it.
5. Update the catalog.

**Done when**
- [ ] Every enforceable invariant in §12 has a corresponding `AC-Nx` ID.
- [ ] §12 reads as a human-friendly summary that points at the ACs.
- [ ] Catalog includes all new `AC-Nx` rows.

**Stop and ask if**
- An item in §12 is really a product decision ("we're not doing mobile v1") rather than an invariant. Those stay as plain non-goals, don't mint ACs for them.

---

### GOV-07 — Bind each AC to verification evidence

**Status:** todo · **Size:** M · **Severity:** Critical · **Depends on:** GOV-05

**Why**
An AC without an evidence path is prose. This is the single biggest quality lever on the whole document.

**Scope**
- Edit: `ACCEPTANCE_CRITERIA.md`.
- Add a `Verification` line (or column in the catalog) to every AC.

**Steps**
1. Add a `Verification` column to the catalog from GOV-01.
2. For each AC, pick the cheapest credible verification path:
   - **Automated**: a command (`npm run lint`, `npm run build` + gzip check, a named test).
   - **Manual**: a concrete dev-harness step ("open `/`, send empty message, confirm no state change").
   - **Visual**: a Figma node reference (`compare against Figma node 143:753`).
3. If no credible path exists, mark the AC `Verification: none` and flag it — that AC is aspirational and should probably be tagged `@aspirational` per GOV-03.
4. Update every row in the catalog.

**Done when**
- [ ] Every AC has a non-empty `Verification` value.
- [ ] Any AC marked `Verification: none` is also tagged `@aspirational`.
- [ ] Automated verifications reference real, existing commands.

**Stop and ask if**
- More than ~15% of ACs end up with `Verification: none` — that means the spec is largely untestable and needs a broader conversation before proceeding.

---

### GOV-08 — Replace visual prose with Figma node links

**Status:** todo · **Size:** S · **Severity:** Medium · **Depends on:** GOV-07

**Why**
Prose descriptions of visual design drift from Figma. The manifest in `ACCEPTANCE_CRITERIA.md` §2.5 already names nodes — use them.

**Scope**
- Edit: `ACCEPTANCE_CRITERIA.md` only.

**Steps**
1. Find ACs whose body describes colors, spacing, border-radius, shadows, font sizes, or layout in prose.
2. Replace the prose with: "Matches Figma node `NNN:NNN` (see §2.5 Figma Manifest)".
3. If the relevant node isn't in §2.5, add it there first.
4. Keep behavioral ACs (states, transitions, interactions) in prose — only replace the *appearance* descriptions.

**Done when**
- [ ] No AC restates specific color, spacing, or typography values in prose when a Figma node already encodes them.
- [ ] Every node referenced by an AC appears in §2.5.

**Stop and ask if**
- A Figma node doesn't match what the AC prose currently says. That's design drift — don't silently pick one; surface the conflict.

---

### GOV-09 — Audit rule files for differential impact

**Status:** todo · **Size:** M · **Severity:** Medium · **Depends on:** —
**Blocks:** GOV-11, GOV-14

**Why**
Rule files are injected into every agent turn. Rules that don't change behavior are pure cost.

**Scope**
- Read-only pass over `.cursor/rules/*.mdc`.
- Output: a short recommendation appended to this file as a new section `## GOV-09 audit results`.

**Steps**
1. For each file in `.cursor/rules/`, summarize in one sentence: what behavior would change if this rule were deleted?
2. Classify each: `keep` (prevents a concrete AI failure mode), `merge` (overlaps with another rule), `drop` (restates model priors or generic good practice), `maybe` (unclear).
3. Write recommendations — do NOT delete any rule in this task.
4. Append the results to `AGENT_BACKLOG.md` under a new section after the tasks.

**Done when**
- [ ] Every `.cursor/rules/*.mdc` file has an explicit classification and one-sentence justification.
- [ ] Recommendations are appended to this file, not acted on.

**Stop and ask if**
- A rule file references behavior that isn't documented in `AGENTS.md` or `ACCEPTANCE_CRITERIA.md`. That's a content gap worth surfacing.

---

### GOV-10 — Adopt amendment-logging convention

**Status:** todo · **Size:** XS · **Severity:** Medium · **Depends on:** —

**Why**
Cheap to start now, impossible to backfill later. Every AC edit should carry a date and a PR/commit reference.

**Scope**
- Edit: `.cursor/rules/sdd.mdc` (add the requirement).
- Edit: `ACCEPTANCE_CRITERIA.md` §10.5 Amending ACs (document the format).
- No changes to existing AC bodies.

**Steps**
1. In §10.5, add a short paragraph: amendments carry `(added YYYY-MM, #PR)` or `(amended YYYY-MM, #PR)` in the AC body or a trailing line.
2. In `sdd.mdc`, add a one-line requirement that PR authors must annotate any AC amendment in this format.
3. Do not retroactively annotate existing ACs.

**Done when**
- [ ] §10.5 documents the format with an example.
- [ ] `sdd.mdc` references the requirement.

**Stop and ask if**
- `sdd.mdc` structure makes it unclear where the line belongs. Prefer adding under an existing section rather than creating a new one.

---

### GOV-11 — Require PR descriptions list AC-IDs touched

**Status:** todo · **Size:** S · **Severity:** Medium · **Depends on:** GOV-09

**Why**
Primary defense against silent drift: a PR may *implement* AC-12 but *affect* AC-15 without the author realizing it. Forcing authors to enumerate touched IDs surfaces unintentional regressions early.

**Scope**
- Edit: `.cursor/rules/version-control.mdc` (or the successor file after GOV-09, if merged/renamed).
- Optional: add a `PULL_REQUEST_TEMPLATE.md` under `.github/` if this repo uses GitHub PRs and the human has approved adding it (see stop-and-ask).

**Steps**
1. Add a bullet to the PR checklist in `version-control.mdc`: "List every AC-ID *touched* by this PR, not just implemented. Include `AC-xx unchanged — verified still holds` for ACs near the change but not modified."
2. If the human approves, add a matching `.github/PULL_REQUEST_TEMPLATE.md` with the checklist prefilled.

**Done when**
- [ ] `version-control.mdc` contains the requirement.
- [ ] If a PR template was added, its checklist matches the rule.

**Stop and ask if**
- Before creating `.github/PULL_REQUEST_TEMPLATE.md` — this is a new file outside `src/`, confirm the human wants it. Per [`.cursor/rules/change-boundary.mdc`](.cursor/rules/change-boundary.mdc), CI/repo-level config edits need explicit approval.

---

### GOV-12 — Document immutable-ID + tombstone convention

**Status:** todo · **Size:** XS · **Severity:** Medium · **Depends on:** —

**Why**
Cheap forever-protection for historical commit references. Once adopted, commits that cite `AC-22` keep making sense even if AC-22's behavior is superseded.

**Scope**
- Edit: `ACCEPTANCE_CRITERIA.md` §10.5 Amending ACs only.

**Steps**
1. Add a paragraph: "AC IDs are **immutable**. Never renumber, never reuse. When an AC is no longer accurate, deprecate it in place with a tombstone."
2. Document the tombstone format: `AC-22: [DEPRECATED YYYY-MM — superseded by AC-45, reason: <one line>]`.
3. Add one worked example.

**Done when**
- [ ] §10.5 has an explicit immutability statement and a worked tombstone example.

**Stop and ask if**
- §10.5 already contradicts this (e.g. previously allowed renumbering). Surface the conflict rather than silently overriding.

---

### GOV-13 — Test-naming convention tied to AC intent

**Status:** todo · **Size:** XS · **Severity:** Low · **Depends on:** —

**Why**
Low urgency (project has ~no tests today), but writing the convention down now costs nothing and guarantees the discipline from the first test onward.

**Scope**
- Edit: `.cursor/rules/code-governance.mdc` only.

**Steps**
1. Add a short section: "When tests are added, their name must quote the AC's intent, not the current implementation. Example: `AC-15: empty submit is a no-op` — not `handleSubmit returns early on empty`."
2. Explain briefly why: tests that describe implementation can be made to pass by matching buggy code; tests that describe intent fail when the code drifts from the spec.

**Done when**
- [ ] `code-governance.mdc` has a named subsection about test naming referencing AC intent.

**Stop and ask if**
- The rule file already has an incompatible test-naming convention. Don't override silently.

---

### GOV-14 — Delete-and-watch experiment on flagged rules

**Status:** todo · **Size:** M · **Severity:** Low · **Depends on:** GOV-09

**Why**
The empirical version of "is this rule earning its keep?" Theory is cheap; observation is decisive.

**Scope**
- Edit: `.cursor/rules/` — remove (or comment out) rules flagged by GOV-09 as `drop` or `maybe`.
- Keep the removed content in a scratch section at the bottom of this file for easy restoration.

**Steps**
1. Read the GOV-09 audit results appended to this file.
2. Remove rules classified as `drop` or `maybe` — one at a time, not all at once.
3. Move the removed content into a `## GOV-14 removed rules (experiment)` section at the bottom of `AGENT_BACKLOG.md` with a removal date.
4. Note the current date as the start of a 1-week observation window.
5. After one week (human triggers the followup), review whether any AI outputs regressed. Decide per rule: restore, merge elsewhere, or delete permanently.

**Done when**
- [ ] At least one rule was removed.
- [ ] Observation-window start date is recorded.
- [ ] There is a clear followup plan for the end of the window.

**Stop and ask if**
- GOV-09 classified all rules as `keep`. Then this task is cancelled — mark status `cancelled` and note the reason.
- A rule flagged `drop` turns out to reference something load-bearing (CI, public API). Halt and ask.

---

### GOV-15 — Quarterly AC decay review

**Status:** todo · **Size:** XS (setup) / S (per run) · **Severity:** Low · **Depends on:** GOV-03

**Why**
The slow failure mode of any spec doc is drift: code ships, ACs don't move, six months later half the doc is lying. A cheap recurring pass catches this early.

**Scope**
- Setup edit: add a **Recurring tasks** section at the bottom of this file.
- First run: produce a short report of findings, appended.
- No AC bodies edited in this task — findings may spawn follow-up GOV-xx tasks.

**Steps**
1. Add a **Recurring tasks** section to `AGENT_BACKLOG.md` documenting: "Every quarter, re-run GOV-15: spot-check 10 randomly selected `@stable` ACs against current behavior. Flag any that have drifted."
2. Run it once now: pick 10 `@stable` ACs (use the GOV-03 tags), verify each one manually or via its declared verification path from GOV-07.
3. Produce a short report appended to this file with findings and any new GOV-xx tasks suggested.

**Done when**
- [ ] Recurring-tasks section exists.
- [ ] First run completed with a short written report.
- [ ] Any drift-related follow-ups are filed as new GOV-xx items.

**Stop and ask if**
- More than 3 of 10 `@stable` ACs have drifted. That's a signal of a broader audit need, not a routine review — surface before continuing.

---

## Completion log

<!--
Format:
- YYYY-MM-DD — GOV-XX — one-line note (commit/PR)
-->

- 2026-04-20 — GOV-02 — Added bold AC-100 bundle-budget callout to `AGENTS.md` §Key Decisions & Constraints, linking to the authoritative AC in `ACCEPTANCE_CRITERIA.md` §8 Performance.
- 2026-04-20 — GOV-01 — Added `## AC Catalog` index (64 rows) between intro and §1 of `ACCEPTANCE_CRITERIA.md`.
- 2026-04-20 — GOV-03 — Tagged every AC in `ACCEPTANCE_CRITERIA.md` with a stability marker (32 @stable / 19 @evolving / 13 @aspirational); added Stability markers subsection and Stability column to the AC catalog.
- 2026-04-20 — GOV-04 — Extracted construction prose from `ACCEPTANCE_CRITERIA.md` into the existing rule files: trimmed AC-112 to behaviour-only, rewrote §11 DoD item 4 to point at `code-governance.mdc`, deprecated AC-71 (Token-only styling) in place (ID retained, catalog row marked `deprecated`, §2.5 umbrella note updated). No rule-file additions needed — `code-governance.mdc` + `project.mdc` already cover strict TS, `onInput`/`currentTarget`, React-via-Preact-compat, CSS Modules, and token-only styling.
- 2026-04-20 — GOV-05 — Split 14 compound ACs into 25 new IDs (AC-10c, 12b, 20e-20k, 23b, 25b-c, 28b-c, 31b-d, 73b, 81b-d, 92b-c, 120b-c); originals kept with narrowed titles. Catalog + §2.5 Figma Manifest updated; no IDs reused; no split exceeded 5 children.

---

## Recurring tasks

_(to be populated by GOV-15)_
