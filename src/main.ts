// One versioned adapter; the old game remains isolated and explicitly labeled.
import './build-identity';
if (new URLSearchParams(location.search).get("legacy") === "1") {
  document.title = "Overlords & Outlaws · Legacy combat game";
  void import("./legacy-main");
} else {
  void import('./history-engine/viewport');
  void import("./history-engine/app");
}
