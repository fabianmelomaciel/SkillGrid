---
name: changelog-drafter
description: "Auto-generates CHANGELOG.md drafts post-tag by reading git log (read-only). Creates PRs with changelog proposals. Includes security gates for safe operation."
category: core
status: stable
risk_level: safe
token_estimate: { input: 521, output: 214 }
---

## Core

# Changelog Drafter

## When to Use

Load this skill after tagging a release (e.g., `git tag v1.x.x`). It reads git log history, drafts a CHANGELOG.md update, and outputs a pull request — never pushes directly.

## Security Gates

### Allowed Tools
Only the following tools are permitted:
- `read` — read files
- `grep` — search file contents
- `glob` — find files by pattern
- `bash` — exclusively for `git log*` commands only

**NEVER use:** `write`, `edit`, `bash` with `git push*`, `git merge`, `git commit`, or any destructive command.

### Rate Limiting
- Maximum **1 execution per hour** per repository.

### Output Protocol
- **Output must be a PR**, never a direct push.
- Use `gh pr create` after drafting the changelog.
- Validate the draft does NOT contain secrets before saving.

### Anti-Loop Protection
- `SKILLGRID_LOOP_MAX_ITER=1` — single pass only, no iteration.

## Workflow

1. **Detect trigger**: Verify a new tag was just created (`git tag --points-at HEAD`).
2. **Read git log**: `git log <previous-tag>..HEAD --oneline` between tags.
3. **Draft changelog**: Categorize commits per Keep a Changelog format.
4. **Secret scan**: Grep draft for secrets before writing.
5. **Write draft**: Save to `CHANGELOG.md` with version header.
6. **Create PR**: `gh pr create` with changelog proposal.

> **CodeGraph:** `skills/shared/codegraph-startup.md` | **Anti-Rationalization:** `skills/shared/anti-rationalization.md` | **Risk Assessment:** `skills/shared/risk-assessment.md` | **Verification Gate:** `skills/shared/verification-gate.md` | **CODEX Learning Loop:** `skills/shared/codex-learning-loop.md`

> Modules: `skills/shared/modules-footer.md`
