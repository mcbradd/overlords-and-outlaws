# Revision 2 production plan and completed iteration record

## Objective

Replace opaque authority changes with a visible family, economy, military contests and fragile alliances. Deliver a 2–4-House table with readable collectible cards, a real 3D battlefield, clear victory, guided learning, responsive interaction and replay. Preserve the full PDF knowledge base and designer attribution.

## Production sequence

1. Reproduce resize failure before editing. At 1024×600 the old sidebar had 792 pixels of content in 494 pixels and scrolled vertically.
2. Separate deterministic game rules, card presentation, persistence, Three.js scene, and application UI. Keep the source-derived three-Royal declaration and document adaptations.
3. Build House-specific frames, heraldic marks and subclass bands. Reserve separate name, portrait, ability and stat areas. Generate six individual portraits and one table texture.
4. Implement two to four Houses, family handoffs, military challenges, paid responses, estate economy, marriage dependencies, explicit tribute and named challenge turns.
5. Use pilots to find dead mechanics and short or stalled games. Run successive 200-game audits and inspect counterfactual decisions rather than counting buttons.
6. Complete browser games, family/privacy/reward integration checks and all-card viewport tests. Fix failures before publishing.
7. Commit and push the tested source to GitHub; publish that same source and built archive to the existing site. Preserve its audience.

## Iterations driven by evidence

- A cheap flat claim fee caused nearly combat-free three-round games. Tribute now equals exposed card costs, visibly connecting army size to the cost of coronation.
- A short heuristic audit mislabeled equivalent openings as interesting. Terminal counterfactual continuations now separate identical results, forced losses and policy-sensitive alternatives. Results remain proxies, not human enjoyment measurements.
- Estates initially returned less value than Stewards and were almost unused. Estates now earn two per turn, while vulnerable but dynasty-building Stewards earn one.
- AI never recalled obstructive foreigners or wounded defenders. It can now trade tempo and gold for recovery or a useful court seat.
- Marriages originally added costs without helping the dynasty. Supported marriages now count toward the three-Royal family; Queen loss can sever whole chains.
- Later seats incorrectly received extra income in the opening circuit. All seats now begin with five; income begins in round two.
- AI spent coronation money on unnecessary growth and shields behind Guardians. It now saves toward the visible tribute and evaluates those expenditures in context.
- Browser play revealed focus-induced scrolling inside the CSS3D layer and a stale second hand page. Non-scrolling clipping and hand-page clamping correct both.
- An unprotected tutorial dragged through 43 rounds. Explicit guided practice now demonstrates the same claim resolution without competitive opponent attacks. Normal modes remain competitive.

## Acceptance evidence

See [Quality report](QUALITY-REPORT.md), [Decision audit](DECISION-AUDIT.md), executable [rules](RULES.md), and generated-art prompts in [Art direction](ART-DIRECTION.md). No automated gate establishes commercial AAA parity or proves that the design space is exhausted. Human comprehension, enjoyment, accessibility and real-device performance remain separate validation work.
