# Tutorial popover — Build 10

The user rejected persistent tutorial instructions in the top bar. The tutorial now uses the ordinary table, Table menu, Court navigation, inspection, camera and contextual card controls. The taught legal action is still highlighted and constrained by the existing deterministic lesson.

A navy/gold popover shows the current explanation and a preview of the relevant card. Close, Let me play, Escape or a backdrop click dismiss it without changing the game. A 44px circled question mark in the header reopens the current instruction. It never advances a cursor or commits an action.

Consecutive draft selections share one popover per pass/seat. Later completed actions advance to the next instruction automatically. Rival actions pause while a modal is open, then run on the ordinary table after dismissal. There are no separate Watch or Continue controls in a tutorial top bar. Older saved lessons at a completed boundary retain a cursor-only Next step in the popover.

Verification includes full legal tutorial completion at 1440×900, 390×844 and 844×390, reopening/dismissal state equality, Escape, grouped picks, keyboard/touch first selections and storage-denial behavior. The required 2/3/4-player desktop/compact opening/action/dense/focus matrix also runs. Generated screenshots are reviewed separately; they are not human playtesting.

Visual inspection confirmed readable popup text, visible dismissal, a clear question-mark control, and an unobstructed standard table when dismissed. Landscape testing exposed a contextual action menu covering a legal destination. Once an action is armed, its menu now hides so the target can be selected; Escape restores the unarmed controls. This behavior is shared by ordinary play.

Evidence is under artifacts/core/tutorial-popover, artifacts/core/build10-counts and the deployed Build 10 reports. No rule, card-art or Main release change is included.
