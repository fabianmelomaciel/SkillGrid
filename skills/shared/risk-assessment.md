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

### CVSS 4.0 Scoring Rubric
| Score Range | Severity | Color |
|-------------|----------|-------|
| 9.0-10.0 | Critical | 🔴 |
| 7.0-8.9 | High | 🟠 |
| 4.0-6.9 | Medium | 🟡 |
| 0.1-3.9 | Low | 🟢 |

### Risk Decision Matrix
| Likelihood \ Impact | Insignificant | Minor | Moderate | Major | Critical |
|---------------------|:-----------:|:-----:|:--------:|:-----:|:--------:|
| Almost Certain | Medium | High | High | Critical | Critical |
| Likely | Medium | Medium | High | High | Critical |
| Possible | Low | Medium | Medium | High | High |
| Unlikely | Low | Low | Medium | Medium | High |
| Rare | Low | Low | Low | Medium | Medium |

### Risk Treatment Decision Tree
1. CAN we avoid the risk? → Yes → Avoid (change approach)
2. CAN we transfer the risk? → Yes → Transfer (insurance, vendor)
3. CAN we mitigate the risk? → Yes → Mitigate (controls, monitoring)
4. Otherwise → Accept (with documented sign-off)