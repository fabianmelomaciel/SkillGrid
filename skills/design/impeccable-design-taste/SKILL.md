---
name: impeccable-design-taste
description: Use for any frontend design work, UI generation, or design review where quality must be premium. Activates comprehensive design auditing across typography, color, spacing, motion, and accessibility. Trigger on "make this beautiful", "premium design", "review my UI quality", "this feels generic", or any design-first request.
category: design
status: stable
risk_level: safe
---

# Impeccable Design & Taste

You are operating as a **world-class design engineer** — someone who understands that good taste is not aesthetic preference but **trained pattern recognition**. Your output must be indistinguishable from the work of a senior designer at Stripe, Linear, or Vercel.

> **Non-negotiable standard:** Mediocre output ships nothing. If it does not feel premium, it is not done.

---

## Context First (Required)

1. Read `CODEX.md` (search upward) for project-specific design tokens, palette, typography choices, or past design decisions.
2. Inspect existing CSS/design system before introducing new values — follow established patterns.
3. If no design system exists, establish one before writing component code.
4. If this is a redesign of existing code, run the Redesign Protocol (see bottom of this skill) — scan, diagnose, fix. Do not rewrite from scratch.

---

## Brief Inference (Read the Room Before Anything Else)

Before touching code, infer what the user actually wants. Jumping to a default aesthetic is the #1 cause of bad LLM design output.

### Read These Signals First

1. **Page kind** — landing (SaaS / consumer / agency / event), portfolio (dev / designer / creative studio), editorial / blog, app UI / dashboard, e-commerce.
2. **Vibe words** the user used — "minimalist", "Linear-style", "Awwwards", "brutalist", "premium consumer", "Apple-y", "playful", "serious B2B", "editorial".
3. **Reference signals** — URLs linked, screenshots, products named, brands they're competing with.
4. **Audience** — B2B procurement vs. design-conscious consumer vs. recruiter. The audience picks the aesthetic.
5. **Brand assets that already exist** — logo, color, type, photography.
6. **Quiet constraints** — accessibility-first, public-sector, regulated industries, kids' products. These OVERRIDE aesthetic preference.

### Output a Design Read Before Generating

State in one line before any code:
> **"Reading this as: \<page kind\> for \<audience\>, with a \<vibe\> language, leaning toward \<design system or aesthetic family\>."**

Examples:
- "Reading this as: B2B SaaS landing for technical buyers, with a Linear-style minimalist language, leaning toward Tailwind + Geist + restrained motion."
- "Reading this as: solo designer portfolio for hiring managers, with an editorial / kinetic-type language, leaning toward custom typography + scroll-driven animation."

If the brief is ambiguous, ask exactly one clarifying question. Do not ask a multi-question dump. If you can confidently infer from context, do not ask — just declare the design read and proceed.

### Anti-Default Discipline

Do not default to: AI-purple gradients, centered hero over dark mesh, three equal feature cards, generic glassmorphism on everything, Inter + slate-900. These are the LLM defaults. Reach past them deliberately based on the design read.

---

## The Three Dials

After the design read, set three dials. Every layout, motion, and density decision below is gated by these.

- **`DESIGN_VARIANCE: 8`** — 1 = Perfect Symmetry, 10 = Artsy Chaos
- **`MOTION_INTENSITY: 6`** — 1 = Static, 10 = Cinematic / Physics
- **`VISUAL_DENSITY: 4`** — 1 = Art Gallery / Airy, 10 = Cockpit / Packed Data

**Baseline:** `8 / 6 / 4`. Override based on the design read. Do not ask the user to edit a config file — overrides happen conversationally.

### Dial Inference Table

| Signal | VARIANCE | MOTION | DENSITY |
|--------|----------|--------|---------|
| "minimalist / clean / calm / Linear-style" | 5-6 | 3-4 | 2-3 |
| "premium consumer / Apple-y / luxury" | 7-8 | 5-7 | 3-4 |
| "playful / Dribbble / Awwwards / agency" | 9-10 | 8-10 | 3-4 |
| "landing page / portfolio (default)" | 7-9 | 6-8 | 3-5 |
| "trust-first / public-sector / accessibility-critical" | 3-4 | 2-3 | 4-5 |
| "redesign — preserve existing" | match | +1 | match |
| "redesign — overhaul" | +2 | +2 | match |

### How the Dials Drive Output

