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
brainstorming → impeccable-design-taste → emil-kowalski-design → incremental-implementation
```

1. **brainstorming**: Define objetivos de diseno con el CEO
2. **impeccable-design-taste**: Audita tipografia, color, espaciado, accesibilidad
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

## 🔒 AI Security Gate (LLM Apps) — v1.6

```
prompt-injection-guard → auditor-de-seguridad → supply-chain-auditor → audit-loop
```

1. **prompt-injection-guard**: Audita todas las superficies LLM del proyecto (chatbots, RAG pipelines, tool agents) contra OWASP LLM01:2025
2. **auditor-de-seguridad**: Escanea el código de aplicación (SAST, OWASP web Top 10, secrets)
3. **supply-chain-auditor**: Verifica CVEs en dependencias, lockfile integrity, licencias del SDK de IA
4. **audit-loop**: Repara automáticamente lo que sea seguro, escala lo crítico al CEO

## 📦 Supply Chain Gate (Pre-Merge) — v1.6

```
supply-chain-auditor → audit-loop
```

1. **supply-chain-auditor**: `npm install <dep>` → CVE scan + license check + lockfile verify + deprecated check
2. **audit-loop**: auto-aplica `npm audit fix --only=patch`, escala breaking changes y licencias incompatibles

## ⚡ Performance Gate (Pre-Merge UI Features) — v1.6

```
performance-profiler [baseline] → [merge feature] → performance-profiler [after] → delta report
```

1. **performance-profiler** (antes del merge): captura baseline — Lighthouse score, bundle size, LCP/CLS/INP
2. *(merge de la feature)*
3. **performance-profiler** (después): mide de nuevo, genera tabla delta
4. Si alguna métrica degrada >10% → bloquea merge y escala al CEO

## 🤖 Multi-Agent Pipeline (A2A) — v1.6

```
a2a-orchestrator → [Agent A (seguridad) ‖ Agent B (performance) ‖ Agent C (supply-chain)] → merge → gestor-documental
```

1. **a2a-orchestrator**: define topología (3 agentes en paralelo), genera `agentcard.json`, configura task lifecycle
2. **Agentes A/B/C**: corren en procesos separados, cada uno con su skill especializada
3. **merge**: orchestrator espera los 3 `COMPLETED`, fusiona reportes JSON
4. **gestor-documental**: compila informe final APA/ISO

## 🛡️ LLM App Hardening (Full Stack) — v1.6

```
brainstorming → spec-driven-development → [prompt-injection-guard + supply-chain-auditor] (paralelo) → mcp-configurator → audit-loop → agente-devops
```

1. **brainstorming**: define arquitectura de la app LLM (RAG, agentic, chatbot, etc.)
2. **spec-driven-development**: documenta requerimientos de seguridad y límites del sistema
3. **prompt-injection-guard** + **supply-chain-auditor** (en paralelo): auditoría de seguridad completa antes del primer deploy
4. **mcp-configurator**: conecta al agente de desarrollo con los MCP servers necesarios (DB, GitHub, tools)
5. **audit-loop**: repara hallazgos seguros, escala críticos
6. **agente-devops**: genera Dockerfile y pipeline CI/CD con todos los gates de seguridad incorporados
