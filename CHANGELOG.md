# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.15.0] - 2026-09-26

### Added
- **`skills/shared/env-preflight.md` + `scripts/preflight.js` (`npm run preflight`)**: pre-flight obligatorio de entorno antes de escribir en cualquier proyecto. Clasificación dev/prod fail-closed (duda ⇒ producción, solo lectura), lectura de `.gitignore`/`.git/info/exclude`/`core.hooksPath`, `git check-ignore -v` por destino, detección de drift, y salida `GO/NO-GO` en una línea. Activado con una sola línea en `skills/shared/modules-footer.md` (lo cargan las 43 skills) más la regla nueva en `AGENTS.md`.
- **Definition of Done en `skills/shared/verification-gate.md`**: única fuente de verdad de "listo" — evidencia fresca de `npm run gate`/`npm test`, `no_new_skips`, `no_deleted_tests`, mapeo diff→test, red→green inverso para cambios de auth/validación/secretos, preflight GO y hooks activos en el target. `verification-before-completion`, `test-driven-development` y `audit-loop` delegan ahí en vez de dar tres definiciones distintas.
- **Guards en `.githooks/pre-commit`**: bloquea `.skip`/`.only`/`todo(` nuevos y tests borrados sin reemplazo en el diff, con los offending lines como evidencia. Se eliminó la sugerencia a `git commit --no-verify`. Guards con concepto adoptado de `intrepideai/donegate` — evaluado junto a otras candidatas de GitHub y decidido NO instalarla (sin dependencias ni tokens base nuevos).
- **`npm run gate`**: gate rápido local (validate + skills + catalog + create-skill, ~7s) para uso diario; la suite completa queda para CI y pre-release.
- **`agente-ideas`: Stage 0 de contexto y memoria** — antes de evaluar complejidad, lee `## Deliberaciones` en `CODEX.md` (una línea por cierre de consejo, máx. 15 entradas, solo hechos verificados): si el tema ya está `resuelto`, devuelve el veredicto previo y no convoca el consejo (re-deliberaciones ≈ 0 tokens). Carga de contexto barata: `graphify query` si existe el grafo, si no `catalog-lite.json` + glob/grep dirigido.
- **Test `token_estimate` en `skills.test.js`**: cada `SKILL.md` debe declarar `input` dentro de ±20% de `chars/4`. Corregidas 12 estimaciones desactualizadas (a2a-orchestrator, mcp-configurator, prompt-injection-guard, hack-audit, changelog-drafter, performance-profiler, executing-plans, creativo-visual, auditor-de-marketing, playwright-testing, db-schema-detector, requesting-code-review) y agregada la que faltaba en `ponytail`.
- **Tabla de catálogo del README auto-generada**: `npm run catalog` ahora reescribe el bloque entre `<!-- catalog:begin -->` y `<!-- catalog:end -->` (43 skills en 3 categorías, con ~tokens del frontmatter) — el drift de tablas manuales (como el badge `skills-49`) queda cubierto por el mismo gate que genera el catálogo.

