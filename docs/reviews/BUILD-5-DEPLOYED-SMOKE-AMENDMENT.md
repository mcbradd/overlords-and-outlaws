# Deployed smoke migration

Written before smoke implementation, 17 September2026. I13/V03 require actual current-runtime checks while preserving historical regressions.

S01: Add a core Pages smoke that reads revision.json, verifies expected source SHA/build/Prod branch when supplied, checks the visible badge, then runs the legal scripted tutorial and all core fixture/input checks at1440×900 and390×844 against the served site. Record actual served asset hashes and preserve each manifest. This is regression evidence, never the blind learner.

S02: Retain the existing History Pages smoke on the explicit archive route. Run the new core smoke after the built preview is available in the release inventory. Both nonzero statuses block Main release; Prod evaluation remains distinct from release approval.

S03: Verify the actual deployed site with CUA after deployment identity matches. Spawn the independent screen-only learner separately; do not give that learner fixture IDs, private state, source or tutorial solutions.
