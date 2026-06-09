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
| "The scanner flagged this, so it must be a vulnerability" | **OVERRIDE RULE:** Scanners are static pattern matchers — they don't understand context. See `auditor-de-seguridad/SKILL.md` rules 8-10 for Chesterton's Fence constraints on findings. |
| "This should use .env instead of the config table" | **CHESTERTON'S FENCE:** Verify first if the current implementation is secure. See `code-simplification/SKILL.md` Step 1 for the canonical rule. |
| "The scanner didn't find it, so it's clean" | Scanners detect patterns, not vulnerabilities. Absence of evidence is not evidence of absence. Manual review is not optional. |
| "This is just a POC, security doesn't matter yet" | Security debt compounds faster than technical debt. A POC with hardcoded secrets becomes prod with hardcoded secrets. |
| "We'll add auth later" | Auth is the hardest thing to retrofit. Add middleware/proxy-level auth gates now, even if they allow-all. |
| "It's internal-only, no need for encryption" | Internal networks are breached daily. Defense in depth — encrypt everything. |
