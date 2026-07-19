---
name: post-merge-cleanup
description: "Scans for stale branches eligible for cleanup after merge. Report-only by default — lists candidates but never deletes without human confirmation."
category: core
status: stable
risk_level: safe
token_estimate: { input: 611, output: 251 }
---

## Core

# Post-Merge Cleanup

## When to Use

Load this skill after merging a PR or feature branch to scan for branches that can be safely cleaned up. By default operates in **report-only L1 mode** — only lists candidates, never deletes.

## Security Gates

### CRITICAL: Report-Only L1 (Default Mode)
- **NEVER delete branches automatically.**
- Only list candidates for human review.
- Require explicit typed confirmation before any delete operation.

### Branch Whitelist (NEVER Delete)
The following branches are **permanently protected** and MUST never appear in cleanup candidates:
- `main`
- `master`
- `develop`

### Branch Prefix Filter
Only branches matching known prefixes are eligible for cleanup:
- `feature/`
- `fix/`
- `loop/`

### Merge Verification
Before any branch can be flagged for cleanup, verify it is fully merged:
```bash
git branch --merged main | grep <branch-name>
```

### Active Worktree Exclusion
Exclude branches currently referenced by active git worktrees:
```bash
git worktree list | awk '{print $1}'
```

### Human Confirmation Gate
If any delete operation is requested (L2 mode, CEO-approved only):
1. Print the list of branches to delete.
2. Require the user to type `confirm delete N branches` to proceed.
3. Print rollback instructions before executing.

## Workflow

1. **Scan branches**: List all local branches with known prefixes.
2. **Check merged status**: Filter to branches fully merged into main/master.
3. **Exclude protected**: Remove whitelist + active worktrees.
4. **Generate report**: Print candidate branches for cleanup.
5. **Report only**: Do NOT delete unless L2 mode is CEO-approved and human confirms.

> **CodeGraph:** `skills/shared/codegraph-startup.md` | **Anti-Rationalization:** `skills/shared/anti-rationalization.md` | **Risk Assessment:** `skills/shared/risk-assessment.md` | **Verification Gate:** `skills/shared/verification-gate.md` | **CODEX Learning Loop:** `skills/shared/codex-learning-loop.md`

> Modules: `skills/shared/modules-footer.md`
