---
name: spec-kit
description: Envuelve la CLI Spec-Kit de GitHub (`specify`) para opencode; genera especificaciones, planes y artefactos de tareas mediante herramientas de Desarrollo Guiado por Especificaciones en lugar de redactarlos manualmente. Requiere Python 3.11+ y `uv`.
category: agent
status: stable
risk_level: critical
token_estimate: { input: 800, output: 400 }
---

## Core

# Spec Kit Agent

## Overview
Delegates artifact generation to the `specify` CLI from GitHub Spec-Kit. Instead of manually drafting specs, plans, and tasks, this skill runs `specify` commands to scaffold structured artifacts, then passes them to human review gates.

Creates an agent `spec-kit` in opencode that other skills (notably `spec-driven-development`) can invoke programmatically.

## When to Use
- `spec-driven-development` skill delegates here when it detects `specify` CLI
- Directly when you want Spec Kit's structured templates instead of manual drafting
- When working on projects already initialized with `specify init`

## Prerequisites
- Python 3.11+
- `uv` (Astral)
- `specify` CLI

### Auto-Install
```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git
```
> ⚠️ **Supply Chain Note:** This installs a CLI from GitHub via `uv`. Verify the source before running in production environments. Consider pinning to a specific commit hash.

### Verify
```bash
specify --version
```

## Lifecycle

### Bootstrap project
```bash
specify init . --integration opencode --force
```
Creates `.specify/` directory tree with templates, scripts, and constitution.

### SDD Workflow
Use the installed templates in `.specify/templates/` to generate:
1. **Constitution** → `.specify/memory/constitution.md`
2. **Spec** → `specs/<branch>/spec.md`
3. **Plan** → `specs/<branch>/plan.md`
4. **Tasks** → `specs/<branch>/tasks.md`

### Sync across agents
If `specify` is used with other agents (Claude Code, Gemini, etc.), run:
```bash
specify integration install <key>
```
to install Spec Kit commands for each agent from the same `.specify/` project root.

## Integration with spec-driven-development
The `spec-driven-development` skill checks for `specify` on `PATH` at startup. If found, it delegates artifact generation here, then takes over for human review gates and implementation dispatch. If not found, it falls back to manual drafting instructions.

> **CodeGraph:** `skills/shared/codegraph-startup.md` | **Anti-Rationalization:** `skills/shared/anti-rationalization.md` | **Risk Assessment:** `skills/shared/risk-assessment.md` | **Verification Gate:** `skills/shared/verification-gate.md` | **CODEX Learning Loop:** `skills/shared/codex-learning-loop.md`

> Modules: `skills/shared/modules-footer.md`
