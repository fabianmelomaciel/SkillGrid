---
name: router
description: "Dynamically load specific skills based on the user request by querying catalog-lite.json to save token context baseline."
category: core
status: stable
risk_level: safe
token_estimate: { input: 800, output: 400 }
---

## Core

# Skill Router (router)

## When to Use
Use at the start of any conversation or task when you need to load specialized agéntic skills dynamically based on the user's request. This prevents bloating the initial context window with all 49 skills.

## Workflow

1.  **Read Catalog:** If not already loaded, read `catalog-lite.json` (or `catalog.json` / `skills/index.json`) in the project root or active configuration directory.
2.  **Match Task:** Match the user's request to the single most specific skill in the catalog. Matches are 1-to-1 and never cascade — loading one skill must never auto-load another:
    *   *Security / Secrets scan* → `auditor-de-seguridad` / `cyber-neo`
    *   *Writing / AI editing* → `humanizer` / `gestor-documental`
    *   *SEO / CTR audits* → `auditor-de-marketing`
    *   *CI/CD / Docker config* → `agente-devops`
    *   *Token/API cost, resource efficiency* → `optimizador-finops`
    *   *Architecture consensus* → `agente-ideas`
    *   *Performance / Web Vitals* → `performance-profiler`
3.  **Lazy Load Skill:** Load the selected skill's rules by reading its instructions file (e.g., `skills/<skill-name>/SKILL.md`) using `read` or `view`.
4.  **Execute:** Proceed with the loaded skill's specific workflow.

## Tools
- `read`/`glob`/`grep` — explore code and read skill files

> **CodeGraph:** `skills/shared/codegraph-startup.md` | **Anti-Rationalization:** `skills/shared/anti-rationalization.md` | **Risk Assessment:** `skills/shared/risk-assessment.md` | **Verification Gate:** `skills/shared/verification-gate.md` | **CODEX Learning Loop:** `skills/shared/codex-learning-loop.md`

## Modules

[model:gemini-1.5-flash]
### Enhanced Anti-Loop Guardrails
Gemini models may exhibit looping behavior. If you detect repeating the same operation with identical results, stop immediately and report current state.

[model:gemini-1.5-pro]
### Enhanced Anti-Loop Guardrails
Same as gemini-1.5-flash.

[model:deepseek-v4-flash]
### Tool Result Handling
Tool results may be truncated. Request specific file sections if output is incomplete.

[platform:opencode]
### Platform Invocation
Invoked via tool call. Return structured output matching the expected format.

[platform:claude-code]
### Platform Invocation
Available as CLAUDE.md-activated skill. Follow Claude Code tool conventions.
