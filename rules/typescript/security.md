---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---
# TypeScript/JavaScript Security

> This file extends [common/security.md](../common/security.md) with TypeScript/JavaScript specific content.

## Runtime Version

- An unpatched runtime voids every other control here: Node only gets security fixes on supported lines.
<!-- floors:start node -->
- Supported lines: 22 (EOL 2027-04-30), 24 (EOL 2028-04-30).
- Source: https://endoflife.date/api/node.json, checked 2026-10-22.
<!-- floors:end -->
- Node 20 went EOL on 2026-04-30 and Node 18 on 2025-04-30: a build on those gets no fixes and is a finding on its own.
- Check the runtime the service actually runs on, not the one in the lockfile or in the local shell.

## Secret Management

```typescript
// NEVER: Hardcoded secrets
const apiKey = "sk-proj-xxxxx"

// ALWAYS: Environment variables
const apiKey = process.env.OPENAI_API_KEY

if (!apiKey) {
  throw new Error('OPENAI_API_KEY not configured')
}
```

## Agent Support

- Use **security-reviewer** skill for comprehensive security audits
