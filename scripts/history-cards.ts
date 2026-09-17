import { mkdirSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  SOURCES,
  NOBLES,
  INTERREGNA,
  LAW_CARDS,
  FRAGMENTS,
  MANIFEST,
  CONTENT_VERSION,
} from "../src/history-engine/content";
import {
  CardTextError,
  compileCard,
  REMINDERS,
  DICTIONARY_HASH,
} from "../src/history-engine/compiler";
import { escapeHTML as esc } from "../src/history-engine/face";
import { MODULES } from "../src/history-engine/types";
import { ACTION_REFERENCE, glossaryHTML } from "../src/history-engine/glossary";
const mode = process.argv[2] ?? "compile";
const marriagePairs = NOBLES.filter((c) =>
  MANIFEST[c.id].ast.abilities?.includes("marry"),
).length;
mkdirSync("artifacts/history", { recursive: true });
const diagnostics = [];
for (const source of SOURCES) {
  try {
    compileCard(source);
    if (source.artRef && !existsSync(join("public", source.artRef)))
      throw Error(`Missing art ${source.artRef}`);
  } catch (error) {
    if (error instanceof CardTextError) diagnostics.push(...error.diagnostics);
    else
      diagnostics.push({
        code: "CT016",
        severity: "error",
        contentId: source.id,
        text: String(error),
      });
  }
}
for (const d of MODULES) {
  const cards = NOBLES.filter((c) => c.printed.dynasty === d);
  if (
    cards.length !== 13 ||
    cards.filter((c) => c.printed.founder).length !== 1
  )
    diagnostics.push({
      code: "CT016",
      severity: "error",
      contentId: d,
      text: "Invalid module inventory",
    });
}
if (new Set(SOURCES.map((c) => c.id)).size !== 92)
  diagnostics.push({
    code: "CT016",
    severity: "error",
    text: "Duplicate or missing content IDs",
  });
