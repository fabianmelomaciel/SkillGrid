## Finding Gate (compartido)

El último paso antes de que un hallazgo entre al informe. No reemplaza el escaneo ni inventa severidad: filtra lo que no se puede sostener y deja constancia de lo que quedó afuera.

### Cuándo corre

Siempre, en `auditor-de-seguridad`, `hack-audit` y `cyber-neo`. En `hack-audit` se aplica después de la fase de explotación; en los otros dos, después de mergear los resultados de los subagentes y antes de calcular el resumen.

### 1. Cinco preguntas

Una sola respuesta "no" alcanza para descartar:

1. **¿Llega input no confiable a la línea señalada?** Si el dato lo controla el atacante, mostrá el camino concreto. Si el valor es una constante, una env de confianza o sale de una allowlist, no hay hallazgo.
2. **¿Hay un camino de explotación real en este contexto, o solo un patrón que se parece?** El scanner marca strings; vos tenés que mostrar el flujo que convierte ese string en impacto.
3. **¿Está vivo fuera de tests, fixtures, ejemplos o código muerto?** Si solo corre en `test/`, `fixtures/`, `example*/` o un stub sin entrypoint, se descarta.
4. **¿La protección no existe, o existe y el scanner no la vio?** Antes de reportar, buscá el middleware, el escape, el parámetro de la query o el permiso que ya lo cubre.
5. **¿El impacto se puede explicar sin "podría"?** Si no podés nombrar qué se pierde —datos, sesión, ejecución, plata—, no es un hallazgo.

### 1b. Confianza (1–10)

Cada hallazgo lleva un score justificado en una línea:

| Confianza | `validation_status` | Acción |
|---|---|---|
| 9–10 | `confirmed` | PoC reproducible + impacto demostrado |
| 8 | `confirmed` | Camino completo verificado y PoC mínimo reproducible |
| 5–7 | `needs-validation` | Hay camino pero falta PoC o contexto |
| 1–4 | `discarded` | Patrón sin impacto, código muerto o protección existente |

Regla dura: **confianza <8 nunca se reporta como `confirmed`**.

### 2. Filtro por modo

- **Auditoría completa:** las 12 categorías siguen en alcance. No descartes algo solo porque es de rate limiting, DoS o validación de input: acá son categorías explícitas y necesitan la misma evidencia que el resto.
- **Modo diff:** mirá solo las líneas cambiadas y aplicá el filtro de alto ruido: DoS, agotamiento de memoria/CPU, rate limiting sin impacto demostrado, validación genérica sin explotación y open redirect sin cadena. En este modo el objetivo es señal, no inventario.

### 3. Evidencia y redacción

Cada hallazgo confirmado lleva:

- `archivo:línea` o request reproducible (método, ruta, payload y respuesta).
- El fragmento justo, no el archivo entero.
- `validation_status`: `confirmed` (lo reprodujiste), `needs-validation` (hay camino pero falta el PoC) o `discarded` (con motivo).
- `confidence`: score 1–10 justificado (ver §1b).
- `estado`: `abierto` | `corregido` | `riesgo_aceptado`; `retest`: fecha + comando/pasos o `pendiente`.
- Placeholders obligatorios: `[cookie_sesion]`, `[email_usuario]`, `[token]`, `[api_key]`, `[ip_interna]`. Nunca copies valores reales de cookies, PII, secretos ni rutas absolutas del usuario al JSON, al HTML ni al informe.

### 4. Severidad anclada

Un vector CVSS v3.1 y su score por hallazgo, más la justificación en una línea. Si no podés armar el vector, la severidad es una opinión: marcala `needs-validation` en vez de inventar un número.

### 4b. Pre-Severity Gate (critical/high)

Antes de asignar `critical` o `high`, respondé:

1. ¿El impacto es demostrado o solo "podría"?
2. ¿El atacante controla el input y alcanza el sink en este contexto?
3. ¿La protección existente (middleware, escape, permiso) ya lo cubre?
4. ¿El alcance real está dentro del scope y del entorno autorizado?

Si alguna respuesta deja duda → bajá a `medium` o `needs-validation`; nunca infles severidad.

### 5. Modo diff

Si el pedido es revisar cambios y no todo el repo:

```bash
git diff --name-only --diff-filter=ACMR <base>...HEAD
git diff --unified=0 <base>...HEAD -- <archivo>
```

Solo entran los archivos cambiados y las líneas tocadas; el contexto se lee para entender, no para reportar. Un hallazgo preexistente que aparece en el camino se anota aparte como `pre-existing` y no se mezcla con el diff.

### Qué se hace con lo descartado

Descartar no es bajar la severidad. El ítem sale del informe con el motivo anotado en `discarded` y se cuenta en `DISCARDED_COUNT`. No se esconde ni se deja como "posible": si el motivo es que falta evidencia, queda `needs-validation` y se dice qué falta para cerrarlo.
