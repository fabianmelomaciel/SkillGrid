---
name: preinstall-audit
description: "Audits third-party skills and MCP servers from disk before installing them — local rules, no network, no external registries."
category: core
status: beta
risk_level: safe
token_estimate: { input: 765, output: 306 }
---

## Core

# Pre-install Audit (preinstall-audit)

Escanea skills y configuraciones MCP que **no son de este proyecto** antes de copiarlas a cualquier IDE. Todo el análisis es local: regex sobre archivos en disco, sin red, sin subir código, sin consultas a servicios externos.

## When to Use

- Antes de instalar una skill o plugin de un repo de terceros.
- Antes de pegar un bloque `mcpServers` recibido por chat, issue o gist.
- Al revisar un PR que agrega skills o configs MCP ajenas.
- Como paso previo de cualquier instalación manual (claude, cursor, opencode).

Para auditar el código de esta app o una red completa, eso es `auditor-de-seguridad` / `cyber-neo` — esta skill es solo la puerta de entrada de paquetes ajenos.

## Workflow

1. **Localizar el material:** clonar o descomprimir el paquete en una carpeta temporal. Si ya está en disco (skill instalada, config MCP), apuntar directo a esa ruta.
2. **Correr el escáner propio:**
   ```bash
   node scripts/scan-third-party.js <ruta> [--json]
   ```
3. **Leer el reporte por severidad:**
   - `ALTA` (inyección de contexto, tubería a shell, llaves privadas, exfiltración de entorno): **no instalar**. Es casi seguro malicioso o un copy-paste descuidado con credenciales — en cuyo caso el problema sigue siendo que no puede entrar.
   - `baja` (tokens en texto plano, drift de manifest): revisar a mano; si es documentación de ejemplo, mover a la whitelist o pedirle al dueño del paquete que lo saque de ahí.
   - `suprimida`: hallazgo conocido y aceptado, queda visible igual por si cambia.
4. **Supresiones con criterio:** cada entrada de `.thirdparty-ignore.json` lleva `regla`, `ruta` y `motivo`. Nunca agregar una supresión genérica (`ruta: ""`) ni una que tape reglas enteras sobre material de terceros — eso apaga la puerta.
5. **MCP además:** cruzar el checklist de `mcp-configurator` (Step 3) — permisos del servidor, alcance del filesystem, credenciales mínimas.
6. **Registrar:** si la auditoría encontró algo y cambió una decisión, el aprendizaje va a `CODEX.md`; si expuso un hueco del propio escáner, va como fila nueva en `EVOLUCION.md`.

## Exit codes

| Código | Significado |
|---|---|
| 0 | Limpio (o solo suprimidos) |
| 1 | Hay hallazgos alta/baja sin suprimir |
| 2 | Uso incorrecto o ruta inexistente |

## Tools

- `bash` — correr el escáner local
- `read`/`grep` — revisar los archivos marcados a mano

> **CodeGraph:** `skills/shared/codegraph-startup.md` | **Verification Gate:** `skills/shared/verification-gate.md`

## Modules

[platform:opencode]
### Platform Invocation
Run `node scripts/scan-third-party.js` from the project root of SkillGrid (or use the absolute path). Read-only.

[platform:claude-code]
### Platform Invocation
Same command; report findings as a table before recommending install/skip.
