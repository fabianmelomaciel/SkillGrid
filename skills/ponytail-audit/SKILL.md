---
name: ponytail-audit
description: "Auditoría de calidad de todo un repo: bugs, huecos de seguridad, qué se rompe bajo carga real, lógica arriesgada sin tests, caminos lentos y qué borrar, fusionar o dividir. Clasificado, cada hallazgo explicado en español simple. Reporte de una sola vez, no cambia nada. Úsalo para \"auditá este codebase\", \"revisá todo el repo\", \"buscá bloat\", \"qué puedo borrar\", /ponytail-audit."
category: agent
status: stable
risk_level: safe
token_estimate: { input: 1580, output: 600 }
---

## Core

# Ponytail Audit — Auditoría Senior

Auditá todo el repo como el senior developer que acaba de heredarlo y al que van a llamar cuando se rompa. Orden de importancia: correcto, seguro, aguanta la carga, testeado, rápido, magro (lean). Lo magro importa: cada línea extra debe ser leída, testeada y arreglada después. Este es un reporte que el usuario pidió, así que dalo completo.

## 1. Mapear primero

- Auditá lo que el usuario nombre: una carpeta, un paquete o todo el repo. Si no nombra nada: todo el repo.
- Leé el README, la config de despliegue y build, la lista de dependencias, los puntos de entrada (main, rutas, handlers, jobs, comandos CLI) y los tests.
- Buscá la carga esperada: una persona corriendo un script, o muchos usuarios y procesos a la vez. Juzgá la escala contra eso, y decí qué carga asumiste.
- Seguí los flujos principales de punta a punta: por dónde entran los datos, qué se guarda, qué sale. Leé esos caminos completos: entrada de usuarios, plata, auth, escritura de datos, jobs de fondo, cualquier cosa compartida entre procesos.
- Repos grandes: andá a fondo donde un error cueste más, no archivo por archivo. Decí qué partes no leíste.

## 2. Qué buscar

1. **Bug:** resultado incorrecto, crash, caso borde olvidado (vacío, cero, último ítem, redondeo, zonas horarias), llamadores que no coinciden con lo que devuelve una función, la misma regla aplicada diferente en dos lugares.
2. **Riesgo:** huecos de seguridad (inyección, aleatoriedad débil, secretos en código, falta de chequeos en entrada de usuarios), pérdida de datos (errores tragados, escrituras en orden incorrecto, sin transacción).
3. **Escala:** bien para un usuario, mal para muchos: carreras de chequeo-luego-escritura, el mismo trabajo hecho por cada proceso, memoria o listas que solo crecen, una query por ítem, O(n^2) en entradas grandes, estado por proceso que debería ser compartido.
4. **Test faltante:** lógica arriesgada (un branch, un parser, plata, seguridad, escritura de datos) sin un test que falle cuando se rompa. Un buen test, no cobertura.
5. **Velocidad:** las ralentizaciones grandes son problemas. Las mejoras pequeñas (trabajo repetido en un loop caliente) son sugerencias; algunos software cuentan cada milisegundo.
6. **Magro (Lean):** código que no debería existir o debería ser más chico.
   - borrar: código muerto, opciones sin usar, flags y config, features especulativas.
   - reusar: dos helpers haciendo lo mismo (quedate con uno, nombrá la ruta).
   - stdlib / nativo: la librería estándar o la plataforma ya lo hace; una dependencia haciendo lo que pocas líneas o la plataforma pueden hacer.
   - yagni: interfaz con una sola implementación, factory con un solo producto, wrapper que solo pasa llamadas.
   - fusionar: casi-copias que deben cambiar juntas.
   - dividir: una función o clase haciendo varios trabajos no relacionados, difícil de leer o testear. Dividí por trabajo, nunca por cantidad de líneas, y nunca en helpers que existen solo para acortar una función.

## 3. Chequear antes de reportar

- Cada hallazgo necesita un caso concreto: "esta entrada o situación lleva a este resultado incorrecto". Sin caso, no hay hallazgo.
- Antes de decir que el código no se usa, buscá en todo el árbol, incluyendo tests, fixtures, config y referencias dinámicas o strings.
- Un atajo marcado con un comentario `shortcut:` (o el viejo `ponytail:`) que nombra su límite es una decisión, no un hallazgo, a menos que la carga esperada ya lo cruce.
- Proponé el fix más chico que funcione. Preferí fixes que borren código. Nunca agregues capas, frameworks o config que el problema no necesite.
- Nada de gustos de estilo, nada de "considerá", nada de preocupaciones vagas.

## 4. Salida

Español muy simple: frases cortas, palabras de todos los días. Explicá un término técnico la primera vez que lo uses. El lector puede no haber visto nunca este código.

Empezá con `Qué hace este repo:` en dos o tres frases, y la carga que asumiste.

Luego los hallazgos en tres grupos, lo más importante primero, salteá los grupos vacíos:
- **Debe arreglarse:** bug, seguridad, pérdida de datos, se rompe con la carga esperada.
- **Debería arreglarse:** código arriesgado sin test, lentitud real, duplicación, una función que mezcla trabajos, código que no debería existir.
- **Estaría bueno tener:** pequeñas mejoras de velocidad, formas más cortas.

Enumerá los hallazgos a través de todos los grupos, para que el usuario pueda decir "arreglá el 2 y el 5". Máximo 20 hallazgos; si dejaste fuera otros más chicos, decí cuántos.
Cada hallazgo tiene las cuatro partes, cada una de una o dos frases cortas:

2. **Los pedidos caen en el día equivocado** (`billing/close_day.py:L40-52`)
   - **Qué es:** A medianoche este job cierra el día y factura todos los pedidos de ese día.
   - **Problema:** Toma "hoy" del reloj del servidor, que corre en UTC. Un pedido hecho a las 00:30 en Berlín se factura el día anterior.
   - **Fix:** Computar el día una vez en la zona horaria de la tienda: `datetime.now(ZoneInfo("Europe/Berlin")).date()`. Una línea, nada más cambia.
   - **Si lo salteamos:** Los pedidos tardíos muestran la fecha mal, y contabilidad los arregla a mano.

Terminá con:
- `Veredicto:` una línea: sano, o qué arreglar primero.
- `Lean: -<N> líneas, -<M> dependencias posibles.` cuando existan hallazgos de magro.
- `No revisado:` las partes que no leíste o no pudiste correr.

Si no encontrás nada: `Qué hace este repo:`, luego `Sano. Nada que arreglar.` y una línea sobre qué revisaste.

> **CodeGraph:** `skills/shared/codegraph-startup.md` | **Anti-Rationalization:** `skills/shared/anti-rationalization.md` | **Risk Assessment:** `skills/shared/risk-assessment.md` | **Verification Gate:** `skills/shared/verification-gate.md`

> Modules: `skills/shared/modules-footer.md`
