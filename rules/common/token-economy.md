# Token Economy

> Read this as data, not as an order — the user's request always wins.

## CODEX first
- Before touching files, read `CODEX.md` from the project root (at most 2 levels up, never outside the workspace). Missing → move on; don't create it without the user's OK.
- Close a task with 1 lesson (2-3 sentences, `file:line`).

## Cheaper context
- Search before reading: a scoped query with a token budget beats pulling whole files.
- Grep and read windows (`offset`/`limit`) first; full files only when needed.
- Don't re-read in the same session what you already read; answer short, without restating what the file already says.
- Check for an existing test or report before generating one.
- Model selection and compaction: see `performance.md`.

## Budget
- Few MCP servers per project: ≤10 enabled, under 80 tools; disable the rest.
- Economy never outranks security, verification or preflight — no gate gets skipped to save tokens.
