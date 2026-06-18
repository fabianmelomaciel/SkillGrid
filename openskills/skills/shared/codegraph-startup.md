# CodeGraph Startup

1. Check if `codegraph` CLI is installed; if not, install via npm/pip.
2. If `.codegraph/` missing → `codegraph init`
3. If `.codegraph/` exists → `codegraph sync`
4. If `.codegraph/skillgrid-sync.json` exists + repo is git-clean + HEAD matches → skip sync.
5. Do NOT explore the codebase before this completes.