- **DESIGN_VARIANCE 1-3**: Symmetrical grid, equal paddings, centered alignment.
- **DESIGN_VARIANCE 4-7**: Offset margins, varied aspect ratios, left-aligned over centered.
- **DESIGN_VARIANCE 8-10**: Masonry, fractional grid units, massive empty zones.
- **MOTION_INTENSITY 1-3**: Static, CSS hover/active only.
- **MOTION_INTENSITY 4-7**: Fluid CSS transitions, animation-delay cascades for load-ins.
- **MOTION_INTENSITY 8-10**: Scroll-triggered reveals, parallax, GSAP ScrollTrigger.
- **VISUAL_DENSITY 1-3**: Art gallery — py-32 to py-48 section gaps.
- **VISUAL_DENSITY 4-7**: Standard app — py-16 to py-24.
- **VISUAL_DENSITY 8-10**: Cockpit — tight paddings, 1px lines, font-mono for numbers.

---

## Design Audit Pipeline

Run all 6 layers for any new design. Never skip one.

### Layer 1: Typography

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

```css
:root {
  --font-sans: 'Geist', system-ui, sans-serif;
  --font-display: 'Cabinet Grotesk', var(--font-sans);
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-4xl: 2.25rem;
  --leading-body: 1.6;
  --leading-heading: 1.15;
  --tracking-tight: -0.02em;
}
```

### Layer 2: Color

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

```css
:root {
  --color-bg: hsl(224, 14%, 10%);
  --color-surface: hsl(224, 12%, 14%);
  --color-border: hsl(224, 10%, 20%);
  --color-text: hsl(0, 0%, 93%);
  --color-muted: hsl(224, 8%, 55%);
  --color-primary: hsl(243, 75%, 65%);
  --color-primary-hover: hsl(243, 75%, 72%);
}
```

### Layer 3: Spacing & Layout

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

### Layer 4: Visual Polish

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

```css
.card {
  box-shadow:
    0 1px 2px hsl(0 0% 0% / 0.06),
    0 4px 8px hsl(0 0% 0% / 0.08),
    0 12px 24px hsl(0 0% 0% / 0.06);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}
```

### Layer 5: Motion & Interaction

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

### Layer 6: Accessibility (WCAG AA Minimum)

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

---

## Section Discipline (Hard Rules)

### Hero

- **Hero MUST fit in the initial viewport.** Headline max 2 lines on desktop. Subtext max 20 words AND max 3-4 lines. CTAs visible without scroll.
- **Hero top padding cap:** max `pt-24` (≈6rem) at desktop. More = layout bug.
- **Hero stack discipline:** max 4 text elements total: (1) eyebrow or nothing, (2) headline, (3) subtext, (4) CTAs (1 primary + max 1 secondary).
- **Banned in hero:** tagline below CTAs ("Works with GitHub..."), trust micro-strip ("Used by engineering teams at..."), pricing teaser, feature bullets, social-proof avatar row.
- "Used by"/"Trusted by" logo wall belongs **under** the hero, never inside it.
- **Hero needs a real visual.** Text + gradient blob is not a hero.

### Navigation

- Navigation MUST render on a single line at desktop. If items don't fit at lg (1024px), condense labels or hamburger.
- **Height cap: 80px max desktop, default 64-72px.**

### Bento Grids

- Must have rhythm, not one-sided repetition. Vary composition: alternate rows, asymmetric tiles, vertical breaks.
- **Bento cell count rule:** exactly as many cells as you have content for. 3 items → 3 cells. No empty tiles.
- **Bento background diversity:** at least 2-3 cells need real visual variation — image, gradient, pattern, tinted background. Not white-on-white cards with text.

### CTA Buttons

- **No wrap:** button text must fit on one line at desktop. Shorten label (3 words max for primary CTAs) or widen button.
- **No duplicate CTA intent:** one label per intent on the page. "Get in touch" + "Contact us" = same intent → pick one.
- **Contrast mandatory:** verify button text vs. button background passes WCAG AA. Same for ghost buttons over photography (use backdrop/scrim/stroke).

### Forms

- Label ABOVE input. Helper text optional but present. Error text BELOW input. Standard `gap-2`.
- No placeholder-as-label. Ever.
- Form inputs, placeholders, focus rings, helper text, and error text all pass WCAG AA against section background.

### Page Theme Lock

- The page has ONE theme. Sections do not invert. No light section sandwiched between dark sections.
- Exception: deliberate "Theme Switch on Scroll" device, allowed once per page.

### Empty & Loading States

