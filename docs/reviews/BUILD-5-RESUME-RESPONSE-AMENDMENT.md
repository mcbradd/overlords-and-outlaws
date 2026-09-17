# Build 5 resume and response correction

Written before correction implementation, 17 September 2026. This extends I08/I09 and the viewport gates; no rule changes.

- R01: Validate tutorial saves against the complete deterministic legal prefix at the saved cursor, including whether its action has resolved. Reject mismatched cursors, outcomes and altered states without overwriting original bytes. Test every pre-action and post-action tutorial boundary, plus mismatches and reordered JSON keys. Replace the existing invalid round-trip fixture with a reached state.
- R02: On compact layouts, put an incoming Trade decision before the private hand because the response requires no hand selection. Both response buttons and their confirmation must be fully visible at 390×844 and 375×667. Inspect actual screenshots; preserve readable 16px explanation text and 44px controls.
- R03: Preserve primary-button foreground/background contrast when hovered, focused and active. Actually inspect the highlighted tutorial confirmation at both phone sizes and desktop. The prior gold background was overwritten by the more-specific generic hover selector while retaining dark text.

Completion requires unit/type checks and a new stable-preview visual regression. Previous failed captures remain evidence.
