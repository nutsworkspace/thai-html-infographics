"""Check source coverage, exported PNG dimensions, and portable local dependencies."""
import hashlib
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import struct


class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links = []

    def handle_starttag(self, tag, attrs):
        self.links.extend(value for key, value in attrs if key in ('src', 'href') and value)


root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'source-map.json').read_text(encoding='utf-8'))
external = re.compile(r'^(?:[a-zA-Z][\w+.-]*:|#|//)')


def check_link(origin, value):
    if not external.match(value):
        target = origin.parent / value.split('#')[0].split('?')[0]
        assert target.exists(), f'Missing dependency: {origin.relative_to(root)} -> {value}'


for page in manifest['pages']:
    source = root / page['source']
    assert hashlib.sha256(source.read_bytes()).hexdigest() == page['source_sha256'], f'Source changed: {source}'
    for filename in page['html']:
        assert (root / filename).exists(), f'Missing artboard: {filename}'

count = 0
for style in manifest['styles']:
    folder = root / 'outputs' / '16x9' / f'style-{style}'
    reports = json.loads((folder / 'render-report.json').read_text(encoding='utf-8'))
    assert not reports.get('pageErrors') and not reports.get('requestErrors'), f'Browser errors: {style}'
    assert len(reports['reports']) == len(manifest['pages']), f'Page count mismatch: {style}'
    for report in reports['reports']:
        assert (report['width'], report['height']) == (manifest['width'], manifest['height'])
        assert not any(report[key] for key in ('artboardOverflow', 'textBoxOverflow', 'failedImages')), report['file']
        assert any('Noto Sans Thai' in face['family'] for face in report['loadedFonts']), report['file']
        png = folder / 'png' / Path(report['file']).with_suffix('.png')
        assert struct.unpack('>II', png.read_bytes()[16:24]) == (manifest['width'], manifest['height']), png
        count += 1
    assert (folder / 'collection.pdf').stat().st_size > 1000, f'Missing PDF: {style}'

for file in [root / 'index.html', *sorted((root / 'outputs').rglob('*.html'))]:
    parser = Links()
    parser.feed(file.read_text(encoding='utf-8'))
    for link in parser.links:
        check_link(file, link)
for file in (root / 'outputs').rglob('*.css'):
    for link in re.findall(r'url\([\s\"\x27]*([^\)\"\x27]+)', file.read_text(encoding='utf-8')):
        check_link(file, link.strip())
print(f'Passed {len(manifest["pages"])} source pages, {count} artboards, 3 PDF files, fonts, layout reports, and local dependencies.')
