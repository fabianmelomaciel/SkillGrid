# Dual-Environment Analysis

### Detection (existing projects)
Scan for `.env*`, `docker-compose*.yml`, `.gitignore`, `.dockerignore`. Detect DB schema drift via `db-schema-detector`. Tag files as `local-only`, `prod-only`, `shared`.

### Report format
```
🌐 Dual-Environment Analysis
Env files: .env.example (shared), .env.local (local), .env.production (prod)
DB drift: [tables only local]
Excluded: reports/, scratch/, .env.local
```

### Scaffolding (new projects)
```
.env.example (committed) | .env.local (.gitignore) | .env.production (never committed)
docker-compose.yml + docker-compose.override.yml (.gitignore) + docker-compose.prod.yml
reports/database/migrations/ (.gitignore)
```

### Rules
- Don't delete/modify env-specific configs
- Flag production-vs-local discrepancies as informational only
- Tag migrations with environment target (`all`, `local-only`, `prod-only`)
