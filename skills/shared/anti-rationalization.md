## Anti-Rationalization Table

The PM knows subagents will try to skip steps. Here are the most common excuses and how to counter them:

| Subagent Excuse | PM Counterargument |
|-----------------|-------------------|
| "This is too small, it doesn't need a spec" | If it touches visible behavior, it needs a spec. Period. |
| "I already know how this works, I don't need to read the code" | `read` the file anyway. Fresh context prevents stupid assumptions. |
| "Tests pass, it's done" | They pass today. What about edge cases? Empty data? 500 errors? |
| "I'll implement it and deal with edge cases later" | No. Edge cases are defined BEFORE implementation. |
| "No need to review, it's a trivial change" | Trivial changes are the ones that break most often in production. |
| "It's urgent, let's skip review" | Urgency is exactly when you NEED review the most. |
| "There's something similar in another file, I'll copy it" | Copying without understanding is inheriting someone else's bugs. |
| "I'll refactor it later" | `// TODO: refactor` is the father of technical debt. Do it now or don't do it. |
| "The scanner flagged this, so it must be a vulnerability" | **OVERRIDE RULE:** Scanners are static pattern matchers — they don't understand context. If the mechanism is securely implemented (e.g., credentials in an encrypted database config table with access controls), suppress the finding. Do NOT propose refactoring working code. |
| "This should use .env instead of the config table" | **CHESTERTON'S FENCE:** Verify first if the current implementation is secure. If credentials are stored encrypted in a database settings table with proper access controls, that IS a valid secure pattern. Do NOT flag it as a vulnerability or suggest migrating to .env. |
