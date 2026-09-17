import { verifyHistoryFaces } from "./history-face-geometry";

// Current faces paint fixed card geometry. Checking old .h-card-ink rectangles
// would silently inspect zero fields. Verify all 92 sources in both formats,
// every real glyph bound, complete operative text, and exact DOM canvas pixels.
await verifyHistoryFaces("artifacts/card-language");
