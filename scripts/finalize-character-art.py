"""Merge completed generation records and encode browser assets without changing geometry."""
import json
import shutil
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
records = root / 'docs/art'
manifest_path = records / 'character-generation.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
for name in ['character-generation-remaining.json', 'character-generation-revisions.json']:
    batch = json.loads((records / name).read_text(encoding='utf-8'))
    for card_id, record in batch.items():
        if card_id in manifest:
            record['previous'] = manifest[card_id]
        manifest[card_id] = record
briefs = json.loads((records / 'character-briefs.json').read_text(encoding='utf-8'))
assert set(manifest) == set(briefs), f'Missing portraits: {set(briefs) - set(manifest)}'

public = (root / 'public/art/characters').resolve()
masters = (records / 'character-masters').resolve()
assert public.is_relative_to(root) and masters.is_relative_to(root)
masters.mkdir(exist_ok=True)
for card_id, record in manifest.items():
    source = (root / 'public' / record['asset']).resolve()
    assert source.is_relative_to(public) and source.suffix == '.png'
    target = source.with_suffix('.webp')
    with Image.open(source) as image:
        image.convert('RGB').save(target, 'WEBP', quality=94, method=6)
        with Image.open(target) as check:
            assert check.size == image.size
        record['dimensions'] = list(image.size)
    record['master'] = str((masters / source.name).relative_to(root)).replace('\\', '/')
    record['asset'] = str(target.relative_to(root / 'public')).replace('\\', '/')
    record['encoding'] = 'WebP quality 94; original pixel dimensions; PNG master retained'

# Preserve every generated candidate, including superseded revisions, outside web delivery.
for source in public.glob('*.png'):
    source = source.resolve()
    target = (masters / source.name).resolve()
    assert source.is_relative_to(public) and target.is_relative_to(masters)
    if target.exists():
        raise RuntimeError(f'Refusing to overwrite master {target}')
    shutil.move(str(source), str(target))
manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
print(f'{len(manifest)} portraits encoded; PNG masters retained in {masters}')
