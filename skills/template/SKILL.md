---
name: my-skill-name
description: "Brief description of when and why to use this skill (1-2 sentences)."
category: core
status: draft
risk_level: safe
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

[platform:opencode]
### Platform Invocation
Invoked via tool call with skill descriptor. Return structured output matching the expected format. All file paths use forward slashes.

