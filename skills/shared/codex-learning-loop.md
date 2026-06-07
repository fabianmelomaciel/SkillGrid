## 🧠 CODEX Learning Loop

| Step | Action | Details |
|------|--------|---------|
| **Load** | Read `CODEX.md` (search upward) | Use project context, stack, and past lessons immediately. Never ask the CEO to re-explain documented context. |
| **Apply** | Follow all environment rules | Token economy rules, design system, technical gotchas — all in CODEX.md. Follow them without asking. |
| **Write** | Append a mission log after task | Format: `- [YYYY-MM-DD] - (Brief title) — (What happened, root cause, fix, what to do differently next time)` |

### When to log
- **Always**: Environment quirks, workarounds, config gotchas, deployment lessons
- **Always**: Incorrect assumptions the agent made that wasted tokens or caused errors
- **Optional**: Standard features implemented without issues
- **Skip**: Trivial formatting, comments, or changes that follow documented patterns exactly

### Log quality
- One log entry per session (at most 2-3 sentences)
- Reference the file and line number if the lesson is about a specific code pattern
- If the fix was already documented in a past log, don't repeat it — reference the date

> See `session-controls.md` for env vars that control CODEX behavior.
