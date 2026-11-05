"""Extract text, page previews and large embedded images from the client brochures.

Usage: py -3 scripts/extract-pdfs.py
Reads source-files/client/pdfs/*.pdf, writes to output/pdf-extract/<slug>/ (git-ignored working files).
"""
import json
import re
import sys
from pathlib import Path

import pymupdf

SRC = Path('source-files/client/pdfs')
OUT = Path('output/pdf-extract')
MIN_IMAGE_EDGE = 900  # skip icons and small decorations


def slug(name: str) -> str:
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')[:48]


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    summary = {}
    for pdf in sorted(SRC.glob('*.pdf')):
        key = slug(pdf.stem)
        target = OUT / key
        (target / 'pages').mkdir(parents=True, exist_ok=True)
        (target / 'images').mkdir(parents=True, exist_ok=True)
        doc = pymupdf.open(pdf)
        text_parts = []
        images = 0
        seen = set()
        for index, page in enumerate(doc, start=1):
            text_parts.append(f'\n===== PAGE {index} =====\n{page.get_text().strip()}')
            page.get_pixmap(dpi=40).save(target / 'pages' / f'p{index:02d}.png')
            for info in page.get_images(full=True):
                xref, width, height = info[0], info[2], info[3]
                if xref in seen or max(width, height) < MIN_IMAGE_EDGE:
                    continue
                seen.add(xref)
                try:
                    pix = pymupdf.Pixmap(doc, xref)
                    if pix.n - pix.alpha >= 4:
                        pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
                    pix.save(target / 'images' / f'p{index:02d}-x{xref}-{width}x{height}.png')
                    images += 1
                except Exception as error:  # noqa: BLE001 - report and continue with other images
                    print(f'  ! {pdf.name} xref {xref}: {error}', file=sys.stderr)
        (target / 'text.txt').write_text(''.join(text_parts), encoding='utf-8')
        summary[pdf.name] = {'slug': key, 'pages': doc.page_count, 'images': images, 'size': list(doc[0].rect)[2:]}
        print(f'{pdf.name}: {doc.page_count} pages, {images} large images')
    (OUT / 'summary.json').write_text(json.dumps(summary, indent=2), encoding='utf-8')
    return 0


if __name__ == '__main__':
    sys.exit(main())