writeFileSync(
  "artifacts/history/card-text-diagnostics.json",
  JSON.stringify(diagnostics, null, 2),
);
if (diagnostics.length) {
  console.error(JSON.stringify(diagnostics, null, 2));
  process.exit(1);
}
if (mode === "compile" || mode === "manifest") {
  writeFileSync(
    "artifacts/history/compiled-manifest.json",
    JSON.stringify(
      {
        rulesetId: "history-engine-v4",
        contentVersion: CONTENT_VERSION,
        dictionaryHash: DICTIONARY_HASH,
        cards: SOURCES.map((source) => ({
          source,
          compiled: MANIFEST[source.id],
        })),
      },
      null,
      2,
    ),
  );
}
if (mode === "proof") {
  const cards = SOURCES.map(
    (c) =>
      `<article class="card ${c.kind}" data-card="${c.id}">${c.kind === "noble" ? `<img class="portrait" src="${esc(c.artRef)}" alt="">` : c.kind === "fragment" ? `<div class="painting" style="background-image:url('${c.artRef}');background-position:${((c.printed.slot! - 1) % 3) * 50}% ${Math.floor((c.printed.slot! - 1) / 3) * 100}%"></div>` : ""}<div class="ink"><div class="dynasty">${esc(c.printed.dynasty)} · ${esc(c.kind)}</div><h2>${esc(c.printed.name)}</h2>${c.kind === "noble" ? `<p>${c.printed.queen ? "Queen · marriage role" : c.printed.founder ? "Founder · Noble" : "Noble"}${c.printed.branch ? ` · ${esc(c.printed.branch)}` : ""}</p>` : ""}${c.cardText ? `<p class="operative">${esc(c.cardText).replace(/\n/g, "<br>")}</p>` : ""}<footer>${esc(c.id)} · r${c.revision}${c.printed.collector ? ` · ${c.printed.collector}/13` : ""}</footer></div></article>`,
  ).join("");
  const pagedCards = cards
    .split("</article>")
    .filter(Boolean)
    .reduce<string[]>((pages, card, index) => {
      if (index % 9 === 0) pages.push("");
      pages[pages.length - 1] += card + "</article>";
      return pages;
    }, [])
    .map((page) => `<div class="sheet sheet-page">${page}</div>`)
    .join("");
  const source = readFileSync(
    "docs/HISTORY-ENGINE-CONTENT-AND-COMPONENTS.md",
    "utf8",
  );
  const bom = source
    .split("\n")
    .filter((line) => line.startsWith("|") && line.includes("|"))
    .filter((line) => !line.includes("---"));
  const html = `<!doctype html><html lang="en"><meta charset="utf-8"><title>O&O · History engine print and play</title><style>@page{size:A4;margin:10mm}*{box-sizing:border-box}body{font-family:Georgia,serif;color:#162b2c;background:#deddd3;margin:0;font-size:11pt}header.intro,section.reference{max-width:190mm;padding:8mm;margin:auto;background:#fffef5}h1{font-size:30pt;font-weight:normal}h2{font-size:14pt;margin:2mm 0}p,li{line-height:1.35}a{color:#344d46}.sheet{display:grid;grid-template-columns:repeat(3,63mm);gap:.5mm;max-width:191mm;margin:8mm auto}.card{width:63mm;height:88mm;background:#fffdf4;border:.2mm solid #85734c;position:relative;break-inside:avoid;overflow:hidden}.portrait{display:block;width:100%;height:18mm;object-fit:cover;object-position:top}.ink{padding:3mm}.noble .ink{padding:2mm 3mm}.dynasty{text-transform:uppercase;font:7pt Arial;letter-spacing:.4pt;color:#655535}.card h2{font-size:14pt;line-height:1.02}.card p{margin:2mm 0;font-size:9pt;line-height:1.16}.card footer{font:6pt Arial;position:absolute;bottom:1.5mm;left:3mm}.law h2{font-size:14pt}.law .operative{font-size:9pt;line-height:1.2}.noble h2{font-size:12pt;margin:1mm 0}.noble .ink{padding:1.5mm 3mm}.noble p{font-size:9pt;line-height:1.12;margin:1mm 0}.noble .dynasty{font-size:6.5pt}.operative{white-space:normal}.h-glossary dt{font-weight:bold}.h-glossary dd{margin:1mm 0 3mm}.fragment .painting{height:88mm;width:63mm;background-size:300% 200%;position:absolute;inset:0}.fragment .ink{position:absolute;inset:auto 0 0;background:#fffef1ed;padding-bottom:6mm}.fragment h2{font-size:10pt}.fragment .operative{font-size:9pt}.reference{break-before:page}.reference h2{font-size:19pt}table{border-collapse:collapse;width:100%;font-size:9pt}th,td{border:1px solid #9c9276;padding:2mm;text-align:left;vertical-align:top}.register{width:100mm;min-height:140mm;padding:5mm;border:1px solid;margin:6mm 0;break-inside:avoid}.line{height:10mm;border-bottom:1px solid #9c9276}.tokens{display:flex;flex-wrap:wrap;gap:3mm}.token{border:1px solid;border-radius:50%;width:18mm;height:18mm;display:flex;align-items:center;justify-content:center;font:8pt Arial}.mat{border:1px solid;padding:6mm;break-inside:avoid;margin:8mm 0;min-height:90mm}.back{display:flex;align-items:center;justify-content:center;text-align:center;background:#132b30;color:#eddaad;font-size:16pt}.sheet-page{break-after:page;page-break-after:always}.tokens{display:block}.token{display:inline-flex;vertical-align:top;margin:1mm;break-inside:avoid;page-break-inside:avoid}.controls{position:sticky;top:0;background:#132b30;color:#fff;padding:10px;z-index:10}.controls button{padding:9px 15px}@media print{body{background:white}.controls{display:none}.sheet{margin:0}.intro{break-after:page}.card{box-shadow:none}}</style><div class="controls"><button onclick="print()">Print at 100% scale</button> Prototype trim 63 × 88 mm · no supplier certification</div><header class="intro"><p>OVERLORDS & OUTLAWS</p><h1>The Weight of the Crown</h1><h2>History engine · print-and-play proof</h2><p>Original concept © 2025 Malachy Murray. ${CONTENT_VERSION}. English operative text from the exact runtime manifest.</p><p>Print at 100%, not “fit”. Trim dimensions are provisional. This home-print kit uses trim lines and a 3 mm safe area. Commercial production needs a supplier dieline, 3 mm image bleed and approved front/back alignment.</p><p>Contains 52 Nobles, four Laws, twelve Crises and 24 painting fragments. Original portraits and four existing scene artworks are preserved; the paintings are prototype source-art reuse, not newly verified historical compositions.</p><p>Use opaque identical Noble backs and identical History backs. Sleeves can supply opacity. A complete selected module stays together; no permanent collection trades.</p><p>Human paper adjudication, material handling, source/editorial clearance and supplier proofs remain outstanding. The user deferred the early paper-play gate to enable digital prototype implementation.</p></header>${pagedCards}
 <section class="reference"><h2>At every seat: the same four Laws</h2>${LAW_CARDS.map((c) => `<h3>${esc(c.printed.name)}</h3><p>${esc(c.cardText)}</p>`).join("")}<h3>Regency</h3><p>Claim the Crown with a native Ruler and a different native Court Noble as heir. Retire the old Ruler and install the heir next round. Maintain the supported successor for two full rounds before settlement.</p><h3>Entry and continued support</h3><p>The primary Law route requires a native Ruler and at least three native Court Nobles at entry only. A failed arrangement forfeits immediately and never restores itself. Ordinary interim succession never wins.</p></section>
 <section class="reference"><h2>Shared actions and timing</h2><p>Every ordinary action costs one seal. Every player has three; refresh only at round start. Block uses that same supply. Pass, consent and mandatory choices are free.</p><table><tr><th>Action</th><th>Procedure</th></tr>${[
   ...ACTION_REFERENCE.map(({ term, explanation }) => [term, explanation]),
 ]
   .map(([a, b]) => `<tr><td>${a}</td><td>${b}</td></tr>`)
   .join(
     "",
   )}</table><h3>Round start</h3><p>Rotate first seat (except round one). Uncover due fragments and check Eudoxia after each. Return Loans. Clear petition register. Refresh three seals and ready Court Nobles. Conduct scheduled succession. Resolve active recurring events oldest first. Reveal N History cards sequentially, checking immediate completion after each. In first-seat order, draw one Noble if your hand has fewer than five.</p><h3>Round end</h3><p>Everyone passing consecutively closes the round immediately. Activate unmet pending Crises in reveal order, after rechecking each condition. Resolve effects and expiries. Check Crown settlement after Eudoxia; begin the next round if no outcome. No reshuffle or hidden round limit.</p></section>
 <section class="reference"><h2>Inheritance and physical verification</h2><p>Choose N modules for N seats, N = 2–4. Shuffle their 13N Nobles and 9N History cards separately. Deal eight Nobles privately. Everyone locks exactly three and passes clockwise together; repeat with two, then one. Declare exactly three matching Nobles simultaneously. Duplicate Dynasties are legal. Appoint a Ruler; retain five Nobles in hand. History begins in round one.</p><p>A four-seat 2/2/2/2 failure reveals all eight. In first-seat order, take the top Noble publicly, return one different-Dynasty card to a repair packet and declare the resulting trio. Shuffle repair packets back only after all repairs. No valid two/three-seat hand can lack a trio.</p><p>Bloodline consists of native Court Nobles and foreign spouses supported by a native Queen in the same Court. No chains. When either spouse leaves, break both halves; a foreign survivor remains unsupported. When a Ruler leaves, choose a remaining native interim Ruler, if any.</p><h3>Read each Crisis</h3><p>Border Rising retires one other Bloodline Noble from each Court with a Ruler, if possible. A Disputed Charter lets the Crown holder return one other Bloodline Noble to their hand. Neither protects a hidden minimum or asks players to track a separate list of dependencies.</p><h3>Words at the table</h3>${glossaryHTML()}<h3>Canonical reminders</h3>${Object.entries(
   REMINDERS,
 )
   .map(([id, text]) => `<p><b>${esc(id)}</b> — ${esc(text)}</p>`)
   .join(
     "",
   )}<h3>Correction and reset</h3><p>Pause errors at the last unambiguous state, verify retained proof, and replay legally. Revealed information cannot be made unknown. An irreparable disputed session is invalid for balance metrics. At game end reveal commitments and hands and reconcile every module ID. No card returns from The Past during play.</p></section>
 <section class="reference"><h2>Registers and reversible components</h2><p>Print four copies of the player references and procedure mats. Print twelve event registers, and match each to the event’s ID marker. Laminate or sleeve erasable fields for testing.</p><div class="register"><h3>Event register</h3><p>Event ID ______ · Pending / Active</p><p>Reveal round ____ · Activation ____ · Ends ____</p><p>Players who must help: □1 □2 □3 □4</p><p>Fulfilled: □1 □2 □3 □4</p><p>Dynasties: □Alba □Plantagenet □Tudor □Habsburg</p><p>Contributing Nobles + players:</p><div class="line"></div><div class="line"></div><p>First contribution: seat ____ · Noble ID ______</p><p>Second contribution: seat ____ · Noble ID ______</p><p>Use a different Noble for each contribution. Keep proof after ordinary commitments return.</p></div><div class="mat"><h3>Seat ____ · Crown / Act procedure</h3><p>Route ______ · Crown claimed round ____ · Reign round ____</p><p>Old Ruler ID __________ · Successor ID __________</p><p>Heir 1 __________ · Heir 2 __________</p><p>Witness / sponsor __________ · Marriage pair ____</p><p>Sealed heir: place one opaque sleeved card here.</p><p>Regency: First Reign / Second Reign</p></div><div class="mat"><h3>Seat ____ · Court and Loans</h3><p>Court rows may extend beyond this mat. No holding ceiling.</p><p>Ruler marker: ____ · Available / Spent action seals: ○ ○ ○</p><p>Loans: retain contributed cards face up here until next start. Records stay on the associated event registers.</p></div><h3>Round track</h3><p>${Array.from({ length: 24 }, (_, i) => `□${i + 1}`).join(" ")}</p><h3>Consecutive Pass strip</h3><p>□ Seat ____ □ Seat ____ □ Seat ____ □ Seat ____</p><h3>Recalled ID register (clear each round)</h3>${Array.from({ length: 5 }, () => '<div class="line"></div>').join("")}<h3>Marriage halves</h3><div class="tokens">${Array.from({ length: marriagePairs }, (_, i) => `<span class="token">Pair ${i + 1}</span><span class="token">Pair ${i + 1}</span>`).join("")}</div><h3>Action seals, rulers, named heirs and once-veiled rings</h3><div class="tokens">${[...Array(12).fill("Seal"), ...Array(4).fill("Ruler"), ...Array(8).fill("Heir"), ...Array(24).fill("Covered once"), ...Array.from({ length: 4 }, (_, i) => `Cover ${i + 1}`), "Crown", "First seat", ...Array.from({ length: 4 }, (_, i) => `Pass ${i + 1}`)].map((t) => `<span class="token">${t}</span>`).join("")}</div><p>Active Cover marker: initiator ____ · Uncover at start of round ____.</p><p>Simultaneous choice slip (four copies): Seat ____ · locked ID __________.</p><p>Separate pile places: Dynasty Deck · History Deck · Noble Past · History Past.</p></section>
 <section class="reference"><h2>Paper adjudication and session record</h2><p>Two people independently adjudicate: Alba loses one of two candidates; Charter loses the Witness; Tudor’s heir reveals only at transfer; Habsburg loses its supporting Queen; active H2 blocks scheduled succession; Cover due R+2 completes a painting before refresh; a declined inspected exchange preserves only private learned knowledge.</p><p>Run at least six adversarial games across 2/3/4 seats and every Law before design signoff. Record full game duration separately from setup and teaching, declared Dynasties, repairs, offers accepted/declined, voluntary Covers, Crown attempts/failures, exact win cause, inaccessible choices and evidence of practical elimination.</p><h3>Five-minute public demonstration</h3><p>The browser’s labeled preset uses two seats, an Alba Court with a native Queen, concealed matching claim evidence, a rival with an Alba Noble in hand, P2 pending and four Alba fragments visible. Keep concealed leverage for Block or bargain it toward marriage and government. Opponents can defeat the attempt. The preset is not a guaranteed win.</p><p>Staff premise: Recruit a dynasty from a shared inheritance. Keep people concealed to bargain and contest, or expose them to govern. Can your government survive succession before Eudoxia completes the record?</p><p>Three setup steps: select matching module count; separate/deal/passing draft; simultaneous declarations and rulers. Reset: reconcile 13 Nobles, 3 Crises, 6 fragments and Law/reference per selected module; restore all proof components to blank.</p></section>
 <section class="reference"><h2>Manifest and manufacturing worksheet</h2><p>Quantities and physical component constraints are normative in HISTORY-ENGINE-CONTENT-AND-COMPONENTS.md. This worksheet records unverified supplier inputs, not invented costs.</p><table><tr><th>Component</th><th>Quantity / size</th><th>Material, finish, bleed, orientation, tolerances, supplier, unit cost</th></tr>${[
   ["Nobles", "52 · 63×88 mm"],
   ["Crises", "12 · 63×88 mm"],
   ["Fragments", "24 · 63×88 mm"],
   ["Laws / module references", "4 each"],
   ["Booklets / Court mats / Crown mats", "4 each"],
   ["Sleeves / ruler markers", "4 each"],
   ["Crown / stage / Regency tile", "1 each"],
   ["Heirs / seals / marriage halves", `8 / 12 / ${marriagePairs * 2}`],
   ["Pass markers / strip / first-seat / track", "4 / 1 / 1 / 1"],
   ["Draw register / optional markers", "1 / 52"],
   ["Event registers / ID markers", "12 / 12"],
   ["Once-veiled rings / active Cover", "24 / 4"],
   ["Screens / slips / pens", "4 each"],
   ["Cloth / pile places", "1 / 4"],
 ]
   .map(
     ([a, b]) =>
       `<tr><td>${a}</td><td>${b}</td><td>Pending physical proof and supplier quotation</td></tr>`,
   )
   .join(
     "",
   )}</table><p>Verify a 1200×900 mm table with actual-size pieces and all four 189×176 mm painting trays. Test 1500×900 mm extended layout if maximum legal component state does not fit. Digital panning is not proof of tabletop fit.</p></section><section class="reference"><h2>Reference backs and module selection</h2><p>Use opaque sleeves or print enough identical backs for all 52 Nobles and 36 History cards. The History back must not identify painting or event. Four module selection cards have one common reverse; these do not enter either deck.</p><div class="sheet"><article class="card back">OVERLORDS<br>&amp; OUTLAWS<br>DYNASTY</article><article class="card back">OVERLORDS<br>&amp; OUTLAWS<br>HISTORY</article><article class="card back">DYNASTY<br>SELECTION</article>${MODULES.map((d) => `<article class="card"><div class="ink"><h2>${d}</h2><p>13 Nobles · 3 Crises · 6 fragments · 1 Law</p><p>${LAW_CARDS.find((c) => c.printed.dynasty === d)!.printed.name}</p><p>Combine one module per seat. A selected module belongs to the pool; draft your Dynasty.</p></div></article>`).join("")}</div></section></html>`;
  writeFileSync("public/history-proof.html", html);
  console.log(
    "Wrote public/history-proof.html · 92 canonical faces plus reference/component kit.",
  );
}
console.log(
  `${mode}: 92 sources valid; ${CONTENT_VERSION}; no Card Text errors.`,
);