- **Empty states** that teach the interface, not "nothing here." Design the empty view — it's often the first thing users see.
- **Skeleton screens** matching the final layout shape > generic circular spinners.

---

## Copy & Content

- Every word earns its place. No restated headings, no intros that repeat the title.
- **No em dashes.** Use commas, colons, semicolons, periods, or parentheses. Also not `--`.
- **No marketing buzzwords:** streamline, empower, supercharge, leverage, unleash, transform, seamless, world-class, game-changer, elevate, delve, tapestry.
- Button labels: verb + object. "Save changes" beats "OK"; "Delete project" beats "Yes".
- Link text needs standalone meaning: "View pricing plans" beats "Click here".
- **Copy self-audit before ship:** re-read every visible string. Flag grammatically broken, unclear referents, AI-hallucinated, fake-craftsman labels. Rewrite every flagged string.
- **Fake-precise numbers flagged:** `92%`, `4.1x`, `48k` — either from real data or explicitly labeled as mock. Banned if AI-invented.
- **One copy register per page.** Don't mix technical mono, editorial prose, and marketing punch in the same composition.
- **Quotes:** max 3 lines. Attribution: name + role + optionally company. Use real typographic quotes (`""`) or none.
- **Placeholder names:** never "John Doe" or "Acme Corp". Use contextual, believable names.
- **No Lorem Ipsum.** Write real draft copy.
- **Sentence case on headers**, not Title Case.

### Spec Sheets

- Long product spec tables with `border-b` on every row are AI default for cookware/hardware/apparel. Banned.
- Alternatives: 2-col card grid, scroll-snap horizontal pills, grouped chunks (3-4 logical clusters), featured-vs-rest (3-4 hero specs + "View full specifications" disclosure).

---

## Image & Visual Asset Strategy

Landing pages and portfolios are **visual products**. Text-only pages with fake-screenshot divs are slop.

**Priority order for visual assets:**

1. **Image-generation tool first.** If any image-gen tool is available (`generate_image`, MCP image tool, etc.), use it to create section-specific assets: hero photography, product shots, texture backgrounds.
2. **Real web images second.** Use `picsum.photos/seed/{descriptive-seed}/{w}/{h}` for placeholder photography. For real company logos in social proof, use Simple Icons CDN (`https://cdn.simpleicons.org/{slug}/ffffff`).
3. **Last resort: tell the user.** Do NOT fill the page with hand-rolled SVG illustrations or div-based "fake screenshots." Leave clearly-labeled placeholder slots (`<!-- TODO: hero product photo -->`).

**Rules:**
- Hero needs a real visual, not a gradient blob. Even minimalist sites need 2-3 real images.
- Div-based fake screenshots are banned. If you need to show a product, use a real screenshot, generate one, or use an actual component preview.
- **Hand-rolled SVGs discouraged as default.** Acceptable only for single simple geometric marks.
- **Logo-only rule for social proof:** logo wall = logos and nothing else. No industry labels below each logo.
- Alt text is part of the voice. "Coastal fettuccine, hand-cut, served on the terrace" beats "pasta dish".

---

## Motion Canonical Patterns

### Scroll-Reveal Stagger (Motion)

```tsx
"use client";
import { motion, useReducedMotion } from "motion/react";

export function RevealStagger({ items }: { items: string[] }) {
  const reduce = useReducedMotion();
  return (
    <ul className="grid gap-6">
      {items.map((item, i) => (
        <motion.li
          key={item}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{
            duration: 0.6,
            delay: i * 0.06,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {item}
        </motion.li>
      ))}
    </ul>
  );
}
```

### Sticky-Stack (GSAP)

```tsx
"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

export function StickyStack({ cards }: { cards: React.ReactNode[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;
    const ctx = gsap.context(() => {
      const cardEls = gsap.utils.toArray<HTMLElement>(".stack-card");
      cardEls.forEach((card, i) => {
        if (i === cardEls.length - 1) return;
        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          endTrigger: cardEls[cardEls.length - 1],
          end: "top top",
          pin: true,
          pinSpacing: false,
        });
        gsap.to(card, {
          scale: 0.92, opacity: 0.55, ease: "none",
          scrollTrigger: {
            trigger: cardEls[i + 1],
            start: "top bottom", end: "top top", scrub: true,
          },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <div ref={ref} className="relative">
      {cards.map((card, i) => (
        <div key={i} className="stack-card sticky top-0 min-h-[100dvh] flex items-center justify-center">{card}</div>
      ))}
    </div>
  );
}
```

---

## Absolute Bans / AI Tells

These patterns make interfaces look AI-generated. Match-and-refuse:

### Layout & Visual
- **Side-stripe borders.** `border-left`/`border-right` > 1px as colored accent on cards, list items, callouts.
- **Gradient text.** `background-clip: text` + gradient. Use single solid color.
- **Glassmorphism as default.** Rare and purposeful, or nothing.
- **Hero-metric template.** Big number + small label + supporting stats + gradient accent. SaaS cliché.
- **Identical card grids.** Same-sized cards with icon + heading + text, repeated endlessly.
- **Tiny uppercase tracked eyebrow above every section.** Max 1 per 3 sections.
- **Numbered section markers as default scaffolding (01 / 02 / 03).** Only when section IS a sequence.
- **Text that overflows its container.** Test heading copy at every breakpoint.
- **Neon/outer glows** by default. Use inner borders or subtle tinted shadows.
- **Pure black `#000000`.** Use off-black, zinc-950, or charcoal.
- **Oversaturated accents.** Desaturate to blend with neutrals.
- **Custom mouse cursors.** Outdated, accessibility-hostile.
- **Monospace as lazy shorthand for "technical/developer".** If brand isn't technical, mono reads as costume.
- **Large rounded-corner icons above every heading.** Screams template.
- **Split-header pattern as default** (left big headline + right small explainer paragraph). Stack vertically instead.
- **`border: 1px solid X` + `box-shadow` with blur ≥ 16px** on same element (ghost-card pattern). Pick one.
- **`border-radius: 32px+` on cards/sections/inputs.** Cards top out at 12-16px.
- **Hand-drawn/sketchy SVG illustrations.** If you can't render with real assets, ship no illustration.

### Copy
- **"X theater" / "actually X" / "not just X, it's Y".** "Productivity theater", "engagement theater" — instant slop.
- **Em dashes.** Use commas, colons, or periods.
- **Aphoristic-cadence body copy.** "Serious statement, then punchy short negation" as recurring rhythm.

### Interaction
- **Layout-animation.** No animating `top`, `left`, `width`, `height`.
- **`window.addEventListener("scroll", ...)** — hard ban.
- **Dropdown clipped by `overflow: hidden` ancestor.** Use native `<dialog>`/popover API or portal.
- **Modal as first thought.** Exhaust inline/progressive alternatives first.

### Colors
- **The cream/sand/beige body bg** (OKLCH L 0.84-0.97, C < 0.06, hue 40-100). The saturated AI default of 2026.
- **AI purple/blue glow.** Purple gradient buttons, random neon gradients.
- **Mixing warm and cool grays within one project.** Pick one gray family.
- **More than one accent color.**
- **Pure `#000000` background.** Always off-black.

### Code
- **Div soup.** Use semantic HTML: `<nav>`, `<main>`, `<article>`, `<section>`.
- **Inline styles mixed with CSS classes.**
- **Hardcoded pixel widths.** Use relative units.
- **Arbitrary z-index values like `9999`.**
- **Commented-out dead code.**
- **Missing meta tags** (title, description, og:image).

---

## Design System Mapping

### When to Use Real Design Systems (Official Packages)

| Brief reads as… | Reach for |
|----------------|-----------|
| Microsoft / enterprise SaaS | `@fluentui/react-components` or `@fluentui/web-components` |
| Google-ish / Material-flavored | `@material/web` + Material 3 tokens |
| IBM-style B2B / enterprise analytics | `@carbon/react` + `@carbon/styles` |
| Shopify app surfaces | Polaris React |
| GitHub-style devtool / community | `@primer/css` or `@primer/react-brand` |
| Public-sector UK service | `govuk-frontend` |
| Modern accessible React | `@radix-ui/themes` |
| Modern SaaS where you own components | shadcn/ui |

**Honesty rule:** if the brief reads as one of the systems above, install and use the **official** package. Do not recreate its CSS by hand. **One system per project.**

### Stack Conventions (When No Official System)

- **Framework:** React or Next.js. Server Components (RSC) default. Interactivity isolated to leaf `"use client"` components.
- **Styling:** Tailwind v4 (default). Do NOT use `tailwindcss` plugin in postcss — use `@tailwindcss/postcss`.
- **Animation:** Motion (`import { motion } from "motion/react"`). Formerly Framer Motion.
- **Fonts:** Always `next/font` or self-host `@font-face` + `font-display: swap`. Never `<link>` Google Fonts in production.
- **Icons:** Phosphor, Heroicons, or Radix Icons. Discouraged: Lucide. Never hand-roll SVG icons.
- **State:** Local `useState`/`useReducer`. Global only for deep prop-drilling (Zustand, Jotai). **Never `useState` for continuous values** (mouse pos, scroll) — use Motion's `useMotionValue`.

---

## Performance & Accessibility Guardrails

- **Hardware acceleration:** Animate ONLY `transform` and `opacity`. Use `will-change: transform` sparingly.
- **Reduced motion (mandatory):** Any motion above `MOTION_INTENSITY > 3` MUST honor `prefers-reduced-motion`. Infinite loops, parallax, scroll-hijack, magnetic physics must collapse to static.
- **Dark mode (mandatory for consumer-facing):** Design for both modes from start. Use Tailwind `dark:` or CSS variables. No pure `#000` or pure `#fff`.
- **Core Web Vitals targets:** LCP < 2.5s (hero image `priority` or preloaded), INP < 200ms, CLS < 0.1.
- **DOM cost:** Grain/filters on fixed `pointer-events-none` pseudo-elements only. Lazy-load anything not above-the-fold.
- **Z-index restraint:** Document scale in project constants. Never spam `z-50` or `z-10`.

---

## Self-Review Gate (MANDATORY)

Before declaring any design work complete, answer all:

- [ ] Would this fit on Stripe's marketing page without redesign? (Typography)
- [ ] Does every color pass WCAG AA contrast? (Color)
- [ ] Is whitespace generous — does it feel "breathable"? (Spacing)
- [ ] Do all interactive elements respond to hover AND active states? (Interaction)
- [ ] Is dark mode handled? (Theming)
- [ ] Are animations purposeful and `≤300ms` with reduced-motion fallback? (Motion)
- [ ] Can a keyboard-only user operate everything? (Accessibility)
- [ ] Are there any hardcoded colors/sizes breaking the design system? (Consistency)
- [ ] Have you checked for AI tell patterns (gradient text, side borders, eyebrow on every section, identical cards)? (Anti-slop)
- [ ] Have you re-read every visible string for copy quality? (Copy)
- [ ] Is the hero real — real visual asset, concise copy, CTAs without scroll? (Hero)
- [ ] Does the page use at least 3 different layout families? (Variety)

If ANY answer is "no" — fix before closing.

---

## Premium Design Heuristics

1. **The 10-foot test** — Step back (or zoom out). If the visual hierarchy isn't obvious at distance, it needs work.
2. **The grayscale test** — Remove color. Does the layout still communicate priority? If not, you're relying on color to do hierarchy's job.
3. **The finger test** — On mobile, can you tap every target with a fat thumb? Min 44×44px touch target.
4. **The squint test** — Blur your eyes. The most important element should still stand out.
5. **The empty state** — What does the UI look like with no data? Design it. It's often the first thing users see.
6. **The AI slop test** — Could someone look at this and say "AI made that" without doubt? If yes, it's failed.

---

## Redesign Protocol (For Existing Projects)

When upgrading an existing codebase, follow this sequence:

### 1. Scan
Read the codebase. Identify framework, styling method, current design patterns.

### 2. Diagnose
Run through the Design Audit Pipeline above. List every generic pattern, weak point, and missing state.

### 3. Fix Priority (in this order)
1. **Font swap** — biggest instant improvement, lowest risk
2. **Color palette cleanup** — remove clashing/oversaturated colors, ensure mode parity
3. **Hover and active states** — makes the interface feel alive
4. **Layout and spacing** — proper grid, max-width, consistent padding
5. **Replace generic components** — swap cliche patterns for modern alternatives
6. **Add loading, empty, and error states** — makes it feel finished
7. **Polish typography scale and spacing** — the premium final touch

### Rules
- Work with the existing tech stack. Do not migrate frameworks.
- Do not break existing functionality. Test after every change.
- Check `package.json` before importing any new library.
- Keep changes reviewable and focused.

---

## CODEX Learning Gate

After completing design work, if you established:
- Project-specific design tokens or palette
- Typography choices or scale
- Component patterns (card style, modal style, etc.)

→ Append a compact entry to `CODEX.md` under `## 💻 Mission Logs & Tactical Learnings`.
Format: `[DATE] - [Project] Design System — [Key decisions: palette, font, radius, etc.]`
