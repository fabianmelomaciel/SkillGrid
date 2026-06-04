# Security Audit Checklists

Detailed check items per category. Reference these from the main SKILL.md during audits.

---

## Secrets & Credentials

- Manually review .gitignore, .dockerignore, and any config files
- **Critical findings**: committed API keys, private keys, tokens — must be revoked
- Look for: .env files committed, hardcoded passwords, connection strings, npmrc/pip.conf with tokens, SSH keys, JWT secrets, cloud provider keys (AWS_ACCESS_KEY_ID, etc.), database URLs with credentials, OAuth tokens, service account JSON files, certificate files (.pem, .crt, .key)
- Check git history for previously committed secrets (`git log -p --diff-filter=M -- .env`)

## Dependency & Supply Chain

- Also inspect package.json / composer.json / requirements.txt / Cargo.toml / go.mod for outdated packages
- **Critical findings**: known CVEs with active exploits, compromised upstream packages
- Check for: unpinned versions (>=, ^, ~), deprecated packages, multiple lock files, typo-squatting risks, unused dependencies, license compliance (GPL in commercial product), sub-dependency vulnerabilities (transitive deps), npm audit / pip-audit / cargo audit / yarn audit / composer audit
- Review lockfile diff for unexpected changes

## SAST — OWASP Top 10 & AI Remnants

- Manually review raw queries, template rendering, file operations, and look for AI remnants
- **Critical findings**: SQLi, Command Injection, Insecure Deserialization, RCE
- Check for:
  - **A1: Broken Access Control** — IDOR, missing authorization checks, privilege escalation
  - **A2: Cryptographic Failures** — weak algorithms, hardcoded keys, insufficient entropy
  - **A3: Injection** — SQL, NoSQL, OS command, LDAP, XPath, template injection (SSTI)
  - **A4: Insecure Design** — missing rate limits, lack of secure defaults, over-fetching
  - **A5: Security Misconfiguration** — verbose errors, default creds, unused features enabled
  - **A6: Vulnerable Components** — outdated libraries with known vulns (covered in category 2)
  - **A7: Auth Failures** — weak passwords, broken session management, missing MFA
  - **A8: Integrity Failures** — unsigned updates, untrusted CDNs, incomplete CI/CD verification
  - **A9: Logging Failures** — no audit trail, log injection, sensitive data in logs
  - **A10: SSRF** — user-supplied URLs fetched server-side, cloud metadata endpoint access
  - **AI Remnants & Vibe Coding Placeholders** — `// TODO: implement`, `// Insert logic here`, `// FIXME: implement this later`, empty `catch`/`except` blocks, stub functions, placeholder error handlers

## Rate Limiting & DoS Protection

- Manually review API routes, login forms, public endpoints
- **Critical findings**: no rate limiting on auth endpoints, no DoS protections
- Check for:
  - Login/register endpoints without rate limiting (brute force vector)
  - Password reset without rate limiting or account locking
  - API endpoints without throttling (per-IP, per-user, per-key)
  - Missing or misconfigured reverse proxy rate limiting (nginx limit_req, Apache mod_evasive, Cloudflare)
  - No CAPTCHA or challenge on repeated failed attempts
  - No account lockout policy after N failed attempts
  - WebSocket/message endpoints without rate limiting
  - File upload endpoints without size/concurrency limits
  - GraphQL without query depth limiting or cost analysis
  - Missing connection pooling limits
  - Resource-intensive endpoints (search, export, report generation) without queue or timeout
  - No request size limits
  - No timeout on external service calls

## Authentication & Session Management

- **Critical findings**: auth bypass, hardcoded sessions, JWTs without verification
- Check for:
  - **Password policies**: minimum length, complexity requirements, no common passwords
  - **MFA/2FA**: available for sensitive actions, enforced for admin roles
  - **JWT**: token signing algorithm (no 'none' algorithm), expiration (short TTL), secret strength, no sensitive data in payload, proper audience/issuer validation
  - **Session management**: secure+httpOnly cookies, session timeout (idle + absolute), session rotation on login, session fixation protection, concurrent session limiting
  - **OAuth/OIDC**: redirect URI validation, state parameter, PKCE for public clients, token storage
  - **Password reset**: secure token generation, token expiration, email verification
  - **Account enumeration**: error messages don't reveal if user exists
  - **Remember-me tokens**: securely generated, stored hashed, one-time use
  - **Registration**: email verification required, no automatic admin assignment

