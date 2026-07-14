---
name: headroom
description: Reduce el uso de tokens del LLM comprimiendo el contexto, logs, salidas de herramientas y archivos. Úsalo al tratar con contextos extensos, salidas de herramientas masivas o para optimizar el gasto de tokens del agente.
category: core
status: stable
risk_level: safe
token_estimate: { input: 869, output: 356 }
---

## Core

# Headroom Agent

## When to Use

Use this skill when you need to optimize agent token economy, manage massive tool outputs (such as large log files or directory trees), or configure the `headroom` context compression proxy or MCP server to prevent LLM context window bloating.

## Workflow

### Step 1: Verification and Setup
Confirm if the `headroom` CLI is installed on the user's system:
```bash
# Check if headroom command is available
headroom --version 2>/dev/null || pip install "headroom-ai[all]" || npm install -g headroom-ai
```

### Step 2: Configuration
Configure headroom strategies depending on the agent workflow:
1. **As an MCP Server:** Add the playroom/headroom server to the agent config (e.g., `~/.claude/claude_desktop_config.json` or `.cursor/mcp.json`):
   ```json
   "headroom": {
     "command": "npx",
     "args": ["-y", "headroom-ai", "mcp", "start"],
     "description": "Token compression and context management"
   }
   ```
2. **As a Transparent Proxy:** Wrap the target agent execution:
   ```bash
   headroom proxy --port 8787
   ```
   Set `OPENAI_API_BASE=http://localhost:8787/v1` or use the wrapper:
   ```bash
   headroom wrap claude
   ```

### Step 3: Compression Policies
Ensure that critical system instructions and security files are exempt from compression:
- Always exclude `.cursorrules`, `rules/`, and `.claude_profile` from the compression pipeline to prevent instruction drift.
- Use `SmartCrusher` for structured JSON data and `CodeCompressor` for programming source code to retain syntactic correctness.

## Tools

- `read_file` / `write_file` — inspect and write configurations
- `run_command` — verify headroom installation and configure the proxy

> **CodeGraph:** `skills/shared/codegraph-startup.md` | **Anti-Rationalization:** `skills/shared/anti-rationalization.md` | **Risk Assessment:** `skills/shared/risk-assessment.md` | **Verification Gate:** `skills/shared/verification-gate.md` | **CODEX Learning Loop:** `skills/shared/codex-learning-loop.md`

## Modules

[model:gemini-1.5-flash]
### Enhanced Anti-Loop Guardrails
Gemini models may exhibit looping behavior. If you detect repeating the same operation with identical results, stop immediately and report current state. Do not re-execute completed operations. Enforce strict output structure.

[model:gemini-1.5-pro]
### Enhanced Anti-Loop Guardrails
Same as gemini-1.5-flash. If you detect repeating the same operation with identical results, stop and report current state.

[platform:opencode]
### Platform Invocation
Invoked via tool call with skill descriptor. Return structured output matching the expected format. All file paths use forward slashes.

[platform:claude-code]
### Platform Invocation
Available as CLAUDE.md-activated skill. Follow Claude Code tool conventions. All file paths use forward slashes.
