---
name: headroom
description: "Capa de optimización de contexto para agentes: reduce el uso de tokens (60-95%) comprimiendo salidas de herramientas, logs, RAG y archivos. Úsalo para 'ahorrar tokens', 'comprimir contexto', configurar el proxy de Headroom, usar MCP para recuperación (CCR) o activar el aprendizaje offline con 'headroom learn'."
category: core
status: stable
risk_level: safe
token_estimate: { input: 840, output: 500 }
---

## Core

# Headroom — Context Optimization Layer

Sos el experto en **Headroom**, la herramienta que optimiza el contexto del LLM para que el agente sea más rápido, barato y capaz de manejar sesiones largas sin chocar con el límite de tokens.

## Cuándo usar

- Cuando el contexto está muy cargado (logs largos, búsquedas masivas, archivos gigantes).
- Cuando el usuario pide "ahorrar tokens" o "reducir costos".
- Para configurar el proxy local, el servidor MCP o la memoria compartida entre agentes.
- Para aplicar aprendizajes de sesiones fallidas mediante `headroom learn`.

## Capacidades Principales

1. **Proxy Transparente**: Intercepta llamadas al API y comprime el contenido antes de que llegue al modelo.
2. **Compresión Reversible (CCR)**: Los originales se guardan localmente; el modelo puede pedir el texto completo con `headroom_retrieve` si lo necesita.
3. **Headroom Learn**: Analiza sesiones pasadas y extrae reglas para `CLAUDE.md`, `AGENTS.md` o `MEMORY.md`.
4. **Memoria Compartida**: Permite que distintos agentes (Claude, Gemini, Codex) compartan contexto comprimido.

## Workflow

### 1. Instalación y Verificación
Verificá si `headroom` está instalado. Si no, instalalo:
```bash
# Recomendado: uv para aislamiento, o pip
uv tool install "headroom-ai[all]" || pip install "headroom-ai[all]"
```

### 2. Modos de Ejecución
Elegí el modo según la herramienta:
- **Wrapper (Recomendado)**: `headroom wrap [claude|codex|cursor|aider|opencode]`
- **Proxy Manual**: `headroom proxy --port 8787` y configurar `BASE_URL` a `http://localhost:8787/v1`.
- **MCP Server**: `headroom mcp install` para habilitar las herramientas `headroom_compress`, `headroom_retrieve` y `headroom_stats`.

### 3. Aprendizaje Offline (Headroom Learn)
Después de un error o una sesión compleja, ejecutá:
```bash
headroom learn --apply --target AGENTS.md
```
Esto analiza los eventos de la sesión y propone mejoras estructurales en las reglas del agente.

### 4. Recuperación de Contexto (CCR)
Si ves un texto comprimido (marcado por Headroom) y necesitás el detalle exacto:
- Usá la herramienta MCP `headroom_retrieve(hash="...")`.

## Reglas de Oro
- **No comprimir reglas**: `.cursorrules`, `rules/`, `AGENTS.md` y archivos de instrucciones deben quedar fuera de la compresión para evitar "deriva de instrucciones".
- **Prioridad de contenido**: JSON usa `SmartCrusher`, código usa `CodeCompressor` (AST-aware) y texto usa `Kompress-v2`.

## Herramientas MCP
- `headroom_compress`: Comprime contenido a pedido.
- `headroom_retrieve`: Recupera el original por hash.
- `headroom_stats`: Muestra cuánto se ha ahorrado en la sesión.

> **Anti-Rationalization:** `skills/shared/anti-rationalization.md` | **Risk Assessment:** `skills/shared/risk-assessment.md` | **Verification Gate:** `skills/shared/verification-gate.md`

> Modules: `skills/shared/modules-footer.md`
