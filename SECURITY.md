# Política de Seguridad de SkillGrid

## Reportar una vulnerabilidad

Si encuentras una vulnerabilidad de seguridad en SkillGrid, por favor repórtala a través de:

1. **GitHub Issues** — crea un issue con label `security` en https://github.com/fabianmelomaciel/SkillGrid/issues
2. **Email** — fabianmelomaciel@gmail.com (respuesta en máximo 48h)

## Tiempo de respuesta

Espera una confirmación dentro de las primeras 48 horas. Trabajaremos en una solución y coordinaremos la divulgación responsable.

## Prácticas recomendadas

- **No publiques 0-days públicamente** sin antes coordinar con el equipo
- Proporciona pasos reproducibles, versión afectada y posible impacto
- Si es posible, incluye una sugerencia de mitigación

## Alcance

Este programa cubre:

- Skills (`skills/*/SKILL.md`)
- Scripts de instalación (`install.ps1`, `install.sh`, `remote-*.ps1`, `remote-*.sh`)
- Scripts de utilería (`scripts/`)
- Workflows CI/CD (`.github/workflows/`)

## Divulgación

Trabajamos con el estándar de divulgación responsable. Una vez solucionado, publicaremos un advisory con crédito al reportante (si así lo desea).
