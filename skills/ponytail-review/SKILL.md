---
name: ponytail-review
description: "Revisión de calidad de un cambio: ¿es lógica la solución, es segura, aguanta carga real, la lógica arriesgada tiene tests, es rápida y hace falta cada línea? Lee el código conectado, no solo el diff. Cada hallazgo se explica en español simple. Úsalo para \"revisá esto\", \"code review\", \"revisá el último commit\", \"revisá mi PR\", \"¿está sobre-ingenierizado?\", /ponytail-review."
category: agent
status: stable
risk_level: safe
token_estimate: { input: 1500, output: 400 }
---

## Core

# Ponytail Review — Revisión Senior

Revisá un cambio como el senior developer al que van a llamar cuando se rompa.
Orden de importancia: correcto, seguro, aguanta la carga, testeado, rápido, magro (lean).
Lo magro importa: cada línea extra debe ser leída, testeada y arreglada después.
Este es un reporte que el usuario pidió, así que dalo completo.

## 1. Entender primero

- Revisá lo que el usuario nombre: cambios sin commitear o en stage, una rama, un link a un PR o archivos. Si no nombra nada: los cambios sin commitear, o el último commit si no hay cambios.
- Leé el diff, luego el código que toca: llamadores de cada función cambiada, las funciones que llama, los tests, el README.
- Seguí el flujo real: por dónde entran los datos, qué se guarda, qué sale.
- Un cambio puede romper código que no toca. Cuando cambia una firma, un valor de retorno o un comportamiento, buscá cada llamador.
- Buscá la carga esperada en el repo (README, config de despliegue): una persona corriendo un script, o muchos usuarios y procesos a la vez. Juzgá la escala contra eso, y decí qué carga asumiste.

## 2. Qué buscar

1. **Bug:** resultado incorrecto, crash, caso borde olvidado (vacío, cero, último ítem, redondeo, zonas horarias), un llamador roto por el cambio, un fix aplicado en un llamador mientras la función compartida sigue rota.
2. **Riesgo:** huecos de seguridad (inyección, aleatoriedad débil, secretos, falta de chequeos en entrada de usuarios), pérdida de datos (errores tragados, escrituras en orden incorrecto, sin transacción).
3. **Escala:** bien para un usuario, mal para muchos: carreras de chequeo-luego-escritura, el mismo trabajo hecho por cada proceso, memoria o listas que solo crecen, una query por ítem, O(n^2) en entradas grandes, estado por proceso que debería ser compartido.
4. **Test faltante:** lógica nueva arriesgada (un branch, un parser, plata, seguridad, escrituras de datos, un bug fix) sin un test que falle cuando se rompa. Un buen test, no cobertura.
5. **Velocidad:** las ralentizaciones grandes son problemas. Las mejoras pequeñas (trabajo repetido en un loop caliente) son sugerencias; algunos software cuentan cada milisegundo.
6. **Magro (Lean):** código que no debería existir o debería ser más chico.
   - borrar: código muerto, opciones sin usar, features especulativas.
   - reusar: el repo ya tiene este helper (nombrá la ruta).
   - stdlib / nativo: la librería estándar o la plataforma ya lo hace; una dependencia nueva por pocas líneas.
   - yagni: abstracción con una sola implementación, config que nadie setea.
   - fusionar: casi-copias que deben cambiar juntas.
   - dividir: una función haciendo varios trabajos no relacionados, difícil de leer o testear. Dividí por trabajo, nunca por cantidad de líneas, y nunca en helpers que existen solo para acortar una función.

## 3. Chequear antes de reportar

- Cada hallazgo necesita un caso concreto: "esta entrada o situación lleva a este resultado incorrecto". Sin caso, no hay hallazgo.
- Volvé a leer las líneas y confirmá: el llamador existe, el valor realmente puede estar vacío, el código realmente no se usa.
- Un atajo marcado con un comentario `shortcut:` (o el viejo `ponytail:`) que nombra su límite es una decisión, no un hallazgo, a menos que la carga esperada ya lo cruce.
- Proponé el fix más chico que funcione. Preferí fixes que borren código. Nunca agregues capas, frameworks o config que el problema no necesite.
- Nada de gustos de estilo, nada de "considerá", nada de preocupaciones vagas.

## 4. Salida

Español muy simple: frases cortas, palabras de todos los días. Explicá un término técnico la primera vez que lo uses. El lector puede no haber visto nunca este código.

Empezá con `Qué hace este cambio:` en dos o tres frases.

Luego los hallazgos en tres grupos, salteá los grupos vacíos:
- **Debe arreglarse:** bug, seguridad, pérdida de datos, se rompe con la carga esperada.
- **Debería arreglarse:** código arriesgado sin test, lentitud real, duplicación, una función que mezcla trabajos, código que no debería existir.
- **Estaría bueno tener:** pequeñas mejoras de velocidad, formas más cortas.

Enumerá los hallazgos a través de todos los grupos, para que el usuario pueda decir "arreglá el 2 y el 5".
Cada hallazgo tiene las cuatro partes, cada una de una o dos frases cortas:

2. **Los pedidos caen en el día equivocado** (`billing/close_day.py:L40-52`)
   - **Qué es:** A medianoche este job cierra el día y factura todos los pedidos de ese día.
   - **Problema:** Toma "hoy" del reloj del servidor, que corre en UTC. Un pedido hecho a las 00:30 en Berlín se factura el día anterior.
   - **Fix:** Computar el día una vez en la zona horaria de la tienda: `datetime.now(ZoneInfo("Europe/Berlin")).date()`. Una línea, nada más cambia.
   - **Si lo salteamos:** Los pedidos tardíos muestran la fecha mal, y contabilidad los arregla a mano.

Terminá con:
- `Veredicto: Ship.` o `Veredicto: arreglá 1 y 3 primero.`
- `Lean: -<N> líneas posibles.` cuando existan hallazgos de magro.
- `No revisado:` una línea, si algo importaba y no pudiste revisarlo.

Si no encontrás nada: `Qué hace este cambio:`, luego `Se ve bien. Ship.` y una línea sobre qué revisaste.

> **CodeGraph:** `skills/shared/codegraph-startup.md` | **Anti-Rationalization:** `skills/shared/anti-rationalization.md` | **Risk Assessment:** `skills/shared/risk-assessment.md` | **Verification Gate:** `skills/shared/verification-gate.md`

> Modules: `skills/shared/modules-footer.md`
