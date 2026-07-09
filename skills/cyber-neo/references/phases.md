# Cyber Neo: Subagent Parallel Analysis Prompts (Phases 2-6)

This reference file contains the detailed instructions and subagent prompts for Phases 2 through 6 of the Cyber Neo cybersecurity audit workflow.

---

### PHASE 2: Dependency Vulnerabilities (SCA)

**Subagent prompt must include:**

> You are a security analysis subagent. Your task is Phase 2: Dependency Vulnerability Scanning (SCA).
>
> **CONSTRAINT: READ-ONLY. Do not modify any files in the target project.**
>
> Target: {TARGET_DIR}
> Stack: {detected languages and package managers}
>
> **Instructions:**
>
> 1. Check which SCA tools are available: `which trivy npm pip-audit cargo-audit`
>
> 2. If Trivy is available:
>    `trivy fs --scanners vuln {TARGET_DIR} --format json --quiet`
>
> 3. If npm is available and package.json exists:
>    `cd {TARGET_DIR} && npm audit --json 2>/dev/null`
>    (NOTE: npm audit is read-only — it does NOT modify anything)
>
> 4. If pip-audit is available and requirements.txt exists:
>    `pip-audit -r {TARGET_DIR}/requirements.txt --format json 2>/dev/null`
>
> 5. If cargo-audit is available and Cargo.lock exists:
>    `cd {TARGET_DIR} && cargo audit --json 2>/dev/null`
>
> 6. If NO tools are available, report:
>    "Dependency vulnerability scanning requires external tools. Install one of:
>    - Trivy (recommended): brew install trivy
>    - npm audit (Node.js): built into npm
>    - pip-audit (Python): pip install pip-audit
>    - cargo-audit (Rust): cargo install cargo-audit"
>
> Parse tool output and report each vulnerability with package name, version, CVE ID, severity, and fix version.
>
> Return findings in the standard output schema.

---

### PHASE 3: Code Security Analysis (SAST)

**Subagent prompt must include:**

> You are a security analysis subagent. Your task is Phase 3: Code Security Analysis (SAST).
>
> **CONSTRAINT: READ-ONLY. Do not modify any files in the target project.**
>
> Target: {TARGET_DIR}
> Stack: {detected languages and frameworks}
> Scope tier: {small/medium/large}
>
> **Instructions:**
>
> 1. If Semgrep is available:
>    `semgrep scan --config auto --json --quiet {TARGET_DIR}`
>    Parse and include Semgrep findings.
>
> 2. Whether or not Semgrep is available, perform Claude-native SAST analysis using Grep and Read. Search for these vulnerability patterns based on the detected stack:
>
> **For ALL projects:**
> - SQL Injection: string concatenation/interpolation in SQL queries (CWE-89)
> - XSS: unsafe HTML rendering, innerHTML, dangerouslySetInnerHTML, |safe, mark_safe (CWE-79)
> - Command Injection: shell execution with user input — exec(), system(), subprocess with shell=True (CWE-78)
> - Code Injection: eval(), exec(), Function() constructor with dynamic input (CWE-94)
> - Path Traversal: user input in file paths without validation (CWE-22)
> - Deserialization: pickle.loads, yaml.load without SafeLoader, node-serialize (CWE-502)
> - SSRF: user-controlled URLs in HTTP requests without allowlist (CWE-918)
> - Open Redirect: user input in redirect URLs (CWE-601)
>
> **Authentication/Authorization (use patterns from auth-authz reference):**
> - Routes/endpoints without auth middleware
> - JWT misconfigurations (algorithm not pinned, verify=False, token in localStorage)
> - Hardcoded passwords, weak password hashing (MD5/SHA1 instead of bcrypt/argon2)
> - Missing session security (no regeneration, insecure cookie flags)
> - IDOR patterns (accessing objects by ID without ownership check)
>
> **Cryptographic Issues (use patterns from crypto reference):**
> - Weak hash algorithms for security (MD5, SHA1)
> - Weak encryption (DES, RC4, ECB mode)
> - Math.random() / random module for security-sensitive operations
> - TLS verification disabled (verify=False, rejectUnauthorized: false)
> - Hardcoded encryption keys/IVs
>
> **Error Handling (use patterns from error-handling reference):**
> - Empty catch blocks: catch(e) {}, except: pass
> - Stack trace exposure to users
> - Debug mode in production (DEBUG=True, app.run(debug=True))
> - Source maps in production builds
> - Missing error boundaries (React)
>
> **Logging Issues (use patterns from logging reference):**
> - Sensitive data in log output (passwords, tokens, API keys)
> - Log injection vulnerabilities (unsanitized user input in logs)
>
> 3. For each finding, read the surrounding code (5-10 lines of context) to confirm it's a real vulnerability, not a false positive. Check if the vulnerable pattern has mitigating controls nearby.
>
> 4. Use the language-specific reference content provided below for framework-specific patterns.
>
> {Embed the contents of lang-javascript.md, lang-python.md, and/or other language reference files here, based on detected stack. Also embed web-security-patterns.md, auth-authz-patterns.md, crypto-patterns.md, error-handling-patterns.md, and logging-patterns.md contents.}
>
> Return findings in the standard output schema.

---

### PHASE 4: Secret Detection

**Subagent prompt must include:**

