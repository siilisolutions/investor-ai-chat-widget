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
| GOV-06 | Elevate §12 Non-Goals into negative AC-IDs | S | Medium | GOV-05 | done |
| GOV-07 | Bind each AC to verification evidence | M | Critical | GOV-05 | done |
| GOV-08 | Replace visual prose with Figma node links | S | Medium | GOV-07 | done |
| GOV-09 | Audit rule files for differential impact | M | Medium | — | todo |
| GOV-10 | Adopt amendment-logging convention | XS | Medium | — | todo |
| GOV-11 | Require PR descriptions list AC-IDs touched | S | Medium | GOV-09 | todo |
| GOV-12 | Document immutable-ID + tombstone convention | XS | Medium | — | todo |
| GOV-13 | Test-naming convention tied to AC intent | XS | Low | — | done |
| GOV-14 | Delete-and-watch experiment on flagged rules | M | Low | GOV-09 | todo |
| GOV-15 | Quarterly AC decay review (set up + first run) | XS/S | Low | GOV-03 | todo |
| GOV-16 | Triage non-stable ACs into stabilisation-path buckets | S | High | GOV-03, GOV-07 | done |

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

**Status:** done · **Size:** S · **Severity:** Medium · **Depends on:** GOV-05

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
- [x] Every enforceable invariant in §12 has a corresponding `AC-Nx` ID.
- [x] §12 reads as a human-friendly summary that points at the ACs.
- [x] Catalog includes all new `AC-Nx` rows.

**Stop and ask if**
- An item in §12 is really a product decision ("we're not doing mobile v1") rather than an invariant. Those stay as plain non-goals, don't mint ACs for them.

---

### GOV-07 — Bind each AC to verification evidence

**Status:** done · **Size:** M · **Severity:** Critical · **Depends on:** GOV-05

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
   - **Visual**: a Figma node reference (`compare against Figma node site:143:601`).
3. If no credible path exists, mark the AC `Verification: none` and flag it — that AC is aspirational and should probably be tagged `@aspirational` per GOV-03.
4. Update every row in the catalog.

**Done when**
- [x] Every AC has a non-empty `Verification` value.
- [x] Any AC marked `Verification: none` is also tagged `@aspirational`.
- [x] Automated verifications reference real, existing commands.

**Stop and ask if**
- More than ~15% of ACs end up with `Verification: none` — that means the spec is largely untestable and needs a broader conversation before proceeding.

---

### GOV-08 — Replace visual prose with Figma node links

**Status:** done · **Size:** S · **Severity:** Medium · **Depends on:** GOV-07

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
- [x] No AC restates specific color, spacing, or typography values in prose when a Figma node already encodes them.
- [x] Every node referenced by an AC appears in §2.5.

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

**Status:** done · **Size:** XS · **Severity:** Low · **Depends on:** —

**Why**
Low urgency when first filed (project had ~no tests), but writing the convention down before the first test lands guarantees the discipline from turn one. Closed together with the Stage B Vitest rollout in `tests/` — every new test name quotes an AC-ID + intent (e.g. `AC-15: empty submit is a no-op`).

**Scope**
- Edit: `.cursor/rules/code-governance.mdc` only.

**Steps**
1. Add a short section: "When tests are added, their name must quote the AC's intent, not the current implementation. Example: `AC-15: empty submit is a no-op` — not `handleSubmit returns early on empty`."
2. Explain briefly why: tests that describe implementation can be made to pass by matching buggy code; tests that describe intent fail when the code drifts from the spec.

**Done when**
- [x] `code-governance.mdc` has a named subsection about test naming referencing AC intent.
- [x] First Vitest suite (`tests/chatMessage.test.tsx`, `tests/compactView.test.tsx`, `tests/apiChatService.test.ts`, `tests/app.test.tsx`) uses the convention end-to-end.

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

### GOV-16 — Triage non-stable ACs into stabilisation-path buckets

**Status:** done · **Size:** S · **Severity:** High · **Depends on:** GOV-03, GOV-07
**Blocks:** stabilisation lanes (future `GOV-xx`)

