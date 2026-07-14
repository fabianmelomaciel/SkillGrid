---
name: issue-triage
description: "Classifies open GitHub issues by heuristics (keywords, template matching) and proposes labels/priorities. Read-only mode by default — never closes or modifies issues."
category: core
status: stable
risk_level: safe
---

## Core

# Issue Triage

## When to Use

Load this skill when you need to classify open GitHub issues, suggest priority levels, or propose labels. Operates in report-only L1 mode by default (no auto-tagging) for the first week.

## Dependencies

- `gh` CLI (GitHub CLI) — authenticated with minimum token scopes: `contents: read` + `issues: read`.

## Security Gates

### Read-Only Mode (L1 — Default)
- **Do NOT close, edit, assign, or modify any issue.**
- **Do NOT push any code changes.**
- Output is a triage report only — no auto-labeling.
- After 1 week of safe operation, CEO may approve L2 (auto-labeling).

### Rate Limiting
- Maximum **1 execution per 2 hours** per repository.

### Minimum Token Permissions
- Only `contents: read` + `issues: read` scopes required.
- `GITHUB_TOKEN` must NOT have write access to issues.

## Workflow

1. **Fetch open issues**: `gh issue list --state open --json number,title,labels,body,createdAt`
2. **Classify by heuristics**:
   - Keyword matching against rule templates (bug, feature, enhancement, question, docs)
   - Template pattern detection in issue body
3. **Propose labels**: Map classification to GitHub labels (e.g., `bug`, `feature`, `enhancement`, `documentation`)
4. **Assign priority**: Based on severity keywords, label type, and issue age:
   - **P0/critical**: security, data loss, crash
   - **P1/high**: major feature, blocked workflow
   - **P2/medium**: enhancement, UX improvement
   - **P3/low**: question, documentation
5. **Generate triage report**: Structured output with issue number, title, proposed labels, and priority.

> **CodeGraph:** `skills/shared/codegraph-startup.md` | **Anti-Rationalization:** `skills/shared/anti-rationalization.md` | **Risk Assessment:** `skills/shared/risk-assessment.md` | **Verification Gate:** `skills/shared/verification-gate.md` | **CODEX Learning Loop:** `skills/shared/codex-learning-loop.md`

> Modules: `skills/shared/modules-footer.md`
