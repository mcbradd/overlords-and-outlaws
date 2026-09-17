const D = (e) => `./${e.replace(/^\/+/, "")}`, le = [
  { id: "alba", name: "Alba", region: "SCOTLAND", motto: "From stone, a kingdom.", color: "#6fa997", emblem: "✥", trait: "Stone & steel", description: "Your Founder grants 2 protection instead of 1 when declared or built. Survive the storm, then rise.", leader: "Kenneth MacAlpin" },
  { id: "plantagenet", name: "Plantagenet", region: "ENGLAND & AQUITAINE", motto: "The lion does not kneel.", color: "#d6a357", emblem: "♜", trait: "Lionheart", description: "A Warlord in your hand can seize with any other card. Hidden force becomes an unexpected claim.", leader: "Eleanor of Aquitaine" },
  { id: "tudor", name: "Tudor", region: "ENGLAND", motto: "A crown worth any secret.", color: "#c27979", emblem: "❀", trait: "The hidden court", description: "Your Intriguers may betray any unprotected rival, even without a marriage. Secrets cross every border.", leader: "Elizabeth I" },
  { id: "valois", name: "Valois", region: "FRANCE", motto: "Power is an art.", color: "#929bc8", emblem: "⚜", trait: "Patron of the arts", description: "Each Lawgiver you build veils one fragment of Eudoxia’s most complete painting. Patronage buys time.", leader: "Francis I" },
  { id: "habsburg", name: "Habsburg", region: "AUSTRIA & EUROPE", motto: "Let others wage war.", color: "#c6b588", emblem: "♛", trait: "The marriage empire", description: "Each living marriage grants 1 additional authority. Alliances can win a crown—and lose it.", leader: "Maria Theresa" },
  { id: "bourbon", name: "Bourbon", region: "FRANCE", motto: "All roads lead to the sun.", color: "#79a6c4", emblem: "☀", trait: "The sun court", description: "Your declared Founder grants 1 additional authority. A brilliant court is a tempting target.", leader: "Louis XIV" }
], ce = {
  alba: [["Kenneth MacAlpin", "Founder", "The first claim"], ["St Margaret", "Queen", "A kingdom’s conscience"], ["Malcolm III", "Warlord", "Canmore"], ["David I", "Lawgiver", "The reforming king"], ["William the Lion", "Warlord", "The lion of Scotland"], ["Alexander II", "Royal", "Keeper of the border"], ["Alexander III", "Royal", "The golden peace"], ["Robert the Bruce", "Warlord", "The unbroken claim"], ["Marjorie Bruce", "Queen", "Bridge of bloodlines"], ["Robert II", "Intriguer", "A new succession"], ["Duncan I", "Royal", "The contested throne"], ["Donald II", "Royal", "The northern crown"], ["Constantine II", "Lawgiver", "Keeper of the realm"], ["Matilda of Scotland", "Queen", "The joining of crowns"]],
  plantagenet: [["Henry II", "Founder", "An empire inherited"], ["Eleanor of Aquitaine", "Queen", "The lioness"], ["Richard I", "Warlord", "The Lionheart"], ["John", "Intriguer", "The disputed king"], ["Henry III", "Royal", "The patient crown"], ["Edward I", "Warlord", "The long shadow"], ["Edward II", "Royal", "A fragile inheritance"], ["Edward III", "Warlord", "The claim across the sea"], ["Philippa of Hainault", "Queen", "The steadfast court"], ["Richard II", "Intriguer", "The gilded throne"], ["Edward the Black Prince", "Warlord", "The warrior heir"], ["Joan of Kent", "Queen", "A marriage of consequence"], ["Geoffrey of Anjou", "Lawgiver", "The planted broom"], ["Isabella of France", "Queen", "The she-wolf"]],
  tudor: [["Henry VII", "Founder", "The rose united"], ["Elizabeth I", "Queen", "The sovereign rose"], ["Henry VIII", "Warlord", "The king’s great matter"], ["Mary I", "Queen", "A crown reclaimed"], ["Edward VI", "Lawgiver", "The young reformer"], ["Elizabeth of York", "Queen", "Two roses, one crown"], ["Margaret Beaufort", "Intriguer", "The king’s mother"], ["Edmund Tudor", "Royal", "An uncertain beginning"], ["Jasper Tudor", "Warlord", "The loyal uncle"], ["Margaret Tudor", "Queen", "The northern marriage"], ["Mary Tudor of France", "Queen", "The French marriage"], ["Arthur Tudor", "Royal", "The lost prince"], ["Owen Tudor", "Intriguer", "The hidden beginning"], ["Catherine of Aragon", "Queen", "The enduring claim"]],
  valois: [["Philip VI", "Founder", "The branch becomes the tree"], ["Francis I", "Warlord", "The Renaissance king"], ["Catherine de’ Medici", "Queen", "The patient web"], ["Charles V", "Lawgiver", "The wise king"], ["Charles VII", "Royal", "The crown restored"], ["Louis XI", "Intriguer", "The universal spider"], ["Henry II", "Warlord", "The tournament crown"], ["Charles IX", "Royal", "The fractured court"], ["Henry III", "Intriguer", "The last Valois"], ["Marguerite de Valois", "Queen", "Between two houses"], ["Louis XII", "Lawgiver", "Father of the people"], ["Claude of France", "Queen", "The Breton inheritance"], ["Isabeau of Bavaria", "Queen", "The contested regency"], ["John II", "Royal", "The captive king"]],
  habsburg: [["Rudolf I", "Founder", "The eagle ascends"], ["Maria Theresa", "Queen", "The unbroken empress"], ["Maximilian I", "Lawgiver", "The last knight"], ["Charles V", "Warlord", "A world of crowns"], ["Philip I", "Royal", "The handsome heir"], ["Ferdinand I", "Lawgiver", "The divided inheritance"], ["Philip II", "Intriguer", "The patient sovereign"], ["Anna of Austria", "Queen", "A marriage of empires"], ["Margaret of Austria", "Queen", "The governing aunt"], ["Ferdinand II", "Warlord", "The iron confession"], ["Leopold I", "Royal", "The eastern shield"], ["Charles VI", "Lawgiver", "The pragmatic claim"], ["Joseph II", "Lawgiver", "The impatient reformer"], ["Mary of Hungary", "Queen", "The governing sister"]],
  bourbon: [["Henry IV", "Founder", "A kingdom reconciled"], ["Louis XIV", "Royal", "The Sun King"], ["Louis XIII", "Warlord", "The crown consolidated"], ["Anne of Austria", "Queen", "The queen regent"], ["Louis XV", "Royal", "The beloved"], ["Louis XVI", "Lawgiver", "The final inheritance"], ["Marie Antoinette", "Queen", "The gilded cage"], ["Marie de’ Medici", "Queen", "The regent’s ambition"], ["Philippe of Orléans", "Intriguer", "The brother’s court"], ["Louis II de Condé", "Warlord", "The Great Condé"], ["Antoine of Bourbon", "Royal", "The Navarre claim"], ["Jeanne d’Albret", "Queen", "The sovereign of Navarre"], ["Philip V of Spain", "Royal", "A crown beyond the mountains"], ["Louis XVIII", "Intriguer", "The restoration"]]
}, de = le.flatMap((e) => ce[e.id].map(([t, r, a], l) => ({ id: `${e.id}-${l}`, house: e.id, name: t, role: r, epithet: a, art: e.id }))), he = {
  "alba-0": "art/characters/alba-0-v1.webp",
  "alba-1": "art/characters/alba-1-v1.webp",
  "alba-2": "art/characters/alba-2-v2.webp",
  "alba-3": "art/characters/alba-3-v2.webp",
  "alba-4": "art/characters/alba-4-v1.webp",
  "alba-5": "art/characters/alba-5-v2.webp",
  "alba-6": "art/characters/alba-6-v2.webp",
  "alba-7": "art/characters/alba-7-v1.webp",
  "alba-8": "art/characters/alba-8-v1.webp",
  "alba-9": "art/characters/alba-9-v1.webp",
  "alba-10": "art/characters/alba-10-v2.webp",
  "alba-11": "art/characters/alba-11-v1.webp",
  "alba-12": "art/characters/alba-12-v1.webp",
  "alba-13": "art/characters/alba-13-v1.webp",
  "plantagenet-0": "art/characters/plantagenet-0-v1.webp",
  "plantagenet-1": "art/characters/plantagenet-1-v1.webp",
  "plantagenet-2": "art/characters/plantagenet-2-v1.webp",
  "plantagenet-3": "art/characters/plantagenet-3-v1.webp",
  "plantagenet-4": "art/characters/plantagenet-4-v2.png",
  "plantagenet-5": "art/characters/plantagenet-5-v2.png",
  "plantagenet-6": "art/characters/plantagenet-6-v1.webp",
  "plantagenet-7": "art/characters/plantagenet-7-v1.webp",
  "plantagenet-8": "art/characters/plantagenet-8-v1.webp",
  "plantagenet-9": "art/characters/plantagenet-9-v1.webp",
  "plantagenet-10": "art/characters/plantagenet-10-v1.webp",
  "plantagenet-11": "art/characters/plantagenet-11-v1.webp",
  "plantagenet-12": "art/characters/plantagenet-12-v1.webp",
  "plantagenet-13": "art/characters/plantagenet-13-v1.webp",
  "tudor-0": "art/characters/tudor-0-v2.webp",
  "tudor-1": "art/characters/tudor-1-v1.webp",
  "tudor-2": "art/characters/tudor-2-v1.webp",
  "tudor-3": "art/characters/tudor-3-v1.webp",
  "tudor-4": "art/characters/tudor-4-v1.webp",
  "tudor-5": "art/characters/tudor-5-v1.webp",
  "tudor-6": "art/characters/tudor-6-v1.webp",
  "tudor-7": "art/characters/tudor-7-v1.webp",
  "tudor-8": "art/characters/tudor-8-v1.webp",
  "tudor-9": "art/characters/tudor-9-v1.webp",
  "tudor-10": "art/characters/tudor-10-v1.webp",
  "tudor-11": "art/characters/tudor-11-v1.webp",
  "tudor-12": "art/characters/tudor-12-v1.webp",
  "tudor-13": "art/characters/tudor-13-v1.webp",
  "valois-0": "art/characters/valois-0-v1.webp",
  "valois-1": "art/characters/valois-1-v1.webp",
  "valois-2": "art/characters/valois-2-v1.webp",
  "valois-3": "art/characters/valois-3-v1.webp",
  "valois-4": "art/characters/valois-4-v1.webp",
  "valois-5": "art/characters/valois-5-v1.webp",
  "valois-6": "art/characters/valois-6-v1.webp",
  "valois-7": "art/characters/valois-7-v1.webp",
  "valois-8": "art/characters/valois-8-v1.webp",
  "valois-9": "art/characters/valois-9-v1.webp",
  "valois-10": "art/characters/valois-10-v1.webp",
  "valois-11": "art/characters/valois-11-v1.webp",
  "valois-12": "art/characters/valois-12-v1.webp",
  "valois-13": "art/characters/valois-13-v1.webp",
  "habsburg-0": "art/characters/habsburg-0-v1.webp",
  "habsburg-1": "art/characters/habsburg-1-v1.webp",
  "habsburg-2": "art/characters/habsburg-2-v1.webp",
  "habsburg-3": "art/characters/habsburg-3-v1.webp",
  "habsburg-4": "art/characters/habsburg-4-v1.webp",
  "habsburg-5": "art/characters/habsburg-5-v1.webp",
  "habsburg-6": "art/characters/habsburg-6-v1.webp",
  "habsburg-7": "art/characters/habsburg-7-v1.webp",
  "habsburg-8": "art/characters/habsburg-8-v1.webp",
  "habsburg-9": "art/characters/habsburg-9-v1.webp",
  "habsburg-10": "art/characters/habsburg-10-v1.webp",
  "habsburg-11": "art/characters/habsburg-11-v1.webp",
  "habsburg-12": "art/characters/habsburg-12-v1.webp",
  "habsburg-13": "art/characters/habsburg-13-v1.webp",
  "bourbon-0": "art/characters/bourbon-0-v1.webp",
  "bourbon-1": "art/characters/bourbon-1-v1.webp",
  "bourbon-2": "art/characters/bourbon-2-v1.webp",
  "bourbon-3": "art/characters/bourbon-3-v1.webp",
  "bourbon-4": "art/characters/bourbon-4-v1.webp",
  "bourbon-5": "art/characters/bourbon-5-v1.webp",
  "bourbon-6": "art/characters/bourbon-6-v1.webp",
  "bourbon-7": "art/characters/bourbon-7-v1.webp",
  "bourbon-8": "art/characters/bourbon-8-v1.webp",
  "bourbon-9": "art/characters/bourbon-9-v1.webp",
  "bourbon-10": "art/characters/bourbon-10-v1.webp",
  "bourbon-11": "art/characters/bourbon-11-v1.webp",
  "bourbon-12": "art/characters/bourbon-12-v1.webp",
  "bourbon-13": "art/characters/bourbon-13-v1.webp"
}, U = "2.1.0", G = "2.1.0", ue = "2.0.0", fe = {
  attack: "Challenge spends 1 seal and turns 1 ready Court Noble in your Bloodline sideways. Each contribution needs a different Noble; players may cooperate.",
  commit: "Lend moves a hand Noble face up to Leverage. It returns to your hand at the next round start.",
  marriage: "Your Queen supports a foreign spouse. Both must be in your Court. Losing either breaks the marriage.",
  crown: "Claim the Crown, change Ruler after the printed wait, then keep the required people for the printed number of full rounds.",
  bloodline: "Your Bloodline is your Court Nobles of your Dynasty plus foreign Nobles married to your Queens. Hand Nobles are called Outlaws; Court Nobles are called Overlords."
}, B = {
  "seats-native": "Each player Lends 1 hand Noble of their Dynasty using Help.",
  attack: "Together, Challenge with 2 different ready Court Nobles in your Bloodline, one per action.",
  "restore-marriage": "At reveal, mark players with foreign Court Nobles outside their Bloodline. Each must Marry one of those Nobles.",
  "seats-rotate": "Each player turns 1 ready Court Noble of their Dynasty sideways using Help.",
  dynasties: "Together, Lend 2 hand Nobles of different Dynasties using Help, one per action.",
  "seats-any": "Each player Lends 1 hand Noble using Help.",
  "barter-or-veil": "Each player completes Trade or Cover after this is revealed. A Trade counts for both players.",
  "married-seats": "At reveal, mark players with marriages. Each marked player Lends 1 hand Noble using Help."
}, W = {
  proclaim: "No player may Claim the Crown.",
  "counterclaim-rotate": "To Block, also turn 1 ready Court Noble of your Dynasty sideways.",
  "petition-with-hand": "Use the Draw action only with an empty hand.",
  marry: "No player may Marry.",
  succession: "When a Crown claim must change Ruler, it fails. Lose that Crown claim; keep the current Ruler."
}, M = {
  "retire-supported": "Each player with a Ruler chooses 1 other Court Noble in their Bloodline, if able. Retire those Nobles to The Past together.",
  "return-unsupported": "Return all foreign Court Nobles outside their Bloodlines to their controllers' hands together.",
  "return-dependency": "The Crown holder chooses 1 Court Noble in their Bloodline other than their Ruler, if able. Return that Noble to their hand.",
  "return-native": "Each player chooses 1 Court Noble of their Dynasty other than their Ruler, if able. Return those Nobles to their controllers' hands together.",
  history: "Reveal 1 extra History card.",
  "break-marriage": "Each player chooses 1 marriage they control, if able. Break those marriages together.",
  "commit-unmarried": "Each player with no marriage chooses 1 hand Noble, if able. Lend those Nobles together. These loans do not count as Help.",
  "blood-edict": "Each player chooses 1 Court Noble whose Dynasty matches a rival's Court Noble. Retire the chosen Nobles together."
}, F = [
  ["build", "Recruit: Move from hand to Court if this Noble matches your Dynasty."],
  ["claim", "Recall: Lend from hand to take a rival's Court Noble of this Dynasty unless Blocked."],
  ["counterclaim", "Block: Lend from hand to stop a Recall of this Dynasty."],
  ["barter", "Trade from your hand."],
  ["commit", "Lend from hand when a Crisis asks."],
  ["veil", "Cover: Discard from hand to cover a painting piece."]
], O = [
  ["withdraw", "Withdraw: Return from Court to hand."],
  ["attack", "Challenge: Turn sideways if ready and in your Bloodline."]
], Q = "Marry: Pair this unmarried Court Queen of your Dynasty with an unmarried foreign Noble from your hand or Court.", $ = "Pay 1 seal; Trade only if accepted.", j = "Starts at round end unless prevented.", q = "Earlier help still counts.", N = "Fail: Lose the Crown if a required Noble or marriage is lost.", re = "Choose a different Court Noble of your Dynasty, not your Ruler, as Witness.", V = {
  "any-heir": "Keep your Ruler and at least 1 named heir until the Ruler changes.",
  heir: "Keep your Ruler and hidden heir until the Ruler changes.",
  "heir-witness": "Keep your Ruler, heir and Witness until the Ruler changes.",
  "heir-marriage": "Keep your Ruler, heir and their marriage until the Ruler changes."
}, ae = ["the next round", "the second round after this one", "the third round after this one"];
function I(e) {
  const t = e.heir, r = t.zone === "hand" ? "Choose " + t.count + " hand Noble of your Dynasty as heir. Set the heir aside face down." : t.zone === "marriage" ? "Choose " + t.count + " foreign Court Noble married to your Queen as heir. The Queen must be of your Dynasty, not your Ruler." : "Choose " + t.count + " other Court Noble" + (t.count === 1 ? "" : "s") + " of your Dynasty" + (t.differentBranches ? " from different branches" : "") + " as heir" + (t.count === 1 ? "" : "s") + ".", a = e.witness === "native" ? "your new Ruler and Witness in your Bloodline" : e.witness === "marriage" ? "your new Ruler in your Bloodline and the same marriage intact" : "your new Ruler in your Bloodline";
  return [
    "Claim the Crown: Have " + e.entryNatives + " Court Nobles of your Dynasty, including your Ruler.",
    r,
    e.witness === "native" ? re : "",
    V[e.keep],
    "At the start of " + ae[e.successionAfter - 1] + ": " + (t.zone === "hand" ? "Reveal your heir. " : "") + "Retire your Ruler. Crown a remaining named heir.",
    "Win: Keep " + a + " for " + e.reignRounds + " full round" + (e.reignRounds === 1 ? "" : "s") + ".",
    N + (t.zone === "hand" ? " Return any hidden heir face up to your hand." : "")
  ].filter(Boolean).join(`
`);
}
const ge = {
  kindreds: I({
    entryNatives: 3,
    heir: { count: 2, zone: "court", native: !0, differentBranches: !0 },
    witness: null,
    keep: "any-heir",
    successionAfter: 1,
    reignRounds: 1
  }),
  charter: I({
    entryNatives: 3,
    heir: { count: 1, zone: "court", native: !0, differentBranches: !1 },
    witness: "native",
    keep: "heir-witness",
    successionAfter: 1,
    reignRounds: 1
  }),
  act: I({
    entryNatives: 3,
    heir: { count: 1, zone: "hand", native: !0, differentBranches: !1 },
    witness: null,
    keep: "heir",
    successionAfter: 1,
    reignRounds: 1
  }),
  marriage: I({
    entryNatives: 3,
    heir: {
      count: 1,
      zone: "marriage",
      native: !1,
      differentBranches: !1
    },
    witness: "marriage",
    keep: "heir-marriage",
    successionAfter: 1,
    reignRounds: 1
  })
};
function z(e) {
  const t = typeof e == "string" ? e : JSON.stringify(e);
  let r = 2166136261;
  for (let a = 0; a < t.length; a++)
    r = Math.imul(r ^ t.charCodeAt(a), 16777619);
  return (r >>> 0).toString(16).padStart(8, "0");
}
const _ = z({
  CONDITIONS: B,
  RESTRICTIONS: W,
  EFFECTS: M,
  LAWS: ge,
  nobleHand: F,
  nobleCourt: O,
  marriageClause: Q,
  costClause: $,
  activationClause: j,
  carryClause: q,
  keepClauses: V,
  failureClause: N
});
class J extends Error {
  constructor(t) {
    super(
      t.map(
        (r) => r.filename + ":" + r.line + ":" + r.column + " " + r.code + " " + r.text
      ).join(`
`)
    ), this.diagnostics = t;
  }
  diagnostics;
}
const x = (e) => Object.entries(e);
function P(e) {
  return e.condition ? ["attack", "dynasties"].includes(e.condition) ? B[e.condition].replace("2", String(e.requiredContributions)) : B[e.condition] : "";
}
function be(e, t) {
  if (t === "noble") {
    const r = (a) => e.abilities?.includes(a[0]);
    return [
      $,
      ...[...F, ...O].filter(r).map(([, a]) => a),
      e.abilities?.includes("marry") ? Q : ""
    ].filter(Boolean).join(`
`);
  }
  return t === "law" && e.law ? I(e.law) : e.fragment ? "Reveal: Place this fragment in slot " + e.fragment + ` of its painting.
If ` + e.fragmentGoal + " fragments of this painting are uncovered, Eudoxia wins immediately. All players lose." : [
    e.condition ? "Prevent: " + P(e) : "",
    j,
    ...e.restrictions.map((r) => "While active: " + W[r]),
    ...e.instructions.map(
      (r) => (r.timing === "activation" ? "When this starts" : "At round start") + ": " + M[r.effect]
    ),
    e.end ? e.end === "attack" ? "End early: " + P(e) : "End early: Complete the Prevent condition." : "",
    e.carry ? q : "",
    e.expiry === "immediate" ? "Then end this event." : e.expiry === "next-end" ? "Ends at round end, after " + e.expiryAfter + " more round" + (e.expiryAfter === 1 ? "" : "s") + "." : ""
  ].filter(Boolean).join(`
`);
}
function me(e, t = "src/history-engine/content.ts") {
  const r = [], a = (n, s, g = 1, d = "Use a supported clause and explicit game terms.") => r.push({
    code: n,
    severity: "error",
    contentId: e.id,
    filename: t,
    line: g,
    column: 1,
    text: s,
    suggestion: d
  }), l = (n, s, g, d, b) => {
    const p = Number(n);
    return (!Number.isInteger(p) || p < s || p > g) && a(
      "CT004",
      d + " must be an integer from " + s + " to " + g + ".",
      b
    ), p;
  };
  for (const n of e.reminderRefs)
    fe[n] || a("CT012", "Unknown reminder: " + n);
  const c = e.cardText.trim(), i = c.split(`
`);
  c || a("CT011", "Every card needs executable Card Text."), ["alba", "plantagenet", "tudor", "habsburg"].includes(
    e.printed.dynasty
  ) || a("CT016", "This Dynasty is not in the core ruleset."), /\b(health|damage|gold|mana|Rank III|authority|power total)\b/i.test(c) && a("CT010", "Combat statistics are not part of this ruleset."), /\b(some|several|a few)\b/.test(c) && a("CT004", "Use an exact quantity."), /Discard (an? |the )?(Overlord|Court Noble)/i.test(c) && a("CT002", "Only hand cards may be discarded."), /from The Past|refresh.*seal/i.test(c) && a(
    "CT009",
    "The Past is permanent and seals refresh only at round start."
  ), /change.*printed Dynasty/i.test(c) && a("CT005", "Printed Dynasty is immutable.");
  const o = {
    restrictions: [],
    instructions: [],
    carry: !1,
    requiredContributions: 2,
    expiryAfter: 1
  };
  if (e.kind === "noble") {
    o.abilities = [];
    let n = !1;
    i.forEach((s, g) => {
      if (s === $ && !n) {
        n = !0;
        return;
      }
      if (s === Q && !o.abilities.includes("marry")) {
        o.abilities.push("marry");
        return;
      }
      const d = [...F, ...O].find(([, b]) => b === s)?.[0];
      !d || o.abilities.includes(d) ? a("CT001", "Unknown or repeated Noble instruction: " + s, g + 1) : o.abilities.push(d);
    }), (!n || !o.abilities.length) && a("CT006", "A Noble needs the action cost and at least one action."), (typeof e.printed.queen != "boolean" || typeof e.printed.founder != "boolean" || e.printed.dynasty === "alba" && !e.printed.branch) && a("CT015", "Missing printed role or branch.");
  } else if (e.kind === "law") {
    const n = {};
    let s = !1, g = !1, d = !1, b = !1, p;
    if (i.forEach((h, m) => {
      const u = m + 1;
      let f;
      (f = /^Claim the Crown: Have (\d+) Court Nobles of your Dynasty, including your Ruler\.$/.exec(
        h
      )) && n.entryNatives === void 0 ? n.entryNatives = l(f[1], 1, 6, "Entry Nobles", u) : (f = /^Choose (\d+) other Court Nobles? of your Dynasty( from different branches)? as heirs?\.$/.exec(
        h
      )) && !n.heir ? n.heir = {
        count: l(f[1], 1, 3, "Heirs", u),
        zone: "court",
        native: !0,
        differentBranches: !!f[2]
      } : (f = /^Choose (\d+) hand Noble of your Dynasty as heir\. Set the heir aside face down\.$/.exec(
        h
      )) && !n.heir ? n.heir = {
        count: l(f[1], 1, 1, "Hidden heirs", u),
        zone: "hand",
        native: !0,
        differentBranches: !1
      } : (f = /^Choose (\d+) foreign Court Noble married to your Queen as heir\. The Queen must be of your Dynasty, not your Ruler\.$/.exec(
        h
      )) && !n.heir ? n.heir = {
        count: l(f[1], 1, 1, "Married heirs", u),
        zone: "marriage",
        native: !1,
        differentBranches: !1
      } : h === re && !s ? s = !0 : x(V).some(([ie, se]) => se !== h || n.keep ? !1 : (n.keep = ie, !0)) || ((f = /^At the start of (the next round|the second round after this one|the third round after this one): (Reveal your heir\. )?Retire your Ruler\. Crown a remaining named heir\.$/.exec(
        h
      )) && n.successionAfter === void 0 ? (n.successionAfter = ae.indexOf(f[1]) + 1, d = !!f[2]) : (f = /^Win: Keep (your new Ruler in your Bloodline|your new Ruler and Witness in your Bloodline|your new Ruler in your Bloodline and the same marriage intact) for (\d+) full rounds?\.$/.exec(
        h
      )) && n.reignRounds === void 0 ? (n.reignRounds = l(f[2], 1, 3, "Reign rounds", u), p = f[1].includes("Witness") ? "native" : f[1].includes("marriage") ? "marriage" : null) : (h === N || h === N + " Return any hidden heir face up to your hand.") && !g ? (g = !0, b = h !== N) : a("CT001", "Unknown or repeated Law clause: " + h, u));
    }), !n.heir || n.entryNatives === void 0 || !n.keep || n.successionAfter === void 0 || n.reignRounds === void 0 || !g)
      a(
        "CT006",
        "A Law needs entry, heirs, maintenance, next Ruler, victory and failure clauses."
      );
    else {
      n.witness = s ? "native" : n.heir.zone === "marriage" ? "marriage" : null;
      const h = n.heir.zone === "hand" ? "act" : n.heir.zone === "marriage" ? "marriage" : s ? "charter" : "kindreds", m = {
        act: "heir",
        marriage: "heir-marriage",
        charter: "heir-witness",
        kindreds: "any-heir"
      };
      (n.keep !== m[h] || p !== n.witness || d !== (n.heir.zone === "hand") || b !== (n.heir.zone === "hand") || s && n.heir.zone !== "court" || h === "charter" && (n.heir.count !== 1 || n.heir.differentBranches) || h === "kindreds" && !n.heir.differentBranches) && a(
        "CT008",
        "Heir, maintenance, Witness, reveal and victory clauses must agree."
      ), o.law = n, o.route = h;
    }
  } else if (e.kind === "fragment") {
    const n = /^Reveal: Place this fragment in slot (\d+) of its painting\.\nIf (\d+) fragments of this painting are uncovered, Eudoxia wins immediately\. All players lose\.$/.exec(
      c
    );
    n ? (o.fragment = l(n[1], 1, 6, "Painting slot", 1), o.fragmentGoal = l(n[2], 1, 6, "Painting goal", 2), o.fragment !== e.printed.slot && a("CT015", "Printed slot differs from executable slot.")) : a(
      "CT001",
      "A fragment needs its printed slot and explicit loss condition."
    );
  } else {
    let n = !1;
    i.forEach((s, g) => {
      const d = g + 1, b = x(B).find(([, u]) => s === "Prevent: " + u), p = x(W).find(
        ([, u]) => s === "While active: " + u
      ), h = x(M).find(
        ([, u]) => s === "When this starts: " + u || s === "At round start: " + u
      );
      let m;
      if (b && !o.condition) o.condition = b[0];
      else if ((m = /^Prevent: Together, Challenge with (\d+) different ready Court Nobles in your Bloodline, one per action\.$/.exec(
        s
      )) && !o.condition)
        o.condition = "attack", o.requiredContributions = l(
          m[1],
          1,
          4,
          "Challenge contributions",
          d
        );
      else if ((m = /^Prevent: Together, Lend (\d+) hand Nobles of different Dynasties using Help, one per action\.$/.exec(
        s
      )) && !o.condition)
        o.condition = "dynasties", o.requiredContributions = l(
          m[1],
          1,
          4,
          "Dynasty contributions",
          d
        );
      else if (s === j && !n) n = !0;
      else if (p && !o.restrictions.includes(p[0]))
        o.restrictions.push(p[0]);
      else if (h) {
        const u = s.startsWith("When this starts") ? "activation" : "start";
        o.instructions.some((f) => f.timing === u) ? a(
          "CT014",
          "Only one effect per timing is supported; split complex effects into separate cards.",
          d
        ) : o.instructions.push({ timing: u, effect: h[0] });
      } else s === "End early: Complete the Prevent condition." && !o.end ? o.end = "condition" : s === "End early: " + P(o) && o.condition === "attack" && !o.end ? o.end = "attack" : s === q && !o.carry ? o.carry = !0 : s === "Then end this event." && !o.expiry ? o.expiry = "immediate" : (m = /^Ends at round end, after (\d+) more rounds?\.$/.exec(s)) && !o.expiry ? (o.expiry = "next-end", o.expiryAfter = l(m[1], 1, 3, "Active rounds", d)) : a("CT001", "Unknown, repeated or misplaced clause: " + s, d);
    }), (!o.condition || !n || !o.expiry) && a("CT006", "A Crisis needs Prevent, start and expiry clauses."), o.end && (!o.carry || o.end === "attack" && o.condition !== "attack" || o.end === "condition" && o.condition === "attack") && a("CT008", "Early ending requires matching retained contributions."), o.end && o.expiry === "immediate" && a(
      "CT008",
      "An immediate Crisis has no action window for early ending."
    ), o.end === "condition" && o.condition === "restore-marriage" && o.restrictions.includes("marry") && a("CT008", "A Crisis cannot forbid the marriage needed to end it."), o.carry && !o.end && a("CT008", "Retained contributions need an early-ending clause."), o.expiry === "immediate" && (o.restrictions.length || o.instructions.some((s) => s.timing === "start")) && a("CT014", "An immediate Crisis cannot have ongoing effects.");
  }
  if (r.length) throw new J(r);
  const T = be(o, e.kind);
  if (T !== c) {
    const n = i.findIndex((s, g) => s !== T.split(`
`)[g]) + 1;
    a(
      "CT013",
      "Use canonical clause order and number agreement.",
      Math.max(1, n),
      "Compare with the compiler's canonical text."
    );
  }
  if (r.length) throw new J(r);
  return {
    sourceId: e.id,
    sourceHash: z({
      source: { ...e, reminderRefs: [] },
      language: U,
      dictionary: _,
      compiler: G,
      interpreter: ue
    }),
    languageVersion: U,
    dictionaryHash: _,
    compilerVersion: G,
    ast: o,
    canonicalText: T,
    reminderRefs: [...e.reminderRefs]
  };
}
const ne = ["alba", "plantagenet", "tudor", "habsburg"], pe = /* @__PURE__ */ new Set([
  "alba-11",
  "plantagenet-12",
  "tudor-10",
  "habsburg-12"
]), X = {
  alba: [1, 8, 13],
  plantagenet: [1, 8, 11, 13],
  tudor: [1, 3, 5, 9, 13],
  habsburg: [1, 7, 8, 13]
}, ye = (e) => [0, 12].includes(e) ? "Alpin" : [7, 8, 9].includes(e) ? "Bruce–Stewart" : "Dunkeld", we = ne.flatMap(
  (e) => de.filter((t) => t.house === e && !pe.has(t.id)).map(
    (t, r) => {
      const a = Number(t.id.split("-")[1]);
      return {
        id: t.id,
        revision: 3,
        kind: "noble",
        printed: {
          name: t.name,
          dynasty: e,
          queen: X[e].includes(a),
          founder: a === 0,
          branch: e === "alba" ? ye(a) : void 0,
          collector: r + 1
        },
        cardText: [
          "Pay 1 seal; Trade only if accepted.",
          "Recruit: Move from hand to Court if this Noble matches your Dynasty.",
          "Recall: Lend from hand to take a rival's Court Noble of this Dynasty unless Blocked.",
          "Block: Lend from hand to stop a Recall of this Dynasty.",
          "Trade from your hand.",
          "Lend from hand when a Crisis asks.",
          "Cover: Discard from hand to cover a painting piece.",
          "Withdraw: Return from Court to hand.",
          "Challenge: Turn sideways if ready and in your Bloodline.",
          X[e].includes(a) ? "Marry: Pair this unmarried Court Queen of your Dynasty with an unmarried foreign Noble from your hand or Court." : ""
        ].filter(Boolean).join(`
`),
        reminderRefs: ["bloodline"],
        historicalNote: "Game offices and marriages explore counterfactual arrangements; the archive distinguishes documented titles and relationships. Historical titles require editorial verification before print.",
        evidenceRefs: ["docs/research/CHARACTER-PORTRAIT-EVIDENCE-AUDIT.md"],
        artRef: he[t.id]
      };
    }
  )
), y = (e, t, r, a, l, c = []) => ({
  id: e,
  revision: 3,
  kind: a,
  printed: { name: r, dynasty: t },
  cardText: l,
  reminderRefs: c,
  historicalNote: "Counterfactual institutional game design; not an assertion that these people or events coexisted.",
  evidenceRefs: ["docs/HISTORY-ENGINE-IMPLEMENTATION-SPEC.md"],
  artRef: ""
}), ve = [
  y(
    "law-alba",
    "alba",
    "Recognition of the Kindreds",
    "law",
    [
      "Claim the Crown: Have 3 Court Nobles of your Dynasty, including your Ruler.",
      "Choose 2 other Court Nobles of your Dynasty from different branches as heirs.",
      "Keep your Ruler and at least 1 named heir until the Ruler changes.",
      "At the start of the next round: Retire your Ruler. Crown a remaining named heir.",
      "Win: Keep your new Ruler in your Bloodline for 1 full round.",
      "Fail: Lose the Crown if a required Noble or marriage is lost."
    ].join(`
`),
    ["crown"]
  ),
  y(
    "law-plantagenet",
    "plantagenet",
    "The Charter",
    "law",
    [
      "Claim the Crown: Have 3 Court Nobles of your Dynasty, including your Ruler.",
      "Choose 1 other Court Noble of your Dynasty as heir.",
      "Choose a different Court Noble of your Dynasty, not your Ruler, as Witness.",
      "Keep your Ruler, heir and Witness until the Ruler changes.",
      "At the start of the next round: Retire your Ruler. Crown a remaining named heir.",
      "Win: Keep your new Ruler and Witness in your Bloodline for 1 full round.",
      "Fail: Lose the Crown if a required Noble or marriage is lost."
    ].join(`
`),
    ["crown"]
  ),
  y(
    "law-tudor",
    "tudor",
    "The Act of Succession",
    "law",
    [
      "Claim the Crown: Have 3 Court Nobles of your Dynasty, including your Ruler.",
      "Choose 1 hand Noble of your Dynasty as heir. Set the heir aside face down.",
      "Keep your Ruler and hidden heir until the Ruler changes.",
      "At the start of the next round: Reveal your heir. Retire your Ruler. Crown a remaining named heir.",
      "Win: Keep your new Ruler in your Bloodline for 1 full round.",
      "Fail: Lose the Crown if a required Noble or marriage is lost. Return any hidden heir face up to your hand."
    ].join(`
`),
    ["crown"]
  ),
  y(
    "law-habsburg",
    "habsburg",
    "The Marriage Settlement",
    "law",
    [
      "Claim the Crown: Have 3 Court Nobles of your Dynasty, including your Ruler.",
      "Choose 1 foreign Court Noble married to your Queen as heir. The Queen must be of your Dynasty, not your Ruler.",
      "Keep your Ruler, heir and their marriage until the Ruler changes.",
      "At the start of the next round: Retire your Ruler. Crown a remaining named heir.",
      "Win: Keep your new Ruler in your Bloodline and the same marriage intact for 1 full round.",
      "Fail: Lose the Crown if a required Noble or marriage is lost."
    ].join(`
`),
    ["crown", "marriage"]
  )
], v = "Ends at round end, after 1 more round.", w = "Starts at round end unless prevented.", A = "Earlier help still counts.", S = "End early: Complete the Prevent condition.", E = "Prevent: Together, Challenge with 2 different ready Court Nobles in your Bloodline, one per action.", Ce = [
  y(
    "A1",
    "alba",
    "Contested Recognition",
    "interregnum",
    [
      "Prevent: Each player Lends 1 hand Noble of their Dynasty using Help.",
      w,
      "While active: No player may Claim the Crown.",
      S,
      A,
      v
    ].join(`
`),
    ["commit"]
  ),
  y(
    "A2",
    "alba",
    "Border Rising",
    "interregnum",
    [
      E,
      w,
      "At round start: Each player with a Ruler chooses 1 other Court Noble in their Bloodline, if able. Retire those Nobles to The Past together.",
      v
    ].join(`
`),
    ["attack"]
  ),
  y(
    "A3",
    "alba",
    "A Broken Recognition",
    "interregnum",
    [
      "Prevent: At reveal, mark players with foreign Court Nobles outside their Bloodline. Each must Marry one of those Nobles.",
      w,
      "When this starts: Return all foreign Court Nobles outside their Bloodlines to their controllers' hands together.",
      "Then end this event."
    ].join(`
`)
  ),
  y(
    "P1",
    "plantagenet",
    "The Barons’ Terms",
    "interregnum",
    [
      "Prevent: Each player turns 1 ready Court Noble of their Dynasty sideways using Help.",
      w,
      "While active: To Block, also turn 1 ready Court Noble of your Dynasty sideways.",
      v
    ].join(`
`)
  ),
  y(
    "P2",
    "plantagenet",
    "A Disputed Charter",
    "interregnum",
    [
      E,
      w,
      "When this starts: The Crown holder chooses 1 Court Noble in their Bloodline other than their Ruler, if able. Return that Noble to their hand.",
      "Then end this event."
    ].join(`
`),
    ["attack"]
  ),
  y(
    "P3",
    "plantagenet",
    "Closed Roads",
    "interregnum",
    [
      "Prevent: Together, Lend 2 hand Nobles of different Dynasties using Help, one per action.",
      w,
      "While active: Use the Draw action only with an empty hand.",
      S,
      A,
      v
    ].join(`
`),
    ["commit"]
  ),
  y(
    "T1",
    "tudor",
    "The Unsettled Church",
    "interregnum",
    [
      "Prevent: Each player Lends 1 hand Noble using Help.",
      w,
      "While active: No player may Marry.",
      v
    ].join(`
`),
    ["commit"]
  ),
  y(
    "T2",
    "tudor",
    "A Rival Proclamation",
    "interregnum",
    [
      E,
      w,
      "When this starts: Each player chooses 1 Court Noble of their Dynasty other than their Ruler, if able. Return those Nobles to their controllers' hands together.",
      "Then end this event."
    ].join(`
`),
    ["attack"]
  ),
  y(
    "T3",
    "tudor",
    "The Open Record",
    "interregnum",
    [
      "Prevent: Each player completes Trade or Cover after this is revealed. A Trade counts for both players.",
      w,
      "At round start: Reveal 1 extra History card.",
      v
    ].join(`
`)
  ),
  y(
    "H1",
    "habsburg",
    "The Divided Inheritance",
    "interregnum",
    [
      "Prevent: At reveal, mark players with marriages. Each marked player Lends 1 hand Noble using Help.",
      w,
      "When this starts: Each player chooses 1 marriage they control, if able. Break those marriages together.",
      "Then end this event."
    ].join(`
`),
    ["commit"]
  ),
  y(
    "H2",
    "habsburg",
    "War of the Succession",
    "interregnum",
    [
      E,
      w,
      "While active: When a Crown claim must change Ruler, it fails. Lose that Crown claim; keep the current Ruler.",
      "End early: Together, Challenge with 2 different ready Court Nobles in your Bloodline, one per action.",
      A,
      v
    ].join(`
`),
    ["attack"]
  ),
  y(
    "H3",
    "habsburg",
    "The Imperial Settlement",
    "interregnum",
    [
      "Prevent: Together, Lend 2 hand Nobles of different Dynasties using Help, one per action.",
      w,
      "At round start: Each player with no marriage chooses 1 hand Noble, if able. Lend those Nobles together. These loans do not count as Help.",
      S,
      A,
      v
    ].join(`
`),
    ["commit"]
  )
], Y = {
  alba: "The Kindreds at Scone",
  plantagenet: "The Witness to the Charter",
  tudor: "The Sealed Intention",
  habsburg: "The Marriage Settlement"
}, Te = {
  alba: "art/court.webp",
  plantagenet: "art/wolves.webp",
  tudor: "art/witness.webp",
  habsburg: "art/last-witness.webp"
}, Re = ne.flatMap(
  (e) => Array.from({ length: 6 }, (t, r) => ({
    ...y(
      "painting-" + e + "-" + (r + 1),
      e,
      Y[e] + " · " + (r + 1),
      "fragment",
      "Reveal: Place this fragment in slot " + (r + 1) + ` of its painting.
If 6 fragments of this painting are uncovered, Eudoxia wins immediately. All players lose.`
    ),
    printed: {
      name: Y[e] + " · " + (r + 1),
      dynasty: e,
      slot: r + 1
    },
    artRef: Te[e]
  }))
), k = [...we, ...ve, ...Ce, ...Re], K = Object.fromEntries(k.map((e) => [e.id, e])), oe = Object.fromEntries(
  k.map((e) => [e.id, me(e)])
), Z = "r4-" + z(k.map((e) => oe[e.id].sourceHash)), C = {
  width: 630,
  height: 880,
  name: { x: 115, y: 48, width: 400, height: 68, baseline: 96 },
  role: { x: 60, y: 118, width: 510, height: 36, baseline: 145 },
  portrait: {
    x: 0,
    y: 159,
    width: 630,
    compactHeight: 643,
    referenceHeight: 108
  },
  rules: { x: 82, y: 288, width: 466, height: 494, maxLines: 17 }
}, L = /* @__PURE__ */ new Map(), R = /* @__PURE__ */ new Map();
let ee = null;
function Ie() {
  return ee ??= Promise.all([
    new FontFace(
      "History Card Title",
      `url(${D("fonts/font-1.woff2")})`,
      { weight: "400 700" }
    ).load(),
    new FontFace(
      "History Card Body",
      `url(${D("fonts/font-2.woff2")})`,
      { weight: "400 800" }
    ).load()
  ]).then((e) => {
    e.forEach((t) => document.fonts.add(t));
  }), ee;
}
function H(e) {
  return L.has(e) || L.set(
    e,
    new Promise((t) => {
      const r = new Image();
      r.onload = () => t(r), r.onerror = () => t(null), r.src = D(e);
    })
  ), L.get(e);
}
function Ne(e) {
  const t = K[e];
  return [t.kind === "noble" ? t.printed.queen ? "Queen" : t.printed.founder ? "Founder" : "Noble" : t.kind === "law" ? "Crown law" : t.kind === "interregnum" ? "Shared crisis" : "Painting piece", t.printed.branch].filter(Boolean).join(" · ");
}
function te(e, t, r) {
  const a = [];
  let l = "";
  for (const c of t.split(/\s+/).filter(Boolean)) {
    const i = l ? `${l} ${c}` : c;
    l && e.measureText(i).width > r ? (a.push(l), l = c) : l = i;
  }
  return l && a.push(l), a;
}
async function xe(e, t = !0) {
  const r = `${e}:${t}`;
  let a = R.get(r);
  return a || (a = Ee(e, t).catch((l) => {
    throw R.delete(r), l;
  }), R.set(r, a), R.size > 192 && R.delete(R.keys().next().value)), a;
}
async function Ae(e) {
  const t = K[e];
  if (t?.kind !== "fragment" || !t.printed.slot)
    throw Error(`Not a painting fragment: ${e}`);
  const r = await H(t.artRef);
  if (!r) throw Error(`Painting artwork unavailable: ${t.artRef}`);
  const a = document.createElement("canvas");
  a.width = C.width, a.height = C.height;
  const l = a.getContext("2d");
  l.imageSmoothingQuality = "high";
  const c = (t.printed.slot - 1) % 3, i = Math.floor((t.printed.slot - 1) / 3);
  return l.drawImage(
    r,
    c * r.width / 3,
    i * r.height / 2,
    r.width / 3,
    r.height / 2,
    0,
    0,
    a.width,
    a.height
  ), a.dataset.fragment = e, a;
}
async function Ee(e, t) {
  const r = K[e];
  if (!r) throw new Error(`Unknown History card: ${e}`);
  const [a, l] = await Promise.all([
    r.artRef && r.kind === "noble" ? H(r.artRef) : null,
    H(`art/frames/${r.printed.dynasty}-perimeter-v2.png`),
    Ie()
  ]), c = document.createElement("canvas");
  c.width = C.width, c.height = C.height;
  const i = c.getContext("2d"), o = [];
  if (i.imageSmoothingQuality = "high", i.fontKerning = "normal", i.beginPath(), i.roundRect(0, 0, 630, 880, 12), i.clip(), i.fillStyle = "#101c24", i.fillRect(0, 0, 630, 880), a) {
    const n = C.portrait, s = t ? n.compactHeight : n.referenceHeight, g = t ? n.width : 160, d = Math.max(g / a.width, s / a.height);
    i.save(), i.beginPath(), i.rect((630 - g) / 2, n.y, g, s), i.clip(), i.drawImage(
      a,
      (630 - a.width * d) / 2,
      n.y,
      a.width * d,
      a.height * d
    ), i.restore();
  }
  l && i.drawImage(l, 0, 0, 630, 880);
  function T(n, s, g, d, b) {
    const p = C[n];
    let h = g;
    const m = () => {
      i.font = `${n === "name" ? 700 : 600} ${h}px ${d}`;
    };
    for (m(); h > 20 && Math.max(
      i.measureText(s).width,
      i.measureText(s).actualBoundingBoxLeft + i.measureText(s).actualBoundingBoxRight
    ) > p.width; )
      h -= 0.25, m();
    i.textAlign = "center", i.textBaseline = "alphabetic", i.fillStyle = b, i.fillText(s, 315, p.baseline);
    const u = i.measureText(s);
    o.push({
      label: n,
      text: s,
      x: 315 - u.actualBoundingBoxLeft,
      y: p.baseline - u.actualBoundingBoxAscent,
      width: u.actualBoundingBoxLeft + u.actualBoundingBoxRight,
      height: u.actualBoundingBoxAscent + u.actualBoundingBoxDescent,
      font: h
    });
  }
  if (T(
    "name",
    r.printed.name,
    t ? 56 : 52,
    '"History Card Title", Georgia',
    "#f2e5c9"
  ), T(
    "role",
    Ne(e),
    t ? 32 : 27,
    '"History Card Body", sans-serif',
    "#d4c29d"
  ), c.dataset.nameLines = "1", c.dataset.textOverflow = "false", !t || r.kind !== "noble") {
    const n = C.rules, s = oe[e].canonicalText.split(`
`), g = r.kind === "noble" ? s.join(" ") : null;
    let d = r.kind === "noble" ? 26 : 30, b = [];
    for (; d >= 25; d -= 0.25) {
      i.font = `400 ${d}px "History Card Body", sans-serif`, b = g ? te(i, g, n.width) : s.flatMap((m) => te(i, m, n.width));
      const h = b.every(
        (m, u) => n.y + d + u * d * 1.13 + i.measureText(m).actualBoundingBoxDescent <= n.y + n.height
      );
      if (b.length <= n.maxLines && h) break;
    }
    const p = b.length > n.maxLines || b.length * d * 1.13 > n.height || d < 25;
    c.dataset.textOverflow = String(p), c.dataset.bodyFont = String(d), c.dataset.ruleLines = String(b.length), i.textAlign = "left", i.fillStyle = "#efe4ce", b.forEach((h, m) => {
      const u = n.y + d + m * d * 1.13;
      i.fillText(h, n.x, u);
      const f = i.measureText(h);
      o.push({
        label: "rules",
        text: h,
        x: n.x - f.actualBoundingBoxLeft,
        y: u - f.actualBoundingBoxAscent,
        width: f.actualBoundingBoxLeft + f.actualBoundingBoxRight,
        height: f.actualBoundingBoxAscent + f.actualBoundingBoxDescent,
        font: d
      });
    });
  }
  return c.dataset.fields = JSON.stringify(o), c.dataset.cardId = e, c.dataset.compact = String(t), c.dataset.artMissing = String(
    r.kind === "noble" && !a || !l
  ), c;
}
async function Be(e = document) {
  await Promise.all(
    [
      ...e.querySelectorAll(
        "canvas.h-face-canvas[data-face-id]"
      )
    ].map(async (t) => {
      if (!t.dataset.faceState) {
        t.dataset.faceState = "loading";
        try {
          const r = await xe(
            t.dataset.faceId,
            t.dataset.compact === "true"
          );
          if (!t.isConnected) return;
          t.width = r.width, t.height = r.height, t.getContext("2d").drawImage(r, 0, 0);
          for (const a of [
            "fields",
            "nameLines",
            "textOverflow",
            "bodyFont",
            "ruleLines",
            "artMissing"
          ])
            r.dataset[a] !== void 0 && (t.dataset[a] = r.dataset[a]);
          t.dataset.faceState = "ready";
        } catch {
          t.dataset.faceState = "error", t.closest(".h-card-face")?.setAttribute("data-art", "unavailable");
        }
      }
    })
  );
}
async function ke() {
  const e = document.querySelector("[data-print]"), t = document.querySelector("[data-print-status]");
  document.documentElement.dataset.printState = "loading";
  try {
    if (document.documentElement.dataset.contentVersion !== Z)
      throw Error("The proof and its renderer have different content versions. Rebuild the proof.");
    await Be();
    const r = [...document.querySelectorAll(".card[data-card] .h-face-canvas")];
    if (r.length !== k.length) throw Error("The proof is missing card faces.");
    for (const l of r) {
      if (l.dataset.faceState !== "ready" || l.dataset.textOverflow === "true" || l.dataset.artMissing === "true")
        throw Error(`The face of ${l.dataset.faceId} could not be prepared completely.`);
      const c = JSON.parse(l.dataset.fields);
      if (!c.some((i) => i.label === "rules")) throw Error(`Missing instructions: ${l.dataset.faceId}`);
      if (c.some((i) => {
        const o = C[i.label];
        return i.x < o.x - 1 || i.y < o.y - 1 || i.x + i.width > o.x + o.width + 1 || i.y + i.height > o.y + o.height + 1;
      })) throw Error(`Print geometry exceeds its safe field: ${l.dataset.faceId}`);
    }
    const a = [...document.querySelectorAll("canvas[data-print-tile]")];
    for (const l of a) {
      const c = await Ae(l.dataset.printTile);
      l.width = c.width, l.height = c.height, l.getContext("2d").drawImage(c, 0, 0), l.dataset.tileState = "ready";
    }
    document.documentElement.dataset.printState = "ready", document.documentElement.dataset.printFaces = String(r.length), document.documentElement.dataset.printTiles = String(a.length), t.textContent = `${r.length} reference faces ready · ${Z} · 63 × 88 mm`, e.disabled = !1, e.onclick = () => window.print();
  } catch (r) {
    document.documentElement.dataset.printState = "error", t.textContent = `Print preparation failed: ${r instanceof Error ? r.message : String(r)}`, t.setAttribute("role", "alert");
  }
}
ke();
