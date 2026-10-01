# Evolución

Lo que este proyecto todavía tiene que mejorar. Se registra el error con su evidencia, se corrige, y la fila sale de `## Abiertas` para `## Cerradas` — no se borra nunca, es el historial.

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

## Abiertas

- E2 | supply-chain | Los instaladores remotos caen a `main` si falta el tag: clon mutáble sin pin | P0 | 2026-10-01 | remote-install.sh:31, remote-install.ps1:35
- E3 | seguridad | El secrets-scan no corre en push directo a `main` (solo pull_request/schedule) | P0 | 2026-10-01 | .github/workflows/pentest.yml:3
- E4 | seguridad | Patrones de secretos del pre-commit angostos: `DB_PASS=` o cualquier credencial genérica no matchea | P1 | 2026-10-01 | .githooks/pre-commit:10
- E5 | docs | README hardcodea conteos (43 skills / 270 tests) y vuelan cada vez que cambian | P1 | 2026-10-01 | README.md:6, README.md:10, README.md:35
- E6 | tests | Falta test de consistencia docs vs `catalog.json` — la clase de drift ya se repitió 4 veces | P1 | 2026-10-01 | CODEX.md:88
- E7 | memoria | CODEX.md sin presupuesto de tamaño (22KB; la entrada de v1.15.0 sola tiene 2295 chars) | P2 | 2026-10-01 | CODEX.md:83
- E8 | ci | El check de evolución no corre en CI cuando el commit es solo `.md` (`paths-ignore: '**.md'`); lo cubre el pre-commit local | P2 | 2026-10-01 | .github/workflows/ci.yml:6

## Cerradas

- E1 | calidad | El pin-check de los instaladores remotos solo corría en CI, nunca en el gate local | P1 | 2026-10-01 | .github/workflows/ci.yml:26 | cerrado 2026-10-01 | package.json:41