## API Security

- **Critical findings**: missing auth on API endpoints, mass assignment, insecure webhooks
- Check for:
  - **Authentication**: every endpoint requires auth (unless explicitly public), no missing @Auth/@LoginRequired decorators
  - **Authorization**: proper role/permission checks, no IDOR in REST paths or query params
  - **Input validation**: all inputs validated server-side (not just client-side), content-type validation, schema validation for JSON payloads
  - **Mass assignment**: no automatic binding of request body to models/entities without allowlist
  - **Rate limiting**: per-endpoint throttling (covered in category 4, cross-reference)
  - **CORS**: not overly permissive (no Access-Control-Allow-Origin: * with credentials), validate Origin
  - **Webhooks**: secret verification, replay protection (timestamp + nonce), idempotency keys, payload validation
  - **API keys**: properly scoped, rotatable, not exposed client-side, revokable
  - **GraphQL**: introspection disabled in production, query depth limiting, no batching abuse, field-level authorization
  - **WebSocket**: origin validation, authentication on connect, message rate limiting
  - **Pagination**: no unbounded `?limit=1000000`, cursor-based pagination preferred
  - **Error handling**: no stack traces or internal details in API responses

## Encryption & Data Protection

- **Critical findings**: weak crypto, no TLS, storing passwords in plaintext
- Check for:
  - **Passwords**: hashed with bcrypt/argon2/scrypt (NOT md5, sha1, sha256 alone), proper cost factor
  - **TLS**: HTTPS enforced, HSTS header present, no mixed content, certificate validation, modern TLS version (1.2+), no weak cipher suites
  - **Data at rest**: PII encrypted in database, file-level encryption for sensitive uploads
  - **Data in transit**: all external calls use HTTPS, internal service-to-service also encrypted
  - **Key management**: keys not hardcoded, proper key rotation process, secret storage (vault, env vars, not code)
  - **Weak algorithms**: no DES, RC4, MD4, MD5 for security uses; no ECB mode; no custom crypto
  - **Token entropy**: sufficient randomness for session tokens, CSRF tokens, password reset tokens
  - **Credit card/PII**: no logging of sensitive data, proper masking

## Infrastructure & Cloud Security

- Manually review Dockerfiles, nginx/Apache configs, .env files, cloud configs
- **Critical findings**: wildcard CORS, exposed debug endpoints, root containers, open cloud storage
- Check for:
  - **Dockerfile**: no running as root, pin base image digest, no COPY --from=untrusted, multi-stage builds, no secrets in build args
  - **Docker Compose**: no ports exposed to 0.0.0.0 unnecessarily, no privileged mode, env vars not in compose file
  - **Kubernetes**: no privileged containers, no hostPath mounts, resource limits set, network policies, no default service accounts with cluster-admin, pod security contexts, secrets not in configmaps
  - **CORS**: not wildcard with credentials, specific origin allowlist
  - **Security headers**: HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Cross-Origin-Embedder-Policy
  - **nginx/Apache**: directory listing disabled, no exposed .git/.env, proper SSL config, rate limiting configured
  - **Cloud (AWS/GCP/Azure)**: S3 buckets not public, IAM least privilege, security groups restricted, no overly permissive roles, CloudTrail/audit logging enabled, encryption enabled on storage, no default VPC with 0.0.0.0/0
  - **Debug/prod separation**: debug mode off in production, no exposed /debug, /status, /phpinfo(), /actuator endpoints
  - **Terraform/Infra-as-Code**: state file not exposed, no hardcoded secrets in .tf, remote state with encryption, plan reviewed before apply

