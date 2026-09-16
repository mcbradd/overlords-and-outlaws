"""Add explicit, uncertainty-aware visual identity direction to all 84 briefs."""
import json
from pathlib import Path

path = Path(__file__).with_name('character-briefs.json')
data = json.loads(path.read_text(encoding='utf-8-sig'))
identities = {
'alba': [
'Mid-ninth century; apparent age 50 is an invented casting choice because birth date is uncertain. Broad square face, heavy straight brows, deep-set eyes, coarse dark hair threaded with grey, close full beard; grounded and still. All facial details invented, not a recovered likeness.',
'Circa 1080, about 35. Invented narrow oval face, fine straight brows, long nose and calm closed mouth, brown hair barely visible beneath veil. Distinct from the younger, rounder Matilda; no verified life likeness.',
'Circa 1080, about 49. Invented large broad head, strong cheek planes, broken-looking but not claimed injured nose, thick dark moustache and short salt-and-pepper beard, receding temples; robust mature build. No verified face.',
'Circa 1140, about 56. Invented lean long face, high forehead, thin lips, swept-back greying hair and clean-shaven chin. Elderly scholarly bearing without spectacles. Facial choices are reconstruction.',
'Circa 1195, about 53. Invented broad long face, weathered cheeks, greying sandy hair and short forked beard, steady deep-set gaze. Deliberately older and bearded beside clean-shaven Alexander II and III; no assured likeness or hair colour.',
'At the 1237 Treaty of York, age 38–39. Invented narrow oval face, straight auburn hair ending at jaw, clean-shaven cheeks and chin, long straight nose and slight downward mouth corners. Hair colour and face are artistic choices, not historical facts.',
'At the 1266 settlement, about 25. Invented youthful full cheeks, broad short nose, clean-shaven face, thick dark softly wavy ear-length hair, upright relaxed bearing. Clearly younger and rounder than Alexander II; no verified likeness.',
'Bannockburn period 1314, about 40. Invented angular compact face, close-cropped dark hair, short practical beard, pronounced cheekbones and determined closed mouth. Neither a film actor nor a claim to definitive skull reconstruction.',
'Circa 1315, about 19. Invented youthful heart-shaped face, soft broad cheekbones, straight brows, auburn-brown hair covered by veil. No adult age beyond her short life; individual features are invented.',
'Circa 1380, about 64. Invented heavy-lidded older face, broad nose, thinning white hair and close white beard, lined cheeks and substantial neck. Age grounded in chronology; not a youthful warrior or known exact likeness.',
'Circa 1038; invented apparent age early thirties, not a claim to precise birth date. Long clean-shaven face, strong rounded chin, dark short curls and alert wide eyes. Avoid Shakespeare elderly-victim casting.',
'Circa 895; invented apparent age mid-forties because birth date is uncertain. Wide cheekbones, narrow chin, long dark moustache with otherwise shaved chin, straight shoulder-length dark hair. Deliberate invented identity, not documented grooming.',
'Late reign circa 935; invented apparent age about 60, since exact birth date is uncertain. Thin triangular face, high domed forehead, sparse grey hair and long narrow silver beard; gentle tired eyes. Not an authenticated likeness.',
'Circa 1110, about 30. Invented rounder face than Margaret, softly arched brows, small firm chin, dark hair concealed under linen veil, engaged direct gaze. No verified portrait; not Empress Matilda.'
],
'plantagenet': [
'Circa 1170, about 37. Compact broad face, heavy neck, short reddish beard and receding reddish hair are reconstruction choices here, not certified by the effigy. Distinct from tall lean Richard.',
'Choose circa 1190, about 68. Elderly long oval face with fine wrinkles, firm mouth and grey hair mostly hidden by veil. Effigy guides the reading pose and courtly silhouette, not facial accuracy; do not default to a twenty-year-old queen.',
'Circa 1192, about 35. Invented long rectangular face, long straight nose, closely trimmed tawny beard and shoulder-length tawny hair; tall upright bearing. Commemorative effigy is not proof of these exact colours/features.',
'Circa 1215, about 48. Rounded middle-aged face, high forehead, short curled beard with a little grey and medium dark wavy hair. These are interpretive variations on effigy convention, not an authenticated living likeness.',
'Circa 1265, about 58. Invented slim older face, slightly asymmetrical brows, straight nose, short greying beard and thin greying hair; attentive architectural-patron bearing. Effigy supplies iconographic context.',
'Circa 1295, about 56. Tall lean silhouette, long face, prominent nose, shoulder-length silver-brown hair and close grey beard. Living face is invented; burial evidence does not certify hair colour or exact facial structure.',
'Circa 1318, about 34. Invented broad smooth forehead, full lips, strong rounded chin, clean-shaven cheeks and softly waved brown jaw-length hair. Mature adult, not a child or effeminized caricature; effigy-informed convention only.',
'Choose circa 1355, about 43. Long face and flowing dark hair with substantial pointed beard echo tomb convention; living expression and hair colour reconstructed. Broader shoulders than Richard II, no late-life death-mask look.',
'Choose circa 1355, about 41. Full broad face and substantial mature figure following alabaster effigy, small mouth and soft cheeks; hair hidden by veil. Natural mature woman, not a generic slim young queen.',
'Circa 1395, about 28. Contemporary Wilton image supports slender youthful royal type: elongated oval face, fine brows, smooth pale cheeks and auburn hair; light fine facial hair only if following that iconography. Idealized portrait, not photographic certainty.',
'Circa 1365, about 35. Invented narrow athletic face, strong straight brow, thick dark hair and a neat short moustache with close chin beard. Armour evidence is firmer than the reconstructed living face. Not black skin or black-painted face derived from epithet.',
'Choose circa 1370, about 42. Invented broad heart-shaped face, long nose, full lips, auburn-brown hair mostly concealed, mature composed gaze. Exact features unknown; avoid generic youthful bride despite marriage role.',
'Circa 1140, about 27. Slender youthful face, short neat beard, straight brown hair to ears; colouring and realism invented around stylized enamel reference. No middle-aged generic monarch.',
'Circa 1325, about 30. Invented sharply oval face, high cheekbones, small straight mouth, dark hair mostly covered, clear steady gaze. Not a snarling villain or literal wolf; precise features not evidenced by contextual source.'
],
'tudor': [
'Circa 1505, about 48. NPG portrait tradition: narrow long face, high cheekbones, thin firm mouth, long nose, dark greying straight hair under cap, clean-shaven. Reserved middle-aged bearing; setting and micro-expression inferred.',
'Circa 1575, about 42. Darnley portrait tradition: long pale oval face, high forehead, fine arched brows, reddish curled hair, narrow mouth. A mature queen, not teenage beauty; age lines restrained by idealized court portrait conventions.',
'Circa 1540, about 49. Holbein-derived broad nearly square face, small eyes, compact reddish beard, broad neck and imposing substantial shoulders. Keep unmistakably different from Henry VII; no generic lean warrior.',
'1554, about 38. Mor portrait: narrow mature face, high forehead, firm lips, long nose and light reddish-brown hair largely covered by hood. Composed direct gaze without villainous red lighting.',
'Circa 1550, about 13. Smooth adolescent oval face, small chin, light straight hair and clean-shaven cheeks; slender boy shoulders. Royal portrait evidence supplies youthful proportions; never an adult bearded Lawgiver.',
'Circa 1500, about 34. Later portrait tradition: pale oval face, softly pointed chin, fine brows, small closed lips and hair largely hidden by gable hood. Treat facial specifics as interpretation from copies, not direct sitting.',
'Circa 1505, about 62. Older narrow lined face, high cheekbones, thin mouth, hair entirely hidden by white vowess headwear. Posthumous portrait tradition supports older devotional silhouette, not photographic precision.',
'Circa 1455, about 25. Invented smooth elongated face, strong brow, dark straight jaw-length hair, clean-shaven cheeks and chin, slim shoulders. No secure life portrait; not a later infant Edmund Tudor.',
'Circa 1485, about 54. Invented broad weathered face, heavy eyelids, pronounced nose, greying brown collar-length hair, clean-shaven face appropriate to chosen late-fifteenth-century court styling. Do not repeat Edmund youthful oval.',
'Circa 1515, about 26. Cautious reconstruction: broad oval face, high forehead, soft pointed chin, reddish-brown hair almost hidden by hood. Later portrait evidence cannot certify precise youthful facial details.',
'1514–1515, about 18–19. Invented youthful rounded oval face, full lower lip, delicate straight nose and fair reddish hair framed by early hood. Clear age and face distinction from her niece Mary I at 38; exact likeness unestablished here.',
'Circa 1500, about 14. Wewyck-associated portrait tradition: slight adolescent face, slim nose, small chin, auburn/light brown straight hair under cap, entirely clean-shaven. Boy proportions, not adult warrior prince.',
'Choose circa 1435; invented apparent age mid-thirties, birth uncertain. Invented compact broad face, slightly rounded nose, thick dark straight hair to ears, clean-shaven chin and strong neck. No claimed life likeness or ethnic facial stereotype.',
'Circa 1525, about 40. Accepted portrait types: mature oval face, softly full cheeks, small firm mouth and auburn hair mostly concealed by hood. Do not infer black hair from Spanish origin; exact colour and face remain interpreted.'
],
'valois': [
'Circa 1340, about 47. Invented long narrow face, high forehead, swept-back greying dark hair and a neatly divided medium beard. Effigy is idealized, so no claim to exact facial likeness.',
'Circa 1535, about 41. Clouet-derived long prominent nose, narrow eyes, broad horizontal brows, dark short beard and moustache; wide-shouldered imposing build. Strong facial evidence in court portrait tradition, micro-expression newly painted.',
'Choose circa 1570, about 51. Mature broad face, heavy-lidded eyes, short firm mouth, high forehead entirely framed by widow veil. Portrait-informed, neither glamorous young bride nor witch caricature.',
'Circa 1370, about 32. Individualized effigy informs thin elongated face, prominent nose, slight pointed beard and composed expression; paint dark straight hair and realistic skin as interpretation. Young mature scholar, not an old sage.',
'Circa 1450, about 47. Fouquet tradition: long nose, heavy-lidded eyes, downturned mouth, clean-shaven angular cheeks and tired mature expression. Natural brown hair under soft hat, no Renaissance beard.',
'Circa 1470, about 47. Portrait-tradition long pointed nose, thin closed lips, lean cheeks, dark hair mostly hidden by cap; clean-shaven. Wary expression is artistic, not proof of scheming character.',
'Circa 1558, about 39. Clouet-derived narrow oval face, cropped dark hair, short pointed beard and fine moustache; athletic upright neck and restrained gaze. Not English Henry II.',
'1570, about 20. Clouet-derived pale thin youthful face, high forehead, slight moustache and sparse pointed beard, dark hair under jeweled toque. Preserve barely adult proportions.',
'Choose circa 1582, about 31. Narrow long face, fine nose, groomed short pointed beard and moustache, dark hair beneath cap. Portrait-tradition interpretation with no sexuality-based exaggeration.',
'Choose circa 1580, about 27. Cautiously invented long oval face, softly arched brows, fuller lips, dark centrally dressed hair with pearls. Contextual sources establish identity, not these exact facial details.',
'Choose circa 1500, about 38. Contemporary manuscript royal type: long face, prominent nose, straight brown shoulder-length hair and clean-shaven chin. Facial realism remains interpretation, not an effigy photograph.',
'1517, about 18. Invented young full cheeks, small firm mouth, slightly rounded chin, brown hair mostly concealed by dark hood. Do not age beyond early twenties; prayer-book evidence does not authenticate face.',
'Choose circa 1412, about 42. Invented full oval face, high forehead, soft jaw and mature eyes; hair largely concealed by period horned headwear. Manuscript image gives court silhouette, not exact face or colouring.',
'Choose circa 1357, about 38. Louvre panel RF 2490 supports the familiar long-nosed profile, reddish hair and short beard; new three-quarter face is a cautious adaptation, not proof of exact colouring or front-view anatomy.'
],
'habsburg': [
'Circa 1280, about 62. Tomb-image tradition suggests an older lean long face and strong nose; thinning grey hair and clean-shaven cheeks chosen as reconstruction. Exact living expression and hair uncertain.',
'Choose circa 1750, about 33. Meytens portrait tradition: broad rounded face, arched brows, small mouth, full cheeks, powdered hair dressed low rather than towering. Mature sovereign and substantial figure, not generic elderly empress.',
'Circa 1518, about 59. Dürer-derived long hooked nose, pursed lips, strong chin, shoulder-length grey hair and clean-shaven face. Distinctive older emperor, no invented beard.',
'1547–1548, about 47–48. Titian-derived elongated face and lower jaw, short reddish beard, receding closely trimmed hair, serious tired eyes. Preserve recognizable proportions respectfully; avoid exaggerated Habsburg caricature.',
'Choose circa 1495, about 17. National Trust panel supports fair shoulder-length hair and youthful clean-shaven face; slender adolescent-to-young-adult cheeks, not mature bearded Philip II. New expression remains interpretation.',
'Choose circa 1555, about 52. KHM portrait tradition: long narrow face, prominent straight nose, dark hair greying at temples, close beard and moustache. Keep older statesman bearing distinct from brother Charles V; reconstructed fine details.',
'1573, about 46. Anguissola type: pale narrow mature face, receding light-brown hair, short carefully trimmed beard and moustache, heavy-lidded measured gaze. Not a black-bearded villain.',
'1573, about 24. Anguissola type: youthful elongated oval face, broad clear forehead, fine brows, small closed mouth and light dressed hair. No resemblance swap with much older Bourbon Anne regent.',
'Choose circa 1520, about 40. Meit bust supports broad oval face, substantial cheeks, small lips and steady gaze within folded linen cap. Mature widow-regent, not Met childhood portrait aged only by adding wrinkles.',
'Circa 1635, about 57. Pachmann portrait tradition: broad mature face, receding dark greying hair, thick moustache and neat pointed beard; lined forehead. Different from the young Tyrolean archduke.',
'Circa 1672, about 32. Benjamin von Block type: elongated face, pronounced lower lip/jaw, thin moustache, dark long curled wig. Young mature ruler despite wig; no grotesque exaggeration.',
'Choose circa 1730, about 45. Institutional portrait tradition: long mature face, prominent nose and lower lip, dark curled full wig, clean-shaven cheeks. Formal closed mouth, distinct from Joseph II short powdered hairstyle.',
'Choose circa 1780, about 39. Portrait-informed broad forehead, receding hairline under short powdered tied hair, full nose, clean-shaven cheeks and firm mouth. Working adult ruler, not elderly general; exact expression inferred.',
'Circa 1555, about 50. Leoni bust supports mature elongated face and sharp straight nose framed by close widow headwear, thin lips, restrained gaze. Hair concealed, age visible, not a young Spanish infanta.'
],
'bourbon': [
'Circa 1606, about 53. Pau portrait tradition: long prominent nose, greying hair, pointed grey beard and moustache, fine wrinkles and slight smile. Age-consistent mature face, not young Navarre prince.',
'1701, about 63. Rigaud type: long mature face, prominent nose, heavy-lidded eyes and thin lips beneath full dark curls; clean-shaven. Fine age lines despite state-portrait idealization, not youthful ballet Louis.',
'Choose circa 1635, about 34. Champaigne-derived slender long face, delicate moustache and pointed chin beard, natural dark hair to shoulders. No giant Louis XIV wig or elderly king features.',
'Choose circa 1647, about 46. Mature rounded face, full cheeks, high forehead and softly arched brows under widow veil; portrait-informed reconstruction. Distinct from young Anna of Spain (24).',
'1763, about 53. Van Loo portrait tradition: mature oval face, prominent straight nose, firm thin mouth, clean-shaven cheeks and powdered side curls. Do not copy Louis XVI youthful broad cheeks.',
'Choose circa 1783, about 29. Callet-derived broad youthful mature face, full cheeks, substantial neck/build, rounded nose, clean-shaven chin and powdered tied hair. Not an elderly monarch or body-size caricature.',
'Choose circa 1784, about 29. Portrait tradition: elongated oval face, high forehead, fair powdered hair, arched brows and small composed mouth. Mature adult in modest dressed hair, not a teenage bridal doll.',
'Choose circa 1622, about 49. Rubens/Pourbus portrait tradition: broad rounded face, high forehead, dark brows, substantial cheeks, brown hair dressed close beneath ornaments. Mature patron, not Catherine de Medici widow type.',
'Choose circa 1675, about 35. Cautious portrait-tradition reconstruction: smooth oval face, dark almond-shaped eyes, prominent straight nose, full lips and dark curled wig. No exact certified likeness from contextual biography; no sexuality-based caricature.',
'Choose circa 1655, about 34. Egmont portrait tradition: very prominent aquiline nose, lean long face, intense eyes, fine moustache and long dark hair. Deliberately angular and recognizably different from Louis XIII.',
'1557, about 39. Clouet source: narrow mature face, strong nose, penetrating eyes, close dark beard and moustache beneath soft cap. Not son Henry IV older grey-bearded image.',
'Circa 1565, about 37. Cautious reconstruction: long slim face, high forehead, narrow mouth, dark hair concealed by hood and concentrated gaze. Contextual sources do not certify the exact facial details.',
'1723, about 40. Ranc portrait type: elongated face, prominent nose, closed lips, clean-shaven jaw, abundant powdered-to-grey curled wig. No Philip IV thin moustache or Habsburg beard.',
'Choose circa 1818, about 63. Guérin/Restoration portrait tradition: broad elderly face, substantial cheeks and neck, short grey hair, clean-shaven chin and heavy-lidded eyes. Respectful likeness, no caricature.'
]}

