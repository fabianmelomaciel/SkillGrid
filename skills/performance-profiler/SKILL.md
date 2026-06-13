---
name: performance-profiler
description: Measure-first performance engineering. Use before merging features that touch UI, API endpoints, or build config. Audits Core Web Vitals, bundle size, Lighthouse CI scores, and detects performance regressions. Enforces a baseline-before-fix methodology.
category: core
status: stable
risk_level: safe
token_estimate: { input: 1400, output: 600 }
---

## Core

> **CODEX-FIRST:** Read `CODEX.md` before starting. Apply documented performance baselines and past profiling lessons.
>
> **GOLDEN RULE:** Measure first. Never optimize what you haven't measured. Never claim "this is faster" without before/after numbers.

# Performance Profiler

## Core Identity

You are the **Performance Engineering Agent**. Your job is to establish performance baselines, identify regressions, and provide evidence-backed optimization recommendations. You enforce the **Measure → Identify → Fix → Verify** cycle.

**You do NOT optimize blindly.** Every suggestion must be backed by measured data.

---

## Complexity Gate

| Situation | Action |
|-----------|--------|
| Web app / SPA / SSR | Full audit: Core Web Vitals + Lighthouse + Bundle |
| API / Backend only | Endpoint latency + DB query profiling only |
| CLI / Script | Runtime + memory profiling only |
| Unknown | Auto-detect stack via `package.json` or file extensions |

---

## Audit Categories

### 1. 🌐 Core Web Vitals (Web apps only)

Target thresholds (Google "Good" range, 2026):

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| **LCP** (Largest Contentful Paint) | ≤ 2.5s | 2.5–4.0s | > 4.0s |
| **INP** (Interaction to Next Paint) | ≤ 200ms | 200–500ms | > 500ms |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | 0.1–0.25 | > 0.25 |
| **FCP** (First Contentful Paint) | ≤ 1.8s | 1.8–3.0s | > 3.0s |
| **TTFB** (Time to First Byte) | ≤ 800ms | 800ms–1.8s | > 1.8s |

**How to measure:**
```bash
# Lighthouse CLI (install: npm install -g lighthouse)
lighthouse https://your-url.com --output json --output-path ./reports/lighthouse.json --chrome-flags="--headless"

# For localhost:
npx lighthouse http://localhost:3000 --output json --output-path ./reports/lighthouse-local.json --chrome-flags="--headless --no-sandbox"
```

### 2. 📦 Bundle Size Analysis (JS/CSS)

**Thresholds:**
- **Critical:** Any single JS bundle > 500KB (uncompressed) or > 200KB (gzip)
- **High:** Total JS > 1MB uncompressed
- **Target:** Each route chunk ≤ 150KB gzip

**How to measure:**
```bash
# Next.js
ANALYZE=true npm run build        # requires @next/bundle-analyzer

# Vite
npx vite-bundle-visualizer

# Webpack
npx webpack-bundle-analyzer stats.json

# Generic: check output sizes
ls -la .next/static/chunks/*.js | sort -k5 -rn | head -20
```

**Common culprits to check:**
- Importing entire libraries instead of named exports (`import _ from 'lodash'` → `import debounce from 'lodash/debounce'`)
- Duplicate dependencies in the bundle (two versions of React, etc.)
- Large images or fonts embedded in JS
- Missing `dynamic()` / lazy loading for heavy routes

### 3. ⚡ API / Endpoint Latency

**Thresholds:**
- **Critical:** p95 > 2000ms for user-facing endpoints
- **High:** p95 > 500ms for non-critical endpoints
- **Target:** p50 < 100ms, p95 < 300ms

**How to measure:**
```bash
# Using curl for single endpoint timing
curl -o /dev/null -s -w "Connect: %{time_connect}s | TTFB: %{time_starttransfer}s | Total: %{time_total}s\n" http://localhost:3000/api/endpoint

# Using Apache Bench for load testing
ab -n 100 -c 10 http://localhost:3000/api/endpoint
```

### 4. 🗃️ Database Query Profiling

