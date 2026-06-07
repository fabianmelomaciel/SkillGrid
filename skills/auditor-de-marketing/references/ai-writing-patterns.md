# AI Writing Detection — 30-Pattern Reference

Based on the Wikipedia "Signs of AI writing" guide by WikiProject AI Cleanup. LLMs produce text that looks statistically normal but reads wrong. These 30 patterns catch that.

## Content Patterns
1. **Significance inflation**: "marking a pivotal moment in the evolution of" → "was established in 1989 to collect regional statistics". Flag any sentence that calls something a milestone, a turning point, or transformative without evidence.
2. **Notability name-dropping**: "cited in NYT, BBC, FT, and The Hindu" → "In a 2024 NYT interview, she argued...". Drop reputation laundry lists unless each source contributes a specific claim.
3. **Superficial -ing analyses**: "symbolizing... reflecting... showcasing...". Remove or replace with concrete sources. These words describe without proving.
4. **Promotional language**: "nestled within the breathtaking region" → "is a town in the Gonder region". Flag tourism brochure tone in factual content.
5. **Vague attributions**: "Experts believe it plays a crucial role" → "according to a 2019 survey by...". Who are the experts. Which study.
6. **Formulaic challenges**: "Despite challenges... continues to thrive". State the actual obstacle and the response. Cut the template.

## Language Patterns
7. **AI vocabulary**: "actually", "additionally", "testament", "landscape", "showcasing", "underscoring", "notably". These words cluster in AI text. Flag more than two per paragraph.
8. **Copula avoidance**: "serves as", "features", "boasts", "stands as", "functions as", "acts as". Normal writing uses "is" and "has". Flag three or more per section.
9. **Negative parallelisms / tailing negations**: "It's not just X, it's Y", "..., no guessing". State the point. Cut the performance.
10. **Rule of three**: "innovation, inspiration, and insights". AI loves triples. Flag any list of exactly three abstract nouns.
11. **Synonym cycling**: "protagonist... main character... central figure... hero" for the same referent. Pick one word and repeat it.
12. **False ranges**: "from the Big Bang to dark matter". Flag ranges that try to imply scope instead of listing the actual topics.
13. **Passive voice / subjectless fragments**: "No configuration file needed". Name the actor. "You don't need a config file."

## Style Patterns
14. **Em/en dashes**: Cut them. Use periods, commas, colons, or parentheses. Two per page is the ceiling.
15. **Boldface overuse**: Bold should mark headings and maybe one keyword. Not half the sentence.
16. **Inline-header lists**: "**Performance:** Performance improved...". Convert to prose or real headings.
17. **Title Case Headings**: "Strategic Negotiations And Partnerships" → "Strategic negotiations and partnerships". Sentence case only.
18. **Emojis in body text**: Flag any emoji outside a heading or social media specific content.
19. **Curly quotes in code contexts**: Straight quotes in code. Curly quotes in prose. Mixing them looks wrong.
20. **Hyphenated word pairs**: "cross-functional, data-driven, client-facing, enterprise-grade". Drop the hyphen when the pair is common enough to stand alone.
21. **Persuasive authority tropes**: "At its core, what matters is...", "The truth is that...". State the point. Don't frame it.
22. **Signposting announcements**: "Let's dive in", "Here's what you need to know". Start with the content.
23. **Fragmented headers**: "## Performance" followed by "Speed matters." on the next line. The heading should carry the weight. Merge them.
24. **Diff-anchored writing**: "This function was added to replace...". Describe what it does, not what changed in the codebase.

## Communication Patterns
25. **Chatbot artifacts**: "I hope this helps!", "Let me know if...", "Feel free to reach out". Cut them. They add nothing.
26. **Cutoff disclaimers**: "While details are limited in available sources...", "It's worth noting that...". Either find the source or remove the sentence.
27. **Sycophantic tone**: "Great question!", "You're absolutely right!", "That's an excellent point". Answer the question. Don't flatter it.

## Filler and Hedging
28. **Filler phrases**: "In order to" → "To". "Due to the fact that" → "Because". "In the event that" → "If". Flag more than one per paragraph.
29. **Excessive hedging**: "could potentially possibly", "it might be argued that", "it seems that". "May" is enough. One hedge per paragraph max.
30. **Generic conclusions**: "The future looks bright", "Exciting times ahead", "The possibilities are endless". Close with a specific fact or plan. Not a vibe.

## Usage
Load this file from `auditor-de-marketing/SKILL.md` section 9 when performing AI writing detection audits.

> Part of SkillGrid — https://github.com/fabianmelomaciel/SkillGrid
