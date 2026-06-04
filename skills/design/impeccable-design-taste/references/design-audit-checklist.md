# Design Audit Checklist — Full Reference

The 6-layer audit for any new design. Never skip one.

---

## Layer 1: Typography

| Check | Rule |
|-------|------|
| Font choice | **No Reflex-Reject fonts** as default: Fraunces, Inter, DM Sans, Playfair Display, Syne, Space Grotesk, Instrument Sans/Serif, Cormorant. Pick from: Geist, Satoshi, Cabinet Grotesk, Outfit, or brand-appropriate alternatives. |
| Heading hierarchy | One `<h1>` per page. Logical h1→h2→h3 nesting. Never skip levels. |
| Font count | Cap at 3 (display + body + optional mono). One well-tuned family beats three competing typefaces. |
| Pairing | Pair on contrast axis (serif + sans, geometric + humanist) or use one family in multiple weights. Never two similar-but-not-identical sans-serifs. |
| Serif discipline | Serif is **very discouraged as default**. Acceptable only when brand explicitly names one, or aesthetic is genuinely editorial/luxury/publication. Banned as defaults: Fraunces, Instrument Serif. |
| Line height | Body: `1.5–1.7`. Headings: `1.1–1.25`. Light text on dark: add 0.05–0.1. |
| Type scale | Modular scale with ≥1.25 ratio. Fluid `clamp()` for headings. Hero ceiling: clamp max ≤ 6rem. |
| Tracking | Display headings: ≥ -0.04em (floor). Headings: -0.02em. Body: 0 or 0.01em. |
| Details | Curly quotes `""` not `""`. Em dash `—` not `--`. Ellipsis `…` not `...`. |
| Text wrap | `text-wrap: balance` on h1–h3. `text-wrap: pretty` on prose to reduce orphans. |
| No all-caps body | Reserve uppercase for short labels (≤4 words), eyebrows, badges. |
| Italic descenders | `leading-[1.1]` minimum + `pb-1` margin on italic display words with descenders (y, g, j, p, q). |

> **CSS tokens baseline** → `references/motion-patterns.md`

---

## Layer 2: Color

| Check | Rule |
|-------|------|
| Strategy | Pick a **color strategy** before picking colors: Restrained (tinted neutrals + one accent), Committed (one saturated color carries 30-60%), Full palette (3-4 named roles), Drenched (surface IS the color). |
| Palette source | No named CSS colors. Use OKLCH or HSL. |
| Contrast | Body text ≥ **4.5:1**. Large text ≥ 3:1. Placeholder text also needs 4.5:1 — not muted gray. |
| Dark mode | `prefers-color-scheme: dark` handled. Use CSS custom properties. Design for both modes from the start. |
| Accent | Max 1 accent color. Saturation < 80% by default. |
| **The Lila Rule** | AI purple/blue glow aesthetic is discouraged as default. Use neutral bases (Zinc/Stone/Slate) with high-contrast singular accents (Emerald, Electric Blue, Burnt Orange). Override only if brand explicitly asks for purple. |
| Tinted neutrals | Add 0.005–0.015 chroma toward brand's hue. Don't default-tint toward warm/cool. |
| Semantic roles | Define: `--color-primary`, `--color-background`, `--color-text`, `--color-muted`, `--color-border`, `--color-destructive`. |
| Gradients | Subtle. Never more than 2 stops. Avoid full-saturation endpoints. |
| Theme selection | Dark vs light is never a default. Write one sentence of physical scene (who, where, what light, what mood). If it doesn't force the answer, add detail until it does. |
| **Premium-Consumer Palette Ban** | Banned as default for premium-consumer briefs: warm beige/cream backgrounds (`#f5f1ea`, `#f7f5f1`), brass/clay/oxblood accents (`#b08947`, `#b6553a`), espresso text (`#1a1714`). Rotate instead: Cold Luxury (silver + chrome), Forest (deep green + bone + amber), Terracotta + Slate, Cobalt + Cream, Black and Tan. |

> **Color tokens baseline** → `references/motion-patterns.md`

---

## Layer 3: Spacing & Layout

| Check | Rule |
|-------|------|
| Spacing scale | 4px base: `4/8/12/16/20/24/32/40/48/64/80/96px`. No arbitrary values. |
| Whitespace | Generous. When in doubt, add more. Cramped = amateur. |
| Layout | Flexbox for 1D, Grid for 2D. For responsive grids: `repeat(auto-fit, minmax(280px, 1fr))`. |
| Border radius | Consistent scale: `4/6/8/12/16/24px` or `full`. **Cards top out at 12-16px** — never 32px+ on cards/sections/inputs. |
| Max widths | Prose: `65ch`. Containers: `1280px` or `1440px`. |
| Z-index | Named layers: `--z-base: 0`, `--z-dropdown: 10`, `--z-modal: 20`, `--z-toast: 30`. Never 999/9999. |
| Cards | Cards are the lazy answer. Use only when elevation communicates real hierarchy. Nested cards are always wrong. **No identical card grids** (same-sized cards with icon + heading + text, repeated endlessly). |
| Anti-center bias | Centered hero/sections are avoided when `DESIGN_VARIANCE > 4`. Force split-screen, left-aligned + right asset, asymmetric whitespace. |
| Section-Layout-Repetition Ban | Once you use a layout family for a section (3-column cards, split-text-image, full-width-quote), that family appears at most ONCE on the page. A landing page with 8 sections must use ≥4 different layout families. |
| Zigzag Alternation Cap | Alternating "left-image + right-text" then reverse = banal. Max 2 consecutive image+text splits. Break pattern with full-width, bento, marquee, or vertical-stack. |
| Eyebrow Restraint | Uppercase tracked eyebrow above sections: max 1 per 3 sections. Hero counts as 1. Eyebrow on every section is the #1 AI tell. |

---

## Layer 4: Visual Polish

| Check | Rule |
|-------|------|
| Shadows | Layered shadows, tinted to background hue. No pure-black drop shadows on light backgrounds. |
| Borders | `1px solid var(--color-border)`. Never `border: 1px solid black`. |
| Images | Always set `width`/`height`. Use `object-fit: cover`. Alt text required. |
| Icons | One family per project. Priority: Phosphor, Heroicons, Radix Icons. Discouraged: Lucide (only if already in project). Standardize strokeWidth globally. |
| Glassmorphism | `backdrop-filter: blur(12px)` + 1px inner border + subtle inner shadow for edge refraction. Use sparingly. |
| Materiality | Use cards ONLY when elevation communicates hierarchy. Otherwise group with `border-t`, `divide-y`, or negative space. |
| Shape Consistency | Pick ONE corner-radius scale for the page and stick to it. Document the rule. |
| Grain/Noise | Apply exclusively to fixed, `pointer-events-none` pseudo-elements. Never on scrolling containers. |

> **Card shadow token** → `references/motion-patterns.md`

---

## Layer 5: Motion & Interaction

- All animations ≤300ms, `transform`/`opacity` only, custom `cubic-bezier`.
- Ease out with exponential curves (ease-out-quart/quint/expo). **No bounce, no elastic.**
- Every button has `:active` scale feedback (`scale(0.98)` or `translateY(1px)`).
- `prefers-reduced-motion` supported — every animation needs a crossfade or instant fallback.
- Hover states on all interactive elements.
- Staggering items within one list is fine. Uniform reflex (identical entrance applied to every section) is not.
- **No `<img>` hover transforms.** Never animate an image on hover. Animate the card's background, border, or shadow instead.
- **Never `window.addEventListener("scroll", ...)`**. Use Motion's `useScroll()`, GSAP ScrollTrigger, IntersectionObserver, or CSS scroll-driven animations.
- **Animate ONLY `transform` and `opacity`**. Never `top`, `left`, `width`, `height`.
- Non-negotiable states for every interactive component: default, hover, focus, active, disabled, loading, error, success.
- Focus rings via `:focus-visible`. Never `outline: none` without replacement. 2-3px thick, offset from element.

---

## Layer 6: Accessibility (WCAG AA Minimum)

| Check | Rule |
|-------|------|
| Contrast | ≥4.5:1 for normal text, ≥3:1 for large text/UI components |
| Keyboard | All interactive elements reachable by `Tab`. Logical order. |
| Focus | `:focus-visible` ring always present. |
| Semantics | Buttons are `<button>`, links are `<a>`. No `div` onClick as interactive. |
| ARIA | Labels on icon-only buttons. `role` on custom widgets. `aria-live` on dynamic regions. |
| Form labels | Every input has a `<label>`. Validate on blur. Errors **below** fields with `aria-describedby`. |
| Touch targets | Min 44×44px. |
| Skip link | `<a href="#main-content">Skip to main content</a>` — hidden off-screen, show on focus. |
| Modals | Use native `<dialog>` with `.showModal()`. Focus trapping, light-dismiss, Escape key. Alternatively, use `inert` attribute on background content. |
