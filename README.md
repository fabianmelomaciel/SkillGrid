<div align="center">

# 🧠 SkillGrid

### Tu agente de IA, con **disciplina**. · Your AI agent, with **discipline**.

*44 skills · memoria persistente · auto-auditoría · 4 IDEs · hasta −90% de tokens · gate en cada commit*

[![License: MIT](https://img.shields.io/badge/license-MIT-b6f36b?style=flat-square&color=0a1206&logo=github)](LICENSE)
[![Skills](https://img.shields.io/badge/skills-44-b6f36b?style=flat-square&color=0a1206)](catalog.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-b6f36b?style=flat-square&color=0a1206)](https://github.com/fabianmelomaciel/SkillGrid/pulls)
[![GitHub stars](https://img.shields.io/github/stars/fabianmelomaciel/SkillGrid?style=flat-square&logo=github&color=b6f36b)](https://github.com/fabianmelomaciel/SkillGrid/stargazers)
[![CI](https://img.shields.io/github/actions/workflow/status/fabianmelomaciel/SkillGrid/ci.yml?branch=main&label=CI&style=flat-square)](https://github.com/fabianmelomaciel/SkillGrid/actions/workflows/ci.yml)
[![Security Pentest](https://img.shields.io/github/actions/workflow/status/fabianmelomaciel/SkillGrid/pentest.yml?branch=main&label=Security%20Pentest&style=flat-square&color=dc2626)](https://github.com/fabianmelomaciel/SkillGrid/actions/workflows/pentest.yml)

</div>

<div align="center">

<img src="https://raw.githubusercontent.com/fabianmelomaciel/SkillGrid/main/assets/hero-skillgrid.svg" width="900" alt="SkillGrid: un comando y tu agente de IA queda con disciplina" />

</div>

---

## 🇬🇧 English

**SkillGrid turns your AI agent into a disciplined teammate.** It's a portable set of plain-text skills (`SKILL.md`) that teaches agents to activate, execute and stop efficiently — across **opencode, Claude Code, Cursor and antigravity**. No lock-in: it's just files.

### What it does
- 🔁 **Closed repair loop** — agents audit and fix their own failures, autonomously.
- 🧠 **Persistent memory** — a local `CODEX.md` the agent writes and re-reads, so you never re-explain your project.
- 🧭 **Tracked evolution** — every bug becomes a row in `EVOLUCION.md` with evidence; the gate won't close it without proof.
- 🛡️ **Security built-in** — a 5-job pentest pipeline runs on every PR (secrets, SAST, SCA, IaC, supply chain).
- 📦 **Pick a profile** — install only the skills your team needs.

### ⚡ TL;DR
- **44 skills, one slash away** — `/agente-ideas`, `/auditor-de-seguridad`, `/audit-loop`… and any skill with `@brainstorming`.
- **Self-auditing** — its own gate + security on every PR.
- **Memory + efficiency** — local `CODEX.md` + CodeGraph: up to **−90%** tokens per session.

| | Without SkillGrid | With SkillGrid |
|---|---|---|
| **Context** | Re-explain your project every session | The agent reads its `CODEX.md` and continues |
| **Quality** | Bugs reach `main` | Tests + gate before every commit |
| **Security** | Audits when you remember | 5 security jobs on every PR |
| **Cost** | Full context every task | ~1.4K tokens/session, −90% with CodeGraph |

### 🚀 First steps
Once installed, type `/agente-ideas` (decide), `/auditor-de-seguridad` (audit) or `/audit-loop` (audit → fix → re-audit). Skills load with `@brainstorming`, `@hack-audit` or their exact ID.

---

## 🇪🇸 Español

**SkillGrid convierte a tu agente de IA en un compañero disciplinado.** Es un sistema portable de skills en texto plano (`SKILL.md`) que le enseña a tus agentes a activarse, ejecutar y detenerse eficientemente — en **opencode, Claude Code, Cursor y antigravity**. Sin lock-in: son solo archivos.

### Qué hace
- 🔁 **Bucle de reparación cerrado** — los agentes auditan y corrigen sus fallos en ciclos autónomos.
- 🧠 **Memoria persistente** — un `CODEX.md` local que el agente escribe y relee, para no repetirte el contexto de tu proyecto.
- 🧭 **Evolución con evidencia** — cada error queda como fila en `EVOLUCION.md`; el gate no deja cerrarla sin prueba.
- 🛡️ **Seguridad incorporada** — pipeline de pentest de 5 jobs en cada PR (secretos, SAST, SCA, IaC, supply chain).
- 📦 **Elegí un perfil** — instalá solo las skills que tu equipo necesita.

### ⚡ TL;DR
- **44 skills, a un slash** — `/agente-ideas`, `/auditor-de-seguridad`, `/audit-loop`… y cualquier skill con `@brainstorming`.
- **Se audita solo** — su propio gate + seguridad en cada PR.
- **Memoria y eficiencia** — `CODEX.md` local + CodeGraph: hasta **−90%** de tokens por sesión.

| | Sin SkillGrid | Con SkillGrid |
|---|---|---|
| **Contexto** | Repetís el proyecto en cada sesión | El agente lee su `CODEX.md` y sigue |
| **Calidad** | Bugs que llegan a `main` | Tests + gate antes de cada commit |
| **Seguridad** | Auditoría cuando te acordás | 5 jobs de seguridad en cada PR |
| **Costo** | Contexto completo en cada tarea | ~1.4K tok/sesión, −90% con CodeGraph |

### 🚀 Primeros pasos
Con las skills instaladas, escribí `/agente-ideas` (decidir), `/auditor-de-seguridad` (auditar) o `/audit-loop` (auditar → corregir → re-auditar). Las skills se cargan con `@brainstorming`, `@hack-audit` o el ID exacto.

---

## ⚡ Install

Auto-detects **opencode, antigravity, Claude Code and Cursor** and configures them. Default profile: `all` (44 skills).

### Windows (PowerShell)
```powershell
irm https://raw.githubusercontent.com/fabianmelomaciel/SkillGrid/main/remote-install.ps1 | iex
```

### Linux / macOS (Bash)
```bash
curl -fsSL https://raw.githubusercontent.com/fabianmelomaciel/SkillGrid/main/remote-install.sh | bash
```

### npm
```bash
npm install @fabianmelomaciel/skillgrid
# → node_modules/@fabianmelomaciel/skillgrid/ (install.sh, install.ps1, skills/, catálogos)
```

> 💡 **For serious setups, don't pipe a live `main`:** download, read, then run.
> ```powershell
> irm https://raw.githubusercontent.com/fabianmelomaciel/SkillGrid/main/remote-install.ps1 -OutFile install.ps1
> Get-Content install.ps1   # read it first
> .\install.ps1
> ```

<details>
<summary><strong>📦 Perfiles / Profiles (partial install)</strong></summary>

*   `minimal`: solo gates mínimos de seguridad (6 skills, ~14K tokens).
*   `standard`: flujo de desarrollo del día a día (16 skills, ~36K tokens).
*   `superpowers`: metodología completa de desarrollo (22 skills, ~45K tokens).
*   `testing`: enfocado en QA: E2E, TDD y debugging (4 skills, ~8K tokens).
*   `strict`: suite completa con todos los auditores activos (43 skills, ~94K tokens).

```bash
./install.sh --profile standard      # Bash
.\install.ps1 -Profile standard      # PowerShell
```
</details>

<details>
<summary><strong>🧩 IDE Rules — Cursor / Copilot</strong></summary>

Genera reglas optimizadas dentro de tu proyecto:
```powershell
.\install.ps1 -ProjectDir "C:\path\tu-proyecto" -Language typescript
```
</details>

---

## 🗺️ Catalog

<details open>
<summary><strong>📚 Las 44 skills completas · All 44 skills</strong></summary>

<!-- catalog:begin -->
*~Tokens = contexto que consume la skill al activarse (medido del frontmatter de cada `SKILL.md`). Las 44 completas, en [catalog.json](catalog.json).*

### 🔧 Desarrollo Core (29 Skills)

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
| `humanizer` | Remove signs of AI-generated writing from text. Use when editing or reviewing text to… | 2400 |
| `incremental-implementation` | Delivers changes incrementally. Use when implementing any feature or change that touches… | 2491 |
| `issue-triage` | Classifies open GitHub issues by heuristics (keywords, template matching) and proposes… | 597 |
| `mcp-configurator` | Configura servidores del Protocolo de Contexto de Modelos (MCP) para extender las… | 2059 |
| `performance-profiler` | Measure-first performance engineering. Use before merging features that touch UI, API… | 2169 |
| `playwright-testing` | Use when designing, writing, debugging, or auditing Playwright E2E and component tests. | 1344 |
| `ponytail` | Úsalo antes de escribir código nuevo para forzar la opción más chica posible (YAGNI,… | 467 |
| `preinstall-audit` | Audits third-party skills and MCP servers from disk before installing them — local… | 765 |
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
| `creativo-visual` | Visual Creative Director for AI image generation and optimization. Translates basic… | 3494 |
| `emil-kowalski-design` | Use when building, reviewing, or auditing any UI component to apply Emil Kowalski's… | 2286 |
| `github-premium-aesthetics` | Implements cutting-edge GitHub/Vercel-inspired UI patterns including Bento grids,… | 2359 |

### 🤖 Agentes Especializados (12 Agents)

| Skill | Para qué | ~Tokens |
|---|---|---:|
| `agente-devops` | Úsalo para auditar, generar y gestionar configuraciones seguras de contenedores Docker… | 1916 |
| `agente-ideas` | Úsalo cuando el CEO o otro agente plantea una decisión técnica compleja, ambigua o de… | 3376 |
| `audit-loop` | Orquesta el bucle cerrado: auditar → corregir → re-auditar → iterar. Se activa como… | 2730 |
| `auditor-de-marketing` | Úsalo para auditar el crecimiento del sitio web, SEO on-page, marcado de esquema,… | 3970 |
| `auditor-de-seguridad` | Úsalo al finalizar el desarrollo, antes del despliegue, después de la generación de… | 3752 |
| `cyber-neo` | Análisis integral de ciberseguridad para cualquier proyecto local. Escanea… | 4153 |
| `execution-runtime` | Gestiona entornos de ejecución seguros y aislados (como Docker, WASM o microVMs) para… | 950 |
| `gestor-documental` | Úsalo para diseñar, auditar, dar formato y validar documentos técnicos y científicos de… | 1738 |
| `hack-audit` | Pentest autónomo con explotación real: mapea el código y toda la superficie local/de… | 5495 |
| `optimizador-finops` | Úsalo para auditar la utilización de recursos computacionales, la eficiencia de las APIs… | 1813 |
| `project-manager` | Agente Project Manager. El CEO da la dirección; el PM planifica, delega, revisa y reporta. | 2800 |
| `prompt-injection-guard` | Defiende contra ataques de inyección de prompts en aplicaciones potenciadas por IA.… | 2834 |
<!-- catalog:end -->

</details>

> ⚠️ **Skills `critical` (6):** `audit-loop`, `auditor-de-seguridad`, `cyber-neo`, `execution-runtime`, `hack-audit` y `prompt-injection-guard` ejecutan herramientas reales (bash, escaneos, exploits). Usalas **solo con autorización explícita y en entornos no productivos**.

---

## 🔒 Security Pipeline

SkillGrid audita su propio código con un pipeline de CI dedicado (`.github/workflows/pentest.yml`), en cada **Pull Request hacia `main`** y **cada domingo**.

| Job | Herramienta | Cobertura |
|:---|:---|:---|
| 🔑 **Secrets** | TruffleHog + Gitleaks | Secretos por entropía y patrones en todo el historial git |
| 🧪 **SAST** | Semgrep `p/owasp-top-ten` | Vulnerabilidades de código estático (OWASP Top 10) |
| 📦 **SCA** | Trivy `fs` | CVEs en dependencias — bloquea en CRITICAL |
| 🏗️ **IaC** | Checkov | Malas configuraciones en `.github/workflows/` |
| 🔗 **Supply Chain** | OpenSSF Scorecard | 18 prácticas de seguridad del proyecto |

> Resultados subidos como **SARIF** a **Security → Code Scanning** para trazabilidad centralizada.

---

## ❓ FAQ

*   **Requisitos / Requirements?** — Node.js ≥ 18 y git. Nada más: las skills son texto.
*   **¿Funciona sin conexión? / Offline?** — Sí, una vez instaladas. Solo necesitás red para instalar o actualizar.
*   **¿Cuánto cuesta? / Cost?** — MIT (gratis). Pagás solo los tokens de tu modelo.
*   **¿Cómo actualizo? / Update?** — Volvé a correr el mismo comando de instalación; reinstala sobre lo anterior.
*   **¿Qué son las skills `critical`?** — Las 6 que ejecutan herramientas reales. Solo con autorización y entorno no productivo.
*   **¿Puede el agente commitear cualquier cosa?** — No: el hook `pre-commit` valida secretos, tests borrados, skips nuevos y el `gate`.

---

## 🙏 Atribución / Attribution

*   Las skills con `category: core` adaptan skills públicos de **[Anthropic](https://github.com/anthropics)** (`brainstorming`, `systematic-debugging`, `test-driven-development`, `writing-plans`…). Detalle en [CONTRIBUTING.md](CONTRIBUTING.md).
*   Guards del pipeline (`no_new_skips`, `no_deleted_tests`) inspirados en **[intrepideai/donegate](https://github.com/intrepideai/donegate)**.

---

<div align="center">

<img src="https://raw.githubusercontent.com/fabianmelomaciel/SkillGrid/main/assets/star-card.svg" width="620" alt="SkillGrid en GitHub" />

</div>

## 📄 Licencia / License

**MIT** — ver [CHANGELOG.md](CHANGELOG.md) para el historial · [Fabian Melo Maciel](https://github.com/fabianmelomaciel).
