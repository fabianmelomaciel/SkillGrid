# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- New `audit-loop` agent skill: closed-loop audit repair with bounded iterations (max 3), 3-color finding taxonomy (green auto-fix, yellow CEO-OK, red never-fix), per-batch verification, and escalation gates
- Follow-up "¿Ejecuto el loop de reparación?" prompt in `auditor-de-seguridad`, `auditor-de-marketing`, and `optimizador-finops`
- 3 new workflows in `skills/bundles/workflows.md`: post-audit repair loop, full audit+repair, pre-deploy gate
- 9 fixture projects for testing the audit-loop behavior across all scenarios
- `tests/audit-loop/audit-loop.test.js` with PowerShell-based fixture runner and snapshot validation

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
