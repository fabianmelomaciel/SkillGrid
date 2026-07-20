# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.12.0] - 2026-07-20

### Added
- **`ponytail` core skill** (total skills: 48 → 49, core: 31 → 32): forces the minimal-intervention ladder (YAGNI → reuse → stdlib → native → dependency → one-liner → minimal new code) before writing any new code. No external dependencies — pure `SKILL.md`, portable to Claude Code, opencode, and antigravity out of the box via the existing merge-loader.

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