**Why**
After GOV-03 tagged stability and GOV-07 bound verification paths, the remaining non-stable ACs (~54 of them, `@evolving` or `@aspirational`) are a mixed bag: some just need their declared verification path run, some need a defined slice of frontend work, and some are blocked on systems this repo does not own. A one-line delta per AC sorts them into those three buckets so stabilisation lanes can be chartered cheaply and we stop treating externally-gated ACs as our bugs.

**Scope**
- Read-only pass over `ACCEPTANCE_CRITERIA.md` and (for grounding) `src/`.
- Append a new section `## GOV-16 triage results` to this file.
- Do not edit AC bodies. Do not change stability tags. Do not touch rule files.

**Steps**
1. From the AC Catalog, enumerate every AC whose Stability is `@evolving` or `@aspirational`.
2. For each, write one line stating the concrete delta between it and `@stable`, and classify into one of:
   - **(a) verify** — implementation appears to satisfy the AC; the remaining step is running the Verification column path and recording the result.
   - **(b) build** — a defined frontend slice is missing. Note the rough size and any design/Figma gating.
   - **(c) external** — behaviour is gated on a system this repo does not own (backend, FI/EN toggle, analytics pipeline, embedded host-page Lighthouse). These cannot be stabilised from inside the widget.
3. Group the output by cluster (so a future lane can pick up a whole cluster at once) rather than by ID.
4. Ground claims by grepping `src/` for the ARIA / history / media-query / cursor hooks the ACs talk about; avoid speculation.
5. Call out any AC where the triage itself surfaces a spec question (missing Figma node, ambiguous scope) — those are stop-and-ask candidates for the follow-up lane, not this task.

**Done when**
- [x] Every `@evolving` and `@aspirational` AC appears exactly once in the triage output with a one-line delta and a bucket.
- [x] Counts per bucket are reported.
- [x] No AC body, stability tag, or rule file was modified.

**Stop and ask if**
- More than ~40% of non-stable ACs fall into bucket (c). That's a signal the spec has drifted into things we don't own and should be surfaced before filing stabilisation lanes.

---

## GOV-16 triage results

Triage of every `@evolving` / `@aspirational` AC from the AC Catalog as of 2026-04-21. Buckets: **(a) verify** — run the declared Verification path; **(b) build** — defined frontend slice needed; **(c) external** — gated on a system outside this repo. Counts:

- `@evolving` (28): **(a)** 21 · **(b)** 7 · **(c)** 0
- `@aspirational` (26): **(a)** 0 · **(b)** 17 · **(c)** 9
- **Totals**: (a) 21 · (b) 24 · (c) 9 (17% of 54 — under the 40% stop-and-ask threshold).

Grounding signals collected from `src/` during triage:
- `role="status"` + `aria-live="polite"` already on the loading blob (`ChatMessage.tsx:35`).
- `role="alert"` already on the error paragraph (`ChatMessage.tsx:40`).
- `aria-label="Send message"` on the send button and a Finnish aria-label on the textarea (`ChatInput.tsx:82,91`).
- Only one `@media` rule exists in `src/styles/` (a `prefers-reduced-motion` block in `chatMessage.module.css:84`) — no viewport breakpoints anywhere.
- No `pushState`, `popstate`, `history.back`, `Escape`/`Esc` handler, or `interceptBackNavigation` option in `src/`.
- No `cursor: text` or focus-forwarding on the input shell.

### Cluster 1 — Loading fidelity (2 ACs, all bucket a)

- **AC-23** *(@evolving)* — Semantics already in code (`role="status"`, `aria-live="polite"`, "Haetaan tietoa..." copy). Delta: run the Figma screenshot compare + dev-harness inspection, record, promote.
- **AC-23b** *(@evolving)* — Blob shape/fill/pulse vs Figma `ds:152:137` / `site:201:2273`. Delta: one `get_design_context` sweep, confirm blob matches, promote.

Lane cost: one PR, largely note-taking — cheapest graduation in the backlog.

