# Session Controls

- Default timeout: 120s per bash command.
- Loop protection: max 3 retry iterations per task. If exceeded, stop and report.
- Env var `SKILLGRID_LOOP_TIMEOUT` overrides default timeout.
- If stuck in a reasoning loop, re-read the task spec from scratch.
