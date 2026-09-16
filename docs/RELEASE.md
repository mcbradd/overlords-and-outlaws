# Live and prod

The source repository is `mcbradd/overlords-and-outlaws`.

| Branch | Purpose                                                  | Site                                                  |
| ------ | -------------------------------------------------------- | ----------------------------------------------------- |
| `main` | Frozen Live game; releases only on explicit user command | https://mcbradd.github.io/overlords-and-outlaws/      |
| `prod` | Ongoing development, testing and evaluation              | https://mcbradd.github.io/overlords-and-outlaws-prod/ |

The preserved Live baseline is `1170dfae963bb2dd33747fffbcd22c9670fc4971`.
GitHub Pages supports one site per repository. The separate
`mcbradd/overlords-and-outlaws-prod` repository holds only built static files on
`gh-pages`. The prod deployment key grants write access only to that repository.
Source changes stay in `prod`; deployment never merges into Main.
Prod builds use `VITE_SAVE_NAMESPACE=prod:` because both Pages sites share browser
storage on the same origin. Live retains its existing save keys.

## Routine work

Work in `prod`, or merge feature branches into `prod`. Push `prod` for evaluation.
The prod workflow requires the build, unit and UI tests before publishing. The
full release suite runs separately so evaluation builds can expose unresolved
regressions. A working prod site is not a release approval.

`npm run test:release` runs the complete verification inventory in
`scripts/release-suite.mjs`: build, unit/UI suites, regression scripts, simulation,
decision audit, balance soak, browser interactions, complete playthroughs with
and without motion, card/portrait/layout probes, and screenshot capture.
Use Node 22.12+ and installed Chrome (`npx playwright install --with-deps chrome`
in Linux CI). Ports 5173–5176 and 4176 must be free. Reports and logs go under
`artifacts/release/`; CI uploads all artifacts even on failure. Each check has a
timeout and a nonzero result blocks release. Retained probes are included; stale
selectors must be repaired and rerun, never silently ignored. Add newly
implemented checks to this inventory before promotion.

## Promotion: only after an explicit user command

1. Record the user's explicit command to promote prod to Main. Requests to push,
   commit, deploy prod, or evaluate are not that command. Keep Main locked until
   the following evidence passes. Never enable auto-merge.
2. Fetch both branches and pin the candidate prod SHA and current Main SHA. The
   candidate must contain Main. Resolve conflicts on prod and restart validation
   if either revision changes. Open a prod-to-main PR only as part of this
   authorized promotion.
3. Require the `release-suite` GitHub check to pass for the candidate/PR merge
   revision. All unit, regression, probes, soak and visual automation must pass;
   infrastructure failures, missing checks, timeouts and skipped checks block
   promotion. Any source change invalidates earlier evidence.
4. Actually open the rendered opening, an action, dense courts and compact-screen
   screenshots, plus the card proofs and any new visual probes. Follow the
   physical-game direction and tutorial contract. Record inspected files,
   dimensions, findings, reviewer and candidate SHA in the release evidence.
   Fix failures on prod and rerun. Screenshot generation alone is not inspection.
5. Only after a real passing inspection, publish the commit status
   `release/visual-inspection=success` on the exact PR head SHA, with an evidence
   URL. Only a human or an agent that performed the inspection may set it. Keep
   this status out of automatic workflows.
6. Recheck user authorization, both SHAs, all required checks and the visual
   status. Temporarily unlock Main while preserving its required checks, PR
   requirement, administrator enforcement and force-push/deletion restrictions.
   Merge the reviewed PR using the pinned head SHA; never bypass required checks.
   Relock Main immediately, including if the merge fails. Do not change Main's
   default branch identity or the Live Pages source.
7. Wait for Live Pages deployment to succeed and run `scripts/pages-smoke.mjs`
   against the Live URL using `BASE_URL`. Return to prod for subsequent work.
   Report deployment and smoke results; any rollback also needs explicit user
   authorization and validation of the rollback candidate.

Main protection requires `release-suite` and `release/visual-inspection`, applies
to administrators, requires a PR, blocks force pushes and deletion, and locks the
branch between releases. Repository administrators can change GitHub settings;
the explicit-command rule governs those changes as well.

## Deployment administration

`prod-pages.yml` publishes only when the ref is `refs/heads/prod` and uses the
`PROD_PAGES_DEPLOY_KEY` secret. The target repository serves `gh-pages` at `/`.
Its `revision.json` identifies the source SHA. The Live workflow on prod is
guarded to run only on Main after a future authorized promotion. Main's existing
workflow and source remain untouched during setup; its GitHub Pages environment
must allow only Main so manually dispatching the old workflow on prod cannot
replace Live.
