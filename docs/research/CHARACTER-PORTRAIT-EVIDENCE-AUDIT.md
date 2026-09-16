# Character portrait evidence audit

16 September 2026. Scope: all 84 entries in `docs/art/character-briefs.json`, their source descriptions in `CHARACTER-PORTRAIT-RESEARCH.md`, and the mapping in `src/character-art.ts`. This is an evidence audit, not certification of every generated pixel. All briefs were reviewed; selected institutional records were reopened below. Only Henry III and Edward I were visually inspected in this audit. Other generated portraits still require comparison with their specific source objects.

## Decision

The roster has individual briefs and individual asset paths. That fixes the previous shared-archetype approach, but **unique files and historically plausible prompts do not establish historical accuracy**. Many briefs substantiate identity and chronology but not dress, jewelry, architecture, or facial anatomy. Their caveats are generally responsible and must survive publication and future regeneration.

For figures without reliable lifetime likenesses, use the description **individual historical reconstruction**. For figures with identified portraits, use **portrait-informed interpretation** and record the source object's date, attribution and identifier. Neither label means photographic certainty. Do not call the entire set validated until its actual output has been checked against those sources.

### Priority corrections

1. **Henry III / Edward I:** the current `plantagenet-4-v1.webp` and `plantagenet-5-v1.webp` are different compositions, not the same image. However, both are grey-bearded, long-nosed men in similar crowns and red mantles; their similarity remains a visual-design concern. Preserve Henry's architectural-patron scene and Edward's taller military silhouette. Face differences are reconstructed choices, not documentary findings.
2. **Henry's building:** inspect the elaborate tracery, towers and buttress arrangement against the Abbey's reconstruction of the eastern church in his reign. The source dates work from 1245 and the consecration to 1269; the whole later Abbey is not permissible in a 1265 view. The generated background is a generic grand Gothic building, not a validated reconstruction. Simplify to an eastern-worksite fragment unless a specific dated architectural source supports more. [Westminster Abbey: Henry III](https://www.westminster-abbey.org/abbey-commemorations/royals/henry-iii).
3. **Edward's armour:** the present image adds exposed riveted shoulder strips. The cited Abbey record establishes burial robes, not this armour. Obtain a dated late-thirteenth-century English/Welsh military reference or remove the speculative plates and retain mail. A broad fourteenth-century armour survey alone cannot authenticate a specific 1295 harness. [Met: European armour, 1300–1400](https://www.metmuseum.org/de/essays/fashion-in-european-armor-1300-1400).
4. **Marguerite de Valois:** the Louvre visitor trail establishes her wedding, not her face. Add an actual portrait source. The Morgan catalogue identifies a School of François Clouet drawing of this exact Marguerite (1553–1615). Its indexed institutional description was read, but the page returned 403 on open; visually compare the drawing before changing likeness claims. [Morgan portrait record](https://www.themorgan.org/drawings/item/109648).
5. **Louis XI:** the sole Louvre object is an 1838 Jaley statue. It cannot authenticate a 1470 face or clothing. Keep the reconstruction label and find a period portrait/medal/manuscript source before claiming documentary resemblance. [Louvre LP 1774](https://collections.louvre.fr/en/ark:/53355/cl010091426).
6. **Margaret Tudor:** never use NPG 1173 as her verified likeness. The NPG identifies an unknown woman and explicitly rejects the previous identification. A later Mytens-derived print also cannot establish an eyewitness face. [NPG conservation research](https://www.npg.org.uk/collections/search/portraitConservation/mw04202/Unknown-woman-formerly-known-as-Margaret-Tudor).

## Evidence categories

- **R — reconstruction:** supplied sources establish identity/context; facial particulars are invented.
- **I — historical image:** effigy, manuscript or later portrait tradition supplies iconography, with limited likeness authority.
- **P — portrait basis:** the brief identifies a potentially useful period portrait/bust. This is a source-basis classification, not a claim that this audit inspected the object or approved the generated likeness.
- **Gap:** evidence requiring improvement before historical validation.

Every row below has been reviewed against its existing brief. “Existing dossier” links to the corresponding person's source list; it does not imply those links were all freshly fetched. Specific reopened sources are identified in the final section. For every row, exact costume color, room arrangement, expression and scene remain interpretation unless separately supported.

## Per-person review

### Alba

| ID / person | Basis | Required check or correction |
|---|---|---|
| alba-0 Kenneth MacAlpin | R; royal chronology, comparative brooch | Source an actual ninth-century brooch/tunic comparator. Hunterston is comparative material culture, not his property; no authenticated face or gold fillet. |
| alba-1 St Margaret | R; biography and Gospel association | Keep c.1080, about 35. Verify book binding and modest eleventh-century chapel; no later Dunfermline nave. |
| alba-2 Malcolm III | R; biography | Add eleventh-century mail, sword and shield evidence. Quilt construction and individual grooming are not established by the biography. |
| alba-3 David I | R; biography | Romanesque abbey patronage is contextual. Architectural plan, collar and face need explicit reconstruction status; no later Melrose ruin. |
| alba-4 William the Lion | R/I; royal seal context | Verify actual seal before deriving crown/garment motifs. Arbroath work must match c.1195; nickname does not license lion costume. |
| alba-5 Alexander II | R; chronology/treaty | Age 38–39 in 1237 is coherent. Face, auburn hair, blue-green mantle and treaty scene are invented. Add garment comparator. |
| alba-6 Alexander III | R/I; later manuscript convention | About 25 in 1266; do not age into a grey-bearded elder. Later iconography is not facial evidence. |
| alba-7 Robert the Bruce | R; heritage context | Add dated early-fourteenth-century harness evidence. No film likeness, no claim of definitive skull reconstruction. |
| alba-8 Marjorie Bruce | R; relationship/chronology | Princess, not reigning queen. About 19 in 1315; no sovereign regalia or mature middle-aged face. |
| alba-9 Robert II | R; royal biography | About 64 in 1380; later royal portraits do not certify white beard or exact facial form. |
| alba-10 Duncan I | R; chronology | Apparent age is a casting decision; avoid claiming precise birth date or Shakespeare's elderly king as evidence. |
| alba-11 Donald II | R; limited documentation | Moustache, shoulder-length hair and clothing need reconstruction labels. Comparative Viking-age objects are not personal belongings. |
| alba-12 Constantine II | R; chronology | Apparent age 60 is explicitly invented; assembly setting and monastic/statesman character need contextual evidence. |
| alba-13 Matilda of Scotland | R; Abbey identity/context | Edith/Matilda, Henry I's wife; not Empress Matilda. Add c.1110 garment/manuscript evidence for veil and crown. |

Sources for these individual decisions: [existing Alba dossier](CHARACTER-PORTRAIT-RESEARCH.md#alba-0--kenneth-macalpin). All fourteen faces remain reconstructions; the dossier's specific invented eye, hair, and facial descriptions must not be promoted to facts.

### Plantagenet

| ID / person | Basis | Required check or correction |
|---|---|---|
| plantagenet-0 Henry II | I; Fontevraud effigy | Preserve commemorative-image caveat. Red hair/beard and compact face are not proved by that effigy; source costume separately. |
| plantagenet-1 Eleanor of Aquitaine | I; Fontevraud effigy | Reading pose has iconographic basis; age about 68 in 1190 is intentional. Do not copy the idealized effigy's apparent youth. |
| plantagenet-2 Richard I | I; Fontevraud effigy | Crusading fortress, mail and beard are reconstruction choices. Effigy does not certify tawny hair or facial anatomy. |
| plantagenet-3 John | I; Worcester effigy | Distinguish commemorative convention from life likeness. Great seal/charter must not accidentally become a modern signature document. |
| plantagenet-4 Henry III | I; Abbey effigy | Reopened source: Torel effigy associated with 1291 reburial is posthumous. Generated architecture requires dated review; see priorities. |
| plantagenet-5 Edward I | R; burial account | Reopened source: no tomb effigy. Tall stature and burial colors have support; shoulder plates, silver-brown hair and face do not. |
| plantagenet-6 Edward II | I; Gloucester effigy | Add direct tomb record, not only general architecture page. Smooth facial/grooming choices remain reconstruction. |
| plantagenet-7 Edward III | I; late-life tomb effigy | A c.1355 face aged about 43 cannot simply copy late-life features. Verify specific transitional harness. |
| plantagenet-8 Philippa of Hainault | I; alabaster effigy | Date reticulated headdress and lacing to chosen c.1355. Effigy-supported figure does not validate every gown detail. |
| plantagenet-9 Richard II | P/I; Wilton Diptych | Retain white-hart imagery and period royal iconography; diptych is devotional, idealized representation. New pose/room are inferred. |
| plantagenet-10 Edward the Black Prince | I; commemorative material | Replace general/later-image links with direct Canterbury tomb and surviving achievements records for jupon/helmet validation. |
| plantagenet-11 Joan of Kent | R; academic biography | She was not reigning queen. Add a dated gown/veil comparator; cup, exact face and room are invented. |
| plantagenet-12 Geoffrey of Anjou | I; Le Mans enamel | Cite exact enamel catalogue entry and date; its lion-bearing shield supports heraldic treatment, not precise living face. |
| plantagenet-13 Isabella of France | R; Eltham context | Identity and palace association do not substantiate exact gown or facial type. Add contemporary manuscript/seal record. |

Sources: [existing Plantagenet dossier](CHARACTER-PORTRAIT-RESEARCH.md#plantagenet-0--henry-ii); reopened Henry, Edward and Wilton records below.

### Tudor

| ID / person | Basis | Required check or correction |
|---|---|---|
| tudor-0 Henry VII | P; NPG 1505 portrait | Use NPG 416 conservation record, not just sitter search. Portrait supports black cap, fur trim and Golden Fleece; new room remains invented. |
| tudor-1 Elizabeth I | P/I; portrait traditions | Specify exact portrait and represented age. Later coronation copies and ageless official types are not unmediated life likenesses. |
| tudor-2 Henry VIII | P/I; Holbein tradition | Distinguish original drawing/cartoon from copies of lost mural. Match body/face age and surviving costume evidence to the chosen year. |
| tudor-3 Mary I | P; Mor/Prado portrait | Keep separate from Mary Tudor of France. Compare mature face, headdress and gown with exact Prado image before approval. |
| tudor-4 Edward VI | P/I; RCT records | Do not combine infant Holbein drawing with adolescent costume as if same-age evidence. Select one dated adolescent portrait. |
| tudor-5 Elizabeth of York | I; portrait tradition | Sitter search does not date the individual image. Identify object and copy status; early Tudor hood must match depicted date. |
| tudor-6 Margaret Beaufort | P/I; vowess imagery | Name exact portrait, artist attribution and date; black vowess dress must not become a generic later widow hood. |
| tudor-7 Edmund Tudor | R; Welsh biography | No identified life likeness in brief. Keep youthful adult chronology; Carmarthen room and dress require period comparators. |
| tudor-8 Jasper Tudor | R; Welsh biography | Add late-fifteenth-century sallet/harness reference. Mature face is reconstructed; no implication biography verifies armour. |
| tudor-9 Margaret Tudor | R/I; later RCT print | NPG rejects former identification of NPG 1173. Exact face is unresolved; never use that unknown woman as validated Margaret. |
| tudor-10 Mary Tudor of France | R; RCT exhibition context | A press release supports identity, not facial reconstruction. Find a securely identified portrait with dating discussion; avoid Mary I. |
| tudor-11 Arthur Tudor | P/I; NPG exhibition portrait | Record exact loan/object, attribution and date. Preserve adolescent scale and gillyflower; no adult warrior physique. |
| tudor-12 Owen Tudor | R; Welsh biography | Birth/early life uncertain. Face and c.1435 clothing remain invented; add contemporary household dress comparator. |
| tudor-13 Catherine of Aragon | P/I; NPG portrait types | Avoid using eighteenth-century NPG 163 copy as direct life evidence. Cite chosen c.1520 panel/miniature precisely. |

Sources: [existing Tudor dossier](CHARACTER-PORTRAIT-RESEARCH.md#tudor-0--henry-vii); reopened NPG conservation records below.

### Valois

| ID / person | Basis | Required check or correction |
|---|---|---|
| valois-0 Philip VI | I; Saint-Denis effigy | Ministry inventory supports object identity. Exact hair/beard, expression and robe palette are reconstruction. |
| valois-1 Francis I | P; Clouet portrait | Use exact portrait/image to verify long nose, beard, cap and broad sleeves. Fontainebleau architecture must exist by chosen c.1535. |
| valois-2 Catherine de’ Medici | P; Clouet-workshop widow portrait | Mature widow circa 1570; preserve pointed veil and period ruff. Cabinet staging not an authenticated scene. |
| valois-3 Charles V | P/I; lifetime effigy | Individualized effigy is stronger than generic royal imagery, but does not establish hair color. Verify library furnishings independently. |
| valois-4 Charles VII | P/I; Fouquet tradition | Check whether cited Condé object is original or derivative. Use exact source image and age, avoid Renaissance beard. |
| valois-5 Louis XI | R/I; 1838 statue | Major source gap: later Jaley statue cannot validate 1470 appearance. Find period material; retain reconstruction label. |
| valois-6 Henry II | P; Clouet-workshop c.1559 | Match short hair, beard, collar and armour to the 1550s. Do not cross-reference English Henry II. |
| valois-7 Charles IX | P; Clouet 1570 | About 20, not middle-aged. Source's deliberately matured representation must not erase youthful proportions. |
| valois-8 Henry III | P/I; late-sixteenth-century portrait tradition | Museum programme is indirect; obtain direct object record. Holy Spirit ribbon requires date after order's establishment. |
| valois-9 Marguerite de Valois | R; contextual Louvre trail | Upgrade with Morgan School of Clouet drawing after image comparison; trail supplies wedding history only. |
| valois-10 Louis XII | I; contemporary Bourdichon manuscript | Manuscript royal type is useful for silhouette, not exact three-dimensional face. Cite specific folio and depicted costume. |
| valois-11 Claude of France | R; prayer-book context | Morgan book evidence supports patronage/date, not exact face. Age about 18 in 1517; add contemporary garment source. |
| valois-12 Isabeau of Bavaria | I; Harley 4431 | Stylized presentation miniature supports court setting/headwear. Name folio and avoid claiming portrait-level facial precision. |
| valois-13 John II | P; Louvre RF 2490 | Reopened Louvre confirms c.1355–1360 panel. Prefer it over coin/later chronicle; front-view adaptation remains inference. |

Sources: [existing Valois dossier](CHARACTER-PORTRAIT-RESEARCH.md#valois-0--philip-vi); reopened Louvre objects and Morgan search record below.

### Habsburg

| ID / person | Basis | Required check or correction |
|---|---|---|
| habsburg-0 Rudolf I | I; tomb-image tradition | King, never crowned emperor. Add direct tomb object/date; facial type is cautious adaptation, not authenticated living expression. |
| habsburg-1 Maria Theresa | P; Meytens/Princeton | Object confirms artist/title but broad date alone does not prove depicted age 33. Tie chosen c.1750 styling to dated portrait. |
| habsburg-2 Maximilian I | P/I; Dürer-derived KHM object | KHM describes relationship to 1518 source. Record attribution/copy status precisely; no invented beard. |
| habsburg-3 Charles V | P; Titian/Prado | Replace search URL with exact Mühlberg record for key basis. Verify individual armour and orders; avoid caricature of jaw. |
| habsburg-4 Philip I | P/I; National Trust c.1495 panel | About 17; retain youthful clean-shaven face. Check cap and Golden Fleece against exact image, not older Philip II. |
| habsburg-5 Ferdinand I | P; KHM portrait | Distinguish sixteenth-century emperor from nineteenth-century namesake. Exact beard/hair/date need source-image comparison. |
| habsburg-6 Philip II | P; Anguissola 1573 | Direct page failed to fetch this audit. Existing attribution/date basis retained pending accessible image comparison. |
| habsburg-7 Anna of Austria | P; Prado Ana portrait | Identity selection remains an art-direction decision: 1549–1580, Philip II's wife. Do not conflate Bourbon Anne. |
| habsburg-8 Margaret of Austria | P; Meit adult bust | Prefer adult bust for chosen age about 40; Met childhood image cannot certify adult face. Check cap construction. |
| habsburg-9 Ferdinand II | P; Pachmann c.1635 | Emperor 1578–1637, not Tyrolean archduke. Verify black harness and white collar directly. |
| habsburg-10 Leopold I | P/I; von Block tradition | Biography is indirect portrait evidence. Add actual object with date and inspect wig, moustache and orders. |
| habsburg-11 Charles VI | P/I; institutional portrait | Record exact portrait maker/date; c.1720/30 range must align with selected age c.1730. |
| habsburg-12 Joseph II | P/I; portrait tradition plus policy biography | Government policy does not authenticate this uniform. Add a dated portrait showing insignia/coat and hair. |
| habsburg-13 Mary of Hungary | P; Leoni c.1555 bust | Widow silhouette and mature face have object basis. Painted skin/hair/color and Brussels room remain interpretation. |

Sources: [existing Habsburg dossier](CHARACTER-PORTRAIT-RESEARCH.md#habsburg-0--rudolf-i); Princeton and KHM indexed records checked below.

### Bourbon

| ID / person | Basis | Required check or correction |
|---|---|---|
| bourbon-0 Henry IV | P; Pau portrait tradition | Do not translate allegorical Mars costume into literal armour. Select ordinary period armour comparator separately. |
| bourbon-1 Louis XIV | P; Rigaud 1701 | About 63; preserve mature face beneath wig. Verify orders and mantle rather than adding arbitrary royal jewelry. |
| bourbon-2 Louis XIII | I/P; later engraving after Champaigne | Engraving transmits a type, not a fresh sitting. Seek underlying painting; no later grand Versailles setting. |
| bourbon-3 Anne of Austria | P/I; Versailles teaching portrait | About 46 in regency scene. Name exact source object/date and widow dress; not Spanish Anna aged 24. |
| bourbon-4 Louis XV | P; van Loo 1763 | About 53. Costume and powdered hair should follow selected object, not Louis XVI's younger face. |
| bourbon-5 Louis XVI | P; Callet 1779 type | Selected 1783 scene is an adaptation of earlier portrait. Working desk and props are inferred. |
| bourbon-6 Marie Antoinette | P/I; portrait tradition/context | A dauphine acquisition record may depict earlier age than chosen 1784. Add the exact mature portrait informing face/gown. |
| bourbon-7 Marie de’ Medici | P; Louvre portrait/Rubens tradition | Distinguish allegorical cycle from literal costume evidence; verify Luxembourg gallery's state at chosen 1622. |
| bourbon-8 Philippe of Orléans | R/P; biography/portrait tradition | Monsieur 1640–1701, not Regent. Biography does not substantiate facial details; add direct portrait object. |
| bourbon-9 Louis II de Condé | P; Egmont tradition | Replace broad press dossier with direct object record; verify chosen age and no nineteenth-century rebuilt château. |
| bourbon-10 Antoine of Bourbon | P; Clouet 1557 at Pau | Use exact 1557 portrait image for beard, cap and doublet. Keep distinct from older son Henry IV. |
| bourbon-11 Jeanne d’Albret | R/I; biography/collection context | Exact face and gown lack direct cited portrait record. Add identified dated object before calling portrait-informed accuracy. |
| bourbon-12 Philip V | P; Ranc 1723 | Direct page unavailable during audit; retain pending verification of armour, sash, orders and age about 40. |
| bourbon-13 Louis XVIII | P/I; Guérin/Restoration | Versailles confirms abandonment of return to palace. Keep generic Restoration study, not residence claim; verify exact orders. |

Sources: [existing Bourbon dossier](CHARACTER-PORTRAIT-RESEARCH.md#bourbon-0--henry-iv); reopened Versailles biography below.

## Fresh source checks and limits

- **Henry III:** Abbey page read in full. Rebuilding chronology and posthumous effigy distinguish architectural context from face evidence. [Abbey](https://www.westminster-abbey.org/abbey-commemorations/royals/henry-iii).
- **Edward I:** Abbey page read in full. It records tall stature, undecorated tomb without effigy, 1774 observation of red/gold burial robes and crimson mantle, and only tentative identification of the Sedilia figure. [Abbey](https://www.westminster-abbey.org/abbey-commemorations/royals/edward-i-and-eleanor-of-castile).
- **Louis XI:** Louvre LP 1774 record read; dated 1838 and attributed to Jaley. [Louvre](https://collections.louvre.fr/en/ark:/53355/cl010091426).
- **Marguerite:** Louvre trail read, establishes 1572 wedding context only. Morgan indexed institutional result identifies the portrait drawing; direct open blocked. [Louvre trail](https://www.louvre.fr/en/explore/visitor-trails/the-louvre-s-masterpieces/ancient-masterpieces-from-the-royal-collections), [Morgan](https://www.themorgan.org/drawings/item/109648).
- **Margaret Tudor:** NPG conservation record read, explicitly describes unknown sitter and unreliable former identities. [NPG 1173](https://www.npg.org.uk/collections/search/portraitConservation/mw04202/Unknown-woman-formerly-known-as-Margaret-Tudor).
- **Henry VII:** NPG conservation/case-study text read; 1505 date and detailed clothing discussed by the owning institution. [NPG case study](https://www.npg.org.uk/collections/research/programmes/making-art-in-tudor-britain/case-studies/matb-case-study-4/).
- **Richard II:** National Gallery Wilton Diptych record opened; useful contextual source. This audit did not independently compare the generated face to its pixels. [National Gallery NG4451](https://www.nationalgallery.org.uk/paintings/english-or-french-the-wilton-diptych).
- **John II:** Louvre RF 2490 read; catalogue dates panel c.1355–1360. [Louvre](https://collections.louvre.fr/ark:/53355/cl010061370).
- **Maria Theresa / Maximilian:** institutional indexed catalogue descriptions checked, not source-image approval. [Princeton](https://artmuseum.princeton.edu/art/collections/objects/41536), [KHM](https://www.khm.at/de/object/2291/).
- **Louis XVIII:** Versailles biography read; royal return to Versailles was abandoned after 1815. [Versailles](https://www.chateauversailles.fr/decouvrir/histoire/grands-personnages/louis-xviii).
- **Comparative objects:** NMS brooch descriptions and Met armour article searched. They support period investigation, not personal attribution or a completed costume validation. [NMS](https://www.nms.ac.uk/collections/search/object?entry=132606&page=1&person=Melbrigda&view=cards), [Met](https://www.metmuseum.org/de/essays/fashion-in-european-armor-1300-1400).
- **Access failures:** Prado Philip II and Philip V pages returned errors on direct open. No successful new verification is claimed for them.

## Completion standard for portrait approval

For each generated file record: selected depiction year; subject age or explicitly invented apparent age; exact portrait/object identifiers; one costume comparator; one setting comparator where the building is identifiable; which features are documented and which reconstructed; source and output images actually viewed; and the resulting correction or approval. A hash/path uniqueness check detects file reuse but cannot validate history or guarantee visibly distinct people. Keep the two checks separate.

## Corrective generation briefs — Henry III and Edward I

Follow-up research on 16 September. The Abbey's own effigy photograph and reconstruction were downloaded and visually inspected: `artifacts/portraits/henry-iii-effigy-reference.jpg` and `henry-iii-architecture-reference.jpg`. They are reference evidence, not assets cleared for redistribution.

**Correction to the preliminary architecture concern:** ornate Gothic is not itself an anachronism for Henry III. The institutional reconstruction includes tracery, a rose window, pinnacles and flying buttresses. The concern is the generated building's unverified configuration and extent, rather than richness alone. The Abbey documents the early eastern work, Purbeck columns and colored decoration, while the western nave remained Norman long after Henry's death. A tightly framed eastern interior avoids inventing a whole skyline. [Abbey architecture](https://www.westminster-abbey.org/history/explore-our-history/architecture).

### Henry III — plantagenet-4

**Choose 1269, age 62, eastern Westminster interior.** Use royal robes with a tunic and mantle secured on his right shoulder, an open leaf crown and restrained textile ornament. The British Museum's record of Stothard's drawing describes these forms on the effigy; it is a later record of a posthumous monument, not proof that Henry wore a specific colored garment at a particular moment. [British Museum 1883,0714.518](https://www.britishmuseum.org/collection/object/P_1883-0714-518). The catalogue search description was available; its direct page returned an error.

**Distinctive casting:** compact seated composition, broad oval/full-cheeked elderly face, short straight nose, heavy lids, receding silver hair and a neatly squared short silver beard; soft but alert expression. These features are deliberately invented to differentiate him. The inspected bronze shows long stylized hair and beard, but it does not compel an exact living face. Do not claim this alternative casting is the effigy's verified anatomy.

**Generation prompt:**

> Paint one new full-art historical reconstruction of Henry III of England, age 62 in 1269, a compact seated elderly architectural patron with a broad oval face, full cheeks, short straight nose, heavy eyelids, receding silver hair and neatly squared short silver beard. These facial choices are reconstructed, not a copied verified likeness. Give him a long muted warm-blue tunic and a softly draped russet silk mantle secured on HIS right shoulder with a small clasp, quiet woven edging and a modest open leaf crown. Clothing silhouette follows his medieval effigy; colors are artistic choices. His hands rest low around a small closed devotional book rather than a large architectural blueprint. Behind him show only one closely cropped eastern Westminster pointed arch and polished dark Purbeck shaft, a small softly focused ruby-and-sapphire grisaille window, and restrained painted stone detail. Newly finished 1269 interior, no whole cathedral skyline, no later Tudor fan vault, no eighteenth-century west towers, no giant pinnacled facade. Warm interior light, quiet material richness, clearly visible mature face. Portrait occupies the upper central field with generous air above and at upper left for the separate game-cost frame, hands above the lower caption area, no painted card border, lettering or numbers. Do not reuse the previous long narrow grey-bearded king face; avoid military armour and sprawling Gothic background. Original painterly historical-game illustration, consistent finish with the other unique portraits.

**Limits:** book, pose, exact colors and face are interpretive. A real patron's association with a building is not evidence of this staged sitting. The proposed crop is period-grounded, not a surveyed reconstruction of a named bay.

### Edward I — plantagenet-5

**Choose Christmas 1294, age 55, Conwy.** Cadw places Edward at Conwy during the rebellion and states the castle originally had white lime-rendered walls and painted shutters. This is a stronger setting than anonymous bare ruined masonry. [Cadw: more about Conwy](https://cadw.gov.wales/more-about-castell-conwy). The castle's initial construction dates to 1283–1287. [Cadw: Conwy](https://cadw.gov.wales/visit/places-to-visit/castell-conwy).

**Military clothing:** use a conservative long-sleeved mail hauberk beneath a simple sleeveless surcoat. Comparative thirteenth-century evidence is the d'Aluye family effigy, dated after 1248–by 1267, with mail hood, sleeves and surcoat. It is French comparative evidence, not Edward's own harness and not a basis for copying its distinctive sword. [Met 25.120.201, d'Aluye knight](https://www.metmuseum.org/art/collection/search/470599), [Met curator discussion](https://www.metmuseum.org/fr/perspectives/our-wandering-knight). Remove unexplained exposed riveted shoulder strips; this is a conservative uncertainty reduction, not a claim that every reinforcing plate was impossible in 1294.

**Generation prompt:**

> Paint one new full-art historical reconstruction of Edward I of England, age 55 at Conwy in winter 1294. A notably tall, lean standing man: long narrow face, prominent straight nose, angular jaw, straight brown-grey hair to his jaw and a close brown-grey beard, sober direct gaze. Facial fine details are invented; make him clearly different from compact full-cheeked seated Henry III. Long-sleeved small-ring mail hauberk, simple unornamented sleeveless dark ochre wool surcoat, narrow leather belt, plain wool cloak thrown behind one shoulder so the mail is visible. No exposed metal shoulder strips, no plate pauldrons, no articulated steel breastplate, no fantasy armor. A restrained open crown, one hand resting low on a plain sheathed straight sword, other hand relaxed, no repeated rolled document. Background: a tight courtyard-side fragment at Conwy, fresh off-white lime-rendered medieval wall, one painted wooden shutter and a sliver of cold estuary light; the roofed castle is inhabited and maintained, not a ruined tourist site. Do not invent an entire castle panorama or modern bridge. Cool winter daylight separates the tall narrow silhouette from warm-shadowed Henry's indoor painting. Head upper center, clear space above and at upper-left for the separate game frame, lower hands clear of caption area. No card border, lettering or numbers. Original painterly historical-game illustration, an individual reconstructed person rather than a reused king archetype.

**Limits:** Cadw supports presence and material setting, not this exact stance, outfit or weather. Comparative French mail evidence supports a conservative silhouette, not personal ownership. Gold/red burial clothes are not automatically his everyday military uniform, so the old burial-to-armour inference is removed.

### Additional image screening in this follow-up

Viewed the existing full-card contact sheets for Alba, Valois, Habsburg, Tudor and Bourbon, plus individual Kenneth MacAlpin and Philip V source assets. This is a screen for large visible problems, not detailed 70-person approval. No additional unambiguous chronological error was established from those thumbnails. Do not elevate resemblance-based guesses into historical findings: Kenneth's apparently stone gallery columns proved to be carved timber when the original was opened; Philip V's distant complex was not demonstrably the nineteenth-century Palace of Westminster. These two suspicions were rejected rather than reported as defects. The unresolved costume/object and exact-portrait gaps in the roster table remain actionable.
