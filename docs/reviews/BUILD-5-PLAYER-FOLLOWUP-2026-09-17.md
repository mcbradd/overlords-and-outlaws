# Player follow-up — 17 September 2026

The resumed iteration adds three requirements: Trade targets only a rival's
face-up Played/Resting pile (not their hand or Court); marriage remains the only
route for a foreign person to enter Court; cards with no valid current uses dim.
These instructions supersede conflicting portions of the frozen Build 6 package.
The immediate correction retains the existing succession game. The user's
follow-up explicitly rejects any-card Court entry. The frozen replacement is
therefore superseded and requires a new coherent design before implementation;
its 6,279-row inventory does not describe the retained succession game.

## Written regression tasks

- DIM-01: During a real rendered response, a held card with no legal answer is
  visibly dimmer and less saturated than a legal answer. It remains readable
  and inspectable. Its caption says it has no valid play now.
- DIM-02: When play returns to an ordinary turn, legality is recomputed; a
  newly usable card regains its normal appearance. Tutorial gating and terminal
  states cannot leave misleading active-card cues.
- TRADE-01: Generate requests only from a different seat's Played pile. Reject
  hand, Court, supply and own-pile targets atomically, including forged actions.
- TRADE-02: Acceptance removes the requested card from that Played pile exactly
  once and conserves both identities. Decline retains ownership. No hidden hand
  identity influences the available target list; an empty rival hand does not
  prevent trading for a public Played card.
- MARRIAGE-01: Reproduce the ordinary rendered route from a legal foreign held
  card to an eligible native Queen; preview both names, commit, and verify the
  link and foreign Court entry. Verify no direct foreign Recruit option.
- MARRIAGE-02: Inspection explains the specific missing marriage condition
  without pretending an unavailable marriage can be committed.
- COPY-01 (found during actual screen inspection): Trade and Crown text must
  read correctly for the default player name "You" as well as other names.
- SAVE-01: Preserve old Build 5 save bytes in their original namespace; new
  Played-pile games use a distinct ruleset/key. Reject old imports visibly
  rather than reinterpreting a pending hidden-hand bargain.
- FIT-01 (actual phone preview): Marriage confirmation must clear the fixed
  build badge; use a concise preview while retaining both identities and the
  succession consequence. Check 360x780 alongside 390x844 and desktop.

## Initial evidence

`npx tsx --test --test-name-pattern="U39|U40|U41|marriage" tests/core-game.test.ts`
passed three existing tests. This establishes that authored legal marriages and
relationship-loss cases execute in the engine, not that the player's reported
UI experience worked. No exact player deal was supplied.

The hand-card CSS explicitly overrides disabled opacity with `opacity: 1
!important`; disabled and enabled cards also share the same filter. A real
browser regression will establish the pre-fix visual result before correction.

## Executed correction and verification

Retained the succession rules and marriage eligibility. No unrestricted Add or
foreign Recruit was introduced. Legal Trade targets, acceptance custody, restore
validation, policy evaluation and reference text now use rival Played piles.
Disabled hand cards are 50% opacity and grayscale, with a plain-language caption;
Inspect remains available. Marriage choices name the Queen; foreign-card
inspection explains the missing requirement or names eligible partners.

Tests executed locally:

- Trade boundary regressions first failed with hidden-hand targets and rejected
  Played targets, then passed for both empty and nonempty rival hands.
- Browser dimming first failed with both opacity values equal to 1; it now
  verifies 0.5 versus 1, grayscale, inspection and restored playability.
- `npm test`: 169 passed. `npm run test:ui`: three passed.
- `npm run build`: passed (existing bundle-size advisory only).
- `scripts/core-player-feedback.ts`: ordinary imported-fixture UI routes for
  marriage, absent Queen, Played trade, response, dimming and regained legality
  passed at 1440x900, 390x844 and 360x780. Commitment controls are measured before
  clicking; compact hand overflow uses an actual wheel within the card well.
- `scripts/core-browser.ts`: full retained tutorial and fixture regression
  passed, producing 112 captures. Generation is not inspection of all 112.
- `scripts/core-app-audit.ts`: six storage/loading/tutorial checks passed.
- `scripts/core-simulate.ts 8`: 24 projected-view policy games, all reached wins;
  this is simulation, not the requested ten blind UI games or family evidence.

The 360x780 response initially placed Defend below the viewport. Extending the
existing short-screen layout breakpoint from 740 to 820 pixels made the tested
commitment controls reachable. A separate failed Inspect check exposed the
intentional hand scroll well; the regression now exercises its real scroll
route rather than force-clicking or scrolling a commitment into view.

Actual images opened by the implementing agent include:

- `artifacts/core/player-feedback-before/response.png` (1440x900 baseline).
- `artifacts/core/player-feedback/1440-response.png`, `390-response.png`,
  `1440-marriage-preview.png`, `390-marriage-complete.png`.
- `artifacts/core/player-feedback-regression/000-opening.png`,
  `074-dense-four-courts.png`, `101-trade-offer.png` (1440x900).
- `artifacts/core/player-feedback-final/390-trade-response.png`,
  `390-marriage-preview.png`, `1440-marriage-unavailable.png`.
- `artifacts/core/player-feedback-fit2/360-response.png` (hand overflow probe).
- `artifacts/core/player-feedback-fit3/360-marriage-preview.png`,
  `360-trade-response.png`, `390-marriage-preview.png` (corrected fit).

Observed: unavailable cards are visibly distinct, Inspect remains readable,
marriage names both partners, and final phone commitments clear the build badge.
The dense board still needs manual focus for small printed names. Existing
renderer/whole-game issues recorded by the handoff are not declared fixed.
The complete release suite, all-viewports visual acceptance, a fresh blind
learner and ten ordinary UI games have not been rerun for this correction.
No Main promotion or manufacturing/family/device certification is claimed.
The next replacement design must preserve marriage-only foreign Court entry.
