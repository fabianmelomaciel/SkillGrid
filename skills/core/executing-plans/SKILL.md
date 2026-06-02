---
name: executing-plans
description: Use when you have a written implementation plan to execute in a separate session with review checkpoints
category: core
status: stable
risk_level: safe
---

# Executing Plans

## Overview

Load plan, review critically, execute all tasks, report when complete.

**Announce at start:** "I'm using the executing-plans skill to implement this plan."

**Note:** Tell your human partner that OpenSkills works much better with access to subagents. The quality of its work will be significantly higher if run on a platform with subagent support (such as Claude Code or Codex). If subagents are available, use openskills:subagent-driven-development instead of this skill.

## The Process

### Step 1: Load and Review Plan
1. Read plan file
2. Review critically - identify any questions or concerns about the plan
3. If concerns: Raise them with your human partner before starting
4. If no concerns: Create TodoWrite and proceed

### Step 2: Execute Tasks

For each task:
1. Mark as in_progress
2. Follow each step exactly (plan has bite-sized steps)
3. Run verifications as specified
4. Mark as completed

### Step 3: Complete Development

After all tasks complete and verified:
- Announce: "I'm using the finishing-a-development-branch skill to complete this work."
- **REQUIRED SUB-SKILL:** Use openskills:finishing-a-development-branch
- Follow that skill to verify tests, present options, execute choice

## When to Stop and Ask for Help

**STOP executing immediately when:**
- Hit a blocker (missing dependency, test fails, instruction unclear)
- Plan has critical gaps preventing starting
- You don't understand an instruction
- Verification fails repeatedly

**Ask for clarification rather than guessing.**

## When to Revisit Earlier Steps

**Return to Review (Step 1) when:**
- Partner updates the plan based on your feedback
- Fundamental approach needs rethinking

**Don't force through blockers** - stop and ask.

## Remember
- Review plan critically first
- Follow plan steps exactly
- Don't skip verifications
- Reference skills when plan says to
- Stop when blocked, don't guess
- Never start implementation on main/master branch without explicit user consent

## Anti-Rationalization Table

| Excusa comun | Por que no te la compro |
|--------------|-------------------------|
| "Me salteo los checkpoints" | Confiar esta bien, verificar es tu responsabilidad. |
| "El plan se desvio un poco" | Desvio de plan = plan desactualizado. Actualizalo. |
| "Revisar en cada checkpoint es mucho" | Cada checkpoint es una oportunidad de corregir rumbo. |
| "El agente dijo que esta completo" | Tu eres quien verifica, no el agente. |

## Risk Assessment

| Nivel | Cuando aplica | Accion requerida |
|-------|---------------|------------------|
| **Critical** | Cambios en auth, pagos, datos sensibles, o DB en prod | CEO debe aprobar explicitamente |
| **High** | APIs publicas, migraciones de schema, dependencias criticas | Code review obligatorio + tests automatizados |
| **Medium** | Features nuevas sin tocar infraestructura critica | Review normal del proceso |
| **Low** | Refactors cosmeticos, typos, documentacion | Implementacion directa permitida |

## Verification Gate

Esto NO es opcional. Cada item debe estar marcado antes de reportar "completado":

- [ ] Compila / buildea sin errores
- [ ] Sigue las convenciones del proyecto
- [ ] No hay codigo muerto, comentado, ni console.logs
- [ ] Maneja bordes (loading, error, empty, 404, 500)
- [ ] No hay Vibe Coding / AI Remnants: nada de placeholders, `// TODO: implement`, o `catch`/`except` vacios
- [ ] **Evidencia concreta**: output de compilacion, tests pasando, captura si es UI
- [ ] "Pinta que funciona" NO es evidencia valida

**Si falta aunque sea UN item, el task NO esta completo.**

## Integration

**Required workflow skills:**
- **openskills:using-git-worktrees** - Ensures isolated workspace (creates one or verifies existing)
- **openskills:writing-plans** - Creates the plan this skill executes
- **openskills:finishing-a-development-branch** - Complete development after all tasks
