# Patrones de Delegacion Avanzados

## Patron: Especulacion Paralela

Cuando no sabes que approach es mejor, mandate dos subagentes en paralelo con enfoques distintos y compara resultados.

```
Task(description="Probar Approach A", ...)
Task(description="Probar Approach B", ...)
→ PM revisa ambos y elige
```

## Patron: Cadena de Confianza

Para tareas grandes donde un subagente necesita el output de otro:

```
Task(desc="Paso 1: Analisis", ...) 
  → PM revisa
  → Task(desc="Paso 2: Implementacion", context=<output-paso-1>, ...)
```

## Patron: Enjambre

Para bugs dificiles: 3 subagentes investigando el mismo problema desde angulos distintos.

```
Task(desc="Bug: revisar logs", agent_type="explore")
Task(desc="Bug: revisar codigo fuente", agent_type="explore")  
Task(desc="Bug: revisar tests", agent_type="explore")
→ PM cruza hallazgos y saca conclusion
```

## Patron: Especialista con Revisor

Un subagente implementa, otro revisa el diff:

```
Task(desc="Implementar feature X", agent_type="general")
  → PM revisa
  → Task(desc="Code review del diff", agent_type="general", permissions={edit: deny})
```
