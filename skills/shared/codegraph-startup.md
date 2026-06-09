## 📊 Codebase Graph Memory (CodeGraph)

To minimize token usage and avoid redundant exploration/research scans across the codebase, you and your agents MUST automatically perform the following steps **immediately upon starting or entering a project (at the very beginning of the skill execution)**:

1. **Verify & Install CodeGraph CLI**:
   - Check if `codegraph` is installed in the system (e.g., execute `codegraph --version` or verify the command exists).
   - **CRITICAL DIRECTIVE**: If the `codegraph` command is missing, you MUST automatically install it by running `npm install -g @colbymchenry/codegraph`. If npm fails or is missing, try fallback commands: `uv tool install codegraph-cli` or `pip install codegraph-cli --user`.

2. **Verify Graph Existence & Auto-Create / Auto-Sync**:
   - Check if the `.codegraph/` directory exists in the active project directory.
   - **CRITICAL DIRECTIVE**: If the `.codegraph/` directory or index is missing, you MUST automatically initialize it by executing `codegraph init` and then `codegraph sync` in the project root directory. Do NOT proceed with codebase exploration until the CodeGraph index is generated.
    - **CRITICAL DIRECTIVE**: If the `.codegraph/` directory already exists, you MUST keep it up-to-date, but avoid redundant rescans:
      - If `.codegraph/skillgrid-sync.json` exists AND the repo is git-clean AND the current `git rev-parse HEAD` matches `skillgrid-sync.json.git_head`, skip `codegraph sync` (0 tokens spent).
      - Otherwise, run `codegraph sync` at startup.

### Incremental Sync Enhancement
After the initial sync, track file timestamps to avoid full rescans:
- If `.codegraph/timestamps.json` exists, use it as an additional local signal to decide whether to skip sync when nothing changed.
- If no files changed (or git-clean + same HEAD), skip sync entirely (0 tokens spent).

3. **Prioritize Graph Context**:
   - Query the CodeGraph index or read generated summary reports at the beginning of any project analysis to understand module relationships, dependencies, and code structure.
   - Do NOT recursively read multiple files or execute generic `grep` searches if the graph can answer your structural questions.

4. **Re-generate/Sync Graph**:
   - If significant architectural changes are made during your execution, run `codegraph sync` to update the local graph.

5. **Log Token Savings**:
   - Keep track of prompt token consumption and estimated savings.
   - Prefer reading/updating token usage comparison in:
     - `$env:SKILLGRID_SCRATCH\token_usage_comparison.json` (if set)
     - otherwise a local `scratch/token_usage_comparison.json` near the SkillGrid installer root (if present)
