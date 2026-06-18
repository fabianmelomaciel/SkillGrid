---
name: ultra-review
description: Use when you need to perform a deep, multi-perspective automated audit of code changes prior to committing or merging.
category: core
status: stable
risk_level: safe
---

## Core


# Ultra-Review Protocol

## Overview
The **Ultra-Review Protocol** replicates the multi-agent code auditing process of Claude Code's `/ultra review` command. It leverages multiple specialized subagents working in parallel to inspect code changes (diffs) from different engineering viewpoints, ensuring high-quality, secure, and performant code before it is merged.

```
                  ┌─────────────────┐
                  │   CODE DIFF     │
                  └────────┬────────┘
                           ▼
         ┌─────────────────┴─────────────────┐
         ▼                 ▼                 ▼
   ┌───────────┐     ┌───────────┐     ┌───────────┐
   │SIMPLICITY │     │ SECURITY  │     │PERFORMANCE│
   │  AUDITOR  │     │  AUDITOR  │     │  AUDITOR  │
   └─────┬─────┘     └─────┬─────┘     └─────┬─────┘
         │                 │                 │
         └─────────────────┼─────────────────┘
                           ▼
                  ┌─────────────────┐
                  │ SYNTHESIZED     │
                  │ REVIEW REPORT   │
                  └─────────────────┘
```

## When to Use
- Before merging a Pull Request or pushing critical changes to main.
- After implementing a complex feature that affects multiple layers of the application.
- When performing pre-deployment sanity checks or security audits.

## Core Pattern

### Step 1: Scope the Diff
1. Generate the git diff of the changes to review (e.g. `git diff` or `git diff main...`).
2. Identify all modified files and their line ranges.

### Step 2: Dispatch Parallel Auditors
Spawn subagents (using the `task` tool) with specific instructions and the diff/files:
1. **Simplicity Auditor**: Focuses on clean code, readability, DRY principles, naming conventions, and structural maintainability.
2. **Security Auditor**: Checks for OWASP vulnerabilities, secrets leakage, input sanitization, error leakage, and authorization holes.
3. **Performance & FinOps Auditor**: Identifies memory leaks, database query performance, resource-heavy loops, and API call optimization.
4. **Design Auditor** (If UI/CSS files are changed): Verifies accessibility (WCAG AA), responsive layout, design consistency, and animation smoothness (applying Emil Kowalski principles).

### Step 3: Synthesis & Reporting
Combine the reviews into a consolidated markdown report:
1. **Critical/Blocking Findings**: Must be resolved before committing or merging.
2. **Non-Blocking Findings**: Can be resolved in follow-up tasks.
3. **Synthesis Scores**: Give a rating from 1 to 10 for readability, security, and performance.

```markdown
# Ultra-Review Synthesis Report

## Executive Summary
- **Simplicity Score**: X/10
- **Security Score**: Y/10
- **Performance Score**: Z/10
- **Overall Recommendation**: [PASS | PASS WITH RECOMMENDATIONS | BLOCK]

## Detailed Findings

### 🔴 Critical & Blocking (Action Required)
- **[Security] SQL Injection risk in user.service.js:45**: Raw query string concatenation.
  - *Fix*: Use parameterized query placeholders.

### 🟡 Warning & Suggestions (Non-blocking)
- **[Simplicity] Duplicate validation logic in routes/auth.js:12-25**: Repeated checks.
  - *Fix*: Extract validation helper.

### 🟢 Compliments & Highlights
- Excellent unit test coverage added.
```

> **CodeGraph:** `skills/shared/codegraph-startup.md` | **Anti-Rationalization:** `skills/shared/anti-rationalization.md` | **Risk Assessment:** `skills/shared/risk-assessment.md` | **Verification Gate:** `skills/shared/verification-gate.md` | **CODEX Learning Loop:** `skills/shared/codex-learning-loop.md`


## Modules

[platform:opencode]
### Parallel Tasks
Invoke subagents in parallel using the `task` execution command to minimize review runtime.

