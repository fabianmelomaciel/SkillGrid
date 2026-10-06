# Evolución

Lo que este proyecto todavía tiene que mejorar. Se registra el error con su evidencia, se corrige, y la fila sale de `## Abiertas` para `## Cerradas` — no se borra nunca, es el historial.

Es del desarrollador y vive en dev: no se publica en el paquete npm ni se copia en la instalación — el usuario recibe la evolución ya aplicada (reglas, skills, tests), no el historial. Regla que no se rompe: `tests/check-evolution.test.js` hace fallar el gate si el ledger se cuela al paquete o al instalador.

Formato de fila:

```
- EX | categoría | mejora | PX | AAAA-MM-DD | evidencia archivo:línea
```

Una fila cerrada agrega dos campos al final:

```
| cerrado AAAA-MM-DD | evidencia de cierre archivo:línea o test
```

Cómo se usa:

1. Un hallazgo que no tiene fila acá no está registrado. Un fix que no movió la fila no está terminado.
2. La evidencia de cierre es verificable (`archivo:línea` o un test), no "queda arreglado".
3. Antes de emitir una auditoría, un reporte o un plan nuevo: leer `## Abiertas`. Lo que ya está listado no se re-reporta y lo cerrado no se re-analiza.
4. Más de 20 cerradas → comprimir las más viejas en una sola línea (`- E1..E4 | archivadas ...`).
5. `node scripts/check-evolution.js` valida el formato y corre en `npm run gate`, en el pre-commit y en CI.
6. Evolución terminada y todo resuelto → instalar en el IDE local del equipo, commit y push a GitHub. Sin ese pase el fix no llega a ningún lado.

## Abiertas

## Cerradas