for house, rows in identities.items():
    assert len(rows) == 14, house
    for i, identity in enumerate(rows):
        data[f'{house}-{i}']['visualIdentity'] = identity

reviews = {
'alba-1': 'Reconstruct a modest late-eleventh-century chapel, not the surviving twelfth-century Dunfermline nave or later Edinburgh chapel attributed to David I.',
'alba-3': 'Generic Romanesque masonry is safer than copying later Melrose ruins. The source is biography, not evidence for a surviving garment or this architectural plan.',
'alba-4': 'Arbroath was founded during his reign; show modest late-twelfth-century work, not the fully developed surviving later medieval ruin or modern restoration.',
'alba-7': 'Stirling background must be an indistinct medieval stronghold, not the present Renaissance palace, sixteenth-century Great Hall or later foreground defenses.',
'alba-9': 'Dundonald fourteenth-century hall is period-compatible; reconstruct a lived-in interior, not the modern roofless visitor-site ruin.',
'alba-13': 'Use the eleventh-century Romanesque Westminster predecessor, not the extant thirteenth-century Gothic abbey or later towers.',
'plantagenet-0': 'Chinon setting is an evocation of a twelfth-century hall, not an exact reconstruction or later château façade.',
'plantagenet-4': 'Westminster should be under construction in the 1260s; omit eighteenth-century west towers and nineteenth-century Parliament.',
'plantagenet-7': 'Use generic fourteenth-century Windsor masonry; omit nineteenth-century rebuilt skyline and later St George chapel.',
'plantagenet-13': 'Eltham means medieval royal manor context; no surviving Tudor great hall treated as built in 1325, no twentieth-century Art Deco palace.',
'tudor-2': 'Whitehall interior is reconstructed; no seventeenth-century Banqueting House or modern Hampton Court visitor fittings.',
'valois-3': 'Louvre library is a medieval keep chamber; omit Renaissance palace façades, modern courtyard and glass pyramid.',
'valois-4': 'Musée Condé source concerns a version of Fouquet portrait tradition; do not imply every institutional copy is the original life painting.',
'valois-9': 'The cited Louvre visitor trail establishes contextual identity; face and exact costume are reconstruction. Seek a dedicated portrait record before claiming portrait-specific facial evidence.',
'habsburg-3': 'Prado object record now added as specific Titian evidence. Actual portrait uses a half-pike and pistol; a command baton is an optional new composition, not copied evidence. Armour dated mid-1540s.',
'habsburg-6': 'El Escorial was under construction in 1573: use a plain granite room, no claim that the completed later decorative programme already existed.',
'bourbon-0': 'For 1606 use a generic period terrace, not the nineteenth-century reconstruction of Pau palace details.',
'bourbon-2': 'Hunting-lodge Versailles predates the grand palace and Hall of Mirrors; preserve that distinction.',
'bourbon-7': 'Chosen 1622 Luxembourg setting should be a recently built/in-progress patronage interior; do not show the completed Rubens cycle installed before 1625 or modern Senate fittings.',
'bourbon-8': 'Saint-Cloud is a reconstructed seventeenth-century salon, not a present-day surviving interior; contextual source supports court association, not exact face.',
'bourbon-9': 'Chantilly terrace must not use the nineteenth-century rebuilt château façade; generic campaign view is safest.',
'bourbon-12': '1723 Madrid royal backdrop must evoke the old Alcázar or a generic period terrace, not the present Royal Palace built after 1734.',
'bourbon-13': 'Restoration palace study is generic; not a claim Louis XVIII returned to live at Versailles.'
}
for key, note in reviews.items():
    data[key]['artDirectionReview'] = note
data['habsburg-3']['sources'].append('https://www.museodelprado.es/en/the-collection/art-work/emperor-charles-v-at-muhlberg/e7c91aaa-b849-478c-a857-0bb58a6b6729')
data['valois-13']['sources'].append('https://collections.louvre.fr/ark:/53355/cl010061370')
data['tudor-2']['sources'].append('https://www.rct.uk/collection/exhibitions/holbein-at-the-tudor-court/the-queens-gallery-buckingham-palace/henry-viii-1491-1547')
for entry in data.values():
    entry['sources'] = list(dict.fromkeys(entry['sources']))
assert len(data) == 84 and all(e.get('visualIdentity') for e in data.values())
path.write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print('Added 84 visualIdentity fields and targeted architecture/source review notes.')
