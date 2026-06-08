---
name: db-schema-detector
description: "Detects local databases and generates cached schemas in CodeGraph to save tokens and audit design inconsistencies, security issues, and environment drift between local and production."
category: core
status: stable
risk_level: safe
token_estimate: { input: 1379, output: 552 }
---

## Core


# Db Schema Detector & Auditor Agent

## When to Use

Use this skill when starting a new workspace analysis or project session where a database is present. It ensures that the schema structure is cached locally inside the `.codegraph/` directory to prevent loading large migrations or executing repeated database query scans, optimizing token economy and identifying data structure anomalies at the very beginning of the work.

---

## Workflow

### Step 1: Automatic Environment & Credentials Scan
*   Detect host Operating System (Windows, Linux, macOS) and active local server stack (Laragon, XAMPP, LAMP, Docker).
*   Search for configuration and environment files (e.g. `.env`, `config/database.php`, `database.js`).
*   Extract connection parameters (host, port, database, username) and DB Engine type (MySQL/MariaDB, PostgreSQL, SQLite).
*   **CRITICAL DIRECTIVE**: Never log, cache, or output database passwords. All passwords must remain strictly in memory during execution.

### Step 2: Database Introspection (Hot / Cold Fallback)
*   Execute the local introspector utility (`node skills/core/db-schema-detector/scripts/db-detector.js`):
    *   **Hot Introspection**: The script attempts connection to the local database using PHP PDO or CLI clients with a strict 3-second connection timeout.
    *   **Cold Introspection**: If the database is unreachable, the script automatically parses local migrations (`database/migrations/`, `migrations/`), SQL DDL dumps, or ORM schemas (Prisma, Eloquent) to reconstruct the tables.
*   Check Cache Lifecycle: Only run the database introspector if `.codegraph/db_schema.json` is missing or if the MD5 hashes of the migration files/`.env` file have changed.

### Step 3: Local Memory Storage (CodeGraph Integration)
*   Store the extracted schema structures under:
    *   `.codegraph/db_schema.json`: Dense database schema representation.
    *   `.codegraph/db_schema.md`: Markdown overview listing columns, primary keys, and foreign keys.
*   **CRITICAL DIRECTIVE**: Ensure both files are added to `.git/info/exclude` or `.gitignore` immediately upon creation to prevent committing schemas to remote version control.

### Step 4: Database Inconsistency & Security Audit
*   Automatically audit the generated schema for:
    *   **Structural Failures**: Tables missing primary keys or `id` fields.
    *   **Naming Inconsistencies**: Mixed casing (snake_case and camelCase) used across tables.
    *   **Orphan Relations**: Foreign key naming fields (`*_id`) that lack index associations or foreign key declarations.
    *   **Security Anti-patterns**: Short `varchar` or `char` columns (length < 40) storing raw user passwords without hashing.

### Step 5: Dynamic Context Token Savings
*   Refer to `.codegraph/db_schema.json` for any structural database queries.
*   Avoid querying the database or reading raw schema SQL files on subsequent conversation turns. Load only the tables relevant to the files or symbols actively scanned by CodeGraph.

---

### Step 6: Environment Drift Detection (Dual-Environment Awareness)

After caching the schema, compare it with the project's dual-environment setup (see `project-manager` → Dual-Environment Analysis Protocol):

- Check for tables/columns that exist only locally vs in migration history
- Flag schema elements that reference environment-specific paths, URLs, or credentials
- Tag entities in `db_schema.json` with `environment: "local" | "production" | "shared"` when drift is detected
- Report findings to the PM for inclusion in the Dual-Environment Report

---

## Tools

- `bash` — execute the database schema detector script
- `read` — read cached schema Markdown and JSON files
- `edit`/`write` — update exclusions and installer scripts