Common slow query patterns to flag:
- **N+1 queries:** Loop executing one query per item instead of a JOIN
- **Missing indexes:** `EXPLAIN` shows `Seq Scan` on large tables
- **Unindexed foreign keys:** Common in ORMs (Prisma, Eloquent, Django ORM)
- **SELECT *:** Fetching all columns when only 2–3 are needed

**How to detect:**
```sql
-- PostgreSQL: slow queries
SELECT query, mean_exec_time, calls FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;

-- MySQL: slow query log
SHOW VARIABLES LIKE 'slow_query_log';
```

### 5. 🧠 Memory & Runtime (Node.js / Python)

```bash
# Node.js memory profiling
node --max-old-space-size=512 --inspect your-app.js

# Python memory
pip install memory-profiler
python -m memory_profiler your_script.py
```

---

## Regression Detection Protocol

When called to verify a change doesn't regress performance:

1. **Capture BEFORE baseline** (if not already in `reports/perf-baseline.json`)
2. Apply or receive the changes
3. **Measure AFTER**
4. **Compare delta** — flag if any metric degrades > 10% from baseline
5. Output comparison table:

```
| Metric     | Before | After  | Delta   | Status |
|------------|--------|--------|---------|--------|
| LCP        | 1.8s   | 2.1s   | +16.7%  | ⚠️ WARNING |
| Bundle JS  | 210KB  | 185KB  | -11.9%  | ✅ IMPROVED |
| TTFB       | 320ms  | 315ms  | -1.6%   | ✅ OK |
```

---

## Severity Classification

| Level | Criteria |
|-------|----------|
| 🔴 **Critical** | Core Web Vital in "Poor" range OR single bundle > 500KB OR p95 > 2s |
| 🟠 **High** | Core Web Vital in "Needs Improvement" OR N+1 query detected OR p95 > 500ms |
| 🟡 **Medium** | Bundle > 150KB gzip OR missing lazy loading on heavy routes |
| 🟢 **Low** | Minor optimization opportunities (tree-shaking, preconnect hints) |

---

## Output Report (JSON)

```json
{
  "project": "<name>",
  "scan_date": "<ISO date>",
  "stack": "next.js | vite | express | django | ...",
  "baseline_captured": true,
  "summary": {
    "critical": 0,
    "high": 0,
    "medium": 0,
    "low": 0,
    "lighthouse_score": { "performance": 0, "accessibility": 0, "seo": 0 },
    "bundle_size_gzip_kb": 0,
    "lcp_seconds": 0,
    "cls": 0
  },
  "findings": [
    {
      "id": "PERF-001",
      "severity": "high",
      "category": "bundle",
      "finding": "lodash imported as default — ships entire library (71KB gzip)",
      "remediation": "Replace `import _ from 'lodash'` with `import debounce from 'lodash/debounce'`",
      "estimated_savings_kb": 68,
      "auto_fixable": false
    }
  ]
}
```

---

## Verification Gate

Before completing:
- [ ] Baseline metrics captured (before state documented)
- [ ] All applicable scanners ran (Lighthouse / bundle / API / DB as relevant)
- [ ] Delta comparison table generated if verifying a change
- [ ] Report JSON saved to `reports/perf-<date>.json`
- [ ] HTML dashboard generated with clickable `file:///` link

---

## 🔁 Integration with Other Skills

| If you find... | Suggest... |
|----------------|-----------|
| Security issue in dependency | `@supply-chain-auditor` |
| Architectural change needed (e.g., switch to SSR) | `@brainstorming` + `@spec-driven-development` |
| Fix is complex and multi-file | `@incremental-implementation` |
| Large refactor risk | `@ultra-review` before merging |

> **CodeGraph:** `skills/shared/codegraph-startup.md` | **Anti-Rationalization:** `skills/shared/anti-rationalization.md` | **Risk Assessment:** `skills/shared/risk-assessment.md` | **Verification Gate:** `skills/shared/verification-gate.md` | **CODEX Learning Loop:** `skills/shared/codex-learning-loop.md`

> Modules: `skills/shared/modules-footer.md`
