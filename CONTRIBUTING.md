# Contribuyendo a SkillGrid

¡Gracias por tu interés en contribuir! Este documento describe el proceso y las convenciones del proyecto.

## Setup local

```bash
git clone https://github.com/fabianmelomaciel/SkillGrid.git
cd SkillGrid
npm install
./install.sh        # o .\install.ps1 en Windows — ver README.md para perfiles y opciones
```

## Antes de hacer commit

Ejecuta siempre:

```bash
npm run validate   # validación de estructura YAML de skills
npm test           # tests de integridad (ver conteo actual en CHANGELOG.md)
```

Ambos deben pasar sin errores.

## Estructura del proyecto

- `skills/<name>/SKILL.md` — cada skill es un directorio con su `SKILL.md`
- `scripts/` — utilidades de validación, generación de catálogo e instalación
- `tests/` — tests de integridad de skills
- `.github/workflows/` — CI y pentest automatizado

## Origen de los skills

- `skills/core/` contiene principalmente adaptaciones de skills públicos de Anthropic (brainstorming, systematic-debugging, test-driven-development, writing-plans, etc.). Al modificarlos, evaluá si el cambio corresponde upstream o es específico de SkillGrid.
- El resto de `skills/` (router, ponytail, agente-ideas, auditor-de-seguridad, cyber-neo, optimizador-finops, etc.) es autoría original de SkillGrid.

## Convenciones para skills

- **YAML frontmatter obligatorio** con campos: `name`, `description`, `category`, `status`, `risk_level`
- Secciones: `## Core` (contenido principal), `## Modules` (footers con etiquetas `[model:*]` / `[platform:*]`)
- Referenciar protocolos compartidos: `anti-rationalization.md`, `risk-assessment.md`, `verification-gate.md`, `codegraph-startup.md`, `codex-learning-loop.md`

## Flujo de trabajo

- Rama base: `main`
- Crea ramas desde `main`: `feature/<nombre>` o `fix/<nombre>`
- Los PRs se hacen a `main`
- Revisa `CODEX.md` para contexto actual del proyecto

## Licencia

Al contribuir aceptas que tu código se publique bajo licencia MIT.
