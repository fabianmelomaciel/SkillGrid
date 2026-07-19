# Contribuyendo a SkillGrid

¡Gracias por tu interés en contribuir! Este documento describe el proceso y las convenciones del proyecto.

## Setup local

```bash
git clone https://github.com/fabianmelomaciel/SkillGrid.git
cd SkillGrid
npx opencode install  # o instalación manual según README.md
```

## Antes de hacer commit

Ejecuta siempre:

```bash
npm run validate   # validación de estructura YAML de skills
npm test           # 251 tests de integridad
```

Ambos deben pasar sin errores.

## Estructura del proyecto

- `skills/<name>/SKILL.md` — cada skill es un directorio con su `SKILL.md`
- `scripts/` — utilidades de validación, generación de catálogo e instalación
- `tests/` — tests de integridad de skills
- `.github/workflows/` — CI y pentest automatizado

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
