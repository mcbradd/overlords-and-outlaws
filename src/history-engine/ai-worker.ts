import { chooseAction } from "./ai";
import type { GameView } from "./types";

// Only a seat projection crosses this boundary. The worker never receives a
// full save, the shuffle seed, or another player's concealed identities.
self.onmessage = (event: MessageEvent<{ view: GameView; seat: number }>) => {
  self.postMessage(chooseAction(event.data.view, event.data.seat));
};
