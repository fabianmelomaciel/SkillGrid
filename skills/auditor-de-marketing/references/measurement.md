# Measurement & Experimentation Reference

Adapted from the CRO/measurement/analytics/ab-testing skills in `coreyhaines31/marketingskills` (MIT). Distilled frameworks, not copied code — no executable content is ingested.

> Load this file only when the audit touches experimentation, tracking, ads or attribution. It is not part of the core scan.

## 1. A/B Test Design
- **One hypothesis, one variable.** State it as: "If we change X, then metric Y moves by ≥Z%, because <reason>." No multi-change tests.
- **Primary metric first.** Pick a single success metric before launch; everything else is guardrail (bounce, revenue, refunds).
- **Sample size / power.** Decide the minimum detectable effect and required sample up front. A test that stops at "looks better" is noise.
- **No peeking.** Fix the runtime (whole weeks, full business cycles) and read the result once. Sequential peeking inflates false positives.
- **Segment, don't cherry-pick.** Report by device/source/plan; a win on desktop that loses on mobile is not a win.

## 2. Analytics & Tracking
- **Event taxonomy:** `object_action` (e.g. `signup_completed`, `checkout_started`). Keep names stable; renaming breaks funnels.
- **Key events:** define the 3-6 events that map to value. Everything else is supporting.
- **UTM discipline:** lowercase, consistent source/medium, one canonical per channel. Uncontrolled UTMs make attribution lie.
- **Server-side vs client:** client tags undercount due to blockers/iOS; for money events prefer server-side or a first-party endpoint.

## 3. Paid & Creative Measurement
- **Platform ROAS is not truth.** Reconcile platform-reported conversions against the source of truth (billing/CRM). They always disagree.
- **Blended CAC** (total spend / total new customers) is the number that matters; per-platform is a diagnostic.
- **Creative fatigue:** watch frequency and CTR decay per creative; refresh before CPA climbs.
- **Wasted spend:** flag placements/keywords with cost and zero (or non-incremental) conversions; produce uploadable exclusion lists.

## 4. Attribution & Incrementality
- **Last-touch flatters the bottom of the funnel.** Note its limits explicitly in any report.
- **Incrementality beats attribution.** When the decision is real money, propose a geo-holdout or a holdout group, not a model.
- **Correlation caveat:** a channel growing alongside a seasonal lift is not necessarily driving it.

## 5. Reporting Rule
Every measurement finding states: metric, current value, target, evidence source, and the decision it should trigger. A number without a decision is decoration.
