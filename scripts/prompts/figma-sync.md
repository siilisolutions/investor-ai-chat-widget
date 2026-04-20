# Figma Sync Prompt

> Reusable prompt an agent runs to compare the live Figma design to
> this repo and produce a **drift report only**. No code edits, no
> token edits, no AC edits are performed by this prompt — review the
> report first, then run a separate "apply" turn for the fixes you
> approve.

This file is the prompt. To use it: paste the whole file into an
agent chat (Cursor, Codex, etc.) or reference it from a command
palette. The agent must follow the Rules section verbatim.

---

## Modes

Pick one at invocation time:

- **`scoped`** (default, cheap) — diff-aware. Only check Figma nodes
  referenced by files changed on the current branch vs `main`.
  - Discover changed files: `git diff --name-only origin/main...HEAD`.
  - Collect the AC IDs referenced in those files (search for
    `AC-\d+`) and join to the manifest in
    [`ACCEPTANCE_CRITERIA.md`](../../ACCEPTANCE_CRITERIA.md) §2.5.
  - If the change touches `src/styles/**` or `src/components/**` but
    no AC IDs are cited, fall back to: every manifest row whose
    "Component / scope" overlaps the changed path.
- **`full-sweep`** (weekly / pre-release) — check **every** row in
  the §2.5 manifest, **and** run the Code-authored watch (below).

If the invoker does not specify a mode, assume `scoped`.

## Code-authored watch (full-sweep only)

Some manifest rows have `Figma node(s) = — (code-authored)`: the AC
is currently satisfied by implementation because Figma has no
matching frame yet. The watch looks for new Figma frames that could
adopt those rows so they stop being code-authored.

Procedure:

1. Collect the code-authored rows from
   [`ACCEPTANCE_CRITERIA.md`](../../ACCEPTANCE_CRITERIA.md) §2.5,
   along with a short search hint for each (derived from the row's
   Component / scope column — e.g. `AC-91` → "tablet", `AC-92` →
   "mobile", `AC-73` → "typography / type / font weights").
2. Call `get_metadata({ fileKey: "vxWJbloNkZ8Muf5qi14MOy", nodeId:
   "0:1" })` once to get the file-level structure. (`0:1` is the
   root page; if the file has multiple pages, repeat per page ID
   returned by the first call.)
3. For each code-authored row, scan the returned XML for frame /
   component names whose lower-cased `name` contains any of the
   row's search hints. Collect candidate `nodeId` + `name` pairs.
4. For each candidate, call `get_design_context` **once** to confirm
   it is a genuine match (not a tooltip, not a palette swatch).
5. Report candidates as `Proposed fix (a) AC edit` — "bind AC-xx to
   Figma node `X:Y` (`name`)" — with confidence low/medium/high.

Never auto-bind. The human decides whether a candidate is a real
match; a later "apply" turn then updates §2.5 and any AC wording.

## Inputs the agent should load

- [`ACCEPTANCE_CRITERIA.md`](../../ACCEPTANCE_CRITERIA.md) §2.5 Figma
  Manifest (the authoritative list of node ↔ AC bindings).
- [`AGENTS.md`](../../AGENTS.md) §Figma (node table, tooling, file
  key `vxWJbloNkZ8Muf5qi14MOy`).
- [`src/styles/variables.css`](../../src/styles/variables.css) for
  the current token values.
- The component/CSS files touched by `scoped` mode.

## Rules (non-negotiable)

1. **Read-only.** Do not edit any file. Do not run `git commit`, `git
   push`, or any non-readonly tool. The only output is a markdown
   report to chat.
2. **One MCP call per node.** For each node in scope, call
   `get_design_context({ fileKey: "vxWJbloNkZ8Muf5qi14MOy", nodeId })`
   exactly once. Prefer text metadata over screenshots; only request
   `get_screenshot` if the design-context response is ambiguous.
3. **No speculation.** If a node returns insufficient info, mark the
   row `unknown` rather than guessing.
4. **Compare against tokens first, components second.** A value in
   `variables.css` trumps the same value hard-coded in a component —
   drift on a token is higher priority.
5. **Never invent fixes that require Code Connect** — it is not yet
   enabled on this Figma plan (see `AGENTS.md` §Code Connect).

## Output contract

Produce a single markdown report with this exact shape:

```markdown
# Figma Sync Report — <YYYY-MM-DD> — mode: <scoped|full-sweep>

## Summary
- Nodes checked: <N>
- Drift found: <M>
- Suggested applies: <K>
- Unknown / skipped: <U>
- Code-authored rows scanned: <R> (full-sweep only)
- Candidate Figma nodes found: <C> (full-sweep only)

## Per-node findings

### <nodeId> — <AC IDs> — <component / scope>
- **Figma (via get_design_context):** <1-3 bullets — layout,
  spacing, colour, typography, copy — whatever the context actually
  returned>
- **Repo today:** <what the relevant component/token/AC currently
  says, with file + line refs>
- **Drift:** <yes | no | unknown>
- **Proposed fix:** <one of>
  - (a) AC edit — <which AC, what wording change>
  - (b) Token edit — <which token in variables.css, from → to>
  - (c) Component edit — <which file, what change>
  - (n/a) no action
- **Confidence:** <high | medium | low>

(repeat per node)

## Code-authored watch (full-sweep only)

For each code-authored row in §2.5, print:

- `AC-xx`: hints used, candidate nodes found (id + name + 1-line
  description), confidence, proposed fix. If nothing found, print
  `AC-xx: no candidates — still code-authored`.

## Manifest update suggestion

A markdown patch for §2.5 Last checked / Checked by columns for
every row actually touched by this run (checked nodes **and**
code-authored rows that were scanned). Date = today. Do NOT apply
it — just print it.
```

## Applying the report

Applying is a **separate turn** with a separate prompt. Typical flow:

1. Run this prompt → read the report.
2. Triage: pick which `Proposed fix` entries to accept.
3. Start a new agent turn with something like: *"Apply fixes for
   rows AC-22, AC-72 from the report above. Update §2.5 Last checked
   for those rows to today."*

Keeping these two turns separate is deliberate — it caps token spend
on the reporting pass and gives you a human checkpoint before any
files change.

## Cost expectation

- `scoped` per PR: ~2-5k tokens (1-3 nodes, short report).
- `full-sweep`: ~15-30k tokens (all manifest rows, one report).

Use `scoped` by default; reserve `full-sweep` for a weekly rhythm or
a release gate.
