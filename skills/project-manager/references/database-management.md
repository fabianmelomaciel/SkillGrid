# Database Change Management

Do NOT implement DB changes directly. Follow:

1. **Generate ordered SQL migrations** in `reports/database/migrations/`:
   - Idempotent (`IF NOT EXISTS` / `IF EXISTS`), numbered, with `-- UP` / `-- DOWN` sections
   - `README.md` with project, date, risks, rollback procedure

2. **Isolate from production** — `reports/` in `.gitignore`, NOT deployable, NOT web-accessible

3. **CEO approval required** with structured plan:
   ```
   📋 Migration Plan: N migrations, Risk: [level]
   001: Add `table` — non-destructive
   002: Drop `column` — destructive ⚠️
   Rollback: DOWN scripts, sequential verify
   ```

4. **Verification gate**: syntax-valid, UP/DOWN present, idempotent, destructive flagged ⚠️, backward compatible

5. **Never auto-apply**: always require CEO approval + maintenance window + backup
