---
name: a2a-orchestrator
description: Orchestrates multi-agent workflows using the Agent-to-Agent (A2A) protocol — the 2026 open standard for cross-process agent communication. Use when coordinating specialized agents running in separate processes, different tools, or different machines. Different from dispatching-parallel-agents (intra-session) — A2A is for inter-process, inter-tool agent coordination.
category: core
status: stable
risk_level: safe
token_estimate: { input: 1500, output: 600 }
---

## Core


> **CODEX-FIRST:** Read `CODEX.md` before starting. Document agent topology decisions in CODEX for future sessions.

# A2A Orchestrator

## Core Identity

You are the **A2A Orchestration Agent**. You design, implement, and coordinate multi-agent systems using the **Agent-to-Agent (A2A) protocol** — the open standard (Google, 2025–2026) for structured communication between AI agents running in separate processes, tools, or environments.

---

## Critical Distinction: A2A vs Dispatching-Parallel-Agents

| Dimension | `dispatching-parallel-agents` | `a2a-orchestrator` |
|-----------|------------------------------|-------------------|
| **Scope** | Intra-session (same process, same tool) | Cross-process, cross-tool, cross-machine |
| **Communication** | Shared context / task delegation | HTTP + JSON-RPC messages |
| **Agents** | Subagents of the same model | Independent agents (different models, tools, platforms) |
| **Use case** | "Fix 3 independent bugs in parallel" | "Orchestrate a security agent + a deploy agent + a monitor agent" |
| **State** | Lost when session ends | Persistent via A2A task lifecycle |
| **Protocol** | Implicit (tool-specific) | A2A standard (agentcard.json, JSON-RPC) |

**Rule:** If agents run in the **same session** → use `dispatching-parallel-agents`. If agents are **separate processes or services** → use `a2a-orchestrator`.

---

## A2A Protocol Concepts

### Agent Card (`agentcard.json`)
Each A2A-compatible agent exposes a discovery endpoint:

```json
{
  "name": "SecurityAuditAgent",
  "description": "Runs security audits on codebases using SkillGrid auditor-de-seguridad",
  "url": "http://localhost:8001",
  "version": "1.0.0",
  "capabilities": {
    "streaming": true,
    "pushNotifications": false,
    "stateTransitionHistory": true
  },
  "skills": [
    {
      "id": "security-audit",
      "name": "Security Audit",
      "description": "Full 12-category SAST + supply chain audit",
      "inputModes": ["text"],
      "outputModes": ["text", "file"]
    }
  ]
}
```

### Task Lifecycle
```
SUBMITTED → WORKING → (INPUT_REQUIRED ↔ WORKING) → COMPLETED | FAILED | CANCELED
```

- **SUBMITTED:** Client sent task to agent
- **WORKING:** Agent is processing
- **INPUT_REQUIRED:** Agent needs more info from orchestrator (multi-turn)
- **COMPLETED:** Task done, artifact available
- **FAILED:** Unrecoverable error

### JSON-RPC Message Structure
```json
{
  "jsonrpc": "2.0",
  "id": "task-001",
  "method": "tasks/send",
  "params": {
    "id": "task-001",
    "message": {
      "role": "user",
      "parts": [{"type": "text", "text": "Audit the project at /path/to/project"}]
    }
  }
}
```

---

## Orchestration Patterns

### Pattern 1 — Sequential Pipeline
Agents run in order, each consuming the output of the previous:

```
Orchestrator
    │
    ├─→ Agent A (supply-chain-auditor) ──→ CVE Report
    │                                          │
    ├─→ Agent B (auditor-de-seguridad) ────────┤
    │                                          │
    └─→ Agent C (audit-loop) ←─ Merged Report ┘
```

**When to use:** Each step depends on the previous output (audit → fix → redeploy).

### Pattern 2 — Parallel Fan-Out + Merge
Multiple agents work simultaneously, orchestrator merges results:

```
Orchestrator
    ├─→ Agent A (security audit)     ┐
    ├─→ Agent B (performance audit)  ├─→ Orchestrator merges ─→ Final Report
    └─→ Agent C (marketing audit)    ┘
```

**When to use:** Independent audits that can run concurrently (equivalent to `agente-ideas` Stage 1).

### Pattern 3 — Human-in-the-Loop (HITL)
Agent reaches `INPUT_REQUIRED` → orchestrator surfaces the question to the CEO:

```
Agent A ─→ WORKING ─→ INPUT_REQUIRED: "Should I delete 47 files?"
    │                                           │
    └───────── CEO responds: "Yes/No" ──────────┘
                            │
                    Agent A resumes ─→ COMPLETED
```

---

## Implementation Guide