### Cluster 2 — Expanded surface & input placement (6 ACs, all bucket a)

- **AC-20a** *(@evolving)* — Viewport fill + opaque background. Delta: manual verify against Figma `site:143:601`.
- **AC-20b** *(@evolving)* — Hero image not visible behind expanded. Delta: verify in dev harness with hero img mounted.
- **AC-20f** *(@evolving)* — No host-page scroll/reflow during transition. Delta: scroll host mid-height, enter expanded, record.
- **AC-28** *(@evolving)* — Input in document flow under latest reply + shadow. Delta: visual verify against Figma `site:143:601` / `ds:152:121`.
- **AC-28b** *(@evolving)* — Short convos not bottom-pinned. Delta: single-pair harness run.
- **AC-28c** *(@evolving)* — Long convos show latest reply + input together. Delta: scripted multi-pair harness run.

Lane cost: one evidence-collection PR; no code expected unless a mismatch surfaces.

### Cluster 3 — Accessibility evidence (7 ACs, all bucket a)

- **AC-80** *(@evolving)* — Tab order textarea → send → chips. Delta: keyboard run, screenshot of focus ring.
- **AC-81** *(@evolving)* — Textarea announces its aria-label. **Already set** (`Siili investor chatbot message`). Delta: DevTools A11y panel capture.
- **AC-81b** *(@evolving)* — Send button announces "Send message". **Already set**. Delta: same capture.
- **AC-81c** *(@evolving)* — Loading state announces "Haetaan tietoa...". **Semantics already in place**. Delta: SR spot-check + capture.
- **AC-81d** *(@evolving)* — Errors via `role="alert"`. **Already set**. Delta: force mock rejection + SR capture.
- **AC-82** *(@evolving)* — WCAG AA contrast. Delta: axe DevTools scan, record token pairs.
- **AC-84** *(@evolving)* — 200% zoom reflow. Delta: browser zoom test.

Lane cost: one evidence PR. Five of the seven are almost certainly already passing — this lane should graduate most of `§6` in a single turn.

### Cluster 4 — Award-critical visual polish (3 ACs, all bucket a)

- **AC-70** *(@evolving)* — Figma parity umbrella. Delta: run `scripts/prompts/figma-sync.md` full-sweep; bump §2.5 `Last checked` rows.
- **AC-74** *(@evolving)* — Motion polish 120–300ms + IR-site easing. Delta: measure current durations, compare to IR site, document.
- **AC-75** *(@evolving)* — No generic AI aesthetic. Delta: juror-style review against Figma; record findings.

Lane cost: one Figma-sync pass plus a motion/aesthetic review note. AC-70 graduating pulls §2.5 freshness up as a side-effect.

### Cluster 5 — Host-context visual checks (2 ACs, both bucket a but gated on assets)

- **AC-76** *(@evolving)* — Dark hero compatibility against the **real** hero asset. Delta: obtain the actual IR-site hero image, overlay the compact view, axe/contrast scan.
- **AC-101** *(@evolving)* — Cold-start ≤150ms at 4× CPU throttle. Delta: DevTools run on a prod build.
- **AC-103** *(@evolving)* — CLS ≤0.05 across a session. Delta: DevTools Performance capture.
- **AC-110** *(@evolving)* — Chrome/Edge/Firefox/Safari happy-path run. Delta: four browsers × desktop + mobile happy path.

All bucket (a), but need an environment step (real hero asset for AC-76, multi-browser access for AC-110) before a human or CI can produce the evidence. Group these in a **Performance & environment evidence** lane, separate from cluster 4, and flag AC-76 to block on the IR team handing over the hero image.

### Cluster 6 — Idempotent init & prod-build hygiene (2 ACs, all bucket a)

- **AC-03** *(@evolving)* — Idempotent init. Delta: call `SiiliChatbot.init()` twice on the same container in the dev harness, confirm single clean mount, record.
- **AC-42** *(@evolving)* — No developer leakage (stack traces / internal IDs) in prod UI or console. Delta: force a throw inside the mock, inspect prod-build DOM + console.

Lane cost: small; both are single-check verifications.

### Cluster 7 — Responsive below desktop (4 ACs, all bucket b)

- **AC-91** *(@evolving)* — Tablet (640–1023px) chip wrap + full-width textarea. Delta: **build**; no viewport breakpoints exist in `src/styles/`.
- **AC-92** *(@evolving)* — Mobile (<640px) compact stacks input above chips. Delta: **build**.
- **AC-92b** *(@evolving)* — Mobile chips scroll or wrap without overflow. Delta: **build**.
- **AC-92c** *(@evolving)* — Mobile expanded view full width with Figma padding. Delta: **build**.

Lane cost: one CSS-only PR adding the breakpoints. Gated on §2.5 code-authored rows — either keep them code-authored with explicit breakpoint decisions documented, or ask the designer for mobile/tablet frames. Flag as stop-and-ask in the lane charter.

### Cluster 8 — Dismiss + back-nav + continue-pill + re-entry (15 ACs, all bucket b)

Largest cluster in the backlog and entirely unimplemented (`grep` found no `pushState`/`popstate`/`Escape`/`interceptBackNavigation` in `src/`). Two Figma gaps block the lane.

Continue-conversation pill:
- **AC-10a** *(@aspirational)* — Pill rendering above chips when history exists. **Design-blocked**: no Figma node for the pill yet; §2.5 currently has no row.
- **AC-10b** *(@aspirational)* — Chip de-duplication after a chip is asked.
- **AC-10c** *(@aspirational)* — Pill activation re-enters expanded with history, no network call.

Close button:
- **AC-20d** *(@aspirational)* — Close (×) button rendering top-right, 44×44 hit target, `aria-label="Sulje keskustelu"`. **Design-blocked**: §2.5 flags this row as "no Figma node — AC extension".
- **AC-20j** *(@aspirational)* — × / Esc dismiss retains messages and calls `history.back()` when intercepting.
- **AC-20k** *(@aspirational)* — Reduced-motion path is instant dismiss.

History / back-nav:
- **AC-20c** *(@aspirational)* — `pushState` on compact → expanded.
- **AC-20g** *(@aspirational)* — `popstate` returns to compact.
- **AC-20h** *(@aspirational)* — Compact-mode back not intercepted (scoping check).
- **AC-20i** *(@aspirational)* — `interceptBackNavigation: false` opt-out. **API surface change** to `WidgetOptions` — flag to `change-boundary.mdc`.

State retention:
- **AC-31** *(@aspirational)* — Dismiss retains `messages` in memory.
- **AC-31b** *(@aspirational)* — Compact re-entry surfaces pill + hides asked chips (depends on AC-10a/b).
- **AC-31c** *(@aspirational)* — Reload clears. Likely already true since there is no persistence layer; delta reduces to a verify step once state model is explicit.
- **AC-31d** *(@aspirational)* — New message from compact with history appends, does not reset.

Focus:
- **AC-32** *(@aspirational)* — Focus retained on textarea after send in expanded (both Enter and send-button click paths).

Lane sequencing proposal: (1) design conversation for pill + close-button Figma nodes → add §2.5 rows; (2) implement close/Esc + messages retention (`AC-20d/j/k`, `AC-31`); (3) add pushState/popstate with opt-out (`AC-20c/g/h/i`) — needs `change-boundary.mdc` approval for the new option; (4) pill + chip de-dup + re-entry (`AC-10a/b/c`, `AC-31b/d`); (5) focus retention (`AC-32`) folded into the send flow. This is 3–5 PRs, not one.

### Cluster 9 — Small ergonomics (2 ACs, all bucket b)

- **AC-17** *(@aspirational)* — Input shell click-to-focus + `cursor: text` on padding. Delta: small CSS (`cursor: text` on shell, `cursor: auto` on send button) + an onMouseDown handler forwarding to the textarea.
- **AC-83** *(@aspirational)* — Reduced-motion: transitions, auto-scroll, blob pulse reduced/disabled. **Partial**: blob pulse already has a `prefers-reduced-motion` block (`chatMessage.module.css:84`). Delta: audit the compact→expanded transition and `scrollIntoView` behavior and honor reduced motion everywhere, not just the blob.

Lane cost: two small PRs, can be combined.

### Cluster 10 — Externally gated (9 ACs, all bucket c)

Cannot be stabilised from inside the widget repo. Recommendation in the stop-and-ask: tag them explicitly as "externally gated" in the spec (e.g. an `@aspirational (externally gated)` sub-marker or a line in the AC body naming the owner) so they stop counting against our stabilisation budget. **This is a spec amendment and needs human approval** — not done in this triage.

- **AC-60** *(@aspirational)* — Every factual claim sourced. Owner: backend / retrieval.
- **AC-61** *(@aspirational)* — No forward-looking statements. Owner: backend / guardrails.
- **AC-62** *(@aspirational)* — No insider information. Owner: backend / content moderation.
- **AC-63** *(@aspirational)* — FI/EN language parity. Owner: product + backend (no toggle in widget yet).
- **AC-64** *(@aspirational)* — Dated-source freshness cue on badge. Owner: backend metadata contract, then widget surfaces.
- **AC-102** *(@aspirational)* — No host-page Lighthouse regression. Owner: embedding on the real host page, not the dev harness.
- **AC-120** *(@aspirational)* — Named events for key actions. Owner: product sign-off on event names.
- **AC-120b** *(@aspirational)* — No PII in event payloads.
- **AC-120c** *(@aspirational)* — `chat_closed` payload shape.

Note: `AC-64` and the `AC-120` family become bucket (b) as soon as their external contract is signed off — the widget side is a small addition once the schema exists.

### Next-step recommendations (for stabilisation-lane charters)

Sequenced by cost-to-value:

1. **Lane A — Loading fidelity** (Cluster 1, 2 ACs). One turn, almost certainly graduates both.
2. **Lane B — A11y evidence** (Cluster 3, 7 ACs). One evidence PR; five of seven likely graduate immediately.
3. **Lane C — Expanded layout evidence** (Cluster 2, 6 ACs). One PR; may surface small layout deltas.
4. **Lane D — Idempotent init & dev-leakage** (Cluster 6, 2 ACs). One small PR.
5. **Lane E — Figma full-sweep + motion review** (Cluster 4, 3 ACs). Uses `figma-sync.md`; also bumps §2.5 freshness.
6. **Lane F — Responsive breakpoints** (Cluster 7, 4 ACs). CSS build PR, gated on a design decision per the stop-and-ask.
7. **Lane G — Ergonomics** (Cluster 9, 2 ACs). One small PR.
8. **Lane H — Dismiss/history/continue-pill** (Cluster 8, 15 ACs). Multi-PR effort; needs design input and `change-boundary.mdc` approval for the new `WidgetOptions` field.
9. **Lane I — Performance & environment evidence** (Cluster 5, 4 ACs). Needs real hero asset + multi-browser access.
10. **Spec housekeeping — externally-gated tagging** (Cluster 10, 9 ACs). Not a lane; a single spec-amendment PR after human approval.

**Stop-and-asks surfaced by triage (do not act on in this task):**
- Designer needed for **pill** (AC-10a) and **close button** (AC-20d) Figma nodes before Lane H can start.
- `interceptBackNavigation` (AC-20i) is a new `WidgetOptions` field and needs explicit approval per `change-boundary.mdc`.
- Lane F: responsive breakpoints without tablet/mobile Figma frames — either request frames or commit to code-authored breakpoints on the record.
- Cluster 10 tagging is a spec change — human approval needed before amending `ACCEPTANCE_CRITERIA.md` bodies.

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
- 2026-04-20 — GOV-06 — Minted AC-N1 (MUST NOT render backend HTML/Markdown) and AC-N2 (MUST NOT bundle font files) in `ACCEPTANCE_CRITERIA.md` §12; restructured §12 into §12.1 Product decisions (persistence, streaming — no AC-IDs, remain v1 product decisions) and §12.2 Invariants (AC-Nx); added both rows to the AC Catalog.
- 2026-04-20 — GOV-07 — Added `Verification` column to the AC catalog in `ACCEPTANCE_CRITERIA.md`, binding each of 91 rows to the cheapest credible evidence path (Automated / Manual / Visual / `none`); 9 aspirational rows marked `none` (9.9%, below the 15% cap); every `none` row is `@aspirational`; automated paths reference real scripts (`npm run build`, `rg`).
- 2026-04-21 — GOV-08 — Replaced visual-token prose in AC-11, AC-12b, AC-20a, AC-21, AC-22, AC-23b, AC-28, AC-72 with references to the Figma nodes already bound in §2.5 (no new nodes needed, no design drift surfaced); behavioural prose and GOV-07 verification-column values left intact.
- 2026-04-21 — GOV-16 — Triaged all 54 non-stable ACs into 10 clusters across three buckets (a verify / b build / c external): 21 verify, 24 build, 9 external (17% external, under the 40% stop-and-ask threshold). Output appended as `## GOV-16 triage results`; proposes 9 stabilisation lanes + 1 spec-housekeeping amendment, ordered by cost-to-value; surfaces 4 stop-and-asks (pill + close-button Figma nodes, `interceptBackNavigation` WidgetOptions addition, responsive breakpoints without mobile frames, externally-gated tagging spec change). No AC bodies, stability tags, or rule files modified.
- 2026-04-22 — Lane A (GOV-16 Cluster 1) — Graduated AC-23 and AC-23b from `@evolving` to `@stable`. Evidence: (1) `ChatMessage.tsx:35-37` has `role="status"`, `aria-live="polite"`, and the "Haetaan tietoa..." copy; (2) Figma `get_metadata` on `ds:152:137` confirms a 44×80 frame with two 28×28 variants (`152:138` Start / `152:140` End) — matches the 28×28 `border-radius: 50%` gray circle in `chatMessage.module.css:61-70`; (3) `chatMessage.module.css:72-90` pulses scale 0.82↔1 + opacity 0.55↔1 over 1400ms ease-in-out between those two Figma endpoints, with a `prefers-reduced-motion` fallback; (4) live dev-harness capture shows the blob + "Haetaan tietoa..." rendering inline below the last Q+A pair, matching `site:201:2273`. Updated inline `@stable` tags, Stability column in the AC Catalog, and §2.5 `Last checked` rows to 2026-04-22. No code changes. Catalog stability after Lane A: 41 @stable / 31 @evolving / 26 @aspirational.
- 2026-04-22 — Lane B (GOV-16 Cluster 3) — Graduated 5 of 7 ACs from `@evolving` to `@stable`: AC-81, AC-81b, AC-81c, AC-81d, AC-82. Evidence: (1) live browser a11y tree confirms the textarea announces "Siili investor chatbot message" (AC-81) and the send button announces "Send message" (AC-81b); (2) `npm run test:ci tests/chatMessage.test.tsx` — 12/12 pass, including the `AC-23 + AC-81c` test asserting `role="status"` + `aria-live="polite"` + "Haetaan tietoa..." copy, and the `AC-40 + AC-81d` test asserting `role="alert"` on errored pairs; (3) AC-82 math-verified for every AC-body token pair on token surfaces — `#000` on `#fff` = 21:1; `#000` on `#e5e5e5` = 17.9:1 (question bubble); `#000` on `#efefef` = 18.7:1 (source badge); `#575757` on `#fff` ≈ 6.8:1 (placeholder); white icon on `#3232ff` / `#aa32ff` gradient = ≥3:1 non-text (send). Hero-image contrast is out of AC-82 scope (owned by AC-76). Updated inline `@stable` tags and Stability column. No code changes. Catalog stability after Lane B: 46 @stable / 26 @evolving / 26 @aspirational.

  **Findings — did NOT graduate AC-80 and AC-84 (reclassified from bucket a → bucket b):**
  - **AC-80 (keyboard focus ring)** — `chatInput.module.css:32` sets `outline: none` on `.textarea` without a compensating `:focus-within` rule on the shell; `.chip`, `.sendButton`, and `.badgeLink` have no `:focus-visible` rules either. Live screenshot of compact view with the textarea in `[active, focused]` state shows no visible focus ring on any interactive element. Proposed fix is a small CSS PR adding `:focus-visible` styles to the textarea shell and the three button-like elements, reusing a token for the ring colour (likely `--blue-500`). File under a new **Lane B-1 — focus-ring build** follow-up.
  - **AC-84 (200% zoom reflow)** — `browser_resize` via MCP does not produce a true CSS-zoom equivalent; only local browser Cmd/Ctrl+= can drive this verification. Code inspection suggests chips with `white-space: nowrap` + long labels (e.g. AC-12b mandated single-line) will overflow at narrow effective widths, coupling AC-84 to the Lane F responsive breakpoints (AC-91 / AC-92b) more than to an isolated fix. Recommendation: defer AC-84 graduation to a local run on a real browser after Lane F lands.
  - Token-hygiene side-finding (not blocking any AC): `chatMessage.module.css:119` hardcodes `color: #c0392b` for `.error` instead of using a token. Not in AC-82 scope (AC-82 is about *token* pairs) and the contrast itself passes AA on white, but worth a one-line token-aligned fix in a future style pass.
- 2026-04-22 — Lane C (GOV-16 Cluster 2, promoted from bucket a → bucket b) — Graduated all 6 ACs from `@evolving` to `@stable`: AC-20a, AC-20b, AC-20f, AC-28, AC-28b, AC-28c. Triage had the lane as verify-only ("may surface small layout deltas"); it surfaced three real deltas (AC-20a/b/f all required the expanded surface to break out of the host container) so it was promoted to a build lane per option 2 of the in-thread stop-and-ask. Code changes: (1) `src/styles/expandedView.module.css` — `.expanded` now `position: fixed; inset: 0; z-index: 2147483000; overflow-y: auto` with opaque `--white-500` background; `.title` / `.messages` / `.inputWrapper` now `flex-shrink: 0` so the surface itself is the scroll container; (2) `src/components/ExpandedView.tsx` — added a mount-scoped `useEffect` that locks `html.style.overflow = 'hidden'` + `body.style.overflow = 'hidden'` and restores on unmount (AC-20f), and moved the auto-scroll target from a trailing sentinel inside `.messages` to the `.inputWrapper` so `scrollIntoView({block: 'end'})` brings the latest reply *and* the input into view together (AC-28c). Evidence: (1) `npm run verify` — build clean, gzip 12.51 kB (js 10.80 + css 1.71) vs 60 kB budget; (2) `npm run lint` clean; (3) `npm run test:ci` — 41/41 pass; (4) live dev-harness via browser MCP, 1280×720 window — title bounding box at `(48, 64)` matches `padding: var(--space-3xl) var(--space-2xl)` on a fixed full-viewport container (AC-20a / AC-20b); host hero h1 stays at y=204 across compact → expanded with 4 Q+A pairs (no host-document reflow, AC-20f); textarea y progresses 319 → 479 → 847 across 1/2/4 pairs — in-flow below latest reply, not bottom-pinned for short convos (AC-28 / AC-28b), and the auto-scroll lands it near viewport bottom with the latest answer directly above for long convos (AC-28c); `.shellExpanded` keeps `box-shadow: var(--textarea-shadow)` (AC-28). Figma context: `site:143:601` / `ds:152:97` / `ds:152:121`. Updated inline `@stable` tags, Stability column in the AC Catalog, and §2.5 `Last checked` rows to 2026-04-22. Catalog stability after Lane C: 52 @stable / 20 @evolving / 26 @aspirational.

  **Conflict flagged for designer review (non-blocking):** the Figma composition `site:143:601` frames the expanded view inside the host page chrome (header + footer visible as page siblings), whereas AC-20a's wording pins the surface to `100vw × 100vh`. The fixed full-viewport interpretation was chosen because it is the only layout that satisfies AC-20a, AC-20b, and AC-20f simultaneously and does not depend on how the host site styles `#siili-chatbot`. If the designer wants the expanded view to live strictly between header and footer (per the Figma composition), AC-20a needs an amendment to reflect that — and the fixed-position surface would be replaced with a header/footer-aware layout, likely coupled to Lane H's close-button / `Esc` dismiss work so the user can return to page chrome without reloading.

  **Side-observations (not blocking AC graduation):**
  - The dev harness `index.html` still sizes `#siili-chatbot` at `max-width: 780px` which was right for compact hero overlay and is now irrelevant in expanded mode (the fixed surface ignores its host container). The harness still represents the host-page placement faithfully for compact mode.
  - Scroll-lock uses raw `style.overflow = 'hidden'` rather than a stashed class; that is intentional to keep the embed-safe surface minimal and per-instance.
