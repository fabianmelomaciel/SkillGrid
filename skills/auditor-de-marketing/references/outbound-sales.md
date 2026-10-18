# Outbound & Sales Enablement Reference

Adapted from the cold-email/emails/sales-enablement/revops skills in `coreyhaines31/marketingskills` (MIT). Distilled frameworks — no code, no scraped lists, nothing executable.

> Load this file only when the audit touches cold outreach, lifecycle email, sales collateral or the marketing→sales handoff. It is not part of the core scan.

## 1. Cold Email (B2B Outbound)
- **ICP before copy.** A tight ideal-customer profile beats clever wording. If the audience is wrong, no sequence saves it.
- **Personalization that isn't creepy:** reference a real, public, relevant fact about the company — not "I saw you're in marketing".
- **Frameworks:** PAS (problem-agitation-solution) or BAB (before-after-bridge). Lead with their pain, not your feature.
- **Sequence:** 3-4 touches over ~2 weeks, each adding a new angle (not "just bumping this"). First touch short: <120 words.
- **Subject lines:** specific and low-hype ("question about <thing>" beats "Revolutionary AI platform"). A/B test in small batches.
- **Deliverability hygiene:** SPF, DKIM, DMARC configured; warm the domain; keep volume low and relevant; monitor bounce and spam-complaint rates.
- **Compliance:** real sender identity, working unsubscribe, honour opt-outs immediately (CAN-SPAM / GDPR / local rules).

## 2. Lifecycle Email
- **Welcome drip:** deliver value in the first email, then sequence by intent. Never a wall of links.
- **Activation:** target the first "aha" action; every email points to one next step.
- **Churn prevention:** trigger on inactivity and on cancellation intent; save offers come before the cancel button, not after.
- **Dunning:** failed-payment recovery emails with a clear, low-friction fix path.

## 3. Sales Enablement Collateral
- **One-pager:** problem → solution → proof → CTA. One screen, scannable.
- **Objection handling:** the top 5 objections, each with a one-line reframe backed by evidence.
- **Demo script:** outcome-led, not feature-tour. Show the before/after the buyer cares about.
- **Battlecards:** per competitor — their strength, their weakness, our wedge, the trap question to ask.

## 4. RevOps / Handoff
- **Lead scoring:** mix fit (firmographic) and intent (behavioural); document the weights, review quarterly.
- **Routing:** owner assignment rules are explicit and testable; no lead sits unassigned.
- **MQL→SQL SLA:** a defined response time, tracked. Slow handoff is a silent budget leak.
- **Closed-loop feedback:** win/loss reasons flow back to targeting and copy — otherwise the ICP never improves.

## 5. Audit Rule
For every outbound/sales finding, flag the missing artifact (ICP, sequence, battlecard, SLA) and the risk if it stays missing. Recommend the asset, not the tactic in the abstract.
