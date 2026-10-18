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
- E21..E26 | archivadas 2026-10-18 — scopes de acciones pineados (E21), storageState.json fuera del pre-commit (E22), auditoría de terceros al instalar (E23), `cost_tier` sin uso en el router (E24), suite duplicada win/ubuntu (E25), planes sin cerrar fuera de la compactación (E26); cerradas 2026-10-05/06/15, detalle en el historial de git
- E27..E30 | archivadas 2026-10-18 — motion/zoom de los 8 reportes (E27), motion stack 2026 en skills de diseño (E28), evidencia de cierre cruzada contra disco (E29), secrets-scan en commits solo-.md (E30); cerradas 2026-10-17, detalle en el historial de git
- E31 | ledger | La evolución se detecta a mano: nada junta el delta desde el último ciclo contra el ledger para proponer candidatas sin gastar tokens | P2 | 2026-10-17 | EVOLUCION.md:21 | cerrado 2026-10-17 | scripts/evolve-scan.js:1, tests/evolve-scan.test.js:1
- E32 | inyeccion | El plugin de memoria inyecta sin sanear lo que lee de CODEX.md, EVOLUCION.md y los planes: texto del repo (o un plan que generó otro) entra al prompt en cada compactación y puede colar directivas | P1 | 2026-10-17 | .opencode/plugins/session-memory.js:153 | cerrado 2026-10-17 | .opencode/plugins/session-memory.js:41, tests/session-memory.test.js:1
- E33 | autonomia | Los scripts de Ralph Loop whitelistean el binario del agente pero no acotan qué rutas puede tocar: una tarea maliciosa o inyectada deja al agente autónomo escribir cualquier archivo | P1 | 2026-10-17 | scripts/ralph-loop.ps1:45 | cerrado 2026-10-17 | scripts/ralph-policy.js:1, tests/ralph-policy.test.js:1
- E34 | portabilidad | ralph-loop.ps1 no corría en Windows PowerShell 5.1: sin BOM, los emojis rompían el parseo (el archivo ya fallaba antes en su última línea) | P2 | 2026-10-17 | scripts/ralph-loop.ps1:150 | cerrado 2026-10-17 | scripts/ralph-loop.ps1:1, tests/ralph-policy.test.js:1
- E35 | ledger | Las candidatas del escáner salían sin orden: había que leerlas todas a mano para saber cuál mirar primero, sin señal de riesgo ni de cobertura | P3 | 2026-10-17 | scripts/evolve-scan.js:86 | cerrado 2026-10-17 | scripts/evolve-scan.js:125, tests/evolve-scan.test.js:1
- E36 | ledger | El escáner y las guardas eran piezas sueltas: no había un comando único que corriera el ciclo (detectar, priorizar, verificar) y avisara si el ledger quedó sano o si el árbol toca algo prohibido | P3 | 2026-10-17 | scripts/evolve-scan.js:1 | cerrado 2026-10-17 | scripts/evolve.js:1, tests/evolve-loop.test.js:1
- E37 | ledger | El ciclo no daba ninguna señal de si la evolución avanza o se estanca: no se veían las abiertas por prioridad, la más vieja sin cerrar ni el ritmo de cierre | P3 | 2026-10-17 | scripts/evolve.js:57 | cerrado 2026-10-17 | scripts/evolve.js:23, tests/evolve-loop.test.js:1
- E38 | secretos | El secrets-scan del pre-commit no cubre tokens modernos: el patrón de OpenAI sk-[a-zA-Z0-9]{48} no matchea las claves sk-proj- (llevan guiones) y faltaban GitLab, npm, Stripe live, GitHub OAuth/user y Docker | P2 | 2026-10-17 | .githooks/pre-commit:17 | cerrado 2026-10-17 | .githooks/pre-commit:26, tests/secrets-patterns.test.js:1
- E39 | secretos | El scanner de terceros (regla token-declarado) quedó atrás del pre-commit: no detectaba glpat-, sk-proj-, sk-ant-, npm_, sk_live_/rk_live_, gho_/ghu_ ni dckr_pat- pegados dentro de un skill ajeno | P2 | 2026-10-17 | scripts/scan-third-party.js:57 | cerrado 2026-10-17 | scripts/scan-third-party.js:63, tests/preinstall-audit.test.js:105
- E40 | secretos | El secrets-scanner.ps1 de la skill auditor-de-seguridad (se publica al usuario) seguía con el set viejo: no detectaba glpat-, npm_, sk-proj-, sk-ant-, rk_live_, ghu_/ghs_/github_pat_ ni dckr_pat- | P2 | 2026-10-17 | skills/auditor-de-seguridad/scanners/secrets-scanner.ps1:9 | cerrado 2026-10-17 | skills/auditor-de-seguridad/scanners/secrets-scanner.ps1:17, tests/secrets-scanner-ps1.test.js:1
- E41 | autonomia | La deny-list de ralph-policy no cubría sus propios archivos: .opencode/plugins, .thirdparty-ignore.json y ralph-policy.js quedaban afuera, así que un agente desatendido podía reescribir su propia jaula | P1 | 2026-10-18 | scripts/ralph-policy.js:11 | cerrado 2026-10-18 | scripts/ralph-policy.js:20, tests/ralph-policy.test.js
- E42 | supply-chain | Una fila de la whitelist del scanner apagaba un hallazgo "alta" sin aprobación: la supresión sola devolvía exit 0 aunque tapara una regla grave | P2 | 2026-10-18 | scripts/scan-third-party.js:89 | cerrado 2026-10-18 | scripts/scan-third-party.js:15, tests/preinstall-audit.test.js
- E43 | autonomia | La escritura autónoma del agente de ideas no pasaba por ralph-policy: las guardas de allowlist/DENY eran prosa y no había barrera de código en el write-path | P1 | 2026-10-18 | skills/agente-ideas/SKILL.md:107 | cerrado 2026-10-18 | .opencode/plugins/write-guard.js:1, tests/write-guard.test.js
- E44 | autonomia | La jaula del modo autónomo sólo interceptaba write/edit/multiedit/patch: el tool bash quedaba afuera, así que un `rm .opencode/state/autonomo` o un `Set-Content scripts/ralph-policy.js` abrían la guarda desde adentro | P1 | 2026-10-18 | .opencode/plugins/write-guard.js:14 | cerrado 2026-10-18 | scripts/agent-guard.js:77, tests/write-guard.test.js:81
- E45 | cobertura | tests/write-guard.test.js existía y pasaba pero no estaba enganchado en npm test ni en el gate: la jaula de autonomía quedaba sin verificación continua | P2 | 2026-10-18 | package.json:48 | cerrado 2026-10-18 | package.json:52
- E46 | finops | Ningún workflow cancelaba corridas superadas: cada push apilado terminaba los jobs de CI y pentest igual | P3 | 2026-10-18 | .github/workflows/ci.yml:6 | cerrado 2026-10-18 | .github/workflows/ci.yml:17, .github/workflows/pentest.yml:23
- E48 | skill | context-engineering mencionaba Context Mode de pasada, sin el paradigma "Think in Code" ni la caveat de licencia ELv2 del server | P3 | 2026-10-18 | skills/context-engineering/SKILL.md:212 | cerrado 2026-10-18 | skills/context-engineering/SKILL.md:219
