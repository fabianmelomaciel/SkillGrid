# CI/CD Security & Portability Patterns

## Docker Security Patterns

| Pattern | Descripcion |
|---------|-------------|
| Multi-stage builds | Reduce tamano de imagen, elimina build tools de prod |
| Non-root user | `USER appuser` en Dockerfile, nunca correr como root |
| Read-only rootfs | `read_only: true` en compose para contenedores stateless |
| Healthcheck | Siempre definir healthcheck, no confiar en restart: always ciego |
| Resource limits | `mem_limit`, `cpus` para evitar DoS por contenedor vecino |
| Secrets via files | `/run/secrets/`, nunca env vars para credenciales |
| Image pinning | `image:tag@sha256:...` para evitar mutabilidad de tags |

## CI/CD Hardening

| Area | Practice |
|------|----------|
| Secrets | Usar GitHub Secrets / vault, nunca hardcoded |
| Permissions | GITHUB_TOKEN con minimo privilegio (contents: read, issues: write) |
| Artifacts | Limpiar artifacts viejos, no exponer logs con secrets |
| Actions pinning | Pinned by commit SHA, no por version tag |
| Matrix builds | Testear en multiples OS/version sin duplicar config |

## IEEE 730 Quick Reference

- **Configuration Management**: Todo cambio debe ser rastreable
- **Verification**: Cada artefacto debe tener un metodo de verificacion definido
- **Traceability**: De requirement → design → code → test
