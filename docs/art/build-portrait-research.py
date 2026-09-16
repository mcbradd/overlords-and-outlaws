"""Rebuild the human-readable audit from the researched portrait briefs."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[2]
briefs = json.loads((root / 'docs/art/character-briefs.json').read_text(encoding='utf-8-sig'))
lines = ['''# Character portrait research — full roster

Audited 15 September 2026 against all 84 IDs in `src/content.ts`. This is art direction for a physical game prototype, not a claim to recover photographic appearances. Sources are museum, library, heritage, cathedral and royal institutional records. Costume, props and settings are artistic inferences unless the entry identifies surviving portrait or object evidence. Pages were researched through web search/open tools; a catalogue description does not imply every source image was visually inspected.

## Roster findings and identity decisions

- Houses are game groupings, not a rigorous single-line dynastic taxonomy. Alba spans Alpin, Dunkeld, Bruce and Stewart rulers. Marjorie Bruce and Joan of Kent were not reigning queens: the game role does not justify sovereign regalia. No roster or rules changes are made by this audit.
- Habsburg Anna is interpreted as Anna of Austria (1549–1580), fourth wife of Philip II; Bourbon Anne is Anne of Austria (1601–1666), wife of Louis XIII and regent. The former name alone is ambiguous: selecting that Anna is an art-direction decision supported by the Prado portrait, not new evidence of designer intent.
- Philippe of Orléans is Monsieur (1640–1701), Louis XIV's brother, matching the card epithet; not his son, the Regent. Habsburg Ferdinand II is the emperor (1578–1637), not the Tyrolean archduke. Margaret of Austria is the Netherlands regent (1480–1530); Mary of Hungary is Charles V's sister (1505–1558).
- Many medieval facial likenesses are unknown. Effigies, seals and later portraits support iconography with limits. Invented faces must not become authenticated likenesses by implication. Later court portraits are stronger evidence but remain constructed representations.
- Avoid present-day national costume projected backward: clan tartan and kilts for early Alba, full plate for twelfth-century knights, ruffs for medieval courts, and powdered wigs for sixteenth-century rulers. Each person needs their actual century and court, not a universal king or queen costume.

## Frame composition contract

Use vertical paintings behind the existing family raster frames. Keep heads and crown tips within the upper opening, quiet background behind ornaments, and hands/identifying props above the lower name and rules ribbons. Do not bake names, rules, numerals, frame ornament or a second border into portraits. Preserve 63:88 component geometry and inspect both reference and taller battlefield apertures.

Palette recommendations: Alba — stone, silver, muted green; Plantagenet — warm limestone, crimson, gold; Tudor — charcoal, ivory, deep rose; Valois — muted blue and warm Renaissance stone; Habsburg — sober black, ivory and burnished gold; Bourbon — deep blue and controlled warm gilding. These complement the interlace, Gothic, rose, strapwork, imperial-collar and sun-ray frames respectively. They are art choices, not historical family uniforms.

## Individual briefs
''']
for house in ['alba', 'plantagenet', 'tudor', 'valois', 'habsburg', 'bourbon']:
    for i in range(14):
        key = f'{house}-{i}'
        e = briefs[key]
        sources = '; '.join(f'[Institutional source]({s})' for s in e['sources'])
        identity = ('\n\n**Visual identity:** ' + e['visualIdentity']) if e.get('visualIdentity') else ''
        review = ('\n\n**Architecture / evidence review:** ' + e['artDirectionReview']) if e.get('artDirectionReview') else ''
        lines.append(f"""### {key} — {e['name']}

**Identity / period:** {e['era']}

**Attire:** {e['attire']}

**Props:** {e['props']} **Setting:** {e['setting']}

**Evidence and interpretation:** {e['likeness']}{identity}{review}

**Avoid:** {e['avoid']}

Sources: {sources}.
""")
lines.append('''## Deliverable boundary

Machine-readable briefs: [character-briefs.json](../art/character-briefs.json). This audit records research and proposed compositions. Generation, crop inspection and in-game verification are separate work and must be recorded only after they happen. Original reference artwork remains untouched.
''')
assert len(briefs) == 84
(root / 'docs/research/CHARACTER-PORTRAIT-RESEARCH.md').write_text('\n'.join(lines), encoding='utf-8')
print('Wrote complete 84-character audit.')
