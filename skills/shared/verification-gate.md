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

### Definition of Done — single source of truth

`verification-before-completion`, `test-driven-development` and `audit-loop` defer here: "done" is this checklist and nothing else.

- [ ] **Fresh evidence.** `npm run gate` (fast, ~7s) or `npm test` (full) executed AFTER the last edit, exit code 0, output captured. A green run from before the final change is stale evidence.
- [ ] **No new skips.** The diff adds no `.skip`, `.only` or `todo(` in tests. The pre-commit hook blocks it; if the hook is missing, that is reported, not assumed.
- [ ] **No deleted tests.** Tests removed must be at least replaced (removed ≤ added), same as donegate's `no_deleted_tests`.
- [ ] **Diff→test mapping.** Every source file touched by the diff is imported or asserted by at least one test. Changed file with no test exercising it → NOT DONE.
- [ ] **Red→green inverse.** For validation/auth/secrets changes: revert the fix locally, confirm the test FAILS, restore it and confirm PASS. Both outputs are the evidence.
- [ ] **Preflight GO.** Anything outside this repo needs the `env-preflight.md` line first.
- [ ] **Hooks active in the target.** `git config core.hooksPath` set — otherwise local gates do not exist there.

Skipped or failing suites, `|| true` on any gate command, or a completion claim without fresh output = NOT DONE. CI (`.github/workflows/pentest.yml`) is the server-side backstop: no local bypass makes production green.