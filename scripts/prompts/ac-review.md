# AC Review Prompt

> Reusable prompt an agent runs to compare the implementation against the
> acceptance criteria and produce an **AC coverage report only**. No code
> edits, no AC edits, no token edits are performed by this prompt —
> review the report first, then run a separate "apply" turn for the
> fixes you approve.

This file is the prompt. To use it: paste the whole file into an
agent chat (Cursor, Codex, etc.) or reference it from a command
palette. The agent must follow the Rules section verbatim.

---

## Modes

Pick one at invocation time:

- **`scoped`** (default, cheap) — diff-aware. Only review AC-IDs in
  scope for the current branch vs `main`.
  - Discover changed files:
    `git diff --name-only origin/main...HEAD`.
  - Collect the AC IDs referenced in those files (search for
    `AC-\d+`) and in the branch's commit messages
    (`git log origin/main..HEAD --format=%B | rg 'AC-\d+'`).
  - If the change touches `src/styles/**` or `src/components/**` but
    no AC IDs are cited, fall back to: every row in
    [`ACCEPTANCE_CRITERIA.md`](../../ACCEPTANCE_CRITERIA.md) §2.5
    Figma Manifest whose "Component / scope" overlaps the changed
    path.
  - If the change touches `src/services/**` or `src/types/index.ts`,
    add the AC-50 / AC-51 band and any AC whose Given/When/Then
    references the touched symbol.
- **`full-sweep`** (weekly / pre-release / release gate) — classify
  **every** AC-ID in
  [`ACCEPTANCE_CRITERIA.md`](../../ACCEPTANCE_CRITERIA.md) §3–§10.

If the invoker does not specify a mode, assume `scoped`.

## Inputs the agent should load

- [`ACCEPTANCE_CRITERIA.md`](../../ACCEPTANCE_CRITERIA.md) — the spec,
  including §2.5 Figma Manifest, §11 Definition of Done, §12
  Non-Goals, and §Amending ACs.
- [`AGENTS.md`](../../AGENTS.md) §Figma (two files — IR-site
  `0xXdKUlBJIolF15MjJuaMC` for screens, IR-DS `rlh00CEImhMWwdRNOUqW6L`
  for components) — only if the in-scope ACs are visual.
- [`src/types/index.ts`](../../src/types/index.ts) — for contract ACs
  (AC-50 band).
- The component / service / CSS files in scope for the selected mode.

## Classification

For each AC-ID in scope, assign exactly one label:

- **`satisfied`** — implementation demonstrably meets the Given/When/Then.
- **`partial`** — some branches of the AC work, others are missing or
  wrong. Name the gap.
- **`broken`** — implementation contradicts the AC (regression or
  never-worked). Name the contradiction.
- **`not-addressed`** — no code path currently implements the AC.
  Fine for not-yet-built ACs; flag for the backlog.
- **`spec-drift`** — implementation is intentionally different from
  the AC and the AC should be amended (see §Amending ACs in
  `ACCEPTANCE_CRITERIA.md`). Name the drift.
- **`unknown`** — insufficient evidence in this pass (e.g. requires
  runtime check, specific browser, or host-page integration that is
  out of reach from static review).

Evidence for each row must be concrete: file + line refs, token
values, Figma node IDs consulted, or an explicit "requires manual
smoke / runtime check" note.

## Rules (non-negotiable)

1. **Read-only.** Do not edit any file. Do not run `git commit`,
   `git push`, or any non-readonly tool. The only output is a
   markdown report to chat.
2. **Static first.** Prefer reading the repo over running the app.
   Only mark an AC `satisfied` from a static read when the code
   plainly implements it; otherwise mark `unknown` with the manual
   step the human should run.
3. **No speculation.** If you cannot tell from the repo + spec,
   mark `unknown` rather than guessing.
4. **Visual ACs defer to Figma.** For any AC in §2.5 Figma Manifest,
   either (a) consult the node via `get_design_context` exactly once
   per node, or (b) mark `unknown` and recommend running
   [`scripts/prompts/figma-sync.md`](figma-sync.md) for the visual
   pass. Do not duplicate what `figma-sync.md` does — point to it.
5. **Non-goals are a signal.** If the implementation appears to
   satisfy something listed in §12 Non-Goals, flag it as
   `spec-drift` with a note — either the code or the non-goal is
   wrong.
6. **Never auto-bind new ACs.** If a code path has no AC, suggest
   the new AC in the report; do not add it.

## Output contract

Produce a single markdown report with this exact shape:

```markdown
# AC Review Report — <YYYY-MM-DD> — mode: <scoped|full-sweep>

## Summary
- ACs in scope: <N>
- satisfied: <n1>
- partial: <n2>
- broken: <n3>
- not-addressed: <n4>
- spec-drift: <n5>
- unknown: <n6>
- New ACs suggested: <K>

## Scope discovery (scoped only)
- Changed files: <list from git diff>
- AC-IDs cited in diff / commits: <list>
- AC-IDs added via overlap fallback: <list, with reason>

## Per-AC findings

### AC-xx — <one-line AC title from the spec>
- **Status:** <satisfied | partial | broken | not-addressed | spec-drift | unknown>
- **Evidence:** <file:line refs, token values, Figma node IDs, or "manual smoke required: ...">
- **Gap / contradiction:** <only for partial / broken / spec-drift — one or two bullets>
- **Suggested follow-up:** <one of>
  - (a) Code fix — <file, 1-line description>
  - (b) AC amendment — <add / edit / deprecate per §Amending ACs, with proposed wording>
  - (c) Manual verification — <exact step the human should run>
  - (d) Defer to figma-sync — <node IDs to pass to figma-sync.md>
  - (n/a) no action

(repeat per AC)

## New AC suggestions

For any code path in scope with no matching AC, propose:

- **Proposed `AC-xx`** — <band, e.g. 3.3 Expanded mode>
- **Given/When/Then:** <draft wording>
- **Why:** <1-line justification tied to the touched code>

## Recommended next turn

Name the single apply-turn the human should run next, e.g.:
- "Apply code fixes for AC-22, AC-28."
- "Run figma-sync scoped for nodes ds:152:116, site:143:601."
- "Amend AC-27 wording per spec-drift note."
```

## Applying the report

Applying is a **separate turn** with a separate prompt. Typical flow:

1. Run this prompt → read the report.
2. Triage: decide which follow-ups to accept (code fix, AC amendment,
   manual verification, or figma-sync).
3. Start a new agent turn naming the accepted follow-ups. The
   implementer then proceeds under [`.cursor/rules/sdd.mdc`](../../.cursor/rules/sdd.mdc)
   with AC-IDs already triaged.

Keeping these two turns separate is deliberate — it caps token spend
on the reporting pass and gives you a human checkpoint before any
files change.

## Cost expectation

- `scoped` per PR: ~3–8k tokens (a handful of ACs, short report).
- `full-sweep`: ~20–40k tokens (every AC, one report).

Use `scoped` by default; reserve `full-sweep` for a weekly rhythm or
a release gate, pairing it with `figma-sync.md` `full-sweep` on the
same day so visual and behavioural drift are assessed together.
