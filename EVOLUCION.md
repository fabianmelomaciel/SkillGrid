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
- E4..E9 | archivadas 2026-10-15 — secretos con `\x27` muerto (E4), README con conteos hardcodeados (E5), sin test docs↔catálogo (E6), CODEX sin presupuesto (E7), check de evolución fuera del CI de docs (E8), pre-commit bloqueando claves de ejemplo (E9); cerradas 2026-10-01/02, detalle en el historial de git
- E10..E20 | archivadas 2026-10-17 — Stage 3 + fixes de review (E10 Stage3 "Agente recomendado", E11 hooks warn-only, E12 nudge /codex-log, E13 compact, E14/E16 commands, E15 plugin match, E17 mensajes, E18 package files, E19 CHANGELOG, E20 XSS dashboards); cerradas 2026-10-02/05, detalle en el historial de git
- E23 | seguridad | Skills y MCP de terceros se instalan en los IDEs sin ninguna auditoría previa (el instalador solo localiza el directorio) | P2 | 2026-10-15 | scripts/install-tasks.js:146 | cerrado 2026-10-15 | scripts/scan-third-party.js:20, tests/preinstall-audit.test.js
- E24 | finops | `cost_tier` se recalcula en el catálogo pero el router nunca lo usa al cargar skills | P2 | 2026-10-15 | scripts/generate-catalog.js:150 | cerrado 2026-10-15 | skills/router/SKILL.md:34, tests/router.test.js
- E25 | ci | La misma suite corre en windows (2x minutos) y ubuntu como jobs separados, y docker-build corre en cada push aunque nadie toque cyber-neo | P3 | 2026-10-15 | .github/workflows/ci.yml:35 | cerrado 2026-10-15 | .github/workflows/ci.yml:35, .github/workflows/docker-build.yml:1
- E26 | memoria | La compactación inyecta deliberaciones y evolución pero no los planes con tareas sin cerrar — tras un crash se pierde el trabajo del plan | P2 | 2026-10-15 | .opencode/plugins/session-memory.js:99 | cerrado 2026-10-15 | .opencode/plugins/session-memory.js:80, tests/session-memory.test.js
- E21 | supply-chain | Acciones de GitHub y docker pineadas por tag mutable (actions/checkout@v7, codeql-action@v4, docker/*) mientras las de terceros van por SHA | P2 | 2026-10-05 | .github/workflows/ci.yml:16 | cerrado 2026-10-06 | tests/action-pins.test.js:31 (28 uses a SHA de 40 hex + permissions/contents read + persist-credentials en los 12 checkouts)
- E22 | secretos | El pre-commit no cubre storageState.json de Playwright (JWT/cookies de sesión) — patrón ausente en el scanner | P2 | 2026-10-06 | .githooks/pre-commit:13 | cerrado 2026-10-06 | .githooks/pre-commit:58, tests/action-pins.test.js:63
- E27 | ux | Los 8 templates de reporte sin motion de calidad (sin reveal de entrada, sin stagger, sin micro-zoom en severidad), con CDN de Google Fonts y acordeones en `<div onclick>` inaccesibles por teclado | P3 | 2026-10-05 | skills/auditor-de-seguridad/reports/dashboard-template.html:109 | cerrado 2026-10-17 | tests/motion-block.test.js:1
- E28 | skill | Las skills de diseño no cubren las APIs de motion con estado 2026: View Transitions same-document (Baseline 2025-10-14, los 3 motores), cross-document (`@view-transition`, limited), scroll-driven animations (Chrome/Safari, sin Firefox), el trío overlay (`@starting-style`/`transition-behavior`/popover) ni la decisión de librería (Motion MIT 3.2KB vs GSAP gratis con licencia no-OSI de Webflow) | P2 | 2026-10-17 | skills/github-premium-aesthetics/SKILL.md:117 | cerrado 2026-10-17 | skills/github-premium-aesthetics/SKILL.md:131, skills/emil-kowalski-design/SKILL.md:81
- E29 | ledger | check-evolution.js valida la forma de la evidencia de cierre pero no la cruza contra el filesystem: una cita `archivo:línea` inventada pasa el gate igual | P1 | 2026-10-17 | scripts/check-evolution.js:59 | cerrado 2026-10-17 | tests/evolution-evidence.test.js:1
- E30 | seguridad | Un commit que sólo toca .md (EVOLUCION.md, skills, rules) no pasa por secrets-scan: ci.yml y pentest.yml lo saltean con paths-ignore y ci-md.yml no escaneaba secretos | P1 | 2026-10-17 | .github/workflows/ci.yml:6 | cerrado 2026-10-17 | .github/workflows/ci-md.yml:49
- E31 | ledger | La evolución se detecta a mano: nada junta el delta desde el último ciclo contra el ledger para proponer candidatas sin gastar tokens | P2 | 2026-10-17 | EVOLUCION.md:21 | cerrado 2026-10-17 | scripts/evolve-scan.js:1, tests/evolve-scan.test.js:1
- E32 | inyeccion | El plugin de memoria inyecta sin sanear lo que lee de CODEX.md, EVOLUCION.md y los planes: texto del repo (o un plan que generó otro) entra al prompt en cada compactación y puede colar directivas | P1 | 2026-10-17 | .opencode/plugins/session-memory.js:153 | cerrado 2026-10-17 | .opencode/plugins/session-memory.js:41, tests/session-memory.test.js:1
- E33 | autonomia | Los scripts de Ralph Loop whitelistean el binario del agente pero no acotan qué rutas puede tocar: una tarea maliciosa o inyectada deja al agente autónomo escribir cualquier archivo | P1 | 2026-10-17 | scripts/ralph-loop.ps1:45 | cerrado 2026-10-17 | scripts/ralph-policy.js:1, tests/ralph-policy.test.js:1
- E34 | portabilidad | ralph-loop.ps1 no corría en Windows PowerShell 5.1: sin BOM, los emojis rompían el parseo (el archivo ya fallaba antes en su última línea) | P2 | 2026-10-17 | scripts/ralph-loop.ps1:150 | cerrado 2026-10-17 | scripts/ralph-loop.ps1:1, tests/ralph-policy.test.js:1
- E35 | ledger | Las candidatas del escáner salían sin orden: había que leerlas todas a mano para saber cuál mirar primero, sin señal de riesgo ni de cobertura | P3 | 2026-10-17 | scripts/evolve-scan.js:86 | cerrado 2026-10-17 | scripts/evolve-scan.js:125, tests/evolve-scan.test.js:1
- E36 | ledger | El escáner y las guardas eran piezas sueltas: no había un comando único que corriera el ciclo (detectar, priorizar, verificar) y avisara si el ledger quedó sano o si el árbol toca algo prohibido | P3 | 2026-10-17 | scripts/evolve-scan.js:1 | cerrado 2026-10-17 | scripts/evolve.js:1, tests/evolve-loop.test.js:1
