---
name: github-premium-aesthetics
description: "Implements cutting-edge GitHub/Vercel-inspired UI patterns including Bento grids, glowing borders, mesh gradients, and fluid motion."
category: design
status: stable
risk_level: safe
token_estimate: { input: 1649, output: 676 }
---

## Core

# GitHub Premium Aesthetics Agent

## When to Use

Use this skill when designing or refactoring frontends where visual quality must look premium, modern, and distinct from typical AI-generated interfaces. It specializes in integrating custom GitHub/Vercel/Linear style components, Bento grids, mesh gradients, keyboard HUDs, and advanced CSS physics.

## Workflow

### Step 1: Analyze Stack & Aesthetic Goal
First, identify the target framework (e.g. Next.js, Vite, Vanilla HTML) and select a layout archetype that guarantees a unique design footprint. Reject generic card lists and center-aligned templates.

### Step 2: Establish Layout and Mesh Backgrounds
Create ambient depth by setting a dark base with radial mesh gradients and a noise SVG filter.

```css
/* Premium Glassmorphic Mesh Background with Noise */
.ambient-bg {
  background-color: hsl(240, 10%, 3.9%);
  background-image: 
    radial-gradient(at 0% 0%, hsla(244, 47%, 53%, 0.15) 0px, transparent 50%),
    radial-gradient(at 100% 0%, hsla(180, 70%, 50%, 0.12) 0px, transparent 50%),
    radial-gradient(at 50% 100%, hsla(338, 70%, 50%, 0.08) 0px, transparent 50%);
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

### Step 3: Implement Unique Bento Grids
Layout components in a Bento Grid format with varying column/row spans. Never repeat identical aspect ratios.

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
}
.bento-card-large { grid-column: span 8; grid-row: span 2; }
.bento-card-medium { grid-column: span 4; grid-row: span 2; }
.bento-card-small { grid-column: span 4; grid-row: span 1; }
@media (max-width: 1024px) {
  .bento-grid > * { grid-column: span 12 !important; }
}
```

### Step 4: Add Interactive Border Glows (Skeuomorphic Borders)
Implement modern 1px borders with hover-driven gradient glow effects that track mouse movement or simulate spotlighting.

```css
.glow-card {
  position: relative;
  background: hsla(240, 6%, 10%, 0.6);
  border: 1px solid hsla(240, 5%, 15%, 0.8);
  border-radius: 12px;
  overflow: hidden;
  backdrop-filter: blur(12px);
  transition: border-color 0.3s ease;
}
.glow-card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: 12px;
  padding: 1px;
  background: linear-gradient(135deg, hsla(0, 0%, 100%, 0.1), transparent, hsla(0, 0%, 100%, 0.05));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
.glow-card:hover {
  border-color: hsla(244, 47%, 60%, 0.4);
}
```

### Step 5: Incorporate Keyboard-First HUD & Command Palette
Allow users to interact via command consoles (`Cmd+K` inputs) with minimalist shortcuts styling.

```html
<!-- Mini HUD shortcut badge -->
<div class="hud-badge">
  <span class="text-xs text-neutral-400">Search</span>
  <kbd class="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-neutral-800 border border-neutral-700 rounded text-neutral-300">⌘K</kbd>
</div>
```

### Step 6: Fluid Typography & Math Scaling
Always utilize CSS `clamp()` for headings to ensure text scale feels dynamic and scales perfectly.

```css
h1 {
  font-size: clamp(2.25rem, 5vw + 1rem, 4.5rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.1;
}
```

### Step 7: Apply Physics-Based Spring Motions
Ensure UI feels fast and premium with custom spring easing curves. Avoid browser default `ease` or linear values.

```css
/* Snappy entering motion */
.panel-enter {
  animation: spring-in 350ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
@keyframes spring-in {
  from { opacity: 0; transform: translateY(12px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
```

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
