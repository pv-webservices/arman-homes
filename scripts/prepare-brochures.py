"""Make web-sized brochure downloads and render the vector location map.

Usage: py -3 scripts/prepare-brochures.py
Reads source-assets/pdfs, writes public/brochures/*.pdf and public/images/projects/location-map.png
(the PNG is converted to WebP by scripts/prepare-project-assets.mjs conventions afterwards).
"""
import sys
from pathlib import Path

import pymupdf

SRC = Path('source-assets/pdfs')
OUT = Path('public/brochures')

BROCHURES = {
    'qrious-life-republic.pdf': 'R-14 QRIOUS Phase II Document.pdf',
    'duet-life-republic.pdf': 'Life Republic by Kolte Patil_Duet Phase 2 Opp Doc-1.pdf',
    'echoes-life-republic.pdf': 'ECHOES.pdf',
    'canvas-life-republic.pdf': 'Tower C .pdf',
    'life-republic-master-layout.pdf': 'Life Republic ~400 Acres Integrated Township Master Layout.pdf',
}


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    for target, source in BROCHURES.items():
        doc = pymupdf.open(SRC / source)
        # Downsample embedded images to screen resolution; keeps text and vectors sharp.
        doc.rewrite_images(dpi_threshold=160, dpi_target=130, quality=70)
        doc.save(OUT / target, garbage=4, deflate=True, clean=True)
        before = (SRC / source).stat().st_size / 1e6
        after = (OUT / target).stat().st_size / 1e6
        print(f'{target}: {before:.1f} MB -> {after:.1f} MB')
    location = pymupdf.open(SRC / 'Life Republic Location Map (3).pdf')
    location[0].get_pixmap(dpi=150).save('output/location-map.png')
    print('location map rendered')
    return 0


if __name__ == '__main__':
    sys.exit(main())
