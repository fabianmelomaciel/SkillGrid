# Multi-Skill Workflows

Secuencias orquestadas que combinan multiples skills para completar tareas complejas.

## Deploy seguro (DevOps + Security)

```
auditor-de-seguridad → optimizador-finops → agente-devops
```

1. **auditor-de-seguridad**: Escanea el proyecto en busca de vulnerabilidades, secretos expuestos, y misconfiguraciones
2. **optimizador-finops**: Audita eficiencia de recursos, costos de API, y economia de tokens
3. **agente-devops**: Genera Dockerfile, docker-compose.yml, y CI/CD pipeline con las correcciones de los pasos anteriores

## Feature completo (Core Pipeline)

```
brainstorming → spec-driven-development → writing-plans → incremental-implementation → requesting-code-review → finishing-a-development-branch
```

1. **brainstorming**: Define requisitos y alcance con el CEO
2. **spec-driven-development**: Escribe especificacion detallada
3. **writing-plans**: Crea plan de implementacion con tareas
4. **incremental-implementation**: Ejecuta cambios en pasos revisables
5. **requesting-code-review**: Solicita revision del codigo escrito
6. **finishing-a-development-branch**: Decide estrategia de integracion (merge/PR/rebase)

## Auditoria completa de proyecto

```
auditor-de-seguridad + auditor-de-marketing + optimizador-finops → gestor-documental
```

1. **auditor-de-seguridad** + **auditor-de-marketing** + **optimizador-finops**: Se ejecutan en paralelo (son independientes)
2. **gestor-documental**: Compila los hallazgos en un informe estructurado (APA)

## Rediseno UI (Design Pipeline)

```
brainstorming → imperfectable-design-taste → emil-kowalski-design → incremental-implementation
```

1. **brainstorming**: Define objetivos de diseno con el CEO
2. **imperfectable-design-taste**: Audita tipografia, color, espaciado, accesibilidad
3. **emil-kowalski-design**: Revisa animaciones, micro-interacciones, perceived performance
4. **incremental-implementation**: Implementa cambios de UI en pasos revisables

## Loop de reparación post-auditoría (Audit → Fix)

```
[auditor-de-seguridad | auditor-de-marketing | optimizador-finops] → audit-loop
```

1. **Audit skill** (uno o varios): corre y genera reporte con N findings
2. **audit-loop**: CEO acepta el follow-up, loop itera hasta 3 veces aplicando fixes seguros, preguntando antes de fixes sensibles, y escalando si quedan críticos abiertos

## Auditoría completa + reparación integral

```
auditor-de-seguridad + auditor-de-marketing + optimizador-finops (paralelo) → gestor-documental → audit-loop
```

1. Los 3 audit skills corren en paralelo (independientes)
2. **gestor-documental**: compila los hallazgos en informe APA
3. **audit-loop**: si el CEO quiere, repara todo lo encontrado

## Pre-deploy gate (CI-friendly)

```
agente-devops → auditor-de-seguridad → audit-loop
```

1. **agente-devops**: valida Docker/CI configs
2. **auditor-de-seguridad**: escanea vulnerabilidades
3. **audit-loop**: aplica fixes seguros automáticos, pide OK para sensibles, re-audita hasta 3 iteraciones o hasta que todo esté limpio antes del push
