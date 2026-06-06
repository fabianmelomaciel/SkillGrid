## Risk Assessment

| Level | When it applies | Required action |
|-------|-----------------|-----------------|
| **Critical** | The plan involves changes to auth, payments, user data, or production DB | CEO must explicitly approve. No "just go ahead". |
| **High** | Changes touching public APIs, schema migrations, or critical dependencies | Code review mandatory + automated tests |
| **Medium** | New features that don't touch critical infrastructure | Standard PM review |
| **Low** | Cosmetic refactors, style changes, typos | Direct implementation allowed |

### Risk of Unnecessary Refactoring (CRITICAL)

Proposing to refactor working, securely-implemented components (e.g., moving credentials from an encrypted database settings table to .env) carries its own risk:

| Risk | Impact |
|------|--------|
| **Regression** | Changing working code can introduce new bugs |
| **Token waste** | The audit+plan+implement cycle costs tokens for no security gain |
| **Context pollution** | Unnecessary findings dilute attention from real vulnerabilities |
| **False confidence** | Moving secrets to .env does NOT magically make them more secure |

**Rule:** Before any refactoring recommendation, verify that a real, active vulnerability exists. If the current implementation is secure, the finding must be suppressed.