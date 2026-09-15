# Revision 2 quality report — 15 September 2026

## Delivered scope

A real Three.js battlefield with projected interactive cards, physical deployments/challenges/captures, marriage links, impact effects, explicit stat panels, six House frames and role identities. Solo tables support 2–4 Houses; local family tables support 2–4 humans with chosen Houses and private handoffs. Guided practice, three-court chronicles, daily seeds, an 84-Royal archive and browser-local saves provide replay paths.

The [rules](RULES.md) connect victory to a three-Royal family, printed tribute and each actual rival's challenge turn. Supported marriage chains contribute legitimacy and fail when disconnected from a native Queen. History is forecast, and the Witness's nine-fragment painting completion is public. There is no opaque authority score.

## Automated validation

- Strict TypeScript checking and production build pass. The initial application is approximately 69 KB JavaScript / 26 KB gzip. The 3D runtime loads when entering a table: Three core is approximately 533 KB / 133 KB gzip, plus small scene/renderer chunks. Vite reports the expected >500 KB vendor-chunk warning; this is not evidence of a measured low-end-device performance budget.
- **16 V2 rule tests** cover equal opening income, 2–4 seats, card conservation, legal/atomic moves, named claim windows, supported marriage chains, Guard, Brace, Ambush, seizure, upkeep, archive recycling, Witness completion, chosen family Houses and hidden-information isolation. Two additional tests check the strict audit classification. Another 13 retained tests cover the historical V1 engine, which is not used by the new UI.
- **Two DOM integration tests** exercise family privacy, save/resume, archive inspection and one-time chronicle rewards carried into the next court. Rendering/audio are mocked in these tests.
- **600 full V2 smoke-test games** validate state after every action and end with explicit reasons. Seeds 30000–30599: 133 Witness endings, average 12.95 rounds.
- **Four 200-game audit runs**, plus pilots, informed the revision. The release run completed 200 games and 4,427 order/response samples. See [Decision audit](DECISION-AUDIT.md) for all categories, counterfactual method and limitations.
- Dependency installation/audit reported zero known vulnerabilities at validation time.

## Real-browser checks

Isolated headless Chrome was used without the user's browsing profile. Tests exercise real click targets and avoid forced clicks.

- All exposed cards were clicked in full 2-, 3- and 4-House tables at 1440×900, 1024×600, 844×390, 667×375 and 568×320. No card clipping, page overflow or blocked target clicks in these fifteen configurations.
- Screenshot/geometry checks report no vertical scrolling in card areas or the decision panel. The document matches viewport dimensions at the tested landscape sizes.
- A complete guided lesson finishes in four rounds, with nine user-side actions/responses, through the actual crown condition. Its protected opponent policy is explicitly disclosed.
- A complete four-House normal match finishes in five rounds in the fixed browser scenario, with sixteen user-side actions/responses and an AI House securing the crown. It includes actual card selection, target review, defensive responses and a specific result explanation.
- The normal browser flow also completes with motion enabled. A separate 844×390 family flow verifies private defensive handoffs, Brace costs and pressure, private reload/resume, public-number inspection and keyboard dialog focus. The compact 568×320 variant also checks four-House estate targeting and a Royal challenge.
- Earlier failed browser runs found CSS3D focus scrolling, a decorative label intercepting target clicks, and an empty stale hand page. Compact-phone testing also found hidden crown/estate controls, which were restored before publication. Each failure was corrected and the full flows rerun.

Screenshots and machine reports are generated under local ignored `artifacts/v2/`. Reproduction commands are in the README.

## Known limitations

This is a tested, substantially revised prototype. These checks do not establish AAA release quality, human enjoyment, first-seat fairness, full accessibility certification, Safari/iOS behavior or low-end mobile GPU performance. Tiny battlefield cards on phones rely on the selected detail panel and full inspection. Six figures have individual new portraits; many others share House archetypes. Heraldic marks are inspired designs, not certified historical arms.

Online multiplayer, network security, account systems, cloud saves, the original passing draft and full expansion content are outside the implemented revision. V1 saves are retained under their old storage key but are incompatible with V2. Generated art and fictional game abilities are labeled as interpretations. The source PDFs and full Markdown knowledge base remain separate from the published static game.

The stricter final audit identifies 1,087 tradeoff candidates, but equivalent/forced decisions and seat effects remain. No honest automated process can certify that every design possibility has been exhausted. The next evidence should come from real families learning and playing this build.
