---
name: changelog-drafter
description: "Generates CHANGELOG.md drafts from git log — post-tag, by date range, or by commit count — with jargon-to-user-language translation. Writes only on a dedicated branch and opens a PR; never commits to the default branch. Includes security gates for safe operation."
category: core
status: stable
risk_level: safe
token_estimate: { input: 911, output: 260 }
---

## Core

# Changelog Drafter

## When to Use

Load this skill after tagging a release (e.g., `git tag v1.x.x`), or on demand for an ad-hoc draft (date range, or last N commits). It reads git log history, drafts a CHANGELOG.md update, and outputs a pull request — never pushes to the default branch.

## Security Gates

### Allowed Tools
Only the following tools are permitted:
- `read` — read files
- `grep` — search file contents
- `glob` — find files by pattern
- `bash` — `git log*` (read), `git checkout -b <branch>`, `git add CHANGELOG.md`, `git commit` (only on the new branch), and `gh pr create` (which pushes that branch)
- `write` — scoped to `CHANGELOG.md` only, and only after `git checkout -b` moved off the default branch

**NEVER use:** `edit` on any other file, `git push` to the default branch, `git push --force`, `git merge`, or any destructive command.

### Rate Limiting
- Maximum **1 execution per hour** per repository.

### Output Protocol
- **Output must be a PR**, never a commit/push to the default branch.
- Use `gh pr create` after drafting the changelog (it pushes the draft branch for you).
- Validate the draft does NOT contain secrets before saving.

### Anti-Loop Protection
- `SKILLGRID_LOOP_MAX_ITER=1` — single pass only, no iteration.

## Retrieval

Pick the range that fits the trigger:
- **Post-tag (default):** `git log <previous-tag>..HEAD --oneline`
- **Date range:** `git log --since="7 days ago" --oneline`
- **Last N commits:** `git log -n 20 --oneline`

Exclude merge commits, formatting-only diffs, and typo fixes unless they touch security or a critical dependency.

## Workflow

1. **Detect trigger**: a new tag (`git tag --points-at HEAD`), or an explicit ad-hoc request with a range.
2. **Read git log**: per the Retrieval range above.
3. **Draft changelog**: categorize commits into Added / Changed / Deprecated / Removed / Fixed / Security (Keep a Changelog). Translate developer jargon into user-facing language (e.g. "refactored client auth endpoint" → "improved login security"); keep raw wording only for internal/CI-only changes.
4. **Secret scan**: grep the draft for secrets before writing.
5. **Branch + write**: `git checkout -b changelog/<version-or-date>`, then write the draft to `CHANGELOG.md` under a new `## [version] - YYYY-MM-DD` header — never edit or reflow existing version blocks.
6. **Create PR**: `git add CHANGELOG.md && git commit -m "docs: changelog draft"`, then `gh pr create` with the proposal.

## Severity of a Miscategorized Entry

| Level | Example | Impact |
|-------|---------|--------|
| Critical | Wrong/duplicate version header, or overwriting an existing entry | Broken version history |
| High | Developer jargon left in a user-facing entry | Confusing for end users |
| Medium | A security or bug fix filed under the wrong category | Reduced audit trust |
| Low | Typo, spacing | Cosmetic |

> **CodeGraph:** `skills/shared/codegraph-startup.md` | **Anti-Rationalization:** `skills/shared/anti-rationalization.md` | **Risk Assessment:** `skills/shared/risk-assessment.md` | **Verification Gate:** `skills/shared/verification-gate.md` | **CODEX Learning Loop:** `skills/shared/codex-learning-loop.md`

> Modules: `skills/shared/modules-footer.md`
