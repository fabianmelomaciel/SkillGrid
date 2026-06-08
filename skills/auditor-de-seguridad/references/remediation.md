# Remediation Playbooks — Security Auditor

> Cargado bajo demanda por `auditor-de-seguridad` cuando se necesita guía de remediación específica.
> No cargar en contexto completo — solo el playbook relevante al finding.

---

## Secrets Exposed (Critical)

1. Revocar la key/token inmediatamente (AWS console, GitHub, Stripe dashboard, etc.)
2. Eliminar el secret del historial git: `git filter-repo` o BFG Repo-Cleaner
3. Rotar a una nueva key
4. Agregar a `.gitignore` y usar variables de entorno

---

## SQL Injection (Critical)

1. Reemplazar interpolación de strings con queries parametrizadas / prepared statements
2. Usar ORM query builders en lugar de SQL crudo
3. Agregar validación y sanitización de inputs
4. Testear con: `' OR 1=1 --`

---

## XSS (High)

1. Reemplazar `innerHTML` con `textContent` o `innerText`
2. Usar DOMPurify para sanitizar HTML si es necesario
3. Agregar header `Content-Security-Policy`
4. Escapar todo output controlado por el usuario

---

## Command Injection (Critical)

1. Reemplazar `exec`/`system`/`shell_exec` con APIs nativas del lenguaje
2. Si exec es requerido: validar input contra allowlist, escapar args de shell
3. Nunca pasar input del usuario directamente a comandos shell

---

## CORS Misconfiguration (High)

1. Nunca usar `Access-Control-Allow-Origin: *` con credenciales
2. Restringir a orígenes específicos
3. Validar el header `Origin` server-side

---

## Exposed .env in Apache (High)

Agregar en `.htaccess`:

```apache
RewriteRule ^\.env - [F,L]
```

---

## Insecure CI/CD (Critical)

1. Eliminar secrets hardcodeados de los workflow files
2. Mover a GitHub Secrets / environment variables
3. Pinear actions a commit SHA
4. Habilitar branch protection con required reviews

---

## Missing Rate Limiting (High)

1. Implementar rate limiting en endpoints de auth (login, register, password reset)
2. Usar rate limiting en reverse proxy (nginx `limit_req`, Cloudflare)
3. Agregar account lockout después de N intentos fallidos
4. Implementar CAPTCHA después del threshold
5. Agregar tiers de rate limit por-IP y por-usuario

---

## Weak Authentication (Critical)

1. Enforcer política de passwords fuerte (mín 12 chars, complejidad)
2. Implementar MFA para acciones sensibles
3. Expiración corta de JWT (15 min para access tokens)
4. Implementar session rotation en login
5. Usar cookies `secure+httpOnly+SameSite`

---

## Race Condition (High)

1. Usar transacciones de DB con niveles de isolación correctos
2. Implementar optimistic locking con campos de versión
3. Usar operaciones atómicas (`INCREMENT`, `DECREMENT`) en lugar de read-then-write
4. Agregar idempotency keys para endpoints de pago/orden

---

## No Audit Logging (Medium)

1. Loguear todos los eventos de auth (login, logout, intentos fallidos)
2. Loguear operaciones sensibles (create, update, delete, role changes)
3. Nunca loguear passwords, tokens ni PII
4. Centralizar logs con timestamps y user IDs

---

## GDPR Non-Compliance (High)

1. Agregar privacy policy y cookie consent banner
2. Implementar endpoint de eliminación de datos
3. Documentar actividades de procesamiento de datos
4. Agregar export de portabilidad de datos
5. Revisar compartición de datos con terceros
