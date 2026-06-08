# Motion Canonical Patterns — Impeccable Design Taste

> Cargado bajo demanda cuando el agente necesita implementar animaciones específicas.
> No cargar en contexto completo durante auditorías de diseño — solo al implementar.

---

## Scroll-Reveal Stagger (Motion / Framer Motion)

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

---

## Sticky-Stack (GSAP ScrollTrigger)

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

## CSS Design Tokens — Baseline

```css
:root {
  /* Typography */
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

  /* Dark mode colors */
  --color-bg: hsl(224, 14%, 10%);
  --color-surface: hsl(224, 12%, 14%);
  --color-border: hsl(224, 10%, 20%);
  --color-text: hsl(0, 0%, 93%);
  --color-muted: hsl(224, 8%, 55%);
  --color-primary: hsl(243, 75%, 65%);
  --color-primary-hover: hsl(243, 75%, 72%);

  /* Z-index layers */
  --z-base: 0;
  --z-dropdown: 10;
  --z-modal: 20;
  --z-toast: 30;
}

/* Card shadow — layered, tinted */
.card {
  box-shadow:
    0 1px 2px hsl(0 0% 0% / 0.06),
    0 4px 8px hsl(0 0% 0% / 0.08),
    0 12px 24px hsl(0 0% 0% / 0.06);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}
```
