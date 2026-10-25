> This file extends [common/patterns.md](../common/patterns.md) with web-specific design-quality guidance.

# Web Design Quality Standards

## Anti-Template Policy

Do not ship generic template-looking UI. Frontend output should look intentional, opinionated, and specific to the product.

### Banned Patterns

- Default card grids with uniform spacing and no hierarchy
- Stock hero section with centered headline, gradient blob, and generic CTA
- Unmodified library defaults passed off as finished design
- Flat layouts with no layering, depth, or motion
- Uniform radius, spacing, and shadows across every component
- Safe gray-on-white styling with one decorative accent color
- Dashboard-by-numbers layouts with sidebar + cards + charts and no point of view
- Default font stacks used without a deliberate reason

### The Floor

Uniformity is the tell: identical radii, identical gaps, one accent on grey. A surface clears this before anyone argues taste:

1. Clear hierarchy through scale contrast
2. Rhythm in spacing, not uniform padding everywhere
3. Depth or layering where the direction asks for it
4. Typography with a real pairing strategy
5. Color doing a job, not decorating
6. Hover, focus, and active states that were designed
7. A composition that breaks its own grid exactly once

## Before Writing Frontend Code

1. Write the five values of "Dirección" — `skills/emil-kowalski-design/SKILL.md`: typology, density, hierarchy, grid, voice.
2. Pick the ficha: a captured reference with tokens, or one of the three in `skills/shared/galeria-disenos.md`. Name it.
3. Palette, type and radii come from that ficha. If it has none, extract them first — inventing them is how the default comes back.
4. Name the discard: the obvious option, and the banned pattern it matches above.

## Style References Are Not a Menu

Nine styles on a list is not a direction: whichever one the agent picks, the output is the average of the list. Bento, mesh gradients and glass are one house's patterns, not the house style.

Do not default to dark mode automatically. Choose the visual direction the product actually wants.

## Component Checklist

- [ ] Does it avoid looking like a default Tailwind or shadcn template?
- [ ] Does it have intentional hover/focus/active states?
- [ ] Does it use hierarchy rather than uniform emphasis?
- [ ] Would this look believable in a real product screenshot?
- [ ] If it supports both themes, do both light and dark feel intentional?
