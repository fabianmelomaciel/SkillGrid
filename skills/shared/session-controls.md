## Session Runtime Controls
Environment variables to control SkillGrid behavior at runtime:

| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `SKILLGRID_HOOK_PROFILE` | minimal / standard / strict | standard | Hook strictness level |
| `SKILLGRID_DISABLED_SKILLS` | comma-separated skill names | (empty) | Skills to skip loading |
| `SKILLGRID_MAX_TOKENS_PER_SESSION` | number | 50000 | Token budget per session |
| `SKILLGRID_DRY_RUN` | true / false | false | Preview changes without applying |
| `SKILLGRID_SCRATCH` | directory path | (empty) | Path for scratch/temp files (e.g., token usage comparison reports). Used by `codegraph-startup.md`. |
| `SKILLGRID_LOOP_TIMEOUT` | seconds | 300 | Maximum seconds per iteration in `ralph-loop` and `audit-loop`. Prevents runaway autonomous loops. Set to 0 to disable. |
| `SKILLGRID_LOOP_MAX_ITER` | number | 3 | Maximum iterations for `audit-loop`. Override the default of 3 for deeper audits. |

Usage: Log these from CODEX.md or set as environment variables before starting the agent.
