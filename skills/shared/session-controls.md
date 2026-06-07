## Session Runtime Controls
Environment variables to control SkillGrid behavior at runtime:

| Variable | Values | Default | Description |
|----------|--------|---------|-------------|
| `SKILLGRID_HOOK_PROFILE` | minimal / standard / strict | standard | Hook strictness level |
| `SKILLGRID_DISABLED_SKILLS` | comma-separated skill names | (empty) | Skills to skip loading |
| `SKILLGRID_MAX_TOKENS_PER_SESSION` | number | 50000 | Token budget per session |
| `SKILLGRID_DRY_RUN` | true / false | false | Preview changes without applying |

Usage: Log these from CODEX.md or set as environment variables before starting the agent.
