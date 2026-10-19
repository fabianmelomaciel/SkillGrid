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
- E41..E58 | archivadas 2026-10-19 — E41 la deny-list no cubría sus propios archivos; E42 una supresión del scanner apagaba un hallazgo sin aprobación; E43 el write-path no pasaba por ralph-policy; E44 la jaula no interceptaba el tool bash; E45 el test de la jaula no estaba en npm test ni en el gate; E46 ningún workflow cancelaba corridas superadas; E48 context-engineering mencionaba Context Mode de pasada; E49 la guarda de bash se evadía por indirección de variable; E50 las reglas destructivas eran case-sensitive y no cubrían find -delete ni git rm -r; E51 el runner del bucle quedó fuera del DENY; E52 .gitignore/.gitattributes sin proteger; E53 el baseline del loop vivía en %TEMP% con nombre predecible; E54 el encabezado de write-guard prometía en absoluto; E55 la jaula sólo miraba globs: la clase [] y las llaves esquivaban; E56 el comentario del HMAC prometía que el agente no ve la clave; E57 check con --secret vacío salteaba la firma del baseline; E58 ralph-policy.test.js no estaba en el gate; cerradas 2026-10-18, citas: - E41→scripts/ralph-policy.js:24, - E42→scripts/scan-third-party.js:15, - E43→.opencode/plugins/write-guard.js:1, - E44→scripts/agent-guard.js:85, - E45→package.json:52, - E46→.github/workflows/ci.yml:17, - E48→skills/context-engineering/SKILL.md:219, - E49→scripts/agent-guard.js:67, - E50→scripts/agent-guard.js:36, - E51→scripts/ralph-policy.js:30, - E52→scripts/ralph-policy.js:33, - E54→.opencode/plugins/write-guard.js:8, - E53→scripts/ralph-policy.js:107, - E55→scripts/agent-guard.js:67, - E56→scripts/ralph-policy.js:107, - E57→scripts/ralph-policy.js:152, - E58→package.json:48
- E65 | finops | El chequeo de dependencias spawneaba 14 procesos `--version` y descartaba la salida: eran 15s de los 30s de `npm test` y el pin nunca se comparaba | P1 | 2026-10-19 | scripts/install-core.js:196 | cerrado 2026-10-19 | scripts/install-core.js:249, tests/install-core.test.js:117
- E66 | finops | El router leía skills/index.json (24KB) para el cost_tier que catalog-lite.json no traía: una consulta de catálogo costaba 6k tokens | P2 | 2026-10-19 | skills/router/SKILL.md:30 | cerrado 2026-10-19 | scripts/generate-catalog.js:187, tests/router.test.js:66
- E67 | docs | El router venía con doble mojibake (Ã©, â†’) en las flechas y los acentos de las reglas de ruteo, y con un conteo de skills congelado en 43 | P2 | 2026-10-19 | skills/router/SKILL.md:15 | cerrado 2026-10-19 | skills/router/SKILL.md:15, tests/docs-consistency.test.js:1
- E68 | efectividad | El escáner de evolución buscaba cobertura sólo en tests/, así que los checkers del gate (que viven en scripts/) no contaban: remote-install.ps1 salía como hueco aunque lo cubre check-remote-install-pin.js | P2 | 2026-10-19 | scripts/evolve-scan.js:201 | cerrado 2026-10-19 | scripts/evolve-scan.js:197, tests/evolve-scan.test.js:134
- E69 | efectividad | Al comprimir las filas viejas del ledger en una línea se perdían las citas, así que el escáner volvía a proponer lo ya cerrado | P2 | 2026-10-19 | scripts/evolve-scan.js:61 | cerrado 2026-10-19 | scripts/evolve-scan.js:56, tests/evolve-scan.test.js:52
- E70 | efectividad | El ciclo de evolución no cerraba: el watermark sólo avanzaba con --mark y ningún script de npm lo exponía, así que `npm run evolve` reportaba siempre las mismas candidatas | P2 | 2026-10-19 | scripts/evolve-scan.js:236 | cerrado 2026-10-19 | package.json:52, scripts/evolve-scan.js:236
- E71 | supply-chain | El postinstall del paquete npm ejecutaba `graphify` por PATH en la máquina de quien instala y pagaba ~10s | P1 | 2026-10-19 | package.json:55 | cerrado 2026-10-19 | scripts/postinstall-graphify.js:16, tests/postinstall-graphify.test.js:21
- E59 | seguridad | La ruta del write-path compara strings: en Windows el ADS `::$DATA` (scripts/ralph-policy.js::$DATA) es el mismo archivo y pasa la DENY, así que el agente puede reescribir su propia política | P1 | 2026-10-19 | scripts/ralph-policy.js:26 | cerrado 2026-10-19 | scripts/ralph-policy.js:58, tests/ralph-policy.test.js:31
- E60 | seguridad | El marcador de autonomía se resuelve contra la raíz que le pasa el IDE: una sesión abierta en un subdirectorio del repo queda desarmada porque ahí no está el marcador | P1 | 2026-10-19 | scripts/agent-guard.js:19 | cerrado 2026-10-19 | scripts/agent-guard.js:22, tests/write-guard.test.js:52
- E61 | seguridad | La guarda de bash sólo lee texto: `node -e "...'.open'+'code/state/autonomo'"` concatena la ruta en runtime y la DENY no la ve | P1 | 2026-10-19 | scripts/agent-guard.js:67 | cerrado 2026-10-19 | scripts/agent-guard.js:112, tests/write-guard.test.js:130
- E62 | seguridad | La 2ª capa del Ralph Loop mira el working tree: `git commit --no-verify` y `git stash -u` lavan el diff y saltean el gate real | P1 | 2026-10-19 | scripts/ralph-policy.js:74 | cerrado 2026-10-19 | scripts/agent-guard.js:46, tests/write-guard.test.js:138
- E63 | seguridad | Los validadores del gate son escribibles: un agente puede reescribir tests/write-guard.test.js o scripts/check-evolution.js y hacer pasar su propio código | P1 | 2026-10-19 | scripts/ralph-policy.js:13 | cerrado 2026-10-19 | scripts/ralph-policy.js:37, tests/ralph-policy.test.js:44

