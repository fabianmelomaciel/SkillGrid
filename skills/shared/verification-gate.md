## Verification Gate

This is NOT optional. Each item MUST be checked before reporting "complete":

- [ ] Compiles / builds without errors
- [ ] Follows project conventions
- [ ] No dead code, commented code, or console.logs
- [ ] Handles edge cases (loading, error, empty, 404, 500)
- [ ] **No Vibe Coding / AI Remnants**: no `// TODO: implement`, placeholders, or empty `catch`/`except` blocks
- [ ] The CEO would understand the result without asking
- [ ] **Concrete evidence**: build output, passing tests, screenshot if UI
- [ ] "Looks like it works" is NOT valid evidence

### Verify Before Refactor Gate (MANDATORY)

Before proposing ANY refactoring or architectural change, the following MUST be verified:

- [ ] **The current implementation is actually broken or insecure** — not just "not ideal" or "not following XYZ guide"
- [ ] **The existing mechanism does NOT already handle the concern** (e.g., database settings table that stores encrypted credentials should NOT be flagged as a vulnerability)
- [ ] **The proposed change has a measurable benefit** (security, performance, maintainability) that outweighs the regression risk of changing working code
- [ ] **The scanner finding was manually verified** — static scanners are pattern matchers, they do not understand context

**If even ONE item is missing from EITHER gate, the task is NOT complete.** Return it to the subagent.