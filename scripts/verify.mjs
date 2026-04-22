#!/usr/bin/env node
/**
 * Pre-finish / pre-commit verifier for Siili Investor Chatbot Widget.
 *
 * Enforces every AC tagged `Automated:` in ACCEPTANCE_CRITERIA.md plus a
 * few governance rules that would otherwise be honor-system:
 *
 *   AC-N1   — no `dangerouslySetInnerHTML` in `src/`
 *   AC-N2   — no font binaries or `@font-face` in `dist/`
 *   AC-50   — `src/components/**` does not import from `src/services/**`
 *   AC-100  — combined gzip of `dist/siili-chatbot.iife.js` + `siili-chatbot.css` ≤ 60 KB
 *   GOV     — components do not import from `'preact'` / `'preact/hooks'`
 *             (must go through `'react'` → `preact/compat` alias)
 *
 * Exits non-zero on the first failure bucket so CI / the pre-commit hook
 * stops the commit. Runs `npm run build` internally so AC-100 and AC-N2
 * have something to inspect.
 */
import { readdir, readFile, stat } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const SRC = join(ROOT, 'src')
const SRC_COMPONENTS = join(SRC, 'components')
const DIST = join(ROOT, 'dist')

const BUDGET_BYTES = 60 * 1024

const FONT_EXTS = new Set(['.woff', '.woff2', '.ttf', '.otf', '.eot'])

const failures = []

function fail(section, message) {
  failures.push({ section, message })
}

function log(msg) {
  process.stdout.write(`${msg}\n`)
}

async function walk(dir, pred) {
  const out = []
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      out.push(...(await walk(full, pred)))
    } else if (entry.isFile() && pred(entry.name, full)) {
      out.push(full)
    }
  }
  return out
}

function isSource(name) {
  return /\.(ts|tsx)$/.test(name)
}

async function grepSource(label, pattern, files, { allow } = {}) {
  const hits = []
  for (const file of files) {
    const text = await readFile(file, 'utf8')
    const lines = text.split('\n')
    lines.forEach((line, i) => {
      if (!pattern.test(line)) return
      if (allow && allow(file, line, i, lines)) return
      hits.push({ file, line: i + 1, text: line.trim() })
    })
  }
  if (hits.length) {
    for (const h of hits) {
      fail(
        label,
        `${relative(ROOT, h.file)}:${h.line}: ${h.text}`,
      )
    }
  }
  return hits
}

async function checkSource() {
  const files = await walk(SRC, isSource)
  if (files.length === 0) {
    fail('src scan', 'No .ts/.tsx files found under src/ — is the script run from the repo root?')
    return
  }

  log(`[verify] scanning ${files.length} source files`)

  await grepSource(
    'AC-N1 · dangerouslySetInnerHTML',
    /dangerouslySetInnerHTML/,
    files,
  )

  await grepSource(
    "GOV · import from 'preact' (use 'react' → preact/compat alias)",
    /from\s+['"]preact(?:\/hooks)?['"]/,
    files,
  )

  const componentFiles = files.filter((f) => f.startsWith(SRC_COMPONENTS))
  await grepSource(
    'AC-50 · components/** import from services/**',
    /from\s+['"](?:\.\.\/)+services\//,
    componentFiles,
  )
}

async function runBuild() {
  log('[verify] running `npm run build` (this also generates dist/ for AC-N2 / AC-100)')
  const result = spawnSync('npm', ['run', 'build'], {
    cwd: ROOT,
    encoding: 'utf8',
    shell: false,
  })
  const combined = `${result.stdout ?? ''}${result.stderr ?? ''}`
  if (result.status !== 0) {
    process.stdout.write(combined)
    fail('build', `\`npm run build\` failed with exit code ${result.status}`)
    return null
  }
  return combined
}

function parseGzipSizes(buildOutput) {
  // Vite prints rows like:
  //   dist/siili-chatbot.iife.js    85.42 kB │ gzip: 29.35 kB
  // The separator is a box-drawing pipe (U+2502); be tolerant of plain `|` too.
  const sizes = {}
  const re =
    /siili-chatbot\.(iife\.js|css)\s+[\d.]+\s*kB\s*[│|]\s*gzip:\s*([\d.]+)\s*kB/gi
  let match
  while ((match = re.exec(buildOutput)) !== null) {
    sizes[match[1].toLowerCase()] = Number.parseFloat(match[2])
  }
  return sizes
}

async function checkBundleBudget(buildOutput) {
  const sizes = parseGzipSizes(buildOutput)
  const jsKb = sizes['iife.js']
  const cssKb = sizes['css']
  if (typeof jsKb !== 'number' || typeof cssKb !== 'number') {
    fail(
      'AC-100 · bundle budget',
      `could not parse gzip sizes from build output (js=${jsKb}, css=${cssKb}). Inspect build logs above.`,
    )
    return
  }
  const totalKb = jsKb + cssKb
  const totalBytes = totalKb * 1024
  const budgetKb = BUDGET_BYTES / 1024
  const tag = totalBytes > BUDGET_BYTES ? 'FAIL' : 'OK'
  log(
    `[verify] AC-100 gzip total: ${totalKb.toFixed(2)} kB (js ${jsKb.toFixed(
      2,
    )} + css ${cssKb.toFixed(2)}) / budget ${budgetKb.toFixed(0)} kB — ${tag}`,
  )
  if (totalBytes > BUDGET_BYTES) {
    fail(
      'AC-100 · bundle budget',
      `combined gzip ${totalKb.toFixed(2)} kB exceeds ${budgetKb.toFixed(
        0,
      )} kB budget.`,
    )
  }
}

async function checkDistFonts() {
  let distStat
  try {
    distStat = await stat(DIST)
  } catch {
    fail('AC-N2 · dist scan', 'dist/ not present — build must have failed.')
    return
  }
  if (!distStat.isDirectory()) {
    fail('AC-N2 · dist scan', 'dist/ is not a directory.')
    return
  }

  const fontHits = await walk(DIST, (name) => {
    const dot = name.lastIndexOf('.')
    if (dot < 0) return false
    return FONT_EXTS.has(name.slice(dot).toLowerCase())
  })
  for (const f of fontHits) {
    fail('AC-N2 · bundled font binary', relative(ROOT, f))
  }

  const cssFiles = await walk(DIST, (name) => name.endsWith('.css'))
  for (const file of cssFiles) {
    const text = await readFile(file, 'utf8')
    if (/@font-face\b/i.test(text)) {
      fail(
        'AC-N2 · @font-face in bundled CSS',
        `${relative(ROOT, file)} declares @font-face`,
      )
    }
  }
}

async function main() {
  await checkSource()
  const buildOutput = await runBuild()
  if (buildOutput) {
    await checkBundleBudget(buildOutput)
    await checkDistFonts()
  }

  if (failures.length === 0) {
    log('[verify] OK — all automated ACs satisfied.')
    return
  }

  process.stdout.write('\n[verify] FAILURES:\n')
  const bySection = new Map()
  for (const f of failures) {
    if (!bySection.has(f.section)) bySection.set(f.section, [])
    bySection.get(f.section).push(f.message)
  }
  for (const [section, msgs] of bySection) {
    process.stdout.write(`\n  ${section}\n`)
    for (const m of msgs) {
      process.stdout.write(`    - ${m}\n`)
    }
  }
  process.stdout.write('\n')
  process.exit(1)
}

main().catch((err) => {
  console.error('[verify] crashed:', err)
  process.exit(2)
})
