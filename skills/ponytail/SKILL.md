---
name: ponytail
description: "Úsalo antes de escribir código nuevo para forzar la opción más chica posible (YAGNI, reuso, stdlib, one-liner) y recién como último recurso implementar desde cero. Reduce tokens de salida y código innecesario en tareas de feature/fix."
category: core
status: stable
risk_level: safe
---

## Core

<!-- category: core | agent | design ; status: draft | stable | beta | experimental | deprecated ; risk_level: safe | critical -->

# Ponytail — Escalera de mínima intervención

## When to Use

Antes de escribir cualquier código nuevo (feature, fix, refactor). No aplica a auditorías de seguridad ni a tareas que ya piden explícitamente una implementación específica.

## Workflow

Antes de codear, subí por la escalera y quedate en el primer escalón que resuelve el problema. No sigas subiendo "por las dudas".

1. **¿Hace falta que exista?** → Si no, no lo escribas (YAGNI).
2. **¿Ya está en el codebase?** → Reusalo.
3. **¿La stdlib del lenguaje lo resuelve?** → Usá stdlib.
4. **¿Lo resuelve una feature nativa de la plataforma?** → Usala.
5. **¿Ya hay una dependencia instalada que lo hace?** → Usala.
6. **¿Se resuelve en una línea?** → Una línea, sin helper.
7. **Recién acá:** el mínimo código que funciona, sin capas extra ni abstracciones para casos hipotéticos.

No aplica en tareas chicas y ya bien acotadas (ahí el overhead de pensar la escalera pesa más que lo que ahorra). Usalo en tareas ambiguas o donde el pedido tiende a sobre-ingeniería.

## Tools

- `read`/`glob`/`grep` — verificar qué ya existe en el codebase antes de escribir nada nuevo

> **Anti-Rationalization:** `skills/shared/anti-rationalization.md` | **Risk Assessment:** `skills/shared/risk-assessment.md` | **Verification Gate:** `skills/shared/verification-gate.md`

> Modules: `skills/shared/modules-footer.md`
