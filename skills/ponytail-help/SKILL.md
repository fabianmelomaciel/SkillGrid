---
name: ponytail-help
description: "Referencia rápida para los niveles, skills y comandos de ponytail. Visualización de una sola vez. Úsalo para /ponytail-help, \"ponytail help\", \"cómo uso ponytail\"."
category: agent
status: stable
risk_level: safe
token_estimate: { input: 660, output: 300 }
---

## Core

# Ponytail Help — Ayuda

Mostrá esta tarjeta de referencia cuando se invoque. De una sola vez, NO cambies de modo, ni escribas archivos flag, ni persistas nada.

## Niveles

| Nivel | Disparador | Qué cambia |
|-------|------------|------------|
| **Lite** | `/ponytail lite` | Construye lo que se pidió, nombra la opción más chica en una línea. |
| **Full** | `/ponytail` | El cambio completo más pequeño, un chequeo donde la lógica lo pide, y una respuesta que nombra lo salteado y cualquier riesgo. Default. |
| **Ultra** | `/ponytail ultra` | También cuestiona el pedido y lo rechaza antes de construir. |

El nivel se mantiene hasta que cambie o termine la sesión.

## Skills

| Skill | Disparador | Qué hace |
|-------|------------|----------|
| **ponytail** | `/ponytail` | El modo perezoso en sí: menos código nuevo, respuestas claras con salteos y riesgos. |
| **ponytail-review** | `/ponytail-review` | Revisión de calidad de un diff: bugs, seguridad, carga, tests faltantes, velocidad, qué recortar. |
| **ponytail-audit** | `/ponytail-audit` | La misma revisión de calidad para todo el repo, clasificada. |
| **ponytail-debt** | `/ponytail-debt` | Recolecta comentarios `shortcut:` en un libro de deuda. |
| **ponytail-gain** | `/ponytail-gain` | Marcador de impacto medido: menos código, menos coste, más velocidad. |
| **ponytail-help** | `/ponytail-help` | Esta tarjeta. |

## Desactivar

Decí "stop ponytail" o "modo normal". Retomá en cualquier momento con `/ponytail`. `/ponytail off` también funciona.

## Configurar modo por defecto

Modo por defecto = `full`, auto-activo en cada sesión. Cambialo:

**Variable de entorno** (máxima prioridad):
```bash
export PONYTAIL_DEFAULT_MODE=ultra
```

**Archivo de configuración** (`~/.config/ponytail/config.json`, Windows: `%APPDATA%\ponytail\config.json`):
```json
{ "defaultMode": "lite" }
```

Seteá `"off"` para desactivar la auto-activación al inicio, activalo manualmente con `/ponytail` cuando quieras.

Resolución: var entorno > archivo config > `full`.

> **CodeGraph:** `skills/shared/codegraph-startup.md` | **Anti-Rationalization:** `skills/shared/anti-rationalization.md` | **Risk Assessment:** `skills/shared/risk-assessment.md` | **Verification Gate:** `skills/shared/verification-gate.md`

> Modules: `skills/shared/modules-footer.md`
