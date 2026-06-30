<div align="center">
# 🧠 SkillGrid

**El copiloto de IA que trabaja *con* tu cabeza, no en contra.**

*43 skills · 226 tests · 4 plataformas · ~90% ahorro de tokens*

[![License: MIT](https://img.shields.io/badge/license-MIT-6366f1?style=flat-square)](LICENSE)
[![Skills](https://img.shields.io/badge/skills-43-22c55e?style=flat-square)](catalog.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-f59e0b?style=flat-square)](https://github.com/fabianmelomaciel/SkillGrid/pulls)
[![GitHub stars](https://img.shields.io/github/stars/fabianmelomaciel/SkillGrid?style=flat-square&logo=github)](https://github.com/fabianmelomaciel/SkillGrid/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/fabianmelomaciel/SkillGrid?style=flat-square&logo=github)](https://github.com/fabianmelomaciel/SkillGrid/network/members)
[![GitHub contributors](https://img.shields.io/github/contributors/fabianmelomaciel/SkillGrid?style=flat-square)](https://github.com/fabianmelomaciel/SkillGrid/graphs/contributors)
[![Default Profile](https://img.shields.io/badge/default%20profile-all-6366f1?style=flat-square)](install.ps1)

<br>

### [⚡ ¡Acelera tu Agente en 10 Segundos! ⚡](#⚡-instalación-en-10-segundos)

</div>

---

## ¿Qué es SkillGrid?

SkillGrid es una colección de **skills portables** — instrucciones estructuradas que transforman tu asistente de IA en un equipo de desarrollo especializado de primer nivel. Cada skill le enseña al agente exactamente *cuándo activarse*, *qué hacer* y *cuándo detenerse* para lograr el resultado óptimo.

No es solo una lista de prompts. Es un **sistema de trabajo autónomo y eficiente** que incluye:

- 🔁 **Bucle de Reparación Automática** — Ahorra horas de depuración. Tus agentes auditan y corrigen fallos en ciclos autónomos cerrados.
- 🧠 **Memoria Persistente (CODEX)** — Cero fricción en contexto. El agente aprende los secretos de tu proyecto y nunca te hace repetir explicaciones.
 - 🛡️ **Seguridad Bajo Control (Taxonomía de Riesgo)** — Duerme tranquilo. El agente sabe qué cambios aplicar de forma segura y cuándo pedir tu autorización. Adicionalmente, las skills son auditadas proactivamente con el escáner de seguridad **NVIDIA SkillSpector**.
- 📦 **Instalación Modular por Roles** — Descarga solo lo que tu equipo necesita (DevOps, Diseño, Gestión, Marketing).

---

## ⚡ Instalación en 10 segundos

> El instalador detecta automáticamente opencode, antigravity, Claude Code y demás — y los configura todos de una vez. Por defecto instala el perfil `all` (43 skills).

### Windows (PowerShell)

```powershell
irm https://raw.githubusercontent.com/fabianmelomaciel/SkillGrid/main/remote-install.ps1 | iex
```

Perfil (opcional):

```powershell
$env:SKILLGRID_PROFILE="all"
irm https://raw.githubusercontent.com/fabianmelomaciel/SkillGrid/main/remote-install.ps1 | iex
```

Nota: el instalador remoto clona una versión fija por seguridad. Si esa versión todavía no soporta perfiles, el valor se ignora automáticamente. Para asegurar perfiles, clonar y ejecutar localmente.

### Linux / macOS (bash)

```bash
curl -fsSL https://raw.githubusercontent.com/fabianmelomaciel/SkillGrid/main/remote-install.sh | bash
```

Perfil (opcional):

```bash
SKILLGRID_PROFILE=all curl -fsSL https://raw.githubusercontent.com/fabianmelomaciel/SkillGrid/main/remote-install.sh | bash
```

Nota: el instalador remoto clona una versión fija por seguridad. Si esa versión todavía no soporta perfiles, el valor se ignora automáticamente. Para asegurar perfiles, clonar y ejecutar localmente.

Eso es todo. El instalador detecta tu setup y copia las skills donde corresponde. ✅

---

## 🛠️ Instalación avanzada

<details>
<summary><strong>Clonar y ejecutar manualmente</strong></summary>

```powershell
# Windows
git clone https://github.com/fabianmelomaciel/SkillGrid.git C:\SkillGrid
cd C:\SkillGrid
.\install.ps1          # Instala las 43 skills (perfil all)
```

```bash
# Linux / macOS
git clone https://github.com/fabianmelomaciel/SkillGrid.git ~/skillgrid
cd ~/skillgrid && bash install.sh          # Instala las 43 skills (perfil all)
```

</details>

<details>
<summary><strong>Perfiles (instalación parcial)</strong></summary>

Por defecto se instalan las **43 skills** completas. Si necesitás una instalación más liviana:

```powershell
.\install.ps1 -Profile minimal   # Gates mínimos
.\install.ps1 -Profile standard  # Flujo completo día a día
.\install.ps1 -Profile strict    # Auditorías y hardening
```

```bash
./install.sh --profile minimal
./install.sh --profile standard
./install.sh --profile strict
```

Nota: si ven carpetas extra (`core/`, `design/`, `template/`), son restos de instalaciones anteriores. Reinstalar borra y reemplaza correctamente.

Chequeo antes de instalar (recomendado):

```bash
npm test
node scripts/install-tasks.js token-audit .
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

Las 26 skills que convierten a tu agente en un ingeniero de software disciplinado:

| Skill | Cuándo la usas |
|-------|----------------|
| `brainstorming` | Antes de tocar código — diseña la feature primero |
| `changelog-generator` | Genera notas de lanzamiento automatizadas analizando el historial de Git |
| `spec-driven-development` | Cuando los requerimientos son vagos o ambiguos |
| `writing-plans` | Para planificar cambios que tocan múltiples archivos |
| `incremental-implementation` | Para entregar en rebanadas seguras y revisables |
| `playwright-testing` | Diseñar, escribir y optimizar pruebas E2E y de componente con Playwright |
| `test-driven-development` | Red → Green → Refactor con disciplina real |
| `systematic-debugging` | Cuando algo falla y no sabés por qué |
| `code-simplification` | Refactorizar sin cambiar comportamiento |
| `verification-before-completion` | Antes de decir "está listo" — evidencia concreta |
| `context-engineering` | Cuando el agente empieza a alucinar por context flooding |
| `db-schema-detector` | Detecta bases de datos locales y genera esquemas cached en CodeGraph para ahorrar tokens |
| `dispatching-parallel-agents` | 2+ tareas independientes — lanzalas en paralelo |
| `subagent-driven-development` | Ejecutar planes grandes con subagentes especializados |
| `requesting-code-review` | Antes de mergear — checklist + evidencia |
| `receiving-code-review` | Cuando recibís feedback — no aplicar a ciegas |
| `finishing-a-development-branch` | Cerrar ramas: merge, PR, o cleanup |
| `using-git-worktrees` | Aislar features para no romper el workspace |
| `writing-skills` | Crear y testear tus propias skills |
| `executing-plans` | Ejecutar planes por lotes con checkpoints de revisión |
| `gsd-workflow` | Metodología GSD (Discuss → Plan → Execute → Verify → Ship) para combatir el context rot |
| `ultra-review` | Protocolo de auditoría paralela multi-perspectiva de cambios (diffs) antes de mergear/commit |
| `mcp-configurator` | Configura servidores MCP (Model Context Protocol) para conectar el agente a DBs, APIs y tools externas |
| `performance-profiler` | Auditoría measure-first: Core Web Vitals, Lighthouse CI, bundle size, latencia de API, detección de regresiones |
| `a2a-orchestrator` | Orquesta redes multi-agente con el protocolo A2A (Agent-to-Agent). Para agentes cross-proceso/cross-tool — diferente a `dispatching-parallel-agents` (intra-sesión) |
| `headroom` | Reduce el consumo de tokens del LLM comprimiendo dinámicamente contextos, logs e historial de conversación |

---

### 🎨 Design Engineering — Calidad visual premium

| Skill | Qué hace |
|-------|----------|
| `impeccable-design-taste` | Auditoría de diseño en 6 capas: tipografía, color, espaciado, polish, motion y accesibilidad WCAG AA. Detecta y elimina los "AI tells" (glassmorphism genérico, gradients de AI, cards idénticas). |
| `emil-kowalski-design` | Animaciones ≤300ms, micro-interacciones, perceived performance. Principios de diseño de Emil Kowalski aplicados sistemáticamente. |
| `github-premium-aesthetics` | Implementa patrones UI de vanguardia inspirados en GitHub y Vercel, incluyendo Bento grids, bordes brillantes, gradientes mesh y movimiento fluido. |
| `creativo-visual` | Director Creativo y Diseñador Visual. Traduce prompts básicos a especificaciones artísticas de 5 componentes (Subject, Action, Context, Composition, Style) e integra ImageMagick. |

---

### 🤖 Agentes especializados

Agentes que se comportan como profesionales con roles definidos:

| Agente | Rol |
|--------|-----|
| `auditor-de-seguridad` | Escanea 12 categorías: secrets, SAST (OWASP Top 10), rate limiting, auth, API security, encryption, logging, compliance, infra, DB y CI/CD |
| `supply-chain-auditor` | Audita la cadena de suministro: CVEs en deps (npm/pip/composer), lockfile integrity, licencias, paquetes deprecados y riesgo transitivo |
| `prompt-injection-guard` | Defiende contra ataques de prompt injection (OWASP LLM01:2025): inyección directa, indirecta vía RAG/tools, jailbreaks y escalada de privilegios |
| `audit-loop` | **Follow-up de auditorías.** Clasifica hallazgos, aplica fixes seguros automáticamente, pide OK para los sensibles, re-audita hasta 3 veces |
| `agente-devops` | Diseña y audita Dockerfiles y pipelines CI/CD seguros. Alineado con IEEE 730 e ISO 27001 |
| `agente-ideas` | **Deliberación y consenso.** Resuelve decisiones complejas o ambiguas con un consejo de 3 etapas optimizado: Complexity Gate (evalúa si vale la pena), Early-Exit Gate (salta revisión si hay convergencia) y Chairman-driven synthesis — mínimo gasto de tokens |
| `auditor-de-marketing` | Audita SEO on-page, schema markup, AEO/GEO, programmatic SEO, AI writing (30 patrones), copy quality, OpenGraph, readability y CRO |
| `optimizador-finops` | Analiza consumo de tokens, comprime prompts, detecta llamadas redundantes a APIs |
| `project-manager` | Escucha al CEO, planifica, delega a agentes especializados, revisa resultados y reporta |
| `gestor-documental` | Formatea documentación técnica y académica (APA 7ª ed., ISO 29148, ISO 29119) |
| `cyber-neo` | **Análisis de ciberseguridad.** Realiza auditorías profundas de seguridad de solo lectura abarcando 11 dominios, OWASP y CWE. |
| `execution-runtime` | Gestiona entornos de ejecución seguros y aislados (sandboxes como Docker o WASM) para ejecutar código de forma segura |
| `spec-kit` | Wrapper de GitHub Spec-Kit (`specify` CLI). Genera specs, planes y tareas estructurados automáticamente en lugar de redactarlos manualmente. Requiere Python 3.11+ y `uv` |

---

### 🎁 Bundles por rol

Instala solo lo que necesita tu equipo:

| Bundle | Qué incluye |
|--------|-------------|
| **`core`** | Las 26 skills de metodología de desarrollo |
| **`devops`** | agente-devops · audit-loop · auditor-de-seguridad · supply-chain-auditor · prompt-injection-guard · optimizador-finops |
| **`design`** | impeccable-design-taste · emil-kowalski-design · creativo-visual |
| **`testing`** | playwright-testing · performance-profiler · test-driven-development · systematic-debugging · verification-before-completion |
| **`management`** | project-manager · gestor-documental · audit-loop · agente-ideas · a2a-orchestrator · spec-kit |
| **`marketing`** | auditor-de-marketing |

---

### ⚡ Workflows multi-skill

Combinaciones pre-diseñadas para tareas complejas:

| Workflow | Secuencia |
|----------|-----------|
| **Feature completa** | `brainstorming` → `spec-driven-development` → `writing-plans` → `incremental-implementation` → `requesting-code-review` → `finishing-a-development-branch` |
| **Feature con E2E** | `brainstorming` → `spec-driven-development` → `writing-plans` → `test-driven-development` → `incremental-implementation` → `playwright-testing` → `requesting-code-review` → `finishing-a-development-branch` |
| **Auditoría + reparación** | `auditor-de-seguridad` → `audit-loop` |
| **Deploy seguro** | `agente-devops` → `auditor-de-seguridad` → `audit-loop` |
| **Rediseño UI** | `brainstorming` → `impeccable-design-taste` → `emil-kowalski-design` → `incremental-implementation` |
| **Auditoría completa** | `auditor-de-seguridad` + `auditor-de-marketing` + `optimizador-finops` (paralelo) → `gestor-documental` |
| **AI Security Gate** 🔒 | `prompt-injection-guard` → `auditor-de-seguridad` → `supply-chain-auditor` → `audit-loop` |
| **Supply Chain Gate** 📦 | `supply-chain-auditor` → `audit-loop` (pre-merge, on `npm install`) |
| **Performance Gate** ⚡ | `performance-profiler` [baseline] → [merge] → `performance-profiler` [delta] |
| **Multi-Agent Pipeline** 🤖 | `a2a-orchestrator` → [agentes especializados en paralelo] → `gestor-documental` |
| **LLM App Hardening** 🛡️ | `brainstorming` → `spec-driven-development` → [`prompt-injection-guard` + `supply-chain-auditor`] → `mcp-configurator` → `audit-loop` → `agente-devops` |

## 🧪 v1.7.2 "Architectural & Performance Rules" (2026-06-30)

### Cambios
- **Reglas de Arquitectura**: Nuevo archivo `rules/common/architecture.md` con lineamientos estrictos para evitar cuellos de botella en BD (N+1), configurar rollback en renderizado optimista, aislar alojamiento estático y asegurar metaetiquetas OpenGraph/SEO.
- **Versión**: Bump general de versión a 1.7.2 en `package.json` y `catalog.json`.

---

## 🧪 v1.7.1 "Stats Dashboard & Default All" (2026-06-26)

### Cambios

- **Default profile**: `install.ps1` ahora instala perfil `all` por defecto (antes `minimal`). `install.sh` ya tenía `all` como default.
- **Test fix**: Corregido snapshot desincronizado en `project-mixed-findings` (expected `applied=3`→`2`, `pending=1`→`2`).
- **README**: Nueva sección de estadísticas del proyecto (tests, plataformas, ahorro de tokens).
- **GitHub**: Repositorio inicializado y subido a `github.com/fabianmelomaciel/SkillGrid`.

---

## 🧪 v1.7 "Context Compression & Secure Runtimes" (2026-06-19)

### 2 New Skills — Context Optimization & Security Isolation

| Skill | Bundle | Why now |
|-------|--------|---------|
| **`headroom`** | `core` + `devops` | Context compression proxy and MCP server to reduce token consumption by up to 95% |
| **`execution-runtime`** | `devops` + `testing` | Secure, isolated execution environment (Docker/WASM/microVM sandboxes) for running untrusted code safely |

### Improvements to Existing Skills & Infrastructure
- **`mcp-configurator`**: Added predefined configuration patterns for the playroom/headroom token compression MCP server.
- **`optimizador-finops`**: Integrated Headroom stats for monitoring context token compression ratio and saving estimates in real-time.
- **`catalog.json` & `skills/index.json`**: Auto-synced and bumped version to `1.7.0`, reporting **43 skills** in total.

---

## 🧪 v1.6 "Supply Chain & Agent Protocol" (2026-06-13)

### 4 New Skills — Research-Backed (GitHub Trending 2026)

| Skill | Bundle | Why now |
|-------|--------|---------|
| **`supply-chain-auditor`** | `devops` | Top requested skill in 2026 — CVEs, lockfile integrity, license compliance, transitive risk |
| **`performance-profiler`** | `core` + `testing` | Core Web Vitals + Lighthouse CI + bundle analysis. Measure-first methodology |
| **`mcp-configurator`** | `core` | MCP is the "USB-C for AI" — de facto standard 2026. Supports Claude Code, Cursor, opencode |
| **`github-premium-aesthetics`** | `design` | Highly requested to eliminate standard "AI-looking" designs. Integrates Bento grids, glowing borders, and fluid CSS physics. |

### Supply Chain Workflow (NEW)
```
npm install <dep>
  → supply-chain-auditor → CVE scan + license check + lockfile verify
  → audit-loop → auto-fix patchable CVEs, escalate breaking changes
```

### Performance Gate (NEW)
```
Pre-merge check on UI features:
  → performance-profiler → Lighthouse baseline → bundle delta comparison → ⚠️ flag regressions >10%
```

### Improvements to Existing Skills

- **`optimizador-finops`**: Added model cost optimization section — reads `models.json` to recommend cheapest model per task type (e.g., `gemini-2.5-flash` at $0.75/1M for quick fixes vs `claude-sonnet-4.6-thinking` at $18/1M for deep reasoning)
- **`auditor-de-seguridad`**: Integrated reference and validation steps for **NVIDIA SkillSpector** (see [skillspector.md](file:///c:/laragon/www/SkillGrid/skills/auditor-de-seguridad/references/skillspector.md)) to scan and secure AI Agent Skills against prompt injections, exfiltration, rogue agent behavior, and tool abuse.
- **`audit-loop`**: Added `ROLLBACK-SAFE` rule — partial failure now reverts only the failing fix, not the whole batch. Added `TIMEOUT` rule (300s per iteration, configurable via `SKILLGRID_LOOP_TIMEOUT`)
- **`shared/session-controls.md`**: Added `SKILLGRID_LOOP_TIMEOUT` and `SKILLGRID_LOOP_MAX_ITER` environment variables

### Infra
- `catalog.json` version synced to `1.6.0` (was `1.1.0`, out of sync with README)
- `npm run catalog` now reports **40 skills** (was 33)
- Remote-install pin updated to `v1.6.0`
- `CHANGELOG.md` fully versioned (v1.1 – v1.6)
- 5 new workflows added to `skills/bundles/workflows.md`
- **CI/CD Security Gate**: Integrated automatic static scans using `skillspector scan --no-llm` inside GitHub Actions to audit all skill files.

---

## 🧪 v1.5 "Security & Intelligence" (2026-06-10)

### New Skills & Models
- **playwright-testing**: Nueva skill E2E integrada en bundle `core` y nuevo bundle/perfil `testing` (4 skills, ~8K tokens).
- **models.json**: 3 modelos nuevos — `gemini-2.5-flash`, `claude-sonnet-4.6-thinking`, `o4-mini` con quirks, anti_patterns y precios reales.

### Security
- **ralph-loop.ps1 / ralph-loop.sh**: Security gate — whitelist de agentes permitidos (`claude`, `opencode`, `antigravity-ide`, `antigravity`, `aider`, `gemini`). Previene ejecución arbitraria de comandos.

### DX & Tooling
- **generate-catalog.js**: Auto-sync de `skills/index.json` al correr `npm run catalog`. Previene desincronización futura entre catalog.json e index.json.
- **README**: Workflow **"Feature con E2E"** agregado. Perfil `testing` documentado en tablas.

---

## 🧪 v1.4 "Token-Efficient Deliberation" (2026-06-08)

### Token Optimization
- **agente-ideas**: −42% tokens (1,101→633). Nuevo Complexity Gate (evalúa si vale la pena convocar consejo), Early-Exit Gate (salta Stage 2 si hay convergencia) y Stage 2 rediseñado (Chairman-driven, elimina 3 LLM calls por deliberación). Tools legacy corregidos a nombres reales de opencode (`task`, `read`, `glob`, `grep`, `edit`, `write`, `bash`).
- **project-manager**: −69% tokens (3,354→1,030). Session Handoff compacto, Database Change Management comprimido, Dual-Environment Analysis comprimido, Tools corregidos. Shared refs restauradas (existen en `skills/shared/`).
- **db-schema-detector**: Tools legacy corregidos (`run_command`→`bash`, `view_file`→`read`, `write_to_file`→`edit/write`).
- **openskills bundle**: agente-ideas añadido a la distribución para plataforma antigravity.
- **README**: Descripciones actualizadas, tabla de idiomas corregida.

---

## 🧪 v1.3 "Full Audit & Hardening" (2026-06-07)

### Security Hardening
- **Installer safety**: `remote-install.ps1` and `remote-install.sh` pinned to `--branch v1.0.0` to prevent supply-chain attacks
- **rm -rf guard**: Added confirmation prompt in `install.sh` before any destructive operation
- **Dependency lock**: `package-lock.json` generated to freeze dependency tree
- **CI/CD tracking restored**: `.github/workflows/` removed from `.gitignore` — pipelines now tracked in version control

### Bugfixes
- `workflows.md`: Fixed typo `imperfectable` → `impeccable`
- `gestor-documental/SKILL.md`: Sections 3 and 4 swapped to correct logical order
- `auditor-de-seguridad/SKILL.md`: Added missing `verification-gate.md` to shared protocol references
- `session-controls.md`: Now documents `SKILLGRID_SCRATCH` env var

### Maintainability
- **DRY reporting**: `scripts/report-common.ps1` created — shared `Escape-Html` function used by `audit.ps1` and `generate-report-from-json.ps1`
- **Inline JS externalized**: `scripts/install-tasks.js` extracted from `install.ps1` (~739→~557 lines)
- **Parallel scanners**: All 12 security scanners in `audit.ps1` now run via `Start-Job` for PowerShell 5.1
- **Install profiles**: `minimal`/`standard`/`strict` profiles via `-Profile` flag
- **Header normalization**: `stack-detection.md` header `#` → `##`

### Content Improvements
- **AI writing patterns**: 30 detection patterns extracted from `auditor-de-marketing/SKILL.md` to `references/ai-writing-patterns.md` — SKILL.md reduced by ~44 lines
- **CODEX Learning Loop**: Enhanced from 7-line stub to actionable guide (when to log, quality standards, format)
- **Chesterton's Fence deduplicated**: Cross-referenced between `anti-rationalization.md`, `code-simplification`, and `auditor-de-seguridad`
- **Session controls referenced**: `session-controls.md` linked from `context-engineering` and `project-manager` footers

---

## 🚀 Quick Start Examples

Ejemplos de conversaciones reales con tu agente usando SkillGrid:

### Feature completa (de principio a fin)

```
Tú: "Agrega un modo oscuro a mi app React"
  → brainstorming activa → define alcance, trade-offs, UX
  → spec-driven-development → documenta requerimientos
  → writing-plans → descompone en tareas verticales
  → incremental-implementation → implementa slice por slice
  → requesting-code-review → checklist antes de mergear
  → finishing-a-development-branch → decide merge/PR/cleanup
```

### Auditoría de seguridad + reparación automática

```
Tú: "Audita la seguridad del proyecto"
  → auditor-de-seguridad → escanea 12 categorías (secrets, SAST, OWASP, etc.)
  → audit-loop → clasifica findings: 🟢 auto-fix, 🟡 requiere OK, 🔴 no tocar
  → CEO revisa plan → audit-loop ejecuta fixes seguros
  → Re-audita hasta 3 iteraciones o hasta que pase
```

### Marketing + SEO completo

```
Tú: "Audita el SEO y marketing del sitio"
  → auditor-de-marketing → 9 categorías: schema, AEO/GEO, programmatic SEO,
    AI writing (30 patrones), copy quality, CRO, OpenGraph, readability
  → audit-loop → repara meta tags, schemas, OpenGraph automáticamente
  → Genera dashboard HTML interactivo con scores y recomendaciones
```

### Assets visuales + diseño UI

```
Tú: "Necesito favicon, OG image y rediseñar la landing"
  → creativo-visual → genera favicon multi-resolución, OG 1200×630,
    PWA manifest, emoji suggestions, auto-integración con framework
  → impeccable-design-taste → audita tipografía, color, espaciado, WCAG
  → emil-kowalski-design → animaciones ≤300ms, micro-interacciones
```

### Decisión arquitectónica compleja

```
Tú: "¿Debo migrar de REST a GraphQL?"
  → agente-ideas → Fan-out (Pragmatic, Security, Performance)
  → Peer Review anónimo → Chairman sintetiza
  → project-manager ejecuta el plan aprobado por CEO
```

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

## 📈 Ahorro Masivo de Tokens con CodeGraph + Protocolos SkillGrid

SkillGrid combina **CodeGraph** (indexación semántica local) con **protocolos de eficiencia** (Chesterton's Fence, Verify Before Refactor, DRY enforcement, Dual-Environment) para eliminar el consumo innecesario de tokens. Olvídate de que tu agente lea archivos completos una y otra vez o proponga cambios que no deberían hacerse.

### 🚀 Principales Beneficios y Políticas de Eficiencia
- **Hasta 95% de Ahorro en Tokens:** CodeGraph reduce el contexto −89.5%. Los protocolos de SkillGrid evitan además el desperdicio en falsos positivos y refactors innecesarios, alcanzando hasta −95% combinado.
- **Cero Fricción (Auto-Sincronización):** Se instala y sincroniza en segundo plano automáticamente. El agente siempre tiene un mapa actualizado de tu codebase sin que tengas que mover un dedo.
- **Refactorización Inteligente de Archivos Largos (Regla Crítica):**
  - Si un archivo supera las **300 líneas** o es modificado/leído repetidamente (más de 2-3 veces en una misma sesión), el agente tiene la directriz estricta de **refactorizar y subdividirlo** en submódulos o helpers pequeños.
  - Esto garantiza que futuras lecturas requieran fragmentos mínimos de contexto, optimizando el presupuesto de tokens.
  - Tras cualquier refactorización, se fuerza la auto-sincronización (`codegraph sync`) para mantener el mapa de dependencias y código actualizado.
- **Respuestas Inmediatas:** Al evitar el "context flooding" en el prompt, tu asistente de IA responde mucho más rápido y con mayor precisión (evitando alucinaciones).
- **Control de Costos (FinOps):** Compara el consumo de tokens y visualiza tu ahorro acumulado en tiempo real desde tu propio dashboard local.

### 📊 Comparativa Real de Consumo y Costos por Plataforma

#### 📂 Caso A: Proyecto Mediano (OpenSkills)
*Medido el 2026-06-04 sobre **300 archivos** (~1.47 MB de código fuente)*

| Métrica | Full Scan (sin CodeGraph) | Con CodeGraph | Reducción |
|---------|:------------------------:|:-------------:|:---------:|
| **Tokens de contexto** | 368,298 | 38,830 | **−89.46%** |

| Plataforma / Herramienta | Modelo | Costo Full Scan | Costo con CodeGraph | Ahorro CodeGraph |
| :--- | :--- | ---: | ---: | ---: |
| **opencode** | Claude Sonnet 4.6 | \$0.921 | \$0.097 | **89.5%** |
| **opencode** | DeepSeek V4 Flash | \$0.184 | \$0.019 | **89.5%** |
| **Antigravity** | Gemini 1.5 Flash | \$0.028 | \$0.003 | **89.5%** |
| **Antigravity / Cursor** | Gemini 1.5 Pro | \$0.460 | \$0.049 | **89.5%** |
| **Antigravity IDE** | Gemini 2.5 Pro | \$0.460 | \$0.049 | **89.5%** |
| **Claude Code** | Claude Sonnet 4.6 | \$1.105 | \$0.116 | **89.5%** |
| **Cursor IDE** | GPT-4o / Claude 3.5 | \$0.921 | \$0.097 | **89.5%** |
| **GitHub Copilot** | GPT-4o | \$0.921 | \$0.097 | **89.5%** |
| **Open WebUI** | Multi-model | variable | variable | **≥89.5%** |

#### 📂 Caso B: Proyecto Grande (SkillGrid completo)
*Medido el 2026-06-15 sobre **10,467 archivos** (~144.5 MB de código fuente)*

| Métrica | Full Scan (sin CodeGraph) | Con CodeGraph | Reducción |
|---------|:------------------------:|:-------------:|:---------:|
| **Tokens de contexto** | 36,135,586 | 3,615,559 | **−89.99%** |

| Plataforma / Herramienta | Modelo | Costo Full Scan | Costo con CodeGraph | Ahorro CodeGraph |
| :--- | :--- | ---: | ---: | ---: |
| **opencode** | Claude Sonnet 4.6 | \$108.407 | \$10.847 | **89.99%** |
| **opencode** | DeepSeek V4 Flash | \$18.068 | \$1.808 | **89.99%** |
| **Antigravity** | Gemini 1.5 Flash | \$2.710 | \$0.271 | **89.99%** |
| **Antigravity / Cursor** | Gemini 1.5 Pro | \$45.169 | \$4.519 | **89.99%** |
| **Antigravity IDE** | Gemini 2.5 Pro | \$45.169 | \$4.519 | **89.99%** |
| **Claude Code** | Claude Sonnet 4.6 | \$108.407 | \$10.847 | **89.99%** |
| **Cursor IDE** | GPT-4o / Claude 3.5 | \$90.339 | \$9.039 | **89.99%** |
| **GitHub Copilot** | GPT-4o | \$90.339 | \$9.039 | **89.99%** |
| **Open WebUI** | Multi-model | variable | variable | **≥89.9%** |

> [!NOTE]
> **¿Por qué Gemini ahorra aún más?**
> Con Gemini (Google), el beneficio es doble: al reducir el contexto por debajo del límite de 128K tokens, la tarifa por millón de tokens se reduce a la mitad. ¡Menos tokens a un precio unitario inferior!

### 📉 Ahorro Adicional por Protocolos de SkillGrid

Además del −89.5% de CodeGraph, los protocolos de SkillGrid evitan tokens desperdiciados en falsos positivos, refactors innecesarios y duplicación. Estimaciones basadas en mediciones de sesiones reales:

| Protocolo / Regla | Ahorro adicional estimado | Cómo evita desperdicio de tokens |
|-------------------|:-------------------------:|----------------------------------|
| **Chesterton's Fence** (auditor no propone refactor innecesario) | −50% a −80% en hallazgos falsos | Cada falso positivo evitado = 500–2,000 tokens que no se gastan en planificar + implementar + revisar |
| **Verify Before Refactor Gate** (verificar antes de sugerir cambios) | −30% a −60% en ciclos de reparación | El audit-loop ya no itera sobre cambios que no deberían hacerse |
| **DRY Enforcement** (no duplicar código) | −10% a −20% en código generado | Se reusa código existente en vez de crear desde cero |
| **Dual-Environment Protocol** (localhost vs producción) | −15% a −30% en sugerencias inválidas | No se proponen cambios que romperían en producción ni se discuten archivos environment-específicos |
| **Idioma del skill adaptado** (inglés o español según el agente) | −5% a −10% por skill cargada | Skills en inglés (~15–20% más compacto) donde aplica; skills en español para equipos hispanohablantes. Detectado automáticamente por `project-manager` |
| **Context Engineering** (working set + sin re-lecturas completas) | −20% a −40% en exploración | No se releen archivos completos "para recordar" |

**Ahorro combinado total estimado:** entre **−92% y −95%** versus un agente sin SkillGrid ni CodeGraph.

> ⚡ **Ejemplo real**: Una auditoría de seguridad completa (12 categorías) que antes consumía ~50,000 tokens ahora consume ~4,000–8,000 tokens gracias a CodeGraph + Chesterton's Fence + Verify Before Refactor.

### 🔋 Ahorro de Sesión — Infraestructura de Contexto (v1.7.x)

Además del ahorro por CodeGraph y protocolos, SkillGrid incluye una capa de optimización de **contexto de sesión** que reduce el baseline de tokens cargado al inicio de cada conversación y maneja los límites de tokens en tiempo real:

| Mejora | Antes | Después | Reducción / Acción |
|--------|:-----:|:-------:|:---------:|
| `catalog-lite.json` (carga lazy del catálogo) | 14.4 KB | 5.5 KB | **−62%** |
| `scratch/` limpio (sin repos `.git` anidados) | ~204 KB artifacts | 0 KB | **−100%** |
| `memory/` rotada (sin historial acumulado) | crece sin límite | comprimida semanalmente | **variable** |
| **Compactación de Contexto** | Desborde de contexto | `/compact` automático | **Proactiva al llegar al 80%** |
| Baseline de sesión combinado | ~90K tokens | ~45K tokens | **−50%** |

**Scripts incluidos** (en `.claude/scripts/`):
- `cleanup-artifacts.sh` — se ejecuta automáticamente al terminar cada sesión (Stop hook). Purga repos `.git` anidados en `scratch/` y archiva artifacts con más de 30 días de antigüedad.
- `compress-memory.sh` — comprime y rota los archivos de memoria del proyecto. Ejecutar semanalmente o manualmente con `bash .claude/scripts/compress-memory.sh`.

#### 🚀 Integración con RTK (Rust Token Killer)
SkillGrid es totalmente compatible con **RTK (Rust Token Killer)**, la herramienta proxy CLI de alto rendimiento que intercepta y comprime salidas de terminal pesadas (`git diff`, `npm test`, etc.) antes de enviarlas al modelo. Se recomienda integrar RTK para lograr un ahorro adicional del 60% al 90% en tokens de entrada durante la ejecución de tareas automatizadas en segundo plano.


> 💡 **Genera `catalog-lite.json`** (solo campos esenciales — 62% más pequeño):
> ```bash
> node -e "const c=require('./catalog.json'),fs=require('fs');fs.writeFileSync('catalog-lite.json',JSON.stringify({version:c.version,generated_at:c.generated_at,total:c.total,skills:c.skills.map(s=>({name:s.name,status:s.status,risk_level:s.risk_level,category:s.category}))},null,2))"
> ```

---

## 🧠 Model Selection & Platform Compatibility Guide

### Platform Capability Matrix

| Plataforma | Default Model | Fallback | Cost Input/1M | Cost Output/1M | ¿Soporta Skills? | ¿Soporta Agentes? | Mecanismo |
|------------|--------------|:--------:|:-------------:|:--------------:|:----------------:|:-----------------:|-----------|
| **opencode** | Claude Sonnet 4.6 | DeepSeek V4 Flash | $3.00 | $15.00 | ✅ SKILL.md | ✅ **Sí (32 agentes .md)** | `~/.config/opencode/skills/` + `agents/` |
| **antigravity** | Gemini 1.5 Flash | Gemini 1.5 Pro | $0.075 | $0.30 | ✅ SKILL.md | ❌ | `~/.gemini/config/skills/` |
| **antigravity-ide** | Gemini 2.5 Pro | Gemini 1.5 Pro | $1.25 | $10.00 | ✅ SKILL.md | ❌ | `~/.gemini/antigravity-ide/skills/` |
| **Claude Code** | Claude 3.5 Sonnet | — | $3.00 | $15.00 | ✅ SKILL.md | ❌ | `~/.claude/skills/` |
| **Cursor IDE** | GPT-4o | Claude 3.5 Sonnet | $2.50 | $10.00 | ❌ (usa rules) | ❌ | `.cursor/rules/*.mdc` |
| **GitHub Copilot** | GPT-4o | — | $2.50 | $10.00 | ❌ (usa instructions) | ❌ | `.github/instructions/*.md` |
| **Open WebUI** | multi-model | — | $0.00 | $0.00 | ✅ SKILL.md | ❌ | configurable |

### Agent System: ¿Por qué solo opencode tiene agentes?

SkillGrid genera **32 agentes `.md`** en `~/.config/opencode/agents/`. Cada agente tiene:

```yaml
---
description: Cuándo y por qué usar este agente
mode: subagent
permission:
  edit: deny    # solo lectura — seguridad primero
  bash: deny
---
```

**¿Por qué las otras plataformas no tienen agentes?**

| Plataforma | ¿Por qué no? |
|------------|-------------|
| **antigravity / antigravity-ide** | Solo leen SKILL.md directamente. No existe un directorio `agents/` ni un concepto de `mode: subagent`. |
| **Claude Code** | Lee SKILL.md desde `~/.claude/skills/`. No tiene sistema de subagentes ni delegación aislada. |
| **Cursor / Copilot** | No soportan SKILL.md nativo. Usan `.mdc` y `.instructions.md` respectivamente — son reglas de proyecto, no agentes autónomos. |

El sistema de agentes de opencode es **único**: permite delegar tareas a subagentes especializados con contexto aislado, permisos restringidos y sin riesgo de fuga de contexto entre tareas.

### Model Reference

| Modelo | Provider | Thinking | Ventana | Compatible con | Input/1M | Output/1M |
|--------|----------|:--------:|:-------:|:--------------:|:--------:|:---------:|
| **Claude Sonnet 4.6** | Anthropic | Sí | 200K | opencode | $3.00 | $15.00 |
| **Claude Sonnet 4.6 Thinking** | Anthropic | Sí (extendido) | 200K | opencode, antigravity-ide | $3.00 | $15.00 |
| **Claude 3.5 Sonnet** | Anthropic | No | 200K | claude-code, cursor | $3.00 | $15.00 |
| **Claude Haiku 4.5** | Anthropic | No | 200K | opencode | $1.00 | $5.00 |
| **DeepSeek V4 Flash** | DeepSeek | No | 128K | opencode | $0.50 | $2.00 |
| **Gemini 2.5 Pro** | Google | Sí | 1M | antigravity-ide | $1.25 | $10.00 |
| **Gemini 2.5 Flash** | Google | Sí | 1M | antigravity-ide, antigravity | $0.15 | $0.60 |
| **Gemini 1.5 Pro** | Google | No | 128K | antigravity, cursor | $1.25 | $5.00 |
| **Gemini 1.5 Flash** | Google | No | 128K | antigravity | $0.075 | $0.30 |
| **GPT-4o** | OpenAI | No | 128K | cursor, github-copilot | $2.50 | $10.00 |
| **o4-mini** | OpenAI | Sí | 200K | cursor, github-copilot | $1.10 | $4.40 |

> 💡 **Tip**: DeepSeek V4 Flash ($0.50/$2.00) es el modelo económico recomendado para opencode en tareas rápidas. Gemini 2.5 Flash ($0.15/$0.60) es el más barato con thinking mode.

---

## 📊 Estadísticas del Proyecto

### Skills & Tests

| Métrica | Valor |
|---------|:-----:|
| Skills totales | **43** |
| Tests de skills (frontmatter, core, modules, CodeGraph, references) | **217** ✅ |
| Tests de audit-loop (9 fixtures) | **9** ✅ |
| Cobertura de validación YAML | **100%** |
| Agentes generados (opencode) | **32** |
| Skills con sección `[platform:opencode]` | **5** |
| Perfiles de instalación | **6** (all, minimal, standard, strict, testing, superpowers) |
| Bundles por rol | **6** (core, devops, design, testing, management, marketing) |

### Instalación Multi-Plataforma

| Plataforma | Skills | Agentes | Default Model | Autodetección |
|------------|:------:|:-------:|:-------------|:--------------|
| **opencode** | 43 | 32 ✅ | Claude Sonnet 4.6 | `~/.config/opencode/skills/` |
| **antigravity** | 43 | — | Gemini 1.5 Flash | `~/.gemini/config/skills/` |
| **antigravity-ide** | 43 | — | Gemini 2.5 Pro | `~/.gemini/antigravity-ide/skills/` |
| **Claude Code** | 43 | — | Claude 3.5 Sonnet | `~/.claude/skills/` |

### Ahorro de Tokens por Plataforma (Proyecto Grande: ~10K archivos, 144MB)

| Plataforma | Modelo | Costo Full Scan | Costo con CodeGraph | Ahorro |
|------------|--------|----------------:|--------------------:|:------:|
| opencode | DeepSeek V4 Flash | $18.07 | $1.81 | **90%** |
| opencode | Claude Sonnet 4.6 | $108.41 | $10.85 | **90%** |
| antigravity | Gemini 1.5 Flash | $2.71 | $0.27 | **90%** |
| antigravity-ide | Gemini 2.5 Flash | $5.42 | **$0.54** | **90%** ⭐ |
| antigravity-ide | Gemini 2.5 Pro | $45.17 | $4.52 | **90%** |
| Claude Code | Claude 3.5 Sonnet | $108.41 | $10.85 | **90%** |

> ⭐ **Mejor relación inteligencia/costo**: antigravity + Gemini 2.5 Flash — $0.54/sesión, 1M contexto, thinking mode.

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

- `$env:SKILLGRID_SCRATCH\token_usage_comparison.json` (si configuraste la variable)
- o un `scratch/token_usage_comparison.json` cerca del root donde corre el instalador

Ese JSON incluye, por proyecto: `baseline_full_scan_tokens`, `codegraph_context_tokens`, `estimated_savings_tokens` y `savings_percentage`.

## 🤝 Crear tu propia skill

Puedes generar una nueva skill de forma interactiva ejecutando:

```powershell
node scripts/create-skill.js
```

El script te preguntará el nombre, categoría, descripción y nivel de riesgo, y generará automáticamente la estructura de directorios y el frontmatter YAML validado.

O bien, puedes copiar la plantilla manualmente y completar los campos:

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

### 🛠️ Optimización del Repositorio para Desarrollo con IA (Dev-Mode)

Si estás desarrollando o contribuyendo al propio repositorio de **SkillGrid** con asistentes de IA (tales como opencode, antigravity, Claude Code, Cursor o Copilot), puedes inicializar las reglas locales, el índice de CodeGraph y la memoria persistente ejecutando el instalador apuntando al directorio raíz del proyecto:

**En Windows (PowerShell):**
```powershell
.\install.ps1 -ProjectDir . -Language typescript -GenerateCodex
```

**En Linux / macOS (Bash):**
```bash
./install.sh --project . --language typescript
```

Esto configurará:
1. **Reglas de IDE locales**: En `.cursor/rules/` y `.github/instructions/` específicas para TypeScript/JS/Scripts.
2. **Índice CodeGraph**: En `.codegraph/` para navegación semántica ultrarrápida.
3. **Memoria Persistente (`CODEX.md`)**: Para recordar el contexto del repositorio y evitar alucinaciones.
4. **Git Exclude**: Configura automáticamente `.git/info/exclude` para que estas configuraciones locales permanezcan privadas y no contaminen el árbol de commits.

---

## v1.2 "Audit Depth & Asset Pipeline" (2026-06-07)

### Marketing Audit Expansion (from marketingskills)
- **Schema markup deep audit**: Added section 5 with JSON-LD type validation, Google Rich Results eligibility checks, BreadcrumbList/Sitelinks integrity, and structured data conflict detection
- **AEO/GEO/LLMO audit**: Added section 6 covering LLM citation readiness, `SpeakableSpecification`/`FAQPage` schema for AI surfaces, featured snippet compatibility, and entity recognition via Wikidata/Wikipedia
- **Programmatic SEO audit**: Added section 7 with template scalability checks, content depth threshold (300-word minimum), index bloat detection, and contextual internal linking verification
- **Copy quality & messaging audit**: Added section 8 with value proposition clarity, conversion copy patterns (PAS/BAB/FAB), emotional triggers, trust signals placement, and multi-segment detection
- **Report schema extended**: Added `schema_score`, `aeo_geo_readiness_score`, `programmatic_seo_score`, and `copy_quality_score` to summary output

### Visual Asset Pipeline (from web-asset-generator)
- **Web asset generation pipeline**: Added full favicon multi-resolution generation (16×16 → 512×512), social media OG image templates (FB/LinkedIn/Twitter/YouTube/Pinterest), and PWA manifest.json auto-generation
- **Asset validation system**: Added dimension/format checks, WCAG 4.5:1 contrast ratio validation for text overlays, and file size budget table per asset type
- **Emoji library**: Added 7 curated emoji categories (60+ emojis) with brand-context suggestions and geometric icon fallback via ImageMagick
- **Framework auto-integration**: CodeGraph-based detection of Next.js/Astro/Vite/Nuxt/Angular with automatic `<link>` and `<meta>` tag insertion in the correct layout file
- **Severity matrix & verification gate**: Updated to cover favicon 404, OG image size limits, PWA path mismatches, and WCAG contrast gaps

---

## v1.1 "Lean & Efficient" (2026-06-07)

### Token Economy Improvements
- **Deduplicated platform modules**: ~480 lines of repeated `## Modules` footer extracted to `skills/shared/modules-footer.md` — single reference line per skill
- **Frontmatter index**: New `skills/index.json` with progressive disclosure metadata (token estimates, cost tiers, invocation graph) for all 30 skills
- **Token budget metadata**: Added `token_estimate: { input, output }` to every SKILL.md frontmatter (estimated from actual file sizes)
- **Install profiles**: Added `minimal`/`standard`/`strict` profiles to `skills/bundles/index.json` for progressive skill loading
- **Session runtime controls**: New `skills/shared/session-controls.md` with environment variables (`SKILLGRID_HOOK_PROFILE`, `SKILLGRID_DISABLED_SKILLS`, etc.)

### Shared Resources
- **Stack detection**: Extracted from audit-loop to `skills/shared/stack-detection.md` — shared by audit-loop and auditor-de-seguridad

### Security Hardening
- **Security framework mappings**: New `skills/auditor-de-seguridad/references/mitre-attack.md` mapping all 12 scanner categories to MITRE ATT&CK v19.1 and NIST CSF 2.0
- **External repo integration guide**: New `skills/auditor-de-seguridad/references/external-repos.md` for progressive disclosure of third-party security skills
- **Findings schema enhanced**: Added optional `cwe_id` and `mitre_technique_id` fields to audit findings
- **CVSS 4.0 rubric & Risk Decision Matrix**: Added to `skills/shared/risk-assessment.md` along with Risk Treatment Decision Tree
- **Security anti-rationalizations**: 4 new rows in `skills/shared/anti-rationalization.md` covering scanner false confidence, POC security debt, auth retrofit, and internal-only encryption

### Enhancements
- **db-schema-detector**: Re-categorized from `agent` to `core` (18→19 core, 9→8 agent)
- **Incremental CodeGraph sync**: Added to `skills/shared/codegraph-startup.md` — timestamp-based diffing to avoid full rescans
- **DESIGN_VARIANCE dial**: Updated description in impeccable-design-taste (section renamed to "The Four Dials")
- **Academic research pipeline**: New `skills/gestor-documental/references/research-pipeline.md` with 10-stage workflow

## 🔄 Ralph Loop Runner (Bucle Autónomo)

SkillGrid incluye scripts automatizados para implementar el **Ralph Loop** de ejecución autónoma en tu terminal. Esto ejecuta al agente de IA (como `claude` o `antigravity-ide`) en ciclos iterativos independientes, permitiendo que avance tarea por tarea sin saturar la ventana de contexto de una sola conversación larga.

El runner lee un archivo de seguimiento (por defecto `task.md`) y se detiene automáticamente cuando no quedan tareas pendientes, o cuando alcanza el límite de iteraciones configurado.

### Uso en Windows (PowerShell)
```powershell
# Ejecución básica (usa 'claude' y 'task.md')
.\scripts\ralph-loop.ps1

# Personalizado
.\scripts\ralph-loop.ps1 -AgentCommand "antigravity-ide" -TaskFile "task.md" -MaxIterations 5 -DelaySeconds 10
```

### Uso en Linux / macOS (Bash)
```bash
# Ejecución básica
bash scripts/ralph-loop.sh

# Personalizado (Parámetros posicionales: agente, taskfile, max_iter, delay)
bash scripts/ralph-loop.sh "claude" "task.md" 5 10
```

---

## 🔒 Reporte de Vulnerabilidades (Security)

Si descubrís una vulnerabilidad de seguridad en SkillGrid, **no abras un issue público**.

Reportá la vulnerabilidad de forma responsable:

| Método | Contacto |
|--------|----------|
| **Email** | security@skillgrid.dev (o [fabianmelomaciel@github](https://github.com/fabianmelomaciel)) |
| **GitHub Security Advisory** | [Report privately](https://github.com/fabianmelomaciel/SkillGrid/security/advisories/new) |

Incluí en el reporte:
- Descripción de la vulnerabilidad y su impacto
- Pasos para reproducirla
- Versión/Commit afectado
- Cualquier prueba de concepto (opcional)

**Tiempos de respuesta esperados:**
- Confirmación de recepción: < 48 horas
- Evaluación inicial: < 7 días
- Fix y release: según severidad (Critical: < 72h, High: < 2 semanas)

Gracias por ayudar a mantener SkillGrid seguro. 🛡️

---

## Licencia

MIT — [Fabian Melo Maciel](https://github.com/fabianmelomaciel)
