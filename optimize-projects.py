"""Create web delivery copies without altering the archived artwork."""
from pathlib import Path
from PIL import Image, ImageOps
import json

root = Path(__file__).resolve().parent
dist = root / 'dist'
manifest = root / 'project-assets.json'
projects = json.loads(manifest.read_text(encoding='utf-8'))
destination = dist / 'assets' / 'portfolio'
destination.mkdir(parents=True, exist_ok=True)
archive = root.parent / 'production' / 'portfolio-originals'
archive.mkdir(parents=True, exist_ok=True)
seen = {}
before = after = 0
for project in projects:
    for item in [project['cover'], *project['gallery']]:
        original = item.get('originalSrc', item['src'])
        if original not in seen:
            source = dist / original
            if not source.exists():
                source = archive / Path(original).name
            output = destination / (source.stem + '.webp')
            # Prefixes in imported filenames keep source names unique.
            with Image.open(source) as image:
                image = ImageOps.exif_transpose(image)
                image.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
                if image.mode not in ('RGB', 'RGBA'):
                    image = image.convert('RGBA' if 'transparency' in image.info else 'RGB')
                image.save(output, 'WEBP', quality=90, method=6)
                seen[original] = {'src': output.relative_to(dist).as_posix(), 'width': image.width, 'height': image.height, 'originalSrc': original}
            before += source.stat().st_size
            after += output.stat().st_size
            # Keep downloaded originals outside the deployable folder.
            if source.resolve().is_relative_to((dist / 'assets' / 'projects').resolve()):
                archived = archive / source.name
                assert archived.resolve().is_relative_to(archive.resolve())
                if not archived.exists():
                    source.rename(archived)
        item.update(seen[original])
manifest.write_text(json.dumps(projects, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
report = {'images': len(seen), 'originalBytes': before, 'deliveryBytes': after, 'reductionPercent': round((1-after/before)*100,1)}
(root.parent / 'planning' / 'portfolio-optimization.json').write_text(json.dumps(report, indent=2)+'\n', encoding='utf-8')
print(json.dumps(report))
