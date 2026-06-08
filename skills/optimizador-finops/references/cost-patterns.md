# Cost Optimization Patterns

Referencia para auditorias de costo computacional.

## API Cost Patterns

| Patron | Costo | Alternativa |
|--------|-------|-------------|
| Polling cada N segundos | Alto | Webhooks / Event-driven |
| Fetch datos completos siempre | Alto | Partial responses, sparse fieldsets |
| N+1 queries en GraphQL | Alto | Batching, DataLoader |
| Sin cache en endpoints calientes | Alto | Cache con TTL, CDN |
| Retry exponencial generico | Medio | Circuit breaker + backoff adaptativo |

## Token Usage Economy

| Practica | Ahorro estimado |
|----------|----------------|
| Prompt truncation a lo esencial | 30-50% |
| Context window limitada a N tokens | 20-40% |
| Reutilizar embeddings en vez de recalcular | 60-80% |
| System prompt comprimido | 10-20% |

## Infrastructure Cost Signals

- Containers sin resource limits → overprovisioning
- Volumenes no limpiados en CI → storage acumulado
- Build sin layer caching → rebuild completo cada vez
- Logs sin rotation → disk lleno → costo de recovery
