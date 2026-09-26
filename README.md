<div align="center">
# 🧠 SkillGrid

### **El copiloto de IA que trabaja *con* tu cabeza, no en contra.**

*43 skills · 270 tests · gate 7s · 4 plataformas · hasta −90% ahorro de tokens · 5 jobs de seguridad en CI*

[![License: MIT](https://img.shields.io/badge/license-MIT-6366f1?style=flat-square)](LICENSE)
[![Skills](https://img.shields.io/badge/skills-43-22c55e?style=flat-square)](catalog.json)
[![Tests](https://img.shields.io/badge/tests-270-3b82f6?style=flat-square)](package.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-f59e0b?style=flat-square)](https://github.com/fabianmelomaciel/SkillGrid/pulls)
[![GitHub stars](https://img.shields.io/github/stars/fabianmelomaciel/SkillGrid?style=flat-square&logo=github)](https://github.com/fabianmelomaciel/SkillGrid/stargazers)
[![CI](https://img.shields.io/github/actions/workflow/status/fabianmelomaciel/SkillGrid/ci.yml?branch=main&label=CI&style=flat-square)](https://github.com/fabianmelomaciel/SkillGrid/actions/workflows/ci.yml)
[![Security Pentest](https://img.shields.io/github/actions/workflow/status/fabianmelomaciel/SkillGrid/pentest.yml?branch=main&label=Security%20Pentest&style=flat-square&color=dc2626)](https://github.com/fabianmelomaciel/SkillGrid/actions/workflows/pentest.yml)

**[⚡ Instalación Rápida](#-instalación-en-10-segundos) | [🛠️ Uso Avanzado](#-instalación-avanzada-y-perfiles) | [🔒 Security Pipeline](#-security-pipeline) | [📄 Changelog](CHANGELOG.md)**

⭐ **[Dale una estrella al repo](https://github.com/fabianmelomaciel/SkillGrid/stargazers)** si te resulta útil — ayuda a que más gente lo encuentre.
</div>

---

## ¿Qué es SkillGrid?

SkillGrid es un **sistema de trabajo autónomo** de instrucciones portables (`SKILL.md`) que enseña a tus agentes de IA a activarse, ejecutar y detenerse eficientemente, optimizando la precisión y reduciendo costos.

*   🔁 **Bucle de reparación cerrado** — los agentes auditan y corrigen fallos en ciclos autónomos, sin que tengas que intervenir.
*   🧠 **CODEX, memoria persistente entre sesiones.** Un `CODEX.md` local (nunca se comitea) que el agente escribe y relee en cada tarea, para no obligarte a repetir el contexto de tu proyecto de una sesión a otra.
*   🛡️ Auditoría integrada de **NVIDIA SkillSpector** en CI + pentest automatizado en cada PR — la seguridad viene incorporada, no como agregado.
*   📦 Instalás solo el perfil de skills que tu equipo necesita, nada más.

### ⚡ TL;DR

*   **43 skills listas para invocar** — `/brainstorming`, `/agente-ideas`, `/auditor-de-seguridad`… en opencode, Claude Code, Cursor y antigravity.
*   **Se audita a sí mismo** — su propio `gate` (43 skills, 270 tests) y un pipeline de seguridad en cada PR.
*   **Memoria y eficiencia** — `CODEX.md` local + CodeGraph: hasta **−90%** de tokens por sesión de trabajo.

| | Sin SkillGrid | Con SkillGrid |
|---|---|---|
| **Contexto** | Repetís el proyecto en cada sesión | El agente lee su `CODEX.md` y sigue |
| **Calidad** | Bugs que llegan a `main` | Tests + `gate` antes de cada commit |
| **Seguridad** | Auditoría cuando te acordás | SkillSpector + 5 jobs de seguridad en cada PR |
| **Costo** | Contexto completo en cada tarea | Catálogo de ~1.4K tok/sesión, −90% con CodeGraph |

---

## ⚡ Instalación en 10 segundos

El instalador autodetecta opencode, antigravity, Claude Code y Cursor, y los configura de inmediato. Por defecto instala el perfil `all` (43 skills).

### Windows (PowerShell)
```powershell
irm https://raw.githubusercontent.com/fabianmelomaciel/SkillGrid/main/remote-install.ps1 | iex
```

### Linux / macOS (Bash)
```bash
curl -fsSL https://raw.githubusercontent.com/fabianmelomaciel/SkillGrid/main/remote-install.sh | bash
```

> 💡 **Para entornos serios, no pegues `main` en vivo:** bajá el instalador, revisalo y ejecutalo:
> ```powershell
> irm https://raw.githubusercontent.com/fabianmelomaciel/SkillGrid/main/remote-install.ps1 -OutFile install.ps1
> Get-Content install.ps1   # leelo antes de correrlo
> .\install.ps1
> ```

### 🚀 Primeros pasos

Con las skills instaladas, escribí su nombre en tu agente:

| Querés… | Invocación |
|---|---|
| Decidir algo complejo de tu proyecto | `/agente-ideas` |
| Auditar seguridad (OWASP Top 10, secretos, deps) | `/auditor-de-seguridad` |
| Diseñar una feature antes de tocar código | `/brainstorming` |
| Cerrar el ciclo auditar → corregir → re-auditar | `/audit-loop` |

---

## 🛠️ Instalación Avanzada y Perfiles

<details>
<summary><strong>📦 Perfiles Disponibles (Instalación Parcial)</strong></summary>

Podés seleccionar perfiles específicos para limitar el consumo de tokens y adecuar el entorno de tu agente:

*   `minimal`: Solo gates mínimos de seguridad (6 skills, ~14K tokens).
*   `standard`: Flujo de desarrollo completo del día a día (16 skills, ~36K tokens).
*   `superpowers`: Metodología completa de desarrollo (22 skills, ~45K tokens).
*   `testing`: Enfocado en QA: E2E, TDD y debugging (4 skills, ~8K tokens).
*   `strict`: Suite completa con todos los auditores activos (43 skills, ~94K tokens).

```bash
# Ejemplo en Bash
./install.sh --profile standard

# Ejemplo en PowerShell
.\install.ps1 -Profile standard
```
</details>

<details>
<summary><strong>IDE Rules (Cursor / Copilot)</strong></summary>

Genera automáticamente archivos de reglas optimizados en tu proyecto local:
```powershell
.\install.ps1 -ProjectDir "C:\ruta\tu-proyecto" -Language typescript
```
</details>

---

## 🗺️ Catálogo de Skills Destacadas

<!-- catalog:begin -->
*~Tokens = contexto que consume la skill al activarse (medido del frontmatter de cada `SKILL.md`). Las 43 completas, en [catalog.json](catalog.json).*

### 🔧 Desarrollo Core (28 Skills)

| Skill | Para qué | ~Tokens |
|---|---|---:|
| `a2a-orchestrator` | Orquesta flujos de trabajo multi-agente usando el protocolo Agent-to-Agent (A2A), el… | 2459 |
| `brainstorming` | You MUST use this before any creative work - creating features, building components,… | 3054 |
| `changelog-drafter` | Generates CHANGELOG.md drafts from git log — post-tag, by date range, or by commit count… | 911 |
| `code-simplification` | Simplifies code for clarity. Use when refactoring code for clarity without changing… | 3786 |
| `context-engineering` | Optimizes agent context setup. Use when starting a new session, when agent output… | 3347 |
| `db-schema-detector` | Detects local databases and generates cached schemas in CodeGraph to save tokens and… | 1128 |
| `dispatching-parallel-agents` | Use when facing 2+ independent tasks that can be worked on without shared state or… | 2012 |
| `executing-plans` | Use when you have a written implementation plan to execute in a separate session with… | 748 |
| `finishing-a-development-branch` | Use when implementation is complete, all tests pass, and you need to decide how to… | 2112 |
| `headroom` | Reduce el uso de tokens del LLM comprimiendo el contexto, logs, salidas de herramientas… | 869 |
| `humanizer` | Remove signs of AI-generated writing from text. Use when editing or reviewing text to… | 2000 |
| `incremental-implementation` | Delivers changes incrementally. Use when implementing any feature or change that touches… | 2491 |
| `issue-triage` | Classifies open GitHub issues by heuristics (keywords, template matching) and proposes… | 597 |
| `mcp-configurator` | Configura servidores del Protocolo de Contexto de Modelos (MCP) para extender las… | 2059 |
| `performance-profiler` | Measure-first performance engineering. Use before merging features that touch UI, API… | 1876 |
| `playwright-testing` | Use when designing, writing, debugging, or auditing Playwright E2E and component tests. | 1117 |
| `ponytail` | Úsalo antes de escribir código nuevo para forzar la opción más chica posible (YAGNI,… | 467 |
| `receiving-code-review` | Use when receiving code review feedback, before implementing suggestions, especially if… | 1927 |
| `requesting-code-review` | Use when completing tasks, implementing major features, or before merging to verify work… | 843 |
| `router` | Dynamically load specific skills based on the user request by querying catalog-lite.json… | 800 |
| `spec-driven-development` | Creates specs before coding. Use when starting a new project, feature, or significant… | 2206 |
| `subagent-driven-development` | Use when executing implementation plans with independent tasks in the current session | 3480 |
| `systematic-debugging` | Use when encountering any bug, test failure, or unexpected behavior, before proposing… | 2955 |
| `test-driven-development` | Use when implementing any feature or bugfix, before writing implementation code | 2444 |
| `using-git-worktrees` | Use when starting feature work that needs isolation from current workspace or before… | 2343 |
| `verification-before-completion` | Use when about to claim work is complete, fixed, or passing, before committing or… | 1586 |
| `writing-plans` | Use when you have a spec or requirements for a multi-step task, before touching code | 1870 |
| `writing-skills` | Use when creating new skills, editing existing skills, or verifying skills work before… | 2751 |

### 🎨 Design Engineering (3 Skills)

| Skill | Para qué | ~Tokens |
|---|---|---:|
| `creativo-visual` | Visual Creative Director for AI image generation and optimization. Translates basic… | 3436 |
| `emil-kowalski-design` | Use when building, reviewing, or auditing any UI component to apply Emil Kowalski's… | 1777 |
| `github-premium-aesthetics` | Implements cutting-edge GitHub/Vercel-inspired UI patterns including Bento grids,… | 1649 |

### 🤖 Agentes Especializados (12 Agents)

| Skill | Para qué | ~Tokens |
|---|---|---:|
| `agente-devops` | Úsalo para auditar, generar y gestionar configuraciones seguras de contenedores Docker… | 1916 |
| `agente-ideas` | Agente experto en deliberación y consenso. Resuelve decisiones complejas o ambiguas con… | 1770 |
| `audit-loop` | Orquesta el bucle cerrado: auditar → corregir → re-auditar → iterar. Se activa como… | 2730 |
| `auditor-de-marketing` | Úsalo para auditar el crecimiento del sitio web, SEO on-page, marcado de esquema,… | 3738 |
| `auditor-de-seguridad` | Úsalo al finalizar el desarrollo, antes del despliegue, después de la generación de… | 3435 |
| `cyber-neo` | Análisis integral de ciberseguridad para cualquier proyecto local. Escanea… | 4153 |
| `execution-runtime` | Gestiona entornos de ejecución seguros y aislados (como Docker, WASM o microVMs) para… | 950 |
| `gestor-documental` | Úsalo para diseñar, auditar, dar formato y validar documentos técnicos y científicos de… | 1738 |
| `hack-audit` | Pentest autónomo con explotación real: mapea el código y toda la superficie local/de… | 5180 |
| `optimizador-finops` | Úsalo para auditar la utilización de recursos computacionales, la eficiencia de las APIs… | 1813 |
| `project-manager` | Agente Project Manager. El CEO da la dirección; el PM planifica, delega, revisa y reporta. | 2800 |
| `prompt-injection-guard` | Defiende contra ataques de inyección de prompts en aplicaciones potenciadas por IA.… | 2834 |
<!-- catalog:end -->

> ⚠️ **Skills `critical` (6):** `audit-loop`, `auditor-de-seguridad`, `cyber-neo`, `execution-runtime`, `hack-audit` y `prompt-injection-guard` ejecutan herramientas reales (bash, escaneos, exploits). Usalas **solo con autorización explícita y en entornos no productivos**.

---

## 🔒 Security Pipeline

SkillGrid aplica sus propias skills de seguridad a sí mismo mediante un pipeline de CI dedicado (`.github/workflows/pentest.yml`). Se ejecuta automáticamente en cada **Pull Request hacia `main`** y de forma **programada cada domingo**.

<details>
<summary><strong>🔍 Ver los 5 jobs del pipeline</strong></summary>

| Job | Herramienta | Cobertura |
|:---|:---|:---|
| 🔑 **Secrets Detection** | TruffleHog + Gitleaks | Secretos por entropía y patrones en todo el historial git |
| 🧪 **SAST** | Semgrep `p/owasp-top-ten` | Vulnerabilidades de código estático (OWASP Top 10) |
| 📦 **SCA** | Trivy `fs` | CVEs en dependencias — bloquea en severidad CRITICAL |
| 🏗️ **IaC** | Checkov | Malas configuraciones en `.github/workflows/` |
| 🔗 **Supply Chain** | OpenSSF Scorecard | Puntuación de 18 prácticas de seguridad del proyecto |

> Todos los resultados se suben como **SARIF** a la pestaña **Security → Code Scanning** de GitHub para trazabilidad centralizada.
</details>

---

## 📈 Ahorro de Tokens (hasta −90%) con CodeGraph

**CodeGraph** (obligatoria, corre sola al arrancar cada skill) y **Graphify** (capa opcional con `graphify query` / `graphify path`) son herramientas distintas: podés usar solo CodeGraph.

SkillGrid combina **CodeGraph** (indexación local) con políticas estrictas de eficiencia para minimizar el context flooding:

*   **Reducción del contexto (≈ −90% en proyectos grandes):** lee solo el código necesario.
*   **Políticas de Refactorización:** Segmentación automática de archivos que superen las 300 líneas.
*   **Filtros de Seguridad:** Evita re-lecturas duplicadas y bucles infinitos de ejecución.

| Escenario | Full Scan (Sin CodeGraph) | Con CodeGraph + SkillGrid | Ahorro |
|:---|:---:|:---:|:---:|
| **Proyecto Grande (10K+ arch., 144MB)** | 36M tokens (~$108.41 USD) | 3.6M tokens (~$10.85 USD) | **-89.99%** |

*Escenario ilustrativo basado en un proyecto de referencia con y sin CodeGraph; el ahorro real varía según el tamaño y estructura de tu repo.*

<details>
<summary><strong>💡 Tip: baja el umbral de auto-compact</strong></summary>

Por defecto Claude Code compacta el contexto recién al ~83-90% de uso, momento en el que ya gastaste una cantidad enorme de tokens leyendo/escribiendo antes de comprimir. Bajalo a un valor más conservador (60-70%) agregando esto a tu `~/.claude/settings.json` (afecta todas tus sesiones, no solo este proyecto):
```json
{ "env": { "CLAUDE_AUTOCOMPACT_PCT_OVERRIDE": "65" } }
```
Esto fuerza la compactación antes, evitando quedarte sin presupuesto a mitad de una tarea larga.
</details>

---

## 🔍 Grafo de Conocimiento con Graphify (opcional)

Capa opcional sobre CodeGraph: convierte el proyecto en un grafo consultable (`graphify query`, `graphify path`) con reglas de IDE propias, reduciendo hasta un **70%** los tokens de entrada en consultas puntuales. Los archivos autogenerados (`graphify-out/`) ya están excluidos en `.gitignore` y `.graphifyignore`.

<details>
<summary><strong>⚡ Instalación, uso e integración con IDEs</strong></summary>

1. **Instalar CLI:**
   ```bash
   uv tool install graphifyy
   # o alternativamente: pip install graphifyy
   ```
2. **Generar Grafo Local:**
   ```bash
   graphify update .
   ```
3. **Consultar en CLI:**
   ```bash
   graphify query "¿Cómo se inicializa el router de SkillGrid?" --budget 1500
   ```

**Reglas de IDE** — instala la lectura automática del grafo para tu asistente:
*   **Antigravity:** `graphify antigravity install`
*   **VS Code (Copilot):** `graphify vscode install`
*   **Cursor:** `graphify cursor install`
*   **Claude Code:** `graphify claude install`
</details>

---

## 🔄 Ralph Loop: Ejecución Autónoma

<details>
<summary><strong>Orquestador para ejecutar agentes de forma iterativa sobre un archivo de tareas (<code>task.md</code>)</strong></summary>

```powershell
.\scripts\ralph-loop.ps1 -AgentCommand "antigravity-ide" -TaskFile "task.md"
```
</details>

---

## ❓ FAQ

*   **¿Requisitos?** — Node.js ≥ 18 y git. Nada más: las skills son texto.
*   **¿Funciona sin conexión?** — Sí, una vez instaladas. Solo necesitás red para instalar o actualizar.
*   **¿Cuánto cuesta?** — SkillGrid es MIT (gratis). Pagás solo los tokens de tu modelo.
*   **¿Cómo actualizo?** — Volvé a correr el mismo comando de instalación; reinstala sobre lo anterior.
*   **¿Qué son las skills `critical`?** — Las 6 que ejecutan herramientas reales (ver recuadro en el catálogo). Solo con autorización y entorno no productivo.
*   **¿Puede el agente commitear cualquier cosa?** — No: el hook `pre-commit` valida secretos, tests borrados, skips nuevos y el `gate` antes de cada commit.

---

## 🙏 Atribución

*   `skills/core/` contiene adaptaciones de skills públicos de **[Anthropic](https://github.com/anthropics)** (`brainstorming`, `systematic-debugging`, `test-driven-development`, `writing-plans`, etc.) — detalle en [CONTRIBUTING.md](CONTRIBUTING.md).
*   Guards de calidad del pipeline (`no_new_skips`, `no_deleted_tests`) inspirados en **[intrepideai/donegate](https://github.com/intrepideai/donegate)**.

---

## 📄 Historial de Cambios y Licencia

*   Para consultar los detalles de cada versión, revisa el [CHANGELOG.md](CHANGELOG.md).
*   **Licencia:** MIT — [Fabian Melo Maciel](https://github.com/fabianmelomaciel).
