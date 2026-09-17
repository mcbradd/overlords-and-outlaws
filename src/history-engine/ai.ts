import { dynastyOf, nameOf, noble, program } from "./content";
import { hash } from "./compiler";
import { crownDependencies, legalActions, nativeIds } from "./rules";
import type { Action, GameView, Seat } from "./types";

export interface Decision {
  action: Action;
  reason: string;
  considered: number;
  policyVersion: string;
}
const cardValue = (v: GameView, seat: Seat, id: string) =>
  dynastyOf(id) === v.players[seat].dynasty
    ? 5 + (noble(id).printed.queen ? 2 : 0)
    : v.players.some((p) => p.seat !== seat && p.dynasty === dynastyOf(id))
      ? 3
      : 2;
function score(v: GameView, a: Action): [number, string] {
  const p = v.players[a.seat];
  const id = a.card ?? "";
  const n = nativeIds(v, a.seat).length;
  switch (a.type) {
    case "setup-lock": {
      const cards = a.cards!;
      if (v.setup?.step === "declare")
        return [
          10 + cards.filter((c) => noble(c).printed.queen).length,
          "Declare a trio with a marriage option.",
        ];
      const keep = (p.hand ?? []).filter((c) => !cards.includes(c));
      const counts = v.modules.map(
        (d) => keep.filter((c) => dynastyOf(c) === d).length,
      );
      return [
        Math.max(...counts) * 4 +
          keep.filter((c) => noble(c).printed.queen).length,
        "Keep a coherent Dynasty and marriage access.",
      ];
    }
    case "repair":
      return [
        -(noble(id).printed.queen ? 2 : 0),
        "Repair the verified declaration without losing useful marriage access.",
      ];
    case "ruler":
      return [
        noble(id).printed.queen ? 0 : 3,
        "Keep a Queen free to sponsor a foreign heir.",
      ];
    case "choice": {
      const kind = v.choices?.effect;
      const cid = a.cards?.[0];
      if (!cid) return [0, "No selection is required."];
      if (kind === "break-marriage")
        return [0, "Resolve the simultaneous marriage choice."];
      const important = [
        ...(v.crown?.heirs ?? []),
        v.crown?.witness,
        v.crown?.successor,
      ].includes(cid);
      return [
        kind === "succession" || kind === "interim"
          ? noble(cid).printed.queen
            ? 1
            : 3
          : -cardValue(v, a.seat, cid) - (important ? 10 : 0),
        "Resolve the mandatory choice while preserving the exposed succession.",
      ];
    }
    case "counterclaim":
      return [
        50,
        "A matching concealed Noble and seal preserve this Overlord.",
      ];
    case "decline":
      return [0, "No affordable Counterclaim is available."];
    case "barter-packet":
      return [
        -a.cards!.reduce((sum, c) => sum + cardValue(v, a.seat, c), 0),
        "Offer concealed people with the least immediate use to this Court.",
      ];
    case "barter-inspect":
      return [
        a.accept ? 5 : 0,
        "Inspect only after both locked packets are authorized.",
      ];
    case "barter-decide": {
      const b = v.barter!;
      const other = a.seat === b.initiator ? b.recipient : b.initiator;
      const gain =
        (b.packets[other] ?? []).reduce(
          (sum, c) => sum + cardValue(v, a.seat, c),
          0,
        ) -
        (b.packets[a.seat] ?? []).reduce(
          (sum, c) => sum + cardValue(v, a.seat, c),
          0,
        );
      return [
        (a.accept ? gain >= 0 : gain < 0) ? 8 : 0,
        "Evaluate the inspected exchange for this seat independently.",
      ];
    }
    case "barter-cancel":
      return [-10, "Cancel without paying a seal."];
    case "proclaim":
      return [
        a.route === "regency" ? 17 : 25,
        "Expose a lawful succession and begin the full public contest.",
      ];
    case "claim": {
      const c = v.crown;
      const dependency =
        c &&
        c.seat !== a.seat &&
        [c.oldRuler, c.successor, ...crownDependencies(v)].includes(a.target!);
      return [
        dependency ? 32 : dynastyOf(a.target!) === p.dynasty ? 12 : 4,
        dependency
          ? "Disrupt an exact exposed Crown dependency."
          : "Acquire a person through a matching printed Dynasty.",
      ];
    }
    case "build":
      return [
        n < 3 ? 16 : n < 5 ? 7 : 2,
        "Build native support while keeping some relatives concealed.",
      ];
    case "marry":
      return [
        p.dynasty === "habsburg" ? 18 : 10,
        "A native Queen admits a foreign person through a visible dependency.",
      ];
    case "attack":
      return [
        program(a.event!).restrictions.includes("succession") &&
        v.crown?.seat === a.seat
          ? 30
          : 11,
        "Fill a distinct persistent Attack space before its consequence.",
      ];
    case "address":
      return [
        9,
        "Contribute public evidence toward averting or ending this event.",
      ];
    case "veil": {
      const f = v.fragments.find((f) => f.id === a.target)!;
      const pressure = v.fragments.filter(
        (x) => x.dynasty === f.dynasty && !x.veil,
      ).length;
      return [
        pressure >= 5
          ? 36 - cardValue(v, a.seat, id)
          : pressure >= 4 && v.crown?.seat === a.seat
            ? 20
            : -20,
        "Sacrifice one specific Outlaw to keep the painting incomplete through the next round.",
      ];
    }
    case "petition":
      return [
        (p.hand?.length ?? 0) < 2 ? 14 : 3,
        "Pay a seal for another concealed option.",
      ];
    case "withdraw":
      return [-8, "Withdraw only when abandoning this public role is useful."];
    case "barter":
      return [
        1 - a.cards!.reduce((sum, c) => sum + cardValue(v, a.seat, c), 0) / 10,
        "Offer a bounded exchange without assuming the other hand.",
      ];
    case "pass":
      return [
        p.seals === 1 && v.crown?.seat === a.seat ? 13 : 0,
        "Reserve a response; a later committed action lets this seat act again.",
      ];
    default:
      return [0, "Take a legal political action."];
  }
}
export function chooseAction(v: GameView, seat: Seat): Decision | null {
  let actions = legalActions(v, seat);
  if (!actions.length) return null;
  // Stable bounded offer search. Observation history prevents repeating a refused
  // offer within the same opportunity, including after reload.
  const lastDecline = [...v.events]
    .reverse()
    .find((e) => e.type === "BarterDeclined");
  const lastAction = [...v.events]
    .reverse()
    .find((e) =>
      [
        "Passed",
        "NobleBuilt",
        "ClaimAnnounced",
        "RoundOpened",
        "BarterCompleted",
      ].includes(e.type),
    );
  if (lastDecline && (!lastAction || lastDecline.seq > lastAction.seq))
    actions = actions.filter((a) => a.type !== "barter");
  let offers = 0;
  actions = actions.filter(
    (a) => a.type !== "barter" || offers++ < v.policy.budget,
  );
  const rated = actions
    .map((action) => {
      const [value, reason] = score(v, action);
      const tie =
        parseInt(
          hash({
            revision: v.revision,
            seat,
            action,
            observations: v.observations,
          }),
          16,
        ) / 4294967296;
      return { action, reason, value: value + tie / 10 };
    })
    .sort((a, b) => b.value - a.value);
  return {
    action: rated[0].action,
    reason: rated[0].reason,
    considered: actions.length,
    policyVersion: v.policy.version,
  };
}
