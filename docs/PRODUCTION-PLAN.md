# Overlords & Outlaws — production plan

## Approved brief

Build a browser-based single-player historical dynasty card game with a touch-adapted landscape layout. Preserve the source's defining systems while resolving incomplete rules independently. Deliver a guided campaign opening, branching replayable runs, four to six European houses, distinctive AI rivals, unlockable options, lavish painterly presentation, atmospheric sound, and persistent progress. Create the private `mcbradd/overlords-and-outlaws` repository, exclude original PDFs, include a complete Markdown knowledge base, and deploy a shareable playable build without new paid services.

## Product

**Overlords & Outlaws: The Witness**. A candlelit council chamber frames a contest of inheritance, exposed authority, hidden leverage, and historical disruption. A tutorial introduces the inheritance draft and declaration before unlocking the full action grammar. A run crosses three acts, with a choice of two encounters per act, followed by rewards that change subsequent play. Skirmish and a reproducible daily challenge support short sessions. The archive provides inspectable cards and the rules remain available during play.

### Scope

- Six European archives: Alba, Plantagenet, Tudor, Valois, Habsburg, and Bourbon. These are deliberately asynchronous historical collections; they do not imply all people lived together. Alba follows the source's broad Scottish lineage grouping rather than claiming a single historical house.
- Fourteen named figures per archive, with Founder, Queen, Warlord, Lawgiver, Intriguer, and Royal roles. Historical associations are distinguished from invented game abilities.
- Eight Interregna, three nine-fragment Eudoxia paintings, six AI rival identities, nine encounter modifiers, and run rewards.
- An eight-card 3–2–1 draft; three matching Royals declare a house; five-card hidden hands; one strategic action per turn; Build, Barter, Seize, Marry, and Betray; shared historical interruptions.
- Tutorial, campaign, skirmish, daily seed, archive, settings, rulebook, results, and resumable saves.

## Technical approach

TypeScript + Vite, a deterministic engine independent of rendering, and DOM/CSS presentation with GPU-friendly transforms. Art is local and compressed; no runtime paid APIs, login requirement, or server-held game state. Audio uses local browser synthesis with user-controlled volume. Saves have a version and validation. The engine produces legal actions consumed by both UI and AI, making rules consistent and simulation practical.

## Sequence

1. Distill every page and visual exhibit of the three source PDFs into the knowledge base; preserve uncertainties and provenance.
2. Write executable prototype rules and content, then implement the deterministic game engine.
3. Build the visual shell, board, tutorial, campaign progression, archive, and sound.
4. Integrate commissioned/generated raster art; refine motion, typography, feedback, and touch interaction.
5. Exercise engine edge cases and full AI matches; run end-to-end flows; inspect desktop and landscape screenshots; fix defects and iterate.
6. Commit and push the private GitHub repository; publish the exact tested build; deliver URLs and a concise quality report.

## Release gates

- Tutorial can be completed without consulting an external manual; legal actions and consequences are discoverable.
- All action families, history, collapse, victory, and Eudoxia defeat resolve without deadlocks or impossible card duplication.
- Campaign branching, rewards, restart, saved-game resume, daily seed, and collection work.
- AI respects hidden information and offers multiple difficulty levels.
- No uncaught errors on critical flows; keyboard and touch selection work; reduced motion and sound controls persist.
- Inspected layouts at 1440×900 desktop and 844×390 landscape; no inaccessible essential controls or blocking overlap.
- Production build and automated checks pass; compressed assets and lazy loading keep initial loading reasonable.
- Repo excludes source PDFs, credentials, dependencies, and temporary artifacts. Knowledge base is included.
- Deployed build is confirmed successful. Report actual testing limits; do not label this a certified commercial AAA release.

## Iteration record

Implementation and verification outcomes are recorded in `docs/QUALITY-REPORT.md` before delivery.
