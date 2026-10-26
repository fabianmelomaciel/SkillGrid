---
name: ponytail-debt
description: "Lista cada comentario `shortcut:` (y los viejos `ponytail:`) como un libro de deuda técnica. Reporte de una sola vez, no cambia nada. Úsalo para \"ponytail debt\", \"qué postergó ponytail\", \"listá los atajos\", /ponytail-debt."
category: agent
status: stable
risk_level: safe
token_estimate: { input: 590, output: 200 }
---

## Core

# Ponytail Debt — Libro de Deuda

Cada atajo deliberado de ponytail se marca con un comentario `shortcut:` nombrando su techo y el camino de mejora (el código viejo puede decir `ponytail:`). Esto los recolecta en un solo libro para que una postergación no se vuelva permanente en silencio.

## Escaneo

Buscá en el repo los marcadores de comentario, salteando `.git` y todo lo que los archivos `.gitignore` ignoren (dependencias, build, caches):

`git grep --no-index --exclude-standard -nE '(#|//|/[*]) ?(shortcut|ponytail):'`

Si el usuario nombra su propia palabra clave (`/ponytail-debt TODO`), buscá esa palabra en su lugar.

Cada coincidencia es una fila del libro. El prefijo de comentario mantiene la prosa que solo menciona la convención fuera del libro. Salteá las coincidencias que no sean una postergación, como una nota sobre un atajo de teclado.

## Salida

Una fila por marcador, agrupada por archivo:

`<archivo>:<línea>, <qué se simplificó>. techo: <el límite nombrado>. mejora: <el disparador para volver a revisarlo>.`

La convención es `shortcut: <techo>, <camino de mejora>`, así que sacá el techo y el disparador directamente del comentario. ¿Querés un dueño por fila? Agregá `git blame -L<línea>,<línea>`.

Marcá el riesgo de rot: cualquier comentario marcador que no nombre camino de mejora o disparador lleva un tag `no-trigger`, esos son los que se pudren en silencio.

Terminá con `<N> marcadores, <M> sin disparador.` Si no se encuentra nada: `Sin deuda de atajos. Libro limpio.`

## Fronteras

Solo lee y reporta, no cambia nada. Para persistirlo, preguntá y escribe el libro en un archivo (ej. `PONYTAIL-DEBT.md`).

> **CodeGraph:** `skills/shared/codegraph-startup.md` | **Anti-Rationalization:** `skills/shared/anti-rationalization.md` | **Risk Assessment:** `skills/shared/risk-assessment.md` | **Verification Gate:** `skills/shared/verification-gate.md`

> Modules: `skills/shared/modules-footer.md`
