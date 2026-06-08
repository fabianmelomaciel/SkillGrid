# Delegation Patterns for Sub-Agents in the Audit Loop

Cuando el audit-loop detecta multiples fixes en dominios distintos, podes delegar batches a sub-agentes para paralelizar.

## When to delegate

- 3+ fixes no relacionados en archivos distintos
- Fixes que requieren herramientas especializadas (e.g., diseño, seguridad)
- El CEO pide acelerar

## Pattern: Parallel batch dispatch

```
1. Particionar hallazgos por archivo/dominio (no se pisan)
2. Cada sub-agente recibe:
   - Hallazgo especifico (ID, archivo, linea, propuesta)
   - Stack del proyecto
   - Comandos de verificacion
3. Sub-agente ejecuta: fix → test → reporta resultado
4. Audit-loop recolecta resultados, consolida
5. Si algun sub-agente falla: revertir + reportar
```

## Pattern: Sequential domino chain

Cuando los fixes tienen dependencias (file A → file B → file C):

```
1. Agente maestro ejecuta fix en file A
2. Verifica
3. Pasa el contexto actualizado al siguiente sub-agente
4. Repetir hasta completar la cadena
```

## Anti-patterns

| No hacer | Por que |
|----------|---------|
| Delegar el mismo archivo a 2 sub-agentes | Conflictos de merge garantizados |
| Delegar sin dar comandos de verificación | Sub-agente no sabe como validar |
| Delegar 🔴 NUNCA AUTO | Violación de reglas del audit-loop |
| Asumir que el sub-agente conoce el stack | Siempre pasar stack + comandos explicitamente |

## Template for sub-agent task

```
Tarea: Aplicar fix [ID-XXX]
Archivo: path/to/file.ext
Linea: N
Propuesta: <descripcion del fix>
Stack: <node|php|python|go|rust|ruby|dotnet>
Comandos de verification:
  - test: <cmd>
  - build: <cmd>
  - lint: <cmd>
Reportar: exito|fallo + output de verification
```
