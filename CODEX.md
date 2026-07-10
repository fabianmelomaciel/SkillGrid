# 🧠 SkillGrid: Tactical CODEX (Learning Memory)

This document is the shared, dynamically evolving persistent memory of the SkillGrid agent squad. It prevents re-explaining context, repeating solved problems, and wasting tokens on re-discovery.

> [!IMPORTANT]
> **AGENT DIRECTIVE:** Read this file at the START of every task. Apply all entries. Do NOT ask the user to re-explain anything documented here. Write back learnings after completing tasks.

> [!NOTE]
> This file is **local-only** and listed in `.git/info/exclude`. Your instance is yours — fill it with your project's truths.

## 🎯 Project Context Quick Reference

- **Project Name**: SkillGrid
- **Primary Language & Framework**: Node.js (JavaScript / CommonJS) + PowerShell/Bash scripting
- **Supported AI Engines**: opencode, antigravity, antigravity-ide, Claude Code, Cursor, GitHub Copilot (cross-compatible)
- **Local Server**: None (CLI utility scripts only)
- **Package Manager(s)**: npm 10+
- **Key Directories**:
  - `/skills` — Source directories for agent skills (each containing a `SKILL.md`)
  - `/rules` — Custom IDE rules source templates (`common/`, `typescript/`, etc.)
  - `/scripts` — Utility, catalog, validation, merging, and installer scripts
  - `/tests` — Unit tests for verifying skills and audit loop functions
- **Database**: None (analyzed via db-schema-detector for project integrations)
- **Deployment**: Automatic local install scripts targeting platforms (opencode, antigravity, Claude Code)
- **Design System**: Vanilla HTML/CSS with dark mode & glassmorphism for generated report dashboards

## 💡 Token Economy Rules

1. Read CODEX first — never ask the user to re-explain documented context.
2. Compact output — prefer tables and bullets over narrative prose.
3. No preamble — skip openers, start doing.
4. Reference don't repeat — cite past Mission Logs by date instead of re-explaining.
5. Minimal clarifying questions — check files before asking.
6. Immediate Code Verification (Verify-As-You-Go) — Never assume a code edit works. Immediately run syntax, compile, linter, or test commands after every single modification.
7. Dynamic Context Learning — Write new findings (gotchas, environment/config quirks) to CODEX.md under Technical Gotchas or Mission Logs immediately after resolving them.
8. Single contiguous replacements — edit code using minimal replace blocks to avoid wasting tokens on sending huge files.

## 🤖 Model Selection Guide (Haiku vs Sonnet)

Claude Code does NOT support automatic model routing via settings.json. Use this table to pick the right model manually (`/model` command or `--model` flag).

| Task Type | Complexity | Est. Tokens | Use |
|-----------|-----------|-------------|-----|
| Skill lookup / read file | Low | 2–5K | **Haiku** |
| Bug fix in existing code | Low | 8–15K | **Haiku** |
| Git log search / grep query | Low | 5–10K | **Haiku** |
| Catalog/index update | Low | 10–20K | **Haiku** |
| Feature enhancement | Medium | 20–40K | **Sonnet** |
| New skill creation | Medium-High | 40–80K | **Sonnet** |
| Architecture review / agente-ideas | High | 50–120K | **Sonnet** |
| Security audit (full project) | High | 60–150K | **Sonnet** |
| Multi-agent orchestration | High | 80K+ | **Sonnet** |

**Rule of thumb:** default to Haiku; escalate to Sonnet when the task requires multi-file reasoning, design decisions, or >20K token context. A hybrid pattern (Haiku subagents → Sonnet synthesis) saves ~40% on complex tasks.

**Context size baseline per session:** ~45K tokens after Fase 1 cleanup (was ~90K). Breakdown:
- `catalog-lite.json` on demand: 5.5KB (vs full `catalog.json` 14.4KB — 62% saved)
- `scratch/` cleaned: no nested `.git` artifacts
- `memory/` rotated: run `.claude/scripts/compress-memory.sh` weekly

## 🛠️ Technical Gotchas & Environment Lessons

