#!/usr/bin/env python3
"""Copy approved examples and local font assets into a new design workspace."""
import argparse
import shutil
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--style', required=True, choices=['1', '2', '3'])
    parser.add_argument('--aspect', choices=['4:5', '16:9'], default='4:5',
                        help='Artboard ratio: 4:5 (1080 x 1350, default) or 16:9 (1920 x 1080).')
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    output = args.output.expanduser().resolve()
    if output.exists() and (not output.is_dir() or any(output.iterdir())):
        parser.error(f'Output must be a new or empty folder: {output}')
    assets = Path(__file__).resolve().parents[1] / 'assets'
    templates = assets / 'templates'
    if args.aspect == '16:9':
        templates = templates / 'landscape-16x9'
    shutil.copytree(templates / f'style-{args.style}', output, dirs_exist_ok=True)
    for name in ['style.css', 'fit.js', 'gallery.css']:
        shutil.copy2(assets / 'shared' / name, output / name)
    if args.aspect == '16:9':
        for name in ['landscape.css', 'fit.js']:
            shutil.copy2(assets / 'shared' / 'landscape-16x9' / name, output / name)
    shutil.copytree(assets / 'fonts', output / 'assets' / 'fonts', dirs_exist_ok=True)
    (output / 'png').mkdir(exist_ok=True)
    print(f'Created style {args.style}, {args.aspect} examples at {output}. Adapt content and pagination, then render previews.')


if __name__ == '__main__':
    main()