- E1..E3 | archivadas 2026-10-06 — pin-check local (E1), instaladores fail-open sin tag (E2), secrets-scan sin `on: push` (E3); cerradas 2026-10-01, detalle en el historial de git
- E4 | seguridad | Patrones de secretos rotos: grep 3.0 no entiende `\x27` (7 patrones casi muertos) y `DB_PASS=` nunca matcheaba | P1 | 2026-10-01 | .githooks/pre-commit:13 | cerrado 2026-10-01 | .githooks/pre-commit:12, .githooks/pre-commit:34
- E21 | supply-chain | Acciones de GitHub y docker pineadas por tag mutable (actions/checkout@v7, codeql-action@v4, docker/*) mientras las de terceros van por SHA | P2 | 2026-10-05 | .github/workflows/ci.yml:16 | cerrado 2026-10-06 | tests/action-pins.test.js:31 (28 uses a SHA de 40 hex + permissions/contents read + persist-credentials en los 12 checkouts)
- E22 | secretos | El pre-commit no cubre storageState.json de Playwright (JWT/cookies de sesión) — patrón ausente en el scanner | P2 | 2026-10-06 | .githooks/pre-commit:13 | cerrado 2026-10-06 | .githooks/pre-commit:58, tests/action-pins.test.js:63
- E10 | skill | Stage 3 no recomendaba qué agente usar según el pedido y rules/common no traía regla de economía de tokens ni CODEX-first para IDEs | P2 | 2026-10-02 | skills/agente-ideas/SKILL.md:97 | cerrado 2026-10-02 | skills/agente-ideas/SKILL.md:97, rules/common/token-economy.md:1
- E11 | hooks | Enforcement que hoy es solo texto y sin recetas: avisar console.log post-edit y al Stop, reminder antes de git push, formateo post-edit — todo warn-only, sin bloqueos | P1 | 2026-10-02 | rules/common/hooks.md:1 | cerrado 2026-10-02 | rules/common/hooks.md:32
- E13 | compact | Compactación floja: la sesión se acerca al límite sin aviso; opencode solo ofrece auto+prune, sin intervalos ni hook de aviso | P2 | 2026-10-02 | rules/common/performance.md:20 | cerrado 2026-10-02 | opencode.json:1 (prune: true es el único cambio real)
- E14 | commands | El handoff sugiere comandos slash (p. ej. /project-manager) pero SkillGrid no instala ningún command de opencode | P2 | 2026-10-02 | skills/agente-ideas/SKILL.md:113 | cerrado 2026-10-02 | scripts/install-tasks.js:114
- E15 | plugin | El hook de session-memory matcheaba el header citado en prosa y no el heading: inyectaba el preámbulo de EVOLUCION en vez de las filas abiertas, y el plugin no tenía ningún test | P1 | 2026-10-02 | .opencode/plugins/session-memory.js:46 | cerrado 2026-10-02 | tests/session-memory.test.js:70
- E16 | commands | Dos fuentes de verdad para codex-log.md sin test de igualdad, y install-commands revienta con un subdirectorio llamado *.md (EISDIR) | P2 | 2026-10-02 | scripts/install-tasks.js:114 | cerrado 2026-10-02 | tests/install-tasks.test.js:52
- E5 | docs | README hardcodea conteos (43 skills / 274 tests) que vuelan cada vez que cambian | P1 | 2026-10-01 | README.md:6, README.md:10, README.md:35 | cerrado 2026-10-02 | README.md:6
- E6 | tests | Falta test de consistencia docs vs `catalog.json` — la clase de drift ya se repitió 4 veces | P1 | 2026-10-01 | CODEX.md:88 | cerrado 2026-10-02 | tests/docs-consistency.test.js:29
- E7 | memoria | CODEX.md sin presupuesto de tamaño (22KB; la entrada de v1.15.0 sola tiene 2295 chars) | P2 | 2026-10-01 | CODEX.md:83 | cerrado 2026-10-02 | tests/codex-budget.test.js:34
- E8 | ci | El check de evolución no corre en CI cuando el commit es solo `.md` (`paths-ignore: '**.md'`); lo cubre el pre-commit local | P2 | 2026-10-01 | .github/workflows/ci.yml:6 | cerrado 2026-10-02 | .github/workflows/ci-md.yml:27
- E9 | secrets | Cualquier commit que toque docs con claves de ejemplo (AWS de ejemplo, headers PEM) queda bloqueado por el pre-commit | P2 | 2026-10-01 | skills/auditor-de-seguridad/reports/audit-example.html:477 | cerrado 2026-10-02 | .githooks/pre-commit:51
- E12 | memoria | Persistencia entre sesiones resuelta con el plugin session-memory; falta el nudge automático de /codex-log al cerrar la sesión | P1 | 2026-10-02 | skills/shared/codex-learning-loop.md:7 | cerrado 2026-10-02 | tests/session-memory.test.js:109
- E17 | mensajes | El help del instalador quedó con la línea `--language php` sin descripción (copy-paste del review de a0aab20) y install-commands loguea un template literal sin interpolación | P2 | 2026-10-02 | scripts/install-core.js:414, scripts/install-tasks.js:118 | cerrado 2026-10-02 | scripts/install-core.js:414, scripts/install-tasks.js:118
- E18 | supply-chain | `package.json` no incluye `commands/` en `files`: el paquete npm se publica sin comandos y `install-commands` no hace nada para consumidores npm (menor #8 del review de a0aab20) | P2 | 2026-10-02 | package.json:22 | cerrado 2026-10-02 | package.json:25
- E19 | docs | Sin sección [Unreleased] en CHANGELOG: los 8 commits posteriores a v1.17.0 quedaron sin registrar y el próximo release habría que reconstruirlos a mano | P1 | 2026-10-05 | CHANGELOG.md:8 | cerrado 2026-10-05 | CHANGELOG.md:8
- E20 | seguridad | Inyección HTML/script al interpolar hallazgos, paths y código escaneado sin escapar en los dashboards de reporte | P1 | 2026-10-05 | skills/auditor-de-seguridad/reports/dashboard-template.html:421 | cerrado 2026-10-05 | skills/shared/report-security.md:1
