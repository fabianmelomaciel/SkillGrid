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

- E72 | efectividad | El visor no tiene integración nativa con Cursor, antigravity ni Copilot: esos IDEs no dejan datos que se puedan leer, así que alimentarlo es manual, con el contrato de ingesta (POST /api/event y `visor emit`) | P2 | 2026-10-20 | ../visor-ia/README.md:56

## Cerradas
- E41..E58 | archivadas 2026-10-19 — E41 la deny-list no cubría sus propios archivos; E42 una supresión del scanner apagaba un hallazgo sin aprobación; E43 el write-path no pasaba por ralph-policy; E44 la jaula no interceptaba el tool bash; E45 el test de la jaula no estaba en npm test ni en el gate; E46 ningún workflow cancelaba corridas superadas; E48 context-engineering mencionaba Context Mode de pasada; E49 la guarda de bash se evadía por indirección de variable; E50 las reglas destructivas eran case-sensitive y no cubrían find -delete ni git rm -r; E51 el runner del bucle quedó fuera del DENY; E52 .gitignore/.gitattributes sin proteger; E53 el baseline del loop vivía en %TEMP% con nombre predecible; E54 el encabezado de write-guard prometía en absoluto; E55 la jaula sólo miraba globs: la clase [] y las llaves esquivaban; E56 el comentario del HMAC prometía que el agente no ve la clave; E57 check con --secret vacío salteaba la firma del baseline; E58 ralph-policy.test.js no estaba en el gate; cerradas 2026-10-18, citas: - E41→scripts/ralph-policy.js:24, - E42→scripts/scan-third-party.js:15, - E43→.opencode/plugins/write-guard.js:1, - E44→scripts/agent-guard.js:85, - E45→package.json:52, - E46→.github/workflows/ci.yml:17, - E48→skills/context-engineering/SKILL.md:219, - E49→scripts/agent-guard.js:67, - E50→scripts/agent-guard.js:36, - E51→scripts/ralph-policy.js:30, - E52→scripts/ralph-policy.js:33, - E54→.opencode/plugins/write-guard.js:8, - E53→scripts/ralph-policy.js:107, - E55→scripts/agent-guard.js:67, - E56→scripts/ralph-policy.js:107, - E57→scripts/ralph-policy.js:152, - E58→package.json:48
- E65 | finops | El chequeo de dependencias spawneaba 14 procesos `--version` y descartaba la salida: eran 15s de los 30s de `npm test` y el pin nunca se comparaba | P1 | 2026-10-19 | scripts/install-core.js:196 | cerrado 2026-10-19 | scripts/install-core.js:249, tests/install-core.test.js:117
- E66 | finops | El router leía skills/index.json (24KB) para el cost_tier que catalog-lite.json no traía: una consulta de catálogo costaba 6k tokens | P2 | 2026-10-19 | skills/router/SKILL.md:30 | cerrado 2026-10-19 | scripts/generate-catalog.js:187, tests/router.test.js:66
- E67 | docs | El router venía con doble mojibake (Ã©, â†’) en las flechas y los acentos de las reglas de ruteo, y con un conteo de skills congelado en 43 | P2 | 2026-10-19 | skills/router/SKILL.md:15 | cerrado 2026-10-19 | skills/router/SKILL.md:15, tests/docs-consistency.test.js:1
- E68 | efectividad | El escáner de evolución buscaba cobertura sólo en tests/, así que los checkers del gate (que viven en scripts/) no contaban: remote-install.ps1 salía como hueco aunque lo cubre check-remote-install-pin.js | P2 | 2026-10-19 | scripts/evolve-scan.js:201 | cerrado 2026-10-19 | scripts/evolve-scan.js:197, tests/evolve-scan.test.js:134
- E69 | efectividad | Al comprimir las filas viejas del ledger en una línea se perdían las citas, así que el escáner volvía a proponer lo ya cerrado | P2 | 2026-10-19 | scripts/evolve-scan.js:61 | cerrado 2026-10-19 | scripts/evolve-scan.js:56, tests/evolve-scan.test.js:52
- E70 | efectividad | El ciclo de evolución no cerraba: el watermark sólo avanzaba con --mark y ningún script de npm lo exponía, así que `npm run evolve` reportaba siempre las mismas candidatas | P2 | 2026-10-19 | scripts/evolve-scan.js:236 | cerrado 2026-10-19 | package.json:52, scripts/evolve-scan.js:236
- E71 | supply-chain | El postinstall del paquete npm ejecutaba `graphify` por PATH en la máquina de quien instala y pagaba ~10s | P1 | 2026-10-19 | package.json:55 | cerrado 2026-10-19 | scripts/postinstall-graphify.js:16, tests/postinstall-graphify.test.js:21
- E59..E63 | archivadas 2026-10-20 — E59 el ADS `::$DATA` de Windows pasaba la DENY y dejaba reescribir la política; E60 el marcador de autonomía se resolvía contra el cwd y dejaba la jaula desarmada en un subdirectorio; E61 la guarda de bash no veía la concatenación de strings en runtime; E62 `git commit --no-verify` y `git stash` lavan el diff y saltean el gate; E63 los validadores del gate eran escribibles; cerradas 2026-10-19, citas: - E59→scripts/ralph-policy.js:58, - E60→scripts/agent-guard.js:22, - E61→scripts/agent-guard.js:112, - E62→scripts/agent-guard.js:46, - E63→scripts/ralph-policy.js:37
- E73 | seguridad | El visor iba a abrir la base SQLite del IDE en read-write: `new DatabaseSync(ruta)` crea el archivo si falta y puede revertir el hot journal del IDE, con riesgo de corromper la base de opencode | P1 | 2026-10-20 | tests/visor-dev-only.test.js:124 | cerrado 2026-10-20 | tests/visor-dev-only.test.js:124
- E74 | efectividad | El visor v1 no mostraba ninguna sesión de opencode: dependía del plugin global, que sólo carga al reiniciar el IDE, y una sesión ya abierta nunca emite session.created | P1 | 2026-10-20 | tests/visor-dev-only.test.js:132 | cerrado 2026-10-20 | tests/visor-dev-only.test.js:132
- E75 | seguridad | La CSP del visor llevaba `script-src 'unsafe-inline'` e `img-src data:`, así que un `<img src=x onerror=...>` dentro del contenido mostrado ejecutaba en el origen del panel | P1 | 2026-10-20 | tests/visor-dev-only.test.js:140 | cerrado 2026-10-20 | tests/visor-dev-only.test.js:140
- E76 | finops | El visor leía `select * from part` en cada tick: 346 ms y 87 MB de heap por llamada con 139 mil filas, y el snapshot completo eran 705 KB por push | P2 | 2026-10-20 | tests/visor-dev-only.test.js:147 | cerrado 2026-10-20 | tests/visor-dev-only.test.js:147

