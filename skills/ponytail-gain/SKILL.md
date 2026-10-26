---
name: ponytail-gain
description: "Muestra los ahorros medidos de ponytail (código, coste, velocidad) del benchmark. Visualización de una sola vez. Úsalo para /ponytail-gain, \"qué ahorra ponytail\", \"impacto de ponytail\"."
category: agent
status: stable
risk_level: safe
token_estimate: { input: 580, output: 200 }
---

## Core

# Ponytail Gain — Marcador de Impacto

Mostrá este marcador cuando se invoque. De una sola vez: NO cambies de modo, ni escribas archivos flag, ni persistas nada.

Las cifras son del benchmark agentic publicado de Ponytail 5: Claude Code headless (Opus 5.5, esfuerzo default) en 39 tareas (tickets de features en un repo real FastAPI + React, bug fixes, casos de seguridad y privacidad, apps chicas), 5 ejecuciones cada una, contra el mismo agente sin el skill. Cada cifra es la media geométrica de las medianas por tarea. Son medidas, no computadas del repo actual.

## Marcador

Renderizá barras ASCII simples. El largo de la barra muestra a ponytail como una parte del baseline sin skill; la etiqueta lleva la cifra exacta:

```
  ponytail gain           benchmark · 39 tareas × 5 ejecuciones · Opus 5.5

  sin-skill       ████████████████████  100%
  Líneas código   █████████···········   47%   ▼ 53%
  Tokens salida   ███████████·········   55%   ▼ 45%
  Coste           ███████████████·····   74%   ▼ 26%
  Tiempo          ████████████········   59%   ▼ 41%
  Checks ocultos pasados   97%  (sin-skill 96%)
  Tests donde la lógica lo pide   98%  (sin-skill 68%)

  Este repo:  /ponytail-debt  (atajos que postergaste)
              /ponytail-audit (lo que todavía se puede recortar)
```

## Frontera de honestidad

Estos son promedios de benchmark, no de este repo. NUNCA imprimas un número de ahorro por repo ("ahorraste X líneas/tokens acá"): la versión no construida nunca se escribió, así que no hay un baseline real para restar en un repo vivo. Las únicas cifras reales por repo vienen de `/ponytail-debt` (un libro contado), y esta tarjeta apunta ahí en lugar de inventar una.

> **CodeGraph:** `skills/shared/codegraph-startup.md` | **Anti-Rationalization:** `skills/shared/anti-rationalization.md` | **Risk Assessment:** `skills/shared/risk-assessment.md` | **Verification Gate:** `skills/shared/verification-gate.md`

> Modules: `skills/shared/modules-footer.md`
