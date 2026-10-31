---
name: webapp-testing
description: "Use when driving a local web app with a native Playwright script: decide static HTML vs dynamic app, start and stop the dev server, wait for networkidle, then inspect the DOM, capture screenshots and read console logs. For maintained Node/TypeScript E2E suites, use playwright-testing."
category: core
status: stable
risk_level: safe
token_estimate: { input: 1097, output: 439 }
---

## Core

> **CODEX-FIRST:** Read `CODEX.md` (search upward) before starting. Log new selector or server-lifecycle findings when done.
>
> **Protocols:** `skills/shared/verification-gate.md` (evidence before "it works"), `skills/shared/risk-assessment.md`, `skills/shared/anti-rationalization.md`.

# Web App Testing — native Playwright

Ad-hoc browser work against a local app: verify a flow, reproduce a bug, capture a screenshot, read the console. The output is a script plus evidence, not a maintained test suite. For locators, page objects and CI, `playwright-testing` is the other half.

## 1. Decision tree

```
Task -> static HTML?
  yes -> read the file, pick selectors, write the script
  no  -> is the server already running?
           no  -> start it with a lifecycle wrapper (section 3)
           yes -> reconnaissance first (section 2)
```

Never write selectors from memory on a dynamic app: render first, look, then act.

## 2. Reconnaissance before action

1. `page.goto(url)` and `page.wait_for_load_state("networkidle")`.
2. Capture evidence: `page.screenshot(path="scratch/webapp-testing/home.png", full_page=True)` and `page.content()`.
3. List candidate targets: roles, labels, buttons, inputs.
4. Only then write the actions, using the locators you actually saw.

Waiting for `networkidle` is not optional on a JS app: inspecting before hydration gives you a DOM that no longer exists.

## 3. Server lifecycle

Start the dev server and the script together, and always tear it down:

- Preferred: a wrapper that spawns the server, polls the port until it accepts a connection, runs the automation, and kills the process tree in `finally`.
- One server per process group; with API + frontend, start them in order and stop them in reverse.
- Never leave a server on a fixed port after the script: the next run fails with "port in use".
- On Windows kill the tree (`taskkill /T` or a new process group); `terminate()` alone can orphan the child.

Upstream reference: Anthropic's `webapp-testing` ships `scripts/with_server.py` for this (Apache-2.0). SkillGrid does not vendor it; see `NOTICE`.

## 4. Script skeleton

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")
    page.screenshot(path="scratch/webapp-testing/home.png", full_page=True)
    browser.close()
```

- `headless=True` by default; open a headed browser only when the user asks to watch.
- Screenshots and traces go under `scratch/`, never to a tracked path.
- Close the browser in `finally`; a crashed script must not leave Chromium behind.

## 5. Console and network evidence

- Attach `page.on("console")` before navigating: a listener registered after `goto` misses the startup logs.
- Attach `page.on("pageerror")` and `page.on("requestfailed")` for the same reason.
- Report the literal message and its source, not a summary. "The page is broken" is not evidence.
- For API calls, `page.route` can mock a response; keep the mock scoped and remove it before the final run.

## 6. Verification gate

Before claiming the flow works:
- [ ] The script runs end to end from a clean server, exit 0.
- [ ] The screenshot or DOM dump that proves the state is attached.
- [ ] Console errors were read, not ignored.
- [ ] The server and the browser are dead at the end (process check).
- [ ] No `sleep` used as a substitute for a real condition; wait for a selector, URL or network state.

Evidence or it did not happen.

---

> **CodeGraph:** `skills/shared/codegraph-startup.md` | **Anti-Rationalization:** `skills/shared/anti-rationalization.md` | **Risk Assessment:** `skills/shared/risk-assessment.md` | **Verification Gate:** `skills/shared/verification-gate.md` | **CODEX Learning Loop:** `skills/shared/codex-learning-loop.md`

> Modules: `skills/shared/modules-footer.md`