- 2026-04-22 — Lane D (GOV-16 Cluster 6, promoted from bucket a → bucket a+b) — Graduated AC-03 and AC-42 from `@evolving` to `@stable`. Triage had the lane as verify-only; it surfaced a latent `App.tsx` leak-in-waiting (the `handleSend` catch forwarded `err.message` straight to the rendered error row, so any `ChatService` that didn't already throw SAFE_ERROR would have violated AC-42) so the lane was promoted to verify + defensive hardening, mirroring the Lane C pattern. Code changes: (1) new `src/errorCopy.ts` exports a single `SAFE_ERROR` Finnish fallback string and becomes the source of truth for both `src/App.tsx` and `src/services/apiChatService.ts`; (2) `src/App.tsx` `handleSend` catch block now renders `SAFE_ERROR` unconditionally and only logs the caught error to the dev console behind `import.meta.env.DEV`, so raw `err.message` never touches the DOM; (3) `src/services/apiChatService.ts` imports `SAFE_ERROR` from the shared module instead of declaring it locally; (4) `.cursor/rules/api-contract.mdc` §Responses now documents the convention (App layer renders the fixed safe string; service `err.message` is never forwarded to the UI, only to dev console). Tests: (1) new `tests/widget.test.tsx` — `AC-03: calling init twice on the same container yields a single clean mount` (two `init({ container })` calls, assert one `.siiliChatbot` root, textarea stays interactive, `console.error` + `console.warn` never called) and `AC-03 + AC-04: re-init with a different apiUrl rewires the ChatService` (first `init` uses mock, second passes `apiUrl`; `fetch` spy confirms the next send POSTs to the new URL, proving the prior root was actually unmounted); (2) `tests/app.test.tsx` adds `AC-42: raw service errors never reach the rendered error row` (service throws `new Error('boom from /internal/v1/whoami 500')`, asserts `role="alert"` contains SAFE_ERROR and does not contain `boom` or `whoami`, and the same strings are absent from `document.body.textContent`); (3) `tests/apiChatService.test.ts` tidy — imports `SAFE_ERROR` from `src/errorCopy.ts` instead of re-declaring it, preventing future drift between the test fixture and the production constant. Evidence: (1) `npm run verify` — build clean, AC-100 gzip **12.47 kB** (js 10.76 + css 1.71) vs 60 kB budget — net **−40 bytes** on js vs Lane C's 10.80 kB because the duplicate SAFE_ERROR Finnish string now appears only once in the bundle; (2) `npm run lint` clean; (3) `npm run test:ci` — **44/44 pass** (41 pre-Lane-D + 2 widget + 1 app-leak). Updated inline `@stable` tags, Stability column in the AC Catalog, and Verification column to point at the new automated paths (`tests/widget.test.tsx` for AC-03; `tests/app.test.tsx` for AC-42). §2.5 Figma Manifest untouched (neither AC is visual). Catalog stability after Lane D: 54 @stable / 18 @evolving / 26 @aspirational.

---

## Recurring tasks

_(to be populated by GOV-15)_