## Database Security

- Manually review SQL files, ORM usage, migration scripts
- **Critical findings**: DROP TABLE/DATABASE in production code, SQL injection in raw queries
- Check for:
  - **Credentials**: no hardcoded DB passwords in code, connection strings from env vars
  - **SQL injection**: string interpolation in raw queries, no parameterized statements
  - **ORM safety**: raw queries through ORM (EntityFramework RawSql, Django raw(), Sequelize.query()), N+1 leading to DoS
  - **Migrations**: no destructive operations without rollback plan, no irreversible migrations, backup before migration
  - **Privileges**: app DB user has minimum required privileges (no DROP/CREATE/ALTER for app user), separate migration user vs app user
  - **Exposure**: DB port not exposed to internet, firewall restricts access to app server IPs only
  - **Encryption**: data encrypted at rest, connection encrypted (TLS for DB connections)
  - **Backup**: automated backups, encrypted backups, tested restore process

## Logging & Monitoring

- **Critical findings**: no audit logs, logging passwords/PII, no intrusion detection
- Check for:
  - **Audit trail**: login/logout events logged, sensitive operations logged (create/delete/role changes), timestamps with timezone
  - **No PII in logs**: passwords, tokens, credit cards, personal data NOT logged; proper log scrubbing/masking
  - **Error handling**: no stack traces exposed to users, proper error pages (no verbose errors), uncaught exception handling
  - **Intrusion detection**: failed login attempts logged, unusual patterns monitored, alerts for brute force
  - **Log storage**: logs not stored in web root, log rotation configured, centralized logging for multi-server setups
  - **Monitoring**: health check endpoints, uptime monitoring, performance metrics, alert thresholds
  - **Incident response**: IR plan documented, contact info for security incidents, escalation path defined
  - **Log injection**: user input sanitized before logging (prevent log forging)

## Business Logic & Access Control

- Reuses SAST scanner with focus on business logic
- **Critical findings**: IDOR, privilege escalation, race conditions, parameter tampering
- Check for:
  - **IDOR (Insecure Direct Object Reference)**: user can access/modify resources belonging to other users by changing IDs in URLs/bodies; test with `/api/users/123` → try `/api/users/124`
  - **Privilege escalation**: normal user can access admin functions; check role/permission checks on every admin endpoint
  - **Race conditions**: concurrent requests to same resource (e.g., bank transfer, coupon usage, inventory deduction); check for atomic operations, database locks, optimistic concurrency
  - **Parameter tampering**: changing price/amount in POST bodies, coupon codes, discount percentages; always validate server-side, never trust client
  - **Mass assignment**: automatic model binding from request bodies; check for `@RequestBody`/`request.form` mapped directly to entities
  - **Workflow bypass**: skipping steps in multi-step processes (checkout without payment, registration without verification); validate state transitions server-side
  - **Replay attacks**: sensitive operations without nonce/timestamp validation; check for idempotency keys on payment endpoints

## Compliance & Privacy

- **Critical findings**: no privacy policy, collecting data without consent, no data deletion mechanism
- Check for:
  - **GDPR**: privacy policy present, consent mechanism for data collection, data deletion/erasure endpoint, data portability export, cookie consent banner, DPA with third-party processors, breach notification process
  - **CCPA**: right to opt-out of data sale, right to deletion, notice at collection
  - **LGPD**: (Brazil) similar to GDPR, data protection officer designated
  - **Data inventory**: what PII is collected, where it's stored, how long retained, who has access
  - **Data retention**: defined retention periods, automated cleanup for expired data
  - **Third-party services**: what data is shared, have DPA/contracts, sub-processor list
  - **Children's privacy**: COPPA compliance if applicable (no data from <13 without parental consent)
  - **Cookie compliance**: cookie categories (essential/functional/analytics/marketing), consent before non-essential cookies, cookie expiry
  - **Data Processing Register**: documented processing activities, lawful basis for each processing purpose
  - **Security measures**: documented technical and organizational measures (TOMs)