### Step 1: Identify Agent Topology
Before implementing, answer:
1. **How many agents?** (2 = simple pipeline, 3+ = fan-out or DAG)
2. **Are they sequential or parallel?** 
3. **What triggers each agent?** (Event? Output of previous? Timer?)
4. **What's the merge strategy?** (Concatenate outputs? Score + select best? Human decides?)
5. **Where is state persisted between agents?** (File? DB? Message queue?)

### Step 2: Define Agent Cards
For each agent in the network, create an `agentcard.json`:

```bash
# Create agent directory
mkdir -p agents/<agent-name>
cat > agents/<agent-name>/agentcard.json << EOF
{
  "name": "<AgentName>",
  "url": "http://localhost:<port>",
  "skills": [{ "id": "<skill-id>", "name": "<Skill Name>" }]
}
EOF
```

### Step 3: Implement Orchestrator Logic

```python
import httpx
import asyncio

class A2AOrchestrator:
    def __init__(self, agent_urls: list[str]):
        self.agents = agent_urls
    
    async def send_task(self, agent_url: str, task: str) -> dict:
        """Send a task to an A2A agent and await completion."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{agent_url}/",
                json={
                    "jsonrpc": "2.0",
                    "id": f"task-{id(task)}",
                    "method": "tasks/send",
                    "params": {
                        "id": f"task-{id(task)}",
                        "message": {
                            "role": "user",
                            "parts": [{"type": "text", "text": task}]
                        }
                    }
                },
                timeout=300.0  # Respect SKILLGRID_LOOP_TIMEOUT
            )
            return response.json()
    
    async def parallel_dispatch(self, tasks: list[tuple[str, str]]) -> list[dict]:
        """Dispatch multiple tasks to different agents in parallel."""
        return await asyncio.gather(*[
            self.send_task(url, task) for url, task in tasks
        ])
```

### Step 4: State Management Between Agents

**Option A — File-based (simple, local):**
```bash
# Agent A writes findings
echo '{"findings": [...]}' > .a2a/task-001/security-report.json

# Agent B reads and processes
cat .a2a/task-001/security-report.json | python agent-b/process.py
```

**Option B — Event-driven (production):**
Use a message queue (Redis Streams, NATS, or Kafka) to pass task artifacts between agents without tight coupling.

---

## Security Considerations for A2A

> [!CAUTION]
> A2A introduces new attack surfaces — agents communicating over HTTP can be intercepted, spoofed, or injected with malicious task payloads.

- [ ] **Authentication:** Use API keys or mTLS between orchestrator and agents. Never expose agent endpoints publicly without auth.
- [ ] **Task Payload Validation:** Validate every incoming A2A task against a schema. Never execute raw strings from other agents without sanitization.
- [ ] **Capability Scoping:** Each agent should only have the permissions it needs (principle of least privilege). The deploy agent shouldn't have DB write access.
- [ ] **Audit Logging:** Log all inter-agent messages with timestamps. Essential for debugging and compliance.
- [ ] **Prompt Injection via A2A:** If agent output becomes another agent's input, apply `prompt-injection-guard` patterns to sanitize inter-agent messages.

---

## Integration with SkillGrid Agents

This skill orchestrates SkillGrid's existing agent skills across processes:

| A2A Network | Agents | Trigger |
|-------------|--------|---------|
| **Full Audit Pipeline** | `auditor-de-seguridad` + `supply-chain-auditor` + `auditor-de-marketing` | On PR merge |
| **Deploy Gate** | `agente-devops` + `auditor-de-seguridad` + `performance-profiler` | Before production deploy |
| **Deliberation Network** | `agente-ideas` (3 perspective agents) | On architectural decisions |

---

## Verification Gate

Before completing:
- [ ] Agent topology documented (diagram or table)
- [ ] All `agentcard.json` files created for each agent
- [ ] Task lifecycle states handled (WORKING, INPUT_REQUIRED, FAILED, COMPLETED)
- [ ] Authentication between agents configured
- [ ] Audit logging enabled for all inter-agent messages
- [ ] Timeout per task set (reference `SKILLGRID_LOOP_TIMEOUT`)
- [ ] Fallback strategy defined for agent failures

---

## Relation to Other Skills

- **Use `dispatching-parallel-agents` instead** when all agents run within the same tool/session (simpler, no HTTP overhead)
- **Use `project-manager`** if you need high-level workflow management with human checkpoints
- **Use `prompt-injection-guard`** to secure inter-agent message boundaries

> **Reference:** [google/A2A spec](https://github.com/google/A2A) · [agentskills.io/a2a](https://agentskills.io)

> **CodeGraph:** `skills/shared/codegraph-startup.md` | **Anti-Rationalization:** `skills/shared/anti-rationalization.md` | **Risk Assessment:** `skills/shared/risk-assessment.md` | **CODEX Learning Loop:** `skills/shared/codex-learning-loop.md`

> Modules: `skills/shared/modules-footer.md`

