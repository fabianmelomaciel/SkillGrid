<div align="center">

# 🧠 OpenSkills

**El copiloto de IA que trabaja *con* tu cabeza, no en contra.**

*27 skills especializadas para opencode · antigravity · Claude Code · Cursor · Copilot*

[![License: MIT](https://img.shields.io/badge/license-MIT-6366f1?style=flat-square)](LICENSE)
[![Skills](https://img.shields.io/badge/skills-26-22c55e?style=flat-square)](catalog.json)
[![CI](https://img.shields.io/github/actions/workflow/status/fabianmelomaciel/OpenSkills/validate.yml?branch=main&style=flat-square&label=CI)](https://github.com/fabianmelomaciel/OpenSkills/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-f59e0b?style=flat-square)](https://github.com/fabianmelomaciel/OpenSkills/pulls)

</div>

---

## ¿Qué es OpenSkills?

OpenSkills es una colección de **skills portables** — instrucciones estructuradas que transforman tu asistente de IA en un equipo especializado. Cada skill le dice exactamente *cuándo activarse*, *qué hacer* y *cuándo parar*.

No es otro conjunto de prompts. Es un **sistema de trabajo** con:

- 🔁 **Bucle de reparación automática** — audita, repara y re-audita sin que lo pidas
- 🧠 **Memoria persistente (CODEX)** — el agente aprende tu proyecto y nunca te vuelve a preguntar lo mismo
- 🛡️ **Taxonomía de riesgo** — cada acción clasificada como segura, requiere OK, o nunca-auto
- 📦 **Bundles por rol** — instala solo lo que necesitas para tu equipo

---

## ⚡ Instalación en 10 segundos

> El instalador detecta automáticamente opencode, antigravity, Claude Code y demás — y los configura todos de una vez.

### Windows (PowerShell)

```powershell
irm https://raw.githubusercontent.com/fabianmelomaciel/OpenSkills/main/remote-install.ps1 | iex
```

### Linux / macOS (bash)

```bash
curl -fsSL https://raw.githubusercontent.com/fabianmelomaciel/OpenSkills/main/remote-install.sh | bash
```

Eso es todo. El instalador detecta tu setup y copia las skills donde corresponde. ✅

---

## 🛠️ Instalación avanzada

<details>
<summary><strong>Clonar y ejecutar manualmente</strong></summary>

```powershell
# Windows
git clone https://github.com/fabianmelomaciel/OpenSkills.git C:\OpenSkills
cd C:\OpenSkills
.\install.ps1
```

```bash
# Linux / macOS
git clone https://github.com/fabianmelomaciel/OpenSkills.git ~/openskills
cd ~/openskills && bash install.sh
```

</details>

<details>
<summary><strong>Instalar reglas en tu proyecto (Cursor / Copilot)</strong></summary>

Genera automáticamente `.cursor/rules/` y `.github/instructions/` con las reglas del lenguaje de tu proyecto:

```powershell
# Windows — autodetecta el lenguaje del proyecto
.\install.ps1 -ProjectDir "C:\ruta\a\tu-proyecto"

# Forzar lenguaje específico
.\install.ps1 -ProjectDir "C:\ruta\a\tu-proyecto" -Language php
```

```bash
# Linux / macOS
./install.sh --project "/ruta/a/tu-proyecto"
./install.sh --project "/ruta/a/tu-proyecto" --language python
```

</details>

<details>
<summary><strong>Compatibilidad por herramienta</strong></summary>

| Herramienta | Soporte | Ruta de instalación |
|-------------|---------|---------------------|
| **opencode** | ✅ Automático | `~/.config/opencode/skills/` |
| **antigravity** | ✅ Automático | `~/.gemini/config/skills/` |
| **Claude Code** | ✅ Automático | `~/.claude/skills/` |
| **Cursor IDE** | ✅ Via `-ProjectDir` | `.cursor/rules/*.mdc` |
| **GitHub Copilot** | ✅ Via `-ProjectDir` | `.github/instructions/*.md` |
| **Aider** | ⚙️ Manual | `aider --instructions-file skills/.../SKILL.md` |

</details>

---

## 🗺️ Skills incluidas

### 🔧 Core — Metodología de desarrollo

Las 17 skills que convierten a tu agente en un ingeniero de software disciplinado:

| Skill | Cuándo la usas |
|-------|----------------|
| `brainstorming` | Antes de tocar código — diseña la feature primero |
| `spec-driven-development` | Cuando los requerimientos son vagos o ambiguos |
| `writing-plans` | Para planificar cambios que tocan múltiples archivos |
| `incremental-implementation` | Para entregar en rebanadas seguras y revisables |
| `test-driven-development` | Red → Green → Refactor con disciplina real |
| `systematic-debugging` | Cuando algo falla y no sabés por qué |
| `code-simplification` | Refactorizar sin cambiar comportamiento |
| `verification-before-completion` | Antes de decir "está listo" — evidencia concreta |
| `context-engineering` | Cuando el agente empieza a alucinar por context flooding |
| `dispatching-parallel-agents` | 2+ tareas independientes — lanzalas en paralelo |
| `subagent-driven-development` | Ejecutar planes grandes con subagentes especializados |
| `requesting-code-review` | Antes de mergear — checklist + evidencia |
| `receiving-code-review` | Cuando recibís feedback — no aplicar a ciegas |
| `finishing-a-development-branch` | Cerrar ramas: merge, PR, o cleanup |
| `using-git-worktrees` | Aislar features para no romper el workspace |
| `writing-skills` | Crear y testear tus propias skills |
| `executing-plans` | Ejecutar planes por lotes con checkpoints de revisión |

---

### 🎨 Design Engineering — Calidad visual premium

| Skill | Qué hace |
|-------|----------|
| `impeccable-design-taste` | Auditoría de diseño en 6 capas: tipografía, color, espaciado, polish, motion y accesibilidad WCAG AA. Detecta y elimina los "AI tells" (glassmorphism genérico, gradients de AI, cards idénticas). |
| `emil-kowalski-design` | Animaciones ≤300ms, micro-interacciones, perceived performance. Principios de diseño de Emil Kowalski aplicados sistemáticamente. |

---

### 🤖 Agentes especializados

Agentes que se comportan como profesionales con roles definidos:

| Agente | Rol |
|--------|-----|
| `auditor-de-seguridad` | Escanea 12 categorías: secrets, dependencias, SAST (OWASP Top 10), rate limiting, auth, API security, encryption, logging, compliance, infra, DB y CI/CD |
| `audit-loop` | **Follow-up de auditorías.** Clasifica hallazgos, aplica fixes seguros automáticamente, pide OK para los sensibles, re-audita hasta 3 veces |
| `agente-devops` | Diseña y audita Dockerfiles y pipelines CI/CD seguros. Alineado con IEEE 730 e ISO 27001 |
| `auditor-de-marketing` | Audita SEO on-page, OpenGraph, readability y CTAs de conversión |
| `optimizador-finops` | Analiza consumo de tokens, comprime prompts, detecta llamadas redundantes a APIs |
| `project-manager` | Escucha al CEO, planifica, delega a agentes especializados, revisa resultados y reporta |
| `gestor-documental` | Formatea documentación técnica y académica (APA 7ª ed., ISO 29148, ISO 29119) |

---

### 🎁 Bundles por rol

Instala solo lo que necesita tu equipo:

| Bundle | Qué incluye |
|--------|-------------|
| **`core`** | Las 17 skills de metodología de desarrollo |
| **`devops`** | agente-devops · audit-loop · auditor-de-seguridad · optimizador-finops |
| **`design`** | impeccable-design-taste · emil-kowalski-design |
| **`management`** | project-manager · gestor-documental · audit-loop |
| **`marketing`** | auditor-de-marketing |

---

### ⚡ Workflows multi-skill

Combinaciones pre-diseñadas para tareas complejas:

| Workflow | Secuencia |
|----------|-----------|
| **Feature completa** | `brainstorming` → `spec-driven-development` → `writing-plans` → `incremental-implementation` → `requesting-code-review` → `finishing-a-development-branch` |
| **Auditoría + reparación** | `auditor-de-seguridad` → `audit-loop` |
| **Deploy seguro** | `agente-devops` → `auditor-de-seguridad` → `audit-loop` |
| **Rediseño UI** | `brainstorming` → `impeccable-design-taste` → `emil-kowalski-design` → `incremental-implementation` |
| **Auditoría completa** | `auditor-de-seguridad` + `auditor-de-marketing` + `optimizador-finops` (paralelo) → `gestor-documental` |

---

## 🧠 Sistema CODEX — Memoria persistente del agente

Cada instalación genera un archivo `CODEX.md` **local y privado** (en `.gitignore`). Es la memoria de largo plazo del agente:

| Sección | Para qué sirve |
|---------|----------------|
| `🎯 Project Context` | Stack, DB, directorios, deployment — el agente no te vuelve a preguntar |
| `💡 Token Economy Rules` | Reglas de eficiencia: sin preámbulos, output compacto, verificación inmediata |
| `🏗️ Active Design System` | Paleta, tipografía, radios — consistencia visual garantizada |
| `🛠️ Technical Gotchas` | Quirks del entorno, reglas del proyecto descubiertas en el camino |
| `💻 Mission Logs` | Historial de decisiones y soluciones — el agente aprende de cada sesión |

> **El instalador nunca sobreescribe tu `CODEX.md`** si ya existe. Tu memoria acumulada está 100% protegida.

---

## 📊 Dashboards visuales de reportes

Los agentes de análisis generan dashboards HTML interactivos con dark mode, glassmorphism y animaciones — se abren directo en tu navegador:

- 🔒 **Security Dashboard** — vulnerabilidades por categoría, acordeones interactivos, bloques de código vulnerables
- 💰 **FinOps Dashboard** — ahorro de tokens estimado, redundancias, propuestas de refactor copiables
- 🚀 **DevOps Dashboard** — SCM Quality Score, validación de Dockerfiles y Compose, scaffolding seguro listo para usar
- 📢 **Marketing Dashboard** — SEO score, estado de OpenGraph, análisis de CTAs above/below the fold

---

## 📈 CodeGraph — Memoria local y optimización de tokens

OpenSkills integra automáticamente **CodeGraph** (la herramienta de análisis semántico local y MCP) durante el proceso de instalación para evitar que los agentes gasten tokens en investigación redundante.

### ¿Cómo funciona?
1. **Detección e instalación**: El instalador (`install.ps1` / `install.sh`) busca si `codegraph` está instalado en el sistema. Si falta, intenta instalar `@colbymchenry/codegraph` globalmente vía `npm` (o `codegraph-cli` vía `pip`/`uv` como respaldo).
2. **Inicialización local**: Si instalas reglas en tu proyecto con `-ProjectDir` o `--project`, el script inicializa y genera un índice de código local dentro de la carpeta `.codegraph/`.
3. **Reducción de tokens**: Los agentes (como `project-manager` y `optimizador-finops`) consultan el índice semántico de `.codegraph/` en lugar de realizar escaneos completos de archivos. Esto reduce hasta un **90%** el consumo de tokens en tareas de investigación.
4. **Registro de ahorro (FinOps)**: Cada análisis genera o actualiza un registro en `c:\laragon\www\peon\scratch\token_usage_comparison.json` para auditar y comparar el consumo teórico de tokens (escaneo completo vs. CodeGraph).

---

## 🤝 Crear tu propia skill

Copia el template y completa los campos:

```
skills/tu-skill/
  ├── SKILL.md          ← Instrucciones para el agente (frontmatter YAML obligatorio)
  └── references/       ← (Opcional) Docs profundas para progressive disclosure
```

El frontmatter mínimo requerido:

```yaml
---
name: tu-skill
description: "Usar cuando [condición específica]."
category: core | design | agent
status: stable | beta | experimental | deprecated | draft
risk_level: safe | critical
---
```

Contribuciones via Pull Request son bienvenidas. El CI valida automáticamente el frontmatter. 🟢

---

## Licencia

MIT — [Fabian Melo Maciel](https://github.com/fabianmelomaciel)
