---
description: Brief description of when and why to use this skill (1-2 sentences).
mode: subagent
permission:
  edit: deny
  bash: deny
---

## Core

<!-- category: core | agent | design ; status: draft | stable | beta | experimental | deprecated ; risk_level: safe | critical -->

# {Skill Title} Agent

## When to Use

[One paragraph describing WHEN this skill should be loaded.]

## Workflow

### Step 1: Header
Description.

### Step 2: Header
Description.

## Tools

- `task` — delegate to sub-agents
- `read`/`glob`/`grep` — explore code
- `edit`/`write` — implement changes
- `bash` — build, test, git

> **CodeGraph:** `skills/shared/codegraph-startup.md` | **Anti-Rationalization:** `skills/shared/anti-rationalization.md` | **Risk Assessment:** `skills/shared/risk-assessment.md` | **Verification Gate:** `skills/shared/verification-gate.md` | **CODEX Learning Loop:** `skills/shared/codex-learning-loop.md`

## Modules

[model:gemini-1.5-flash]
### Enhanced Anti-Loop Guardrails
Gemini models may exhibit looping behavior. If you detect repeating the same operation with identical results, stop immediately and report current state. Do not re-execute completed operations. Enforce strict output structure.

[model:gemini-1.5-pro]
### Enhanced Anti-Loop Guardrails
Same as gemini-1.5-flash. If you detect repeating the same operation with identical results, stop and report current state.

[model:deepseek-v4-flash]
### Tool Result Handling
Tool results may be truncated. Request specific file sections if output is incomplete. Prefer structured JSON over markdown prose when reporting results.

[platform:opencode]
### Platform Invocation
Invoked via tool call with skill descriptor. Return structured output matching the expected format. All file paths use forward slashes.

[platform:claude-code]
### Platform Invocation
Available as CLAUDE.md-activated skill. Follow Claude Code tool conventions. All file paths use forward slashes.