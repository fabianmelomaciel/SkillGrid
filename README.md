<div align="center">
<!-- OpenGraph: https://raw.githubusercontent.com/fabianmelomaciel/OpenSkills/main/.opengraph/og-image.png -->

# 🧠 OpenSkills

**El copiloto de IA que trabaja *con* tu cabeza, no en contra.**

*26 skills especializadas para opencode · antigravity · Claude Code · Cursor · Copilot*

[![License: MIT](https://img.shields.io/badge/license-MIT-6366f1?style=flat-square)](LICENSE)
[![Skills](https://img.shields.io/badge/skills-26-22c55e?style=flat-square)](catalog.json)
[![CI](https://img.shields.io/github/actions/workflow/status/fabianmelomaciel/OpenSkills/validate.yml?branch=main&style=flat-square&label=CI)](https://github.com/fabianmelomaciel/OpenSkills/actions)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-f59e0b?style=flat-square)](https://github.com/fabianmelomaciel/OpenSkills/pulls)
[![GitHub stars](https://img.shields.io/github/stars/fabianmelomaciel/OpenSkills?style=flat-square&logo=github)](https://github.com/fabianmelomaciel/OpenSkills/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/fabianmelomaciel/OpenSkills?style=flat-square&logo=github)](https://github.com/fabianmelomaciel/OpenSkills/network/members)
[![GitHub contributors](https://img.shields.io/github/contributors/fabianmelomaciel/OpenSkills?style=flat-square)](https://github.com/fabianmelomaciel/OpenSkills/graphs/contributors)

<br>

### [⚡ ¡Acelera tu Agente en 10 Segundos! ⚡](#⚡-instalación-en-10-segundos)

</div>

---

## ¿Qué es OpenSkills?

OpenSkills es una colección de **skills portables** — instrucciones estructuradas que transforman tu asistente de IA en un equipo de desarrollo especializado de primer nivel. Cada skill le enseña al agente exactamente *cuándo activarse*, *qué hacer* y *cuándo detenerse* para lograr el resultado óptimo.

No es solo una lista de prompts. Es un **sistema de trabajo autónomo y eficiente** que incluye:

- 🔁 **Bucle de Reparación Automática** — Ahorra horas de depuración. Tus agentes auditan y corrigen fallos en ciclos autónomos cerrados.
- 🧠 **Memoria Persistente (CODEX)** — Cero fricción en contexto. El agente aprende los secretos de tu proyecto y nunca te hace repetir explicaciones.
- 🛡️ **Seguridad Bajo Control (Taxonomía de Riesgo)** — Duerme tranquilo. El agente sabe qué cambios aplicar de forma segura y cuándo pedir tu autorización.
- 📦 **Instalación Modular por Roles** — Descarga solo lo que tu equipo necesita (DevOps, Diseño, Gestión, Marketing).

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

## 📈 Ahorro Masivo de Tokens con CodeGraph y Refactorización

OpenSkills se integra de forma nativa con **CodeGraph** y promueve reglas de diseño modular para eliminar por completo el consumo innecesario de tokens en tareas de desarrollo e investigación de código. Olvídate de que tu agente lea archivos completos una y otra vez.

### 🚀 Principales Beneficios y Políticas de Eficiencia
- **Hasta 95% de Ahorro en Tokens:** Al usar indexación semántica local en lugar de escaneos completos de archivos, la huella de contexto se reduce al mínimo imprescindible.
- **Cero Fricción (Auto-Sincronización):** Se instala y sincroniza en segundo plano automáticamente. El agente siempre tiene un mapa actualizado de tu codebase sin que tengas que mover un dedo.
- **Refactorización Inteligente de Archivos Largos (Regla Crítica):**
  - Si un archivo supera las **300 líneas** o es modificado/leído repetidamente (más de 2-3 veces en una misma sesión), el agente tiene la directriz estricta de **refactorizar y subdividirlo** en submódulos o helpers pequeños.
  - Esto garantiza que futuras lecturas requieran fragmentos mínimos de contexto, optimizando el presupuesto de tokens.
  - Tras cualquier refactorización, se fuerza la auto-sincronización (`codegraph sync`) para mantener el mapa de dependencias y código actualizado.
- **Respuestas Inmediatas:** Al evitar el "context flooding" en el prompt, tu asistente de IA responde mucho más rápido y con mayor precisión (evitando alucinaciones).
- **Control de Costos (FinOps):** Compara el consumo de tokens y visualiza tu ahorro acumulado en tiempo real desde tu propio dashboard local.

### 📊 Comparativa Real de Consumo y Costos por Plataforma

Medido el 2026-06-04 sobre **300 archivos** (~1.47 MB de código fuente):

| Métrica | Full Scan (sin CodeGraph) | Con CodeGraph | Reducción |
|---------|:------------------------:|:-------------:|:---------:|
| **Tokens de contexto** | 368,298 | 38,830 | **−89.5%** |

| Proveedor / Plataforma | Modelo | Costo Full Scan | Costo con CodeGraph | Ahorro |
| :--- | :--- | ---: | ---: | ---: |
| **Google (Antigravity)** | Gemini 1.5 Flash | \$0.028 | \$0.003 | **89.5%** |
| **Google (Antigravity / Cursor)** | Gemini 1.5 Pro | \$0.460 | \$0.049 | **89.5%** |
| **Anthropic (Claude Code)** | Claude 3.5 Sonnet | \$1.105 | \$0.116 | **89.5%** |
| **OpenAI (Cursor / Copilot)** | GPT-4o | \$0.921 | \$0.097 | **89.5%** |

> [!NOTE]
> **¿Por qué Gemini ahorra aún más?**
> Con Gemini (Google), el beneficio es doble: al reducir el contexto por debajo del límite de 128K tokens, la tarifa por millón de tokens se reduce a la mitad. ¡Menos tokens a un precio unitario inferior!

---

## 🔁 Handoff de sesión (Project Manager Multi-IDE)

El agente `project-manager` está diseñado para que puedas pausar y retomar el trabajo entre múltiples IDEs y herramientas de IA (tales como opencode, Claude Code, Cursor, Copilot, Open WebUI, etc.) sin perder el estado ni "recargar" el contexto de forma manual.

Al finalizar una petición o detenerse, el agente deja un bloque **SESSION HANDOFF** estructurado que cualquier intérprete de IA puede leer directamente para reanudar el trabajo:

- **Git Context:** Rama activa, commits recientes y archivos modificados.
- **Working Set:** Lista mínima de archivos de trabajo activos y rangos de líneas bajo modificación.
- **CodeGraph Status:** Estado de sincronización del índice.
- **Token Stats:** Ahorro acumulado a partir de `token_usage_comparison.json`.
- **Próximos pasos ordenados:** Acciones concretas que debe realizar el siguiente agente.

### 📊 Dónde se guardan los datos de tokens

El instalador puede generar una comparativa estimada en:

- `$env:OPENSKILLS_SCRATCH\token_usage_comparison.json` (si configuraste la variable)
- o un `scratch/token_usage_comparison.json` cerca del root donde corre el instalador

Ese JSON incluye, por proyecto: `baseline_full_scan_tokens`, `codegraph_context_tokens`, `estimated_savings_tokens` y `savings_percentage`.

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