- E1..E3 | archivadas 2026-10-06 — pin-check local (E1), instaladores fail-open sin tag (E2), secrets-scan sin `on: push` (E3); cerradas 2026-10-01, detalle en el historial de git
- E4..E9 | archivadas 2026-10-15 — secretos con `\x27` muerto (E4), README con conteos hardcodeados (E5), sin test docs↔catálogo (E6), CODEX sin presupuesto (E7), check de evolución fuera del CI de docs (E8), pre-commit bloqueando claves de ejemplo (E9); cerradas 2026-10-01/02, detalle en el historial de git
- E10..E20 | archivadas 2026-10-17 — Stage 3 + fixes de review (E10 Stage3 "Agente recomendado", E11 hooks warn-only, E12 nudge /codex-log, E13 compact, E14/E16 commands, E15 plugin match, E17 mensajes, E18 package files, E19 CHANGELOG, E20 XSS dashboards); cerradas 2026-10-02/05, detalle en el historial de git
- E21..E26 | archivadas 2026-10-18 — scopes de acciones pineados (E21), storageState.json fuera del pre-commit (E22), auditoría de terceros al instalar (E23), `cost_tier` sin uso en el router (E24), suite duplicada win/ubuntu (E25), planes sin cerrar fuera de la compactación (E26); cerradas 2026-10-05/06/15, detalle en el historial de git
- E27..E30 | archivadas 2026-10-18 — motion/zoom de los 8 reportes (E27), motion stack 2026 en skills de diseño (E28), evidencia de cierre cruzada contra disco (E29), secrets-scan en commits solo-.md (E30); cerradas 2026-10-17, detalle en el historial de git
- E31..E35 | archivadas 2026-10-18 — escáner de candidatas contra el ledger (E31), saneo de la inyección de memoria (E32), acotado de rutas del Ralph Loop (E33), BOM de ralph-loop.ps1 en PS 5.1 (E34), orden/riesgo de las candidatas (E35); cerradas 2026-10-17, detalle en el historial de git
- E36..E40 | archivadas 2026-10-18 — comando único del ciclo (E36), métricas del ledger (E37), tokens modernos en el pre-commit (E38), tokens modernos en el scanner de terceros (E39), tokens modernos en el secrets-scanner.ps1 (E40); cerradas 2026-10-17, detalle en el historial de git
