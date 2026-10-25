---
name: emil-kowalski-design
description: Use when building, reviewing, or auditing any UI component to apply Emil Kowalski's design engineering principles. Enforces animation quality, micro-interaction polish, perceived performance, modern CSS motion (View Transitions, scroll-driven, popover overlays) and accessibility standards. Trigger on requests like "make this feel polished", "review my animations", "improve UX", or any frontend UI work.
category: design
status: stable
risk_level: safe
token_estimate: { input: 2286, output: 710 }
---

## Core

# Emil Kowalski Design Engineering

You are applying the design philosophy of Emil Kowalski — the idea that **taste is a trained instinct**, not a gift. In a world where functionality is commoditized, **invisible details** are the primary differentiator.

> **Core doctrine:** The best animation is the one that goes unnoticed. The best interaction is the one that feels inevitable.

---

## 🧠 Before You Start

1. Read `CODEX.md` (search upward) to load any project-specific UI patterns or past lessons.
2. Inspect existing animation/transition code in the project before proposing new approaches.
3. Ask yourself: **"Does this change serve a function, or is it decoration?"** Decoration without purpose ships last or not at all.

---

## 🎯 Dirección (before any CSS)

A surface with no named direction converges to the average of the training data. Five values, written down before the first component:

| axis | pick one |
|---|---|
| **typology** | 12-col bento · asymmetric 2-col · single-column editorial · masonry · full-bleed with overlay |
| **density** | `gap:padding` ratio — 24:64 tight, 48:32 airy |
| **hierarchy** | one dominant at 6.4rem, or three at 2.4rem — say which |
| **grid** | respected, or broken at exactly one point |
| **voice** | editorial serif · technical mono · neutral grotesque |

Two checks on those numbers, not on the adjectives:

- **Repetition veto:** at least 3 of the 5 differ from the last design recorded in `skills/shared/galeria-disenos.md`. Bento, halo and ⌘K are the defaults — they count as "same".
- **One broken gesture:** at most two effects from the motion stack. Glow + halo + spring + palette at once is what makes it read as generated.

If the five values can't be written, the direction isn't decided. Get a ficha or capture one. CSS first and direction named afterwards is how the average gets in.

---

## Animation Rules (Non-Negotiable)

| Rule | Requirement |
|------|-------------|
| **Duration** | UI transitions: **100–300ms max**. Anything slower feels sluggish. |
| **Easing** | Always use custom `cubic-bezier`. Never use `ease`, `ease-in`, `ease-out` defaults. |
| **GPU acceleration** | Only animate `transform` and `opacity`. Never animate `width`, `height`, `top`, `left`. |
| **Origin-aware** | Popovers, dropdowns, tooltips must animate from their trigger point (`transform-origin`). |
| **Purposeful** | Every animation must answer: "what spatial relationship does this communicate?" |
| **Reduced motion** | `@media (prefers-reduced-motion: reduce)` MUST disable or minimize all animations. |
| **View transitions** | Morphs between UI states via `document.startViewTransition` (Baseline 2025-10-14). Feature-detect; under reduced-motion do the DOM swap instantly without the transition. One `view-transition-name` per element, never reuse. Default root fades 150–250ms. |
| **Scroll-driven** | `animation-timeline: scroll()/view()` only behind `@supports (animation-timeline: …)` with a usable no-JS/no-support fallback, and disabled under reduced-motion. |
| **Overlays** | Tooltips/menús: Popover API + `@starting-style` + `transition-behavior: allow-discrete`. No JS animation code for show/hide. |

### Standard Easing Values

```css
/* Snappy entry — for menus, dropdowns, toasts */
cubic-bezier(0.16, 1, 0.3, 1)

/* Natural exit — for closing, dismissing */
cubic-bezier(0.4, 0, 0.2, 1)

/* Bouncy — use sparingly, only for delight moments */
cubic-bezier(0.34, 1.56, 0.64, 1)
```

### Animation Template

```css
/* ✅ Correct — GPU-friendly, purposeful, origin-aware */
.popover {
  transform-origin: var(--radix-popover-content-transform-origin);
  animation: popover-in 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes popover-in {
  from { opacity: 0; transform: scale(0.95); }
  to   { opacity: 1; transform: scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .popover { animation: none; }
}

/* ❌ Wrong — animating layout properties, bad easing */
.popover {
  transition: height 400ms ease, width 400ms ease;
}
```

---

## Modern CSS Motion (2026)

- **View Transitions API** — `document.startViewTransition(updateCallback)` for list→detail, filter reorders, theme switches. Guard: `if (!document.startViewTransition || matchMedia('(prefers-reduced-motion: reduce)').matches) updateDOM();`. Cross-document (`@view-transition { navigation: auto }`) es progressive enhancement: Firefox todavía no.
- **Scroll-driven animations** — progress bars y reveals ligados al scroll. Siempre con `@supports (animation-timeline: scroll())`; fuera del guard, el elemento se ve estático y funcional.
- **Overlay trio** — `popover` + `@starting-style` + `transition-behavior: allow-discrete` reemplaza al enter/exit con JS: el browser anima el open y respeta el close discreto.
- **Stack decision** — CSS puro para micro; View Transitions para morphs; Motion (MIT) si hay gestures/layout en JS; GSAP solo para timelines complejos (licencia no-OSI); WebGL solo si el proyecto pide 3D.

---

## Micro-Interaction Rules

| Interaction | Implementation |
|-------------|----------------|
| **Button press** | `transform: scale(0.97)` on `:active` — instant (0ms), release 100ms |
| **Hover lift** | `transform: translateY(-1px)` + subtle `box-shadow` increase |
| **Loading states** | Show spinner after 300ms delay (avoid flash for fast responses) |
| **Optimistic UI** | Update UI immediately, revert on error — never make users wait |
| **Focus ring** | Always visible, never removed. Use `:focus-visible` not `:focus`. |

### Press Feedback Template

```css
/* Immediate press, smooth release */
.button {
  transition: transform 100ms cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 100ms cubic-bezier(0.4, 0, 0.2, 1);
}
.button:active {
  transform: scale(0.97);
}

/* For touch devices */
@media (hover: none) {
  .button:active {
    transform: scale(0.95);
  }
}
```

---

## Perceived Performance Rules

- **Skeleton screens** over spinners for content that takes >500ms
- **Optimistic updates** for mutations (like, bookmark, delete) — revert on failure
- **Prefetch on hover** (`router.prefetch()` on link hover for page transitions)
- **Instant feedback** — every click must produce a visual response within one frame (16ms)
- **Stagger children** — when revealing lists, stagger by 30–50ms per item, not all at once

```css
/* Staggered list reveal */
.item:nth-child(1) { animation-delay: 0ms; }
.item:nth-child(2) { animation-delay: 40ms; }
.item:nth-child(3) { animation-delay: 80ms; }
/* Cap at ~5 items — beyond that, stagger loses meaning */
```

---

## Design Audit Checklist

Run this on any UI component before marking work done:

- [ ] All animations use `transform`/`opacity` only (no layout properties)
- [ ] All durations are ≤300ms
- [ ] Custom `cubic-bezier` used (no CSS defaults)
- [ ] Origin-aware: dropdowns/popovers animate from trigger point
- [ ] `@media (prefers-reduced-motion: reduce)` disables animations
- [ ] View Transitions: feature-detected, reduced-motion swaps instant, `view-transition-name` único
- [ ] Scroll-driven animations detrás de `@supports (animation-timeline: …)` con fallback estático
- [ ] Overlays (tooltips/menús) vía Popover API + `@starting-style`, sin JS de animación
- [ ] Buttons have `:active` scale feedback
- [ ] Focus states visible with `:focus-visible`
- [ ] No animation exists purely for decoration without spatial meaning
- [ ] Loading states appear only after 300ms delay
- [ ] Touch devices have appropriate `touch-action` set

---

## Design Gate — evidence, not checkboxes

A tick means nothing: the model ticks its own boxes, and a page of ticks has shipped generic more than once. Before declaring UI done, produce:

1. **The ficha, cited.** Which pattern in `skills/shared/galeria-disenos.md` (or which capture), and the `file:line` where each applied token lives.
2. **The discard.** The obvious option, named, plus the literal prohibited pattern it matches from `rules/web/design-quality.md` ("Banned Patterns"). "None" is a fail.
3. **The five values** of "Dirección", with at least 3 differing from the last recorded design.
4. **The built surface, captured** — not the mock. Contrast AA, 4px spacing, `:focus-visible`, 44px targets and one layout family per page still hold: they are the floor, not the proof.

Tiered, so the gate doesn't become paperwork: a single component asks for 1 and 3. A new page or section asks for all four. If a gate gets skipped because it was too heavy, it is not a gate.

---

## Taste Development Protocol

When reviewing your own work, ask:

1. **Does this feel fast?** Interactions should feel instantaneous. If it feels slow, it is slow.
2. **Is the animation communicating something?** Fade = appears. Scale from origin = grows from source. Slide = spatial context.
3. **What happens on mobile/touch?** Hover effects must degrade gracefully.
4. **Side by side with the ficha, is this distinguishable?** If it reads like the same template with another accent, it failed. The benchmark is the reference — not the premium sites everyone already looks like.

---

## CODEX Learning Gate

After completing UI work, if you discovered:
- A project-specific animation pattern or design token
- A browser/OS quirk affecting animations
- A performance constraint unique to this stack

→ Append a log entry to `CODEX.md` under `## 💻 Mission Logs & Tactical Learnings`.

> **Galería de diseños:** `skills/shared/galeria-disenos.md` — las tres fichas (son forma, no identidad) y el procedimiento para tomar una nueva: captura a PNG, tokens fuera, ficha escrita. No es una nota al pie: el Design Gate la pide citada.

> **CodeGraph:** `skills/shared/codegraph-startup.md` | **Anti-Rationalization:** `skills/shared/anti-rationalization.md` | **Risk Assessment:** `skills/shared/risk-assessment.md` | **Verification Gate:** `skills/shared/verification-gate.md` | **CODEX Learning Loop:** `skills/shared/codex-learning-loop.md`

> Modules: `skills/shared/modules-footer.md`