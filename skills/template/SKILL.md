---
name: my-skill-name
description: "Brief description of when and why to use this skill (1-2 sentences)."
category: core
status: draft
risk_level: safe
---

<!-- category: core | agent | design ; status: draft | stable | beta | experimental | deprecated ; risk_level: safe | critical -->

# {Skill Title} Agent

## When to Use

[One paragraph describing WHEN this skill should be loaded.]

## Workflow

### Step 1: Header
Description.

### Step 2: Header
Description.

## Anti-Rationalization Table

| Excusa comun | Por que no te la compro |
|--------------|-------------------------|
| "..." | ... |

## Risk Assessment

| Nivel | Cuando aplica | Accion requerida |
|-------|---------------|------------------|
| **Critical** | ... | ... |
| **High** | ... | ... |
| **Medium** | ... | ... |
| **Low** | ... | ... |

## Verification Gate

- [ ] Compila / buildea sin errores
- [ ] Sigue las convenciones del proyecto
- [ ] No hay codigo muerto, comentado, ni console.logs
- [ ] Maneja bordes (loading, error, empty)
- [ ] **Evidencia concreta**: output de compilacion, tests pasando, captura si es UI
- [ ] "Pinta que funciona" NO es evidencia valida

**Si falta aunque sea UN item, el task NO esta completo.**

## Tools

- `task` — delegate to sub-agents
- `read`/`glob`/`grep` — explore code
- `edit`/`write` — implement changes
- `bash` — build, test, git