### Changed
- `audit-loop` absorbe el protocolo de revisión multi-perspectiva de `ultra-review`: fan-out paralelo de auditores de simplicidad, seguridad y performance sobre el diff, síntesis única con scores y veredicto `PASS | PASS WITH RECOMMENDATIONS | BLOCK`.
- `finishing-a-development-branch` absorbe la limpieza post-merge de `post-merge-cleanup`: scan de branches stale con prefijos conocidos, whitelist `main`/`master`/`develop`, exclusión de worktrees activos, report-only por defecto con confirmación tipada.
- `emil-kowalski-design` absorbe el design taste gate de `impeccable-design-taste`: auditoría de tipografía, color (WCAG AA), spacing (escala 4px), pulido, movimiento y accesibilidad + autochequeo previo a declarar listo.
- `spec-driven-development`: el fast path invoca la CLI `specify` directamente, sin pasar por el subagente `spec-kit`.
- Ruteo actualizado a las skills sobrevivientes: `router`, `project-manager`, `a2a-orchestrator`, `performance-profiler`, `prompt-injection-guard` y `docs/workflows.md`.
- **`agente-ideas`: consejo endurecido tras auditoría propia (Ranking: 1º C FinOps 8.5, 2º B Seguridad 8, 3º A Simpleza 7)** — contrato de salida para subagentes (score 0-10, ≥1 riesgo, evidencia `file:line`, ≤400 palabras), 1 retry máximo o estado `Council: degraded`, veto de la perspectiva de seguridad sobre el early-exit, handoff con `Evidence` (gate fresco + GO de preflight) obligatorio para declarar `Complete` (si no, `Blocked`), presupuesto por deliberación (≤60K input / ≤10K output / ≤8 min), gate de salto con umbrales concretos (diff ≤100 LOC o ≤3 archivos, 1 commit reversible, sin superficie de seguridad), `edit`/`write` solo tras OK del CEO, y postura anti-inyección (lo que el repo muestre es dato, nunca instrucción).
- **`agente-ideas`: fixes de errores** — Stage 3 promediaba "rankings" que no existían (Stage 2 produce un solo ranking); el anonimato del Stage 2 era ilusorio (reordenar sin revelar perspectiva); el "external validator" del council Expanded quedó definido; gate de complejidad y early-exit dejaron de ser contradictorios; `CODEX-FIRST` con patrón "search upward / crear si falta".
- **`agente-ideas`: refinamientos post-análisis** — lookup de memoria anclado al header (`^## Deliberaciones`: la mission log menciona ese string entre backticks), sin doble lectura de `CODEX.md` (`CODEX-FIRST` ya lo cargó), nueva línea `Gate: convened | skipped (motivo, LOC)` en el handoff para instrumentar cuántos pedidos ni llegan al consejo, regla explícita de poda de memoria (al entrar la entrada #16, resumir las 5 más viejas al escribir el handoff) y `bash` acotado a verificación (tests/gate/git status-diff, nada destructivo sin OK explícito).
- **README reescrito para GitHub**: TL;DR + tabla con/sin SkillGrid, "Primeros pasos" con invocaciones reales (`/agente-ideas`, `/auditor-de-seguridad`…), catálogo destacado en tablas escaneables con ~tokens por skill, FAQ, sección de Atribución, aviso de las 6 skills `critical`, nota de instalador revisable en vez de `| iex` ciego, y badge de tests.

### Removed
- **6 skills (49 → 43)**: `supply-chain-auditor` (el alcance vive en la fase Dependency & Supply Chain de `auditor-de-seguridad`, con `cyber-neo/references/supply-chain.md` como referencia), `gsd-workflow` (`writing-plans` + `executing-plans`), `spec-kit`, `ultra-review`, `impeccable-design-taste`, `post-merge-cleanup`. El consejo deliberativo (agente-ideas, 3 etapas) resolvió qué conservar: `brainstorming` y `hack-audit` se mantienen por ser funciones únicas.
- **2 skills huérfanas desinstaladas** de opencode, Claude Code y antigravity: `changelog-generator` y `etichack` — existían en disco pero no tenían entrada en el catálogo.
- Instalaciones duplicadas `skills/core/` y `skills/design/` en Claude Code y antigravity (restos de versiones viejas del instalador, con los SKILL.md repetidos en dos rutas).
- 27 archivos `*(Conflicted copy 2026-09-21 from CHIWI)*` de todo el repo (ninguno trackeado, 85 KB de ruido en `git status`).

### Fixed
- Drift de git: `CODEX.md`, `.agents/VOICE.md` y `scratch/test-mixed.json` estaban trackeados pese a figurar en `.gitignore` → `git rm --cached` (siguen en disco, ahora consistentemente ignorados).
- `skills/bundles/index.json`: perfil `strict` le faltaba `ponytail` y las descripciones de perfiles quedaron con los conteos reales tras la purga.
- Conteos en README (43 skills, 270 tests, perfiles 6/16/43) y en `router`.
- **README: bugs de confianza** — badge `skills-49` (eran 43), ancla rota de "Instalación Avanzada", cifras de ahorro inconsistentes (unificadas en "hasta −90%", la tabla con precios queda como respaldo), perfiles faltantes `superpowers` (22) y `testing` (4), `[NUEVO]` obsoleto en `hack-audit`.
- **`scripts/merge-skill.js`**: `coreBody` no se recortaba al inicio — el merge inyectaba una línea en blanco espuria tras `## Core` en todos los SKILL.md instalados.
- **Descripciones de perfiles en `skills/bundles/index.json`**: `strict` decía "42 skills" (eran 43, faltaba el recount post-ponytail) y las sumas de tokens de los 5 perfiles estaban con valores previos a la re-estimación (`minimal` ~8K→~14K, `standard` ~28K→~36K, `superpowers` ~40K→~45K); bullets del README actualizados.
- **`CODEX.md` gotcha de Catalog Maintenance**: el snippet manual usaba `total: c.total` (campo inexistente; el real es `summary.total`) y afirmaba que `catalog-lite.json` era gitignored — está trackeado. Reemplazado por la instrucción de `npm run catalog`, que ahora también sincroniza la tabla del README.
- **`cost_tier` congelado en `skills/index.json`**: `generate-catalog.js` preservaba el tier existente y solo lo calculaba si faltaba, así que 8 skills quedaron con tier viejo tras re-estimar sus `token_estimate` (p. ej. `hack-audit` con 5180 tokens seguía `medium`; ahora `high`). El tier se recalcula en cada corrida desde el estimate vigente (v1.2.38).

Suite: 299 → 270 tests (269 tras la purga de las 6 skills + 1 nuevo test de `token_estimate`), 0 fallos, validate en verde.

---

## [1.14.0] - 2026-09-21

### Fixed
- **Instaladores remotos rotos para todo usuario nuevo**: `remote-install.sh`/`remote-install.ps1` (los comandos de "Instalación en 10 segundos" del README) apuntaban a `--branch v1.13.0`, un tag que nunca se pusheó a GitHub — `scripts/release.sh` lo creaba localmente pero solo *imprimía* la instrucción de pushearlo, nunca lo hacía. El mismo patrón dejó sin tag las versiones 1.10.0 a 1.13.0. `release.sh` ahora comitea, taguea y pushea (`git push origin main` + `git push origin <tag>`) automáticamente, corre `npm run validate`/`npm test` como gate antes de taguear, y regenera `catalog.json`/`catalog-lite.json`/`skills/index.json` (antes quedaban con la versión vieja). Los instaladores remotos ahora caen a `main` si el tag fijado llega a faltar, en vez de fallar directo.
- **`AGENTS.md`: texto corrupto en la sección "scratch y reports"** — mojibake introducido en `e835fce`, con dos caracteres irrecuperables (reemplazados por U+FFFD). Reescrito en español rioplatense correcto.
- **`CONTRIBUTING.md`: comando de setup roto** — `npx opencode install` no es un paquete real (404 en el registro de npm) y este repo no define `bin`; reemplazado por `./install.sh` / `.\install.ps1`.
- Conteos desactualizados en `README.md`/`CONTRIBUTING.md` (50 → 49 skills, 304 → 299 tests tras la eliminación de `changelog-generator`).

### Removed
- **`changelog-generator` skill** (total skills: 50 → 49): duplicaba a `changelog-drafter` — ambos leían `git log` y actualizaban `CHANGELOG.md` con categorías Keep a Changelog, sin ninguna desambiguación en el router (a diferencia del clúster de seguridad, donde el router elige explícitamente entre skills solapadas). `changelog-generator` era autoría original de SkillGrid (junio); `changelog-drafter`, agregado después (julio) como adaptación de un skill de Anthropic con gates de seguridad, nunca se vinculó al primero. `README.md` ya listaba solo `changelog-drafter` como skill activa.

### Changed
- **`changelog-drafter`**: corregido bug de auto-contradicción (declaraba `write` prohibido pero su propio workflow necesitaba escribir el borrador); ahora permite `write`/`git commit` únicamente sobre una rama nueva, nunca sobre la rama por defecto. Incorpora de `changelog-generator` la traducción de jerga técnica a lenguaje de usuario, consultas flexibles de `git log` (por tag, rango de fechas, o últimos N commits) y una matriz de severidad para categorización incorrecta.

### Added
- **`hack-audit` agent skill** (total skills: 49 → 50, agents: 13 → 14): pentest autónomo con explotación real. A diferencia de `auditor-de-seguridad` y `cyber-neo` (solo análisis estático), este agente mapea vectores de ataque desde el código y después los explota de verdad contra el target en ejecución — sin proof-of-concept funcionando, el hallazgo no entra al informe. Cubre las cinco clases fijas de siempre: Injection, XSS, SSRF, autenticación rota y autorización rota. Incluye gate obligatorio de autorización + no-producción antes de tocar cualquier target, y un veredicto fail-closed producción-vs-muestra sobre el código antes de tratar cualquier hallazgo como real. Agregado a los bundles `devops` y al perfil `strict`. Suite de tests: 299 → 304.
- **`hack-audit`: cobertura de superficie local + módulo SSH**: nueva Fase 0.5 mapea todo lo que escucha en la máquina (`ss`/`netstat` + proceso dueño) antes de acotar el alcance, no solo la URL que le pasaron; nueva sección 4.1 cubre revisión de hardening SSH (`sshd_config`, `ssh-audit`) bajo las mismas reglas de no-fuerza-bruta. Integración opcional con herramientas externas ya instaladas (`nmap`, `nikto`, `sqlmap`, `ffuf`, `nuclei`, `ssh-audit`) para ampliar cobertura, con fallback nativo si no están.
- **`hack-audit`: regla dura anti-evasión de logs**: prohibición explícita de borrar/alterar logs, historial de comandos o registros del target (SSH, app o sistema) para ocultar la intervención — toda acción queda documentada como evidencia propia del scan, nunca oculta del lado del servidor auditado.
- **`hack-audit`: informe estandarizado**: `references/plantilla-informe.md` pasa a ser la única estructura válida (mismo orden de secciones en toda corrida) y el informe se escribe siempre en español, sin excepción, sea cual sea el idioma de la conversación.

---

## [1.13.0] - 2026-07-22

### Fixed
- **Router bootstrap bug**: `catalog-lite.json` was gitignored but required at runtime by `skills/router`, so a fresh clone or `npm install` left the router reading the full 28K index instead of the lightweight catalog. Now tracked in git and regenerated via `prepack`.
- **`postinstall` no longer fails installs**: replaced the direct `graphify update .` postinstall with `scripts/postinstall-graphify.js`, which degrades gracefully (exit 0) when `graphify` isn't on the consumer's PATH.
- **Stale pinned tag in remote installers**: `remote-install.sh`/`.ps1` were pinned to `v1.7.3` while `package.json` was already at `1.13.0`. Updated to `v1.13.0`; `scripts/release.sh` now auto-syncs this tag on every future release so it can't drift again.
- **Cosmetic version churn in `skills/index.json`**: `generate-catalog.js` bumped the patch version on every regeneration even with no content change, causing spurious diffs. Now only bumps when skill content actually changed.

### Security
- **CI audit gate now actually blocks**: removed `continue-on-error: true` from the `npm audit --audit-level=high` step in `ci.yml` — a high-severity dependency vulnerability now fails the build instead of only being reported.
- **`install-core.js` hardened against command injection and path traversal**: replaced all `execSync` (shell:true, string interpolation) calls with `execFileSync` (array args, no shell parsing) for the `shared`/`bundles` copy step, the `merge-skill.js` invocation, and the removed `node -e` interpolated-script pattern in the token-savings calculator. Added a path-traversal guard (`path.basename` + `path.resolve` + root boundary check) before any per-skill `rmSync`/`mkdirSync`, and a non-blocking warning when installing a skill with `risk_level: critical`.

### Changed
- **Deduplicated skill directory-walking logic** (`scripts/lib/walk-skills.js`): `validate-skills.js`, `generate-catalog.js`, and `install-core.js` now share a single `walkSkillFiles()` implementation instead of three separate copies.
- **`catalog.json` version resolution now prioritizes `package.json`** over a potentially stale existing `catalog.json` version, fixing a bug where the catalog could silently fall behind the actual package version.
- **`.githooks/pre-commit` now scopes skill validation**: `npm run validate` only runs when staged files touch `skills/` or the catalog/validation scripts, reducing redundant work on unrelated commits. The test suite still runs on every commit.
- **`router` no longer nudges cascading security audits**: disambiguated `auditor-de-seguridad` (default) vs `cyber-neo` (toolchain-specific) vs `supply-chain-auditor` (dependency-scope-specific) so overlapping SCA/secrets scans aren't run back-to-back for the same scope.
- Added test coverage for `generate-catalog.js`'s hand-rolled YAML frontmatter parser and `create-skill.js`'s kebab-case normalization (previously untested); total suite now 304 tests (was 251).

---

## [1.12.0] - 2026-07-20

### Added
- **`ponytail` core skill** (total skills: 48 → 49, core: 31 → 32): forces the minimal-intervention ladder (YAGNI → reuse → stdlib → native → dependency → one-liner → minimal new code) before writing any new code. No external dependencies — pure `SKILL.md`, portable to Claude Code, opencode, and antigravity out of the box via the existing merge-loader.
- **README tip: `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE`**: documented how to lower Claude Code's auto-compact threshold (default ~83-90%) via `~/.claude/settings.json`'s `env` block, avoiding premature token exhaustion on long sessions.

---

## [1.9.0] - 2026-07-14

### Added
- **3 new loop-engineering core skills** (total skills: 45 → 48, core: 28 → 31):
  - `changelog-drafter` — Post-tag auto-changelog drafting with read-only tools, rate limiting (1 exec/h), secret scan gate, and anti-loop protection (SKILLGRID_LOOP_MAX_ITER=1). Output is always a PR, never a direct push.
  - `issue-triage` — Read-only GitHub issue classifier using keyword heuristics and template matching. Proposes labels and priorities. Report-only L1 mode by default (no auto-tagging first week). Depends on `gh` CLI with minimum `contents: read` + `issues: read` scopes.
  - `post-merge-cleanup` — Stale branch scanner with branch whitelist (main/master/develop), prefix filter (feature/, fix/, loop/), merge verification via `git branch --merged`, worktree exclusion, and human confirmation gate. Report-only L1 by default.

### Security
- All 3 new skills include embedded security gates: tool whitelists, rate limits, read-only defaults, and human confirmation requirements. Pattern aligns with audit-loop security architecture.

---

## [1.8.0] - 2026-07-13

### Added
- **GitHub Actions Security Pentest Workflow** (`.github/workflows/pentest.yml`): Pipeline dedicado de penetración y seguridad con 5 jobs paralelos:
  - 🔑 `secrets-scan` — TruffleHog (entropía) + Gitleaks (patrones) sobre historial git completo.
  - 🧪 `sast-scan` — Semgrep `p/owasp-top-ten` + `p/secrets` con upload SARIF a GitHub Security tab.
  - 📦 `sca-scan` — Trivy filesystem scan, bloquea PRs con severidad CRITICAL.
  - 🏗️ `iac-scan` — Checkov sobre `.github/workflows/` para detectar malas configuraciones de CI/CD.
  - 🔗 `supply-chain` — OpenSSF Scorecard (18 prácticas de seguridad, solo en `push` y `schedule`).
- **Triggers:** `pull_request → main` + `schedule` semanal (domingos 02:00 UTC) + `workflow_dispatch`.
- **SARIF centralizado:** Todos los resultados visibles en `Security → Code Scanning` de GitHub.

### Changed
- **README**: Nueva sección `🔒 Security Pipeline` con tabla de 5 jobs, badges de CI y Security Pentest.

---

## [1.7.3] - 2026-06-30

### Added
- **Pre-commit validation & test gate**: `.githooks/pre-commit` now runs `npm run validate` and `npm test` before allowing commits, catching broken skills and test failures at commit time.
- **Anti-vibecoding project directive**: `.agents/AGENTS.md` — project-level style and authenticity rules for all agents operating in this repo.

### Changed
- **Agent count corrected**: README updated from 32 to 13 (actual agents generated for `category: agent` skills).


## [1.7.2] - 2026-06-30

### Added
- **Architecture and Performance Rules**: Added `rules/common/architecture.md` defining rules for database bottlenecks, optimistic rendering rollbacks, static hosting layer boundaries, and OpenGraph/SEO meta configurations.

### Changed
- **`agente-ideas`**: Translated prompt instruction body to English to optimize context tokens and model logic flow, while preserving Spanish for frontmatter and interactive/final report outputs.


## [1.7.1] - 2026-06-26

### Changed
- Default profile: `install.ps1` now defaults to `all` profile.
- README: Added project stats section.

## [1.7.0] - 2026-06-19

### Added
- **`headroom`** context optimization skill.
- **`execution-runtime`** security isolation environment skill.

## [1.6.0] - 2026-06-13

### Added
- **`supply-chain-auditor`** agent skill: audits npm/pip/composer dependency graphs for CVEs (CVSS-scored), lockfile integrity, license violations (GPL/AGPL detection), deprecated packages, and transitive risk. Integrates with `audit-loop`.
- **`performance-profiler`** core skill: measure-first performance engineering covering Core Web Vitals (LCP/INP/CLS/FCP/TTFB), Lighthouse CI, bundle size analysis, API endpoint latency (p50/p95), DB slow query detection, and regression tracking with before/after delta tables.
- **`mcp-configurator`** core skill: configures Model Context Protocol (MCP) servers for Claude Code, Cursor, VS Code, opencode, and Windsurf. Includes platform detection, Tier 1/2 server directory, security checklist, and config templates for web dev, data science, and DevOps roles.
- **`prompt-injection-guard`** agent skill: defends against OWASP LLM01:2025 — direct injection, indirect injection via RAG/tools, jailbreak vectors, privilege escalation via tool calls. Includes 6-category audit checklist, safe prompt construction patterns, tool whitelist templates, and output schema validation examples.
- **`a2a-orchestrator`** core skill: implements Google Agent-to-Agent (A2A) protocol for cross-process multi-agent coordination. Covers Agent Cards, task lifecycle (SUBMITTED→WORKING→COMPLETED), sequential pipeline, parallel fan-out, and human-in-the-loop patterns. Distinct from `dispatching-parallel-agents` (intra-session).
- 5 new workflows in `skills/bundles/workflows.md`: AI Security Gate, Supply Chain Gate, Performance Gate, Multi-Agent Pipeline, LLM App Hardening
- `SKILLGRID_LOOP_TIMEOUT` and `SKILLGRID_LOOP_MAX_ITER` environment variables in `skills/shared/session-controls.md`

### Changed
- **`optimizador-finops`**: Added model cost optimization section with task-type → model recommendations table sourced from `models.json` (gemini-2.5-flash for quick fixes → claude-sonnet-4.6-thinking for architecture decisions)
- **`audit-loop`**: Added `ROLLBACK-SAFE` rule (revert only failing fix, not whole batch) and `TIMEOUT` rule (300s per iteration, configurable via `SKILLGRID_LOOP_TIMEOUT`)
- `remote-install.ps1` and `remote-install.sh`: updated pin from `v1.5.0` → `v1.6.0`
- `catalog.json`: version synced from `1.1.0` → `1.6.0` (was out of sync with README)
- Skills count: 33 → **38**

### Fixed
- `catalog.json` version field was reporting `1.1.0` while README documented v1.5 — now aligned

## [1.5.0] - 2026-06-10

### Added
- **`playwright-testing`** core skill: E2E testing skill integrated into bundle `core` and new bundle/profile `testing` (4 skills, ~8K tokens)
- **`models.json`**: 3 new models — `gemini-2.5-flash`, `claude-sonnet-4.6-thinking`, `o4-mini` with quirks, anti_patterns, and real pricing
- **`ralph-loop.ps1` / `ralph-loop.sh`**: Security gate — whitelist of allowed agents (claude, opencode, antigravity-ide, antigravity, aider, gemini). Prevents arbitrary command execution.

### Changed
- **`generate-catalog.js`**: Auto-sync of `skills/index.json` on `npm run catalog`. Prevents future desync between catalog.json and index.json.
- README: Workflow "Feature con E2E" added. Profile `testing` documented.

## [1.4.0] - 2026-06-08

### Changed
- **`agente-ideas`**: −42% tokens (1,101→633). New Complexity Gate, Early-Exit Gate (skips Stage 2 on convergence), Stage 2 redesigned as Chairman-driven (eliminates 3 LLM calls per deliberation)
- **`project-manager`**: −69% tokens (3,354→1,030). Compact Session Handoff, compressed protocols
- **`db-schema-detector`**: Tool names corrected to real opencode names (`bash`, `read`, `edit/write`)
- `openskills` bundle: `agente-ideas` added to antigravity distribution

## [1.3.0] - 2026-06-07

### Security
- `remote-install.ps1` and `remote-install.sh` pinned to `--branch v1.0.0` (supply-chain protection)
- `install.sh`: confirmation prompt before any destructive `rm -rf` operation
- `package-lock.json` generated to freeze dependency tree

### Changed
- `skills/shared/`: `report-common.ps1` created — shared `Escape-Html` function used by `audit.ps1` and `generate-report-from-json.ps1`
- All 12 security scanners in `audit.ps1` now run via `Start-Job` (parallel, PowerShell 5.1)
- Install profiles: `minimal`/`standard`/`strict` via `-Profile` flag
- `install-tasks.js` extracted from `install.ps1` (~739→~557 lines)
- AI writing patterns (30) extracted from `auditor-de-marketing/SKILL.md` to `references/ai-writing-patterns.md`

### Fixed
- `workflows.md`: typo `imperfectable` → `impeccable`
- `gestor-documental/SKILL.md`: Sections 3 and 4 swapped (correct logical order)
- `auditor-de-seguridad/SKILL.md`: Missing `verification-gate.md` reference added

## [1.2.0] - 2026-06-07

### Added
- **Marketing Audit Expansion**: Schema markup deep audit (JSON-LD, Rich Results), AEO/GEO/LLMO audit (`SpeakableSpecification`, `FAQPage`), Programmatic SEO audit, Copy quality audit (PAS/BAB/FAB patterns)
- **Visual Asset Pipeline**: Favicon multi-resolution (16×16→512×512), OG image templates, PWA manifest auto-generation, WCAG 4.5:1 contrast validation, framework auto-integration (Next.js/Astro/Vite/Nuxt/Angular)
- **`creativo-visual`** design skill: Visual Creative Director with 5-component prompt specification, ImageMagick integration, emoji library (60+ emojis)

## [1.1.0] - 2026-06-07

### Added
- `skills/index.json`: frontmatter index with progressive disclosure metadata (token estimates, cost tiers, invocation graph) for all skills
- `skills/shared/session-controls.md`: runtime environment variables (`SKILLGRID_HOOK_PROFILE`, `SKILLGRID_DISABLED_SKILLS`, `SKILLGRID_MAX_TOKENS_PER_SESSION`, `SKILLGRID_DRY_RUN`)
- `skills/shared/modules-footer.md`: DRY extraction of ~480 repeated lines across skills
- Install profiles: `minimal`/`standard`/`strict` in `skills/bundles/index.json`
- `token_estimate` frontmatter field on all SKILL.md files

### Security
- `skills/auditor-de-seguridad/references/mitre-attack.md`: MITRE ATT&CK v19.1 + NIST CSF 2.0 mappings for all 12 scanner categories
- `skills/shared/risk-assessment.md`: CVSS 4.0 rubric + Risk Treatment Decision Tree

### Changed
- `db-schema-detector`: Re-categorized from `agent` → `core`
- `skills/shared/codegraph-startup.md`: Incremental sync (timestamp-based diffing, avoids full rescans)

## [1.0.0] - 2026-05-01

### Added

- 25 skills across 3 tiers: core (17), design (2), specialized agents (6)
- Rules for 17 programming languages (common, angular, arkts, cpp, csharp, dart, fsharp, golang, java, kotlin, perl, php, python, react, ruby, rust, swift, typescript, web, zh)
- Cross-harness installers for opencode, antigravity, Claude Code, Cursor, GitHub Copilot, and Aider
- Security audit system (`audit.ps1` / `audit.sh`) with HTML report generation
- CODEX shared learning memory system with mission logs
- `project-manager` agent for task planning, delegation, and verification
- `agente-devops` agent for Docker/CI-CD security auditing
- `auditor-de-seguridad` agent for security scanning (SAST, dependencies, secrets)
- `auditor-de-marketing` agent for SEO, OpenGraph, and CTA conversion auditing
- `gestor-documental` agent for technical documentation formatting (APA, ISO)
- `optimizador-finops` agent for LLM token optimization and cost auditing
- Core SDLC workflow skills: brainstorming, TDD, spec-driven-development, writing-plans, incremental-implementation, code-simplification, systematic-debugging, verification-before-completion, and more
- Design engineering skills: emil-kowalski-design, impeccable-design-taste
- Install scripts for Windows (PowerShell) and Linux/Mac (Bash)
- Remote one-liner installers

### Infrastructure

- CI/CD validation workflow for skill frontmatter and structure
- Dependabot for npm and GitHub Actions dependency updates
- Standardized YAML frontmatter across all skills (name, description, category, status)
- Machine-readable catalog (`catalog.json`) with auto-generation script
- Skill validation script (`scripts/validate-skills.js`)
- Basic integration tests (`tests/`)
