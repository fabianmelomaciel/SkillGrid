---
name: gsd-workflow
description: Use when executing complex, multi-step coding tasks where context rot or token limits could degrade performance.
category: core
status: stable
risk_level: safe
---

## Core


# GSD Workflow (Git. Ship. Done.)

## Overview
GSD (Git. Ship. Done.) is a spec-driven development loop designed to combat **Context Rot**—the degradation of agent performance, focus, and compliance as the chat conversation history and context window accumulate too many tokens. GSD prevents this by structuring work into clear phases and delegating execution to clean, isolated subagent sessions.

```
┌───────────────┐
│  1. DISCUSS   │ ← Understand requirements and design options
└───────┬───────┘
        ▼
┌───────────────┐
│   2. PLAN     │ ← Write spec and create task.md (or STATE.md)
└───────┬───────┘
        ▼
┌───────────────┐
│  3. EXECUTE   │ ◄───┐ Spawn fresh subagents for separate tasks
└───────┬───────┘     │ Keep parent context lean by clearing history
        ▼             │
┌───────────────┐     │
│  4. VERIFY    │ ────┘ Run automated tests & review checklists
└───────┬───────┘
        ▼
┌───────────────┐
│   5. SHIP     │ ← Commit, merge, write changelog, and clean up
└───────────────┘
```

## When to Use
- Implementing multi-file features or complex logic.
- Long debugging or refactoring sessions spanning multiple hours.
- When you notice the agent starting to "forget" guidelines, repeat errors, or overlook details (signs of Context Rot).
- When context usage exceeds 50% of the model's comfortable limit.

## Core Pattern

### Phase 1: Discuss
1. Ask questions to resolve ambiguity BEFORE writing any code.
2. Research the existing stack, patterns, and files.

### Phase 2: Plan
1. Create a detailed specification/implementation plan.
2. Initialize `task.md` to track todo items.
3. Establish state persistent files (`STATE.md` or `task.md`) so that agents can resume work across session boundaries without relying on chat history.

### Phase 3: Execute (Anti-Rot Subagent Strategy)
1. Do not perform all edits in the main chat context.
2. For each task item, spawn a dedicated **subagent** with a fresh, clean context using:
   - `task` or `invoke_subagent` tool.
   - Pass ONLY the necessary files and the specific instruction for that subtask.
3. Once the subagent returns its report, log progress to `task.md` and discard the subagent session context.
4. Keep the main session lean by only holding the summary and plan.

### Phase 4: Verify
1. Run lint, type-check, and automated tests after each task.
2. Perform self-reviews or peer reviews on diffs.

### Phase 5: Ship
1. Commit changes to git with clean, structured messages.
2. Update the `CHANGELOG.md` or run release scripts.
3. Delete temporary scratch files or isolated git worktrees.

## Common Mistakes
- **Context Accumulation**: Continuing a long conversation for the execution phase. This causes the agent to lose precision. Instead, break it down and use subagents.
- **Lost State**: Spawning subagents without updating `task.md` or `STATE.md`, leading to disconnected tasks. Always sync state in files.

> **CodeGraph:** `skills/shared/codegraph-startup.md` | **Anti-Rationalization:** `skills/shared/anti-rationalization.md` | **Risk Assessment:** `skills/shared/risk-assessment.md` | **Verification Gate:** `skills/shared/verification-gate.md` | **CODEX Learning Loop:** `skills/shared/codex-learning-loop.md`


## Modules

[platform:opencode]
### Subagent Delegation
Use the native `task` tool to spawn parallel subagents for isolated file edits.

