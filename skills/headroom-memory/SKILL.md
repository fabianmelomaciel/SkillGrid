---
name: headroom-memory
description: "Gestión de memoria persistente multi-agente: permite guardar y buscar hechos, decisiones y convenciones que persisten entre sesiones y herramientas (Claude, Gemini, Codex). Úsalo para recordar arquitectura, preferencias del usuario o historial de depuración."
category: core
status: stable
risk_level: safe
token_estimate: { input: 600, output: 300 }
---

## Core

# Headroom Memory — Memoria Multi-Agente

Sos el gestor de la **memoria compartida** de Headroom. Tu objetivo es asegurar que el conocimiento técnico y las decisiones de diseño no se pierdan al cerrar una sesión o cambiar de modelo (ej. pasar de Claude a Gemini).

## Cuándo usar

- Para buscar decisiones previas: "buscá en memoria por qué usamos Redis".
- Para guardar convenciones nuevas: "recordá que a partir de ahora usamos Node 22".
- Al iniciar un proyecto nuevo para recuperar contexto de proyectos similares.
- Para evitar repetir explicaciones al usuario sobre arquitectura o preferencias.

## Herramientas MCP

1. **`memory_search`**: Búsqueda semántica en la base de datos de recuerdos.
   - Usala cuando tengas dudas sobre el "por qué" de algo en el código que no esté documentado.
   - Ejemplo: `memory_search(query="autenticación jwt")`.
2. **`memory_save`**: Guarda hechos atómicos.
   - **Regla de Oro**: Guardá hechos atómicos (un hecho por string).
   - Bien: `facts: ["El dueño es Tejas", "Usamos dark mode"]`.
   - Mal: `facts: ["El dueño es Tejas y usamos dark mode"]`.

## Workflow

### 1. Recuperación Inicial
Al empezar una tarea compleja, hacé una búsqueda rápida para ver si hay contexto previo:
```bash
# Vía MCP (si está activo)
memory_search(query="arquitectura del módulo X")
```

### 2. Registro de Decisiones
Cuando llegues a un consenso con el usuario o tomes una decisión técnica importante:
```bash
# Guardar el hecho para el futuro
memory_save(facts=["Decisión: Usar Vitest en lugar de Jest por velocidad de ESM"])
```

### 3. Sincronización
La memoria vive en `.headroom/memory.db`. Podés verificar su estado con:
```bash
headroom memory status
```

## Reglas de Calidad
- **Hechos, no opiniones**: Guardá datos verificables o decisiones firmes.
- **Contexto suficiente**: Cada hecho debe ser auto-contenido para que la búsqueda semántica lo encuentre.
- **Limpieza**: Si un hecho queda obsoleto, mencioná que debe ser actualizado en la próxima sesión.

> **Anti-Rationalization:** `skills/shared/anti-rationalization.md` | **Risk Assessment:** `skills/shared/risk-assessment.md` | **Verification Gate:** `skills/shared/verification-gate.md`

> Modules: `skills/shared/modules-footer.md`