- E1..E3 | archivadas 2026-10-06 — pin-check local (E1), instaladores fail-open sin tag (E2), secrets-scan sin `on: push` (E3); cerradas 2026-10-01, detalle en el historial de git
- E4..E9 | archivadas 2026-10-15 — secretos con `\x27` muerto (E4), README con conteos hardcodeados (E5), sin test docs↔catálogo (E6), CODEX sin presupuesto (E7), check de evolución fuera del CI de docs (E8), pre-commit bloqueando claves de ejemplo (E9); cerradas 2026-10-01/02, detalle en el historial de git
- E10..E20 | archivadas 2026-10-17 — Stage 3 + fixes de review (E10 Stage3 "Agente recomendado", E11 hooks warn-only, E12 nudge /codex-log, E13 compact, E14/E16 commands, E15 plugin match, E17 mensajes, E18 package files, E19 CHANGELOG, E20 XSS dashboards); cerradas 2026-10-02/05, detalle en el historial de git
- E21..E26 | archivadas 2026-10-18 — scopes de acciones pineados (E21), storageState.json fuera del pre-commit (E22), auditoría de terceros al instalar (E23), `cost_tier` sin uso en el router (E24), suite duplicada win/ubuntu (E25), planes sin cerrar fuera de la compactación (E26); cerradas 2026-10-05/06/15, detalle en el historial de git
- E27..E30 | archivadas 2026-10-18 — motion/zoom de los 8 reportes (E27), motion stack 2026 en skills de diseño (E28), evidencia de cierre cruzada contra disco (E29), secrets-scan en commits solo-.md (E30); cerradas 2026-10-17, detalle en el historial de git
- E31..E35 | archivadas 2026-10-18 — escáner de candidatas contra el ledger (E31), saneo de la inyección de memoria (E32), acotado de rutas del Ralph Loop (E33), BOM de ralph-loop.ps1 en PS 5.1 (E34), orden/riesgo de las candidatas (E35); cerradas 2026-10-17, detalle en el historial de git
- E36..E40 | archivadas 2026-10-18 — comando único del ciclo (E36), métricas del ledger (E37), tokens modernos en el pre-commit (E38), tokens modernos en el scanner de terceros (E39), tokens modernos en el secrets-scanner.ps1 (E40); cerradas 2026-10-17, detalle en el historial de git