- **Skill Validation**: All skills MUST contain a valid YAML frontmatter containing `name`, `description`, `category`, `status`, and `risk_level`. This is checked automatically via `npm run validate`.
- **Catalog Maintenance**: If you add, delete, or rename any skill, you MUST run `npm run catalog` immediately to synchronize `catalog.json` and `skills/index.json`. Also regenerate `catalog-lite.json` by running: `node -e "const c=require('./catalog.json');const fs=require('fs');fs.writeFileSync('catalog-lite.json',JSON.stringify({version:c.version,generated_at:c.generated_at,total:c.total,skills:c.skills.map(s=>({name:s.name,status:s.status,risk_level:s.risk_level,category:s.category}))},null,2))"`. `catalog-lite.json` is gitignored (generated, not committed).
- **Test Integrity**: Always run `npm test` before declaring a task complete. Tests verify the structure of YAML frontmatters and mock environments for the audit loop.
- **Git Exclusions**: To prevent cluttering the repository, local-only rule directories (`.cursor/`, `.github/`), `CODEX.md`, and `.codegraph/` must remain untracked and excluded in `.git/info/exclude`.

## 💻 Mission Logs & Tactical Learnings

- 2026-06-10 - Project Optimization — Initialized CODEX.md, local project rules, and CodeGraph memory to prevent agent errors and reduce prompt context footprint.
- 2026-06-13 - v1.6 "Supply Chain & Agent Protocol" — Added 3 new skills (supply-chain-auditor, performance-profiler, mcp-configurator) via agente-ideas deliberation council. Fixed catalog.json version desync (1.1.0→1.6.0). Added ROLLBACK-SAFE + TIMEOUT rules to audit-loop. Added model cost table to optimizador-finops. Gotcha: catalog.json version must be updated MANUALLY before running `npm run catalog` — the script regenerates index.json but does NOT auto-update catalog.json version field.
- 2026-06-13 - v1.6 Continuation — Added 2 more skills (prompt-injection-guard: OWASP LLM01:2025, a2a-orchestrator: Google A2A protocol). Updated remote-install pin v1.5.0→v1.6.0 in both PS1 and SH. Total: 38 skills. Key lesson: a2a-orchestrator is NOT a duplicate of dispatching-parallel-agents — A2A = cross-process HTTP protocol, dispatching = intra-session tool delegation.
- 2026-06-19 - Spec Kit Integration — Added `spec-kit` agent + skill. Wraps GitHub Spec-Kit (`specify`) CLI for opencode. `spec-driven-development` skill now detects `specify` on PATH and delegates artifact generation to spec-kit subagent (fast path), falling back to manual instructions if unavailable. Requires Python 3.11+ and `uv` on the host system. Updated: catalog.json (total: 43), README (agent list + management bundle). Spec Kit's `specify init . --integration opencode --force` bootstraps `.specify/` directory with SDD templates.
- 2026-06-19 - Headroom Integration — Integrated `headroom` CLI (token compression) into: incremental-implementation (MCP server + command wrapper), context-engineering (context stats + compression), verification-before-completion (output compression), test-driven-development (TDD cycle compression). Headroom available via npm (`npm install -g headroom-ai`) or pip (`pip install headroom-ai`). Note: pip install requires Python 3.11-3.13 (PyO3 no soporta Python 3.14).
- 2026-06-19 - CodeGraph Active Invocation — Added Level 6 to context-engineering: explicit `codegraph query`, `codegraph report`, `codegraph init && codegraph sync` commands for direct graph consultation instead of reading files.
- 2026-06-25 - Token/Security Optimization Sprint — agente-ideas deliberation council (3 subagents) + project-manager execution. Delivered: (1) .gitignore hardened (+.claude/, credentials*, secrets*, .env*, catalog-lite.json); (2) .claude/scripts/cleanup-artifacts.sh + compress-memory.sh with Stop hook; (3) catalog-lite.json generator (62% smaller than catalog.json); (4) .githooks/pre-commit secrets scanner (13 patterns, no external deps); (5) CODEX Model Selection Guide (Haiku vs Sonnet decision table); (6) auditor-de-seguridad — email case-variation rate-limit bypass added to rate-limit-scanner.ps1 (HIGH finding) and checklists.md. Gotcha: model_routing and weekly_compress hooks are NOT native Claude Code features — use `/model` command and system cron/Task Scheduler instead. Fase 2 (skills/→src/skills/) DEFERRED — 7+ hardcoded paths in installer scripts, blast radius > benefit.
- 2026-06-26 - v1.7.1 Release — Full Install + Bugfix + GitHub Push + Stats Dashboard. (1) Default de installer PS1 cambiado de `minimal` a `all`. (2) Bugfix `project-mixed-findings` snapshot. (3) README actualizado con stats (226 tests, 4 plataformas, token savings por modelo, badges). (4) Git init + push a `github.com/fabianmelomaciel/SkillGrid` (rama main) con tag v1.7.1. (5) Instalación local perfil `all` completa en opencode (43 skills + 13 agents), antigravity (43), antigravity-ide (43), Claude Code (43). (6) Vercel Agent Browser (`vercel-labs/agent-browser`, 30K+ stars, v0.30.1) evaluado para futura integración. Gotcha: al sincronizar git local (init fresh) con remote existente, usar `git fetch origin; git checkout origin/main -b temp-main; git checkout master -- <files>; git commit; git push origin temp-main:main`.
- 2026-07-09 - Security Tooling Expansion — cyber-neo potenciado con 5 nuevas herramientas locales. Instaladas: Semgrep (SAST multilenguaje), Trivy (SCA), Gitleaks (secretos), TruffleHog (secretos por entropía), Checkov (IaC: Terraform, K8s, Docker), Bandit (Python SAST), Safety (SCA Python), Nuclei (vulnerabilidades web). Script `scripts/setup-security-tools.ps1` creado para instalación reproducible. PATH de usuario actualizado para disponibilidad en todos los IDEs. SKILL.md de cyber-neo extendido con allowed-tools, fases SCA/SAST/Secrets/IaC. install.ps1/sh actualizados con detección e instalación interactiva. Total: 45 skills. Gotcha: TruffleHog no soporta `--version` — se verifica con `trufflehog 2>&1` (usage output). Safety requiere click>=8.2.1 (pip install --upgrade click). `catch {}` en PowerShell es false positive del pre-commit hook.
- 2026-06-30 - v1.7.3 Release — Pre-commit Gate + Anti-Vibecoding + README Fix. (1) `.githooks/pre-commit` ahora ejecuta `npm run validate` + `npm test` antes de cada commit (gate de calidad). (2) `.agents/AGENTS.md` — directiva anti-vibecoding a nivel de proyecto (no-AI-signatures, naming humano, spacing natural). (3) README corregido: agent count 32→13 (el script solo genera agentes para `category: agent`, que son 13 skills). (4) CHANGELOG actualizado con v1.7.3. (5) Instalación local completada en 5 plataformas: opencode (43 skills + 13 agents), antigravity (43), antigravity-gemini (43), antigravity-ide (43), Claude Code (43). (6) Auditoría post-release: remote-install pins actualizados v1.6.0→v1.7.3, tag v1.7.3 creado y push. Gotcha: el conteo de agentes en README estaba desactualizado desde v1.5 — siempre fue 13, no 32. Gotcha: `catch {}` en PowerShell es un false positive del anti-vibecoding scanner — es manejo de errores legítimo.
- 2026-07-10 - Design Fit Evaluation (agente-ideas) — Consejo de diseño evaluó 5 enfoques (impeccable-design-taste, emil-kowalski-design, github-premium-aesthetics, creativo-visual, huashu-design) para SkillGrid. Veredicto unánime: ninguno aplica porque SkillGrid es un CLI tool sin frontend UI. El diseño actual (dark mode + glassmorphism en reports, README limpio) ya es óptimo. Se corrigió README: 44→45 skills, 227→236 tests, se agregó `creativo-visual` faltante al catálogo de diseño. Instalación local completa en 4 plataformas (45 skills c/u). Gotcha: huashu-design (alchaincyf/huashu-design, 20K stars) es una skill de diseño HTML-native externa, no aplica a CLI tools.
