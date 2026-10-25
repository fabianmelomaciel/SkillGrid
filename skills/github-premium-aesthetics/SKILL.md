---
name: github-premium-aesthetics
description: "Craft mechanics for premium surfaces — border glow, spring physics, the View Transitions ladder — applied to a visual direction that already exists. Picks no palette, no background and no layout: those come from the ficha in galeria-disenos.md. Use once the direction is decided, not to decide it."
category: design
status: stable
risk_level: safe
token_estimate: { input: 1910, output: 470 }
---

## Core

# GitHub Premium Aesthetics Agent

## When to Use

Use it once the visual direction is already chosen and the surface needs the craft layer: the border treatment, the spring, the transition between states, the scroll-linked detail. If nobody named a direction yet, this is the wrong file — the direction comes first, in `skills/emil-kowalski-design/SKILL.md` ("Dirección").

> **La ficha manda.** Paleta, tipografía, radios y fondo salen de la ficha elegida en `skills/shared/galeria-disenos.md`. Sin ficha citada no se escribe CSS de identidad: se elige una de las tres o se pide una captura. Este archivo aporta la física, no el look.

## Workflow

### Step 1: Analyze Stack
Identify the target framework (Next.js, Vite, vanilla HTML). The archetype is not chosen here — the ficha already settled it; this step only decides how it gets built.

### Step 2: Ambient Depth, Colours From the Ficha
When the ficha asks for an ambient field, one radial at the accent plus a noise layer is enough. The base can be light — the violet/cyan/pink triad is the tell of generated UI, and it does not live in this file.

```css
/* Ambient field — --bg and --accent come from the ficha */
.ambient-bg {
  background-color: var(--bg);
  background-image: radial-gradient(at 0% 0%, color-mix(in oklab, var(--accent) 15%, transparent) 0px, transparent 50%);
  position: relative;
}
.ambient-bg::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.04;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}
```

### Step 3: Bento Only If the Direction Says Bento
It is one archetype out of five, not the house style. When the ficha says bento, no two cards share a proportion. When it says editorial, asymmetric or single-column, this step does not apply and the grid is whatever the ficha measured.

### Step 4: Add Interactive Border Glows (Skeuomorphic Borders)
Implement modern 1px borders with hover-driven gradient glow effects that track mouse movement or simulate spotlighting.

```css
.glow-card {
  position: relative;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  backdrop-filter: blur(12px);
  transition: border-color 200ms cubic-bezier(0.16, 1, 0.3, 1);
}
.glow-card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: var(--radius);
  padding: 1px;
  background: linear-gradient(135deg, hsla(0, 0%, 100%, 0.1), transparent, hsla(0, 0%, 100%, 0.05));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
.glow-card:hover {
  border-color: color-mix(in oklab, var(--accent) 40%, transparent);
}
```

### Step 5: A Command Palette Is a Product Decision
A `⌘K` HUD ships when the product is keyboard-first, not to look premium. As decoration it is the most recognisable generated-UI tic.

### Step 6: Fluid Typography, When the Scale Is Fluid
`clamp()` when the ficha's scale is fluid. Tracking is a decision (editorial `-0.01em`, display `-0.04em`), not a constant — copying `-0.04em` everywhere is how two different brands end up with the same headline.

```css
h1 {
  font-size: clamp(2.25rem, 5vw + 1rem, 4.5rem);
  font-weight: var(--weight-display);
  letter-spacing: var(--tracking-display);
  line-height: var(--leading-display);
}
```

Both `--weight-display` and `--tracking-display` come from the ficha. Hardcoding `800 / -0.04em` is how every landing ends up with the same headline.

### Step 7: Spring Physics, Inside the Duration Rule
Custom spring curves, never the browser defaults — and inside the 100–300ms window: a 350ms spring reads as sluggish.

```css
/* Snappy entering motion */
.panel-enter {
  animation: spring-in 240ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes spring-in {
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
```

### Step 8: Motion Stack 2026 — browser first, libraries last

Pick the first rung that fits; never jump to a library when CSS or a platform API does the job.

| Rung | Tool | Use when |
|------|------|----------|
| 1 | Pure CSS transitions/keyframes | Micro-interactions, hovers, enters ≤300ms on transform/opacity |
| 2 | **View Transitions API** (same-document; Baseline 2025-10-14: Chrome 111, Firefox 144, Safari 18) | Morphing between UI states: list→detail, filter reorders, theme switches |
| 3 | **Scroll-driven animations** (`animation-timeline`) | Progress bars, section reveals tied to scroll. Chrome 115+/Safari 26+, Firefox aún no — always behind `@supports` |
| 4 | **Motion** (ex-Framer Motion, MIT, `animate` mini ≈3.2KB) | Gesture choreography, layout animations, React/Vue apps that already ship JS |
| 5 | **GSAP** | Intricate timelines, SVG morphing, path animation. Gratis desde Webflow pero licencia estándar (no-OSI): bien en sites de cliente, mal en herramientas que compitan con Webflow |
| 6 | WebGL / Three.js | Solo cuando el proyecto pide 3D explícitamente |

**Recipe guards** — feature-detect, `prefers-reduced-motion`, unique `view-transition-name`, `@supports (animation-timeline: …)`, Popover + `@starting-style` — are written once in `skills/emil-kowalski-design/SKILL.md` (Animation Rules). Read them there instead of keeping a second copy that drifts.

## Tools

- `task` — delegate to sub-agents
- `read`/`glob`/`grep` — explore code
- `edit`/`write` — implement changes
- `bash` — build, test, git

> **CodeGraph:** `skills/shared/codegraph-startup.md` | **Anti-Rationalization:** `skills/shared/anti-rationalization.md` | **Risk Assessment:** `skills/shared/risk-assessment.md` | **Verification Gate:** `skills/shared/verification-gate.md` | **CODEX Learning Loop:** `skills/shared/codex-learning-loop.md`

## Modules

[model:gemini-1.5-flash]
### Enhanced Anti-Loop Guardrails
Gemini models may exhibit looping behavior. If you detect repeating the same operation with identical results, stop immediately and report current state. Do not re-execute completed operations. Enforce strict output structure.

[model:gemini-1.5-pro]
### Enhanced Anti-Loop Guardrails
Same as gemini-1.5-flash. If you detect repeating the same operation with identical results, stop and report current state.

[model:deepseek-v4-flash]
### Tool Result Handling
Tool results may be truncated. Request specific file sections if output is incomplete. Prefer structured JSON over markdown prose when reporting results.

[platform:opencode]
### Platform Invocation
Invoked via tool call with skill descriptor. Return structured output matching the expected format. All file paths use forward slashes.

[platform:claude-code]
### Platform Invocation
Available as CLAUDE.md-activated skill. Follow Claude Code tool conventions. All file paths use forward slashes.