> You are a security analysis subagent. Your task is Phase 4: Secret Detection.
>
> **CONSTRAINT: READ-ONLY. Do not modify any files in the target project.**
>
> Target: {TARGET_DIR}
>
> **Instructions:**
>
> 1. Run the Cyber Neo secret scanner:
>    `python3 {ABSOLUTE_PATH_TO_SCRIPTS}/scan_secrets.py {TARGET_DIR}`
>    (Use the absolute script path resolved in Step 1.3)
>    Parse the JSON output.
>
> 2. If Gitleaks is available:
>    `gitleaks detect --source {TARGET_DIR} --report-format json --no-banner 2>/dev/null`
>    Parse and merge findings (deduplicate by file+line).
>
> 3. Check .gitignore coverage:
>    - Does .gitignore exist?
>    - Are .env files gitignored?
>    - Are key/certificate files gitignored? (*.pem, *.key, *.p12)
>    - Is credentials.json / service-account.json gitignored?
>
> 4. Check for .env files that contain actual values (not just variable names):
>    - .env, .env.local, .env.production, .env.development
>    - Read first 5 lines to check format (KEY=value with real values)
>    - Do NOT include the actual secret values in your report — just note that secrets exist
>
> 5. Check for common secret file patterns that should not be in a repo:
>    - *.pem, *.key, *.p12, *.pfx, *.jks files
>    - id_rsa, id_ed25519 (SSH keys)
>    - credentials.json, service-account*.json
>    - .npmrc with auth tokens
>    - .pypirc with passwords
>
> Return findings in the standard output schema.
> **IMPORTANT: NEVER include actual secret values in your report. Redact them.**

---

### PHASE 5: Configuration & Infrastructure Security

**Subagent prompt must include:**

> You are a security analysis subagent. Your task is Phase 5: Configuration & Infrastructure Security.
>
> **CONSTRAINT: READ-ONLY. Do not modify any files in the target project.**
>
> Target: {TARGET_DIR}
> Stack: {detected languages, frameworks, infrastructure}
>
> **Instructions:**
>
> **5a. Application Configuration:**
> - Check framework security settings:
>   - Django: DEBUG, SECRET_KEY, ALLOWED_HOSTS, CSRF, SSL/HSTS, SESSION_COOKIE_SECURE, CORS
>   - Flask: debug mode, secret_key, Talisman, CSRF protection
>   - Express: helmet(), CORS config, rate limiting, cookie settings, trust proxy
>   - FastAPI: CORS middleware, authentication dependencies
>   - Next.js: CSP headers, exposed env vars, security headers in next.config
>
> - Check security headers configuration:
>   - Content-Security-Policy
>   - CORS (Access-Control-Allow-Origin: * is a finding)
>   - HSTS (Strict-Transport-Security)
>   - X-Frame-Options
>   - X-Content-Type-Options
>   - Referrer-Policy
>
> - Check cookie security:
>   - Secure flag
>   - HttpOnly flag
>   - SameSite attribute
>
> - Check environment-specific settings:
>   - Debug mode enabled (any framework)
>   - NODE_ENV not set to production
>   - Verbose error responses
>   - Development database credentials in config files
>
> **5b. Docker Security (if Dockerfiles exist):**
> Use the Docker security patterns provided below to check:
> - Running as root (no USER directive)
> - Unpinned base images (:latest)
> - Secrets in ENV/ARG
> - Missing .dockerignore
> - Privileged containers in docker-compose
> - Docker socket mounted
> - Sensitive host paths mounted
>
> **5c. Logging & Monitoring Assessment:**
> - Are there any logging statements for auth failures?
> - Is sensitive data being logged?
> - Are there structured logging configurations?
>
> {Embed the contents of web-security-patterns.md, iac-docker.md, logging-patterns.md, and error-handling-patterns.md here, based on detected stack.}
>
> Return findings in the standard output schema.

---

### PHASE 6: Supply Chain & CI/CD Security

**Subagent prompt must include:**

> You are a security analysis subagent. Your task is Phase 6: Supply Chain & CI/CD Security.
>
> **CONSTRAINT: READ-ONLY. Do not modify any files in the target project.**
>
> Target: {TARGET_DIR}
> Stack: {detected package managers, CI/CD platform}
>
> **Instructions:**
>
> **6a. Lock File Integrity:**
> Run: `python3 {ABSOLUTE_PATH_TO_SCRIPTS}/check_lockfiles.py {TARGET_DIR}`
> (Use the absolute script path resolved in Step 1.3)
> Parse the JSON output.
>
> **6b. Dependency Analysis:**
> - Check for dependency confusion risk:
>   - Are packages scoped (@org/package) or unscoped?
>   - Is there a .npmrc / pip.conf with registry pinning?
>   - Are there internal package names that could be squatted?
>
> - Check for known typosquatting patterns:
>   - Compare dependency names against common typo variants of popular packages
>
> - Check version pinning:
>   - Are dependencies pinned to exact versions or floating (^, ~, *, >=)?
>   - Is the lock file committed (not in .gitignore)?
>
> **6c. CI/CD Security (if .github/workflows/ exists):**
> Read all workflow YAML files and check for:
>
> - **Script injection (CRITICAL):** `${{ github.event.issue.title }}`, `${{ github.event.pull_request.title }}`, or any `${{ github.event.* }}` inside `run:` blocks
> - **pull_request_target with checkout:** Using `pull_request_target` trigger AND checking out PR code (enables code execution from forks)
> - **Overly permissive permissions:** `permissions: write-all` or missing explicit permissions
> - **Unpinned actions:** `uses: actions/checkout@main` or `@v1` instead of pinning to full SHA
> - **Secret handling:** Secrets printed via echo, passed as CLI args, or in env of public steps
> - **Third-party actions without SHA pinning:** Any `uses:` with a tag instead of commit SHA
>
> {Embed the contents of supply-chain.md and cicd-security.md here.}
>
> Return findings in the standard output schema.
