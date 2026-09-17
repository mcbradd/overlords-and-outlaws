# Independent core reducer and AI audit

17 September 2026, parent agent reviewing the systems agent's uncommitted implementation after the `3fbb734` plan freeze. Reviewed `types.ts`, `content.ts`, `engine.ts` and `ai.ts` in `src/core-game`; relevant unit and simulation evidence is separate.

The reducer enumerates legal candidates from an allowlisted seat projection, then validates the complete revisioned action before cloning/mutation. Recall removes its lead before a single defender response; accepted and declined exchanges preserve exact identity and delay reuse. Crown dependency checks run after departures and at boundaries; claim-round and reign-round are distinct. Per-round attempt/offer marks and card-zone commitments bound initiated actions. Round-cap termination checks succession first. No seals or hidden deck order enter policy choices.

The successful-Recall exchange correction addresses resource starvation without restoring removed Crown dependencies. Projected-policy statistics are not proof of strategy or human comprehension. Strong deterministic policy scoring still needs the requested observed-game counterexamples; frequent claims or wins alone do not pass that gate.

Public-knowledge presentation remains an open UX audit concern: AI can retain `knownHands`, while the normal screen does not currently offer a persistent readable record of those publicly returned/disclosed identities. The physical premise permits player memory, but the digital presentation must distinguish publicly established information from unknown possibilities. Record this in the observed-game gauntlet; do not call every strategic surface accepted.

APP-05's publicly empty Trade recipient issue was independently identified in the application audit and assigned to the systems author with pre-correction tests. No further reducer blocker was established in this source pass. This is a review of the named modules, not a line-coverage guarantee or visual sign-off.
