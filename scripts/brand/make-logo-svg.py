"""Rebuild the SWAYARI wordmark as clean vector SVGs (letters as outlines, no fonts needed at runtime).

Usage: python3 scripts/brand/make-logo-svg.py <fonts_dir> <out_dir>
Writes swayari-logo-light.svg (for ivory backgrounds) and swayari-logo-gold.svg (for dark backgrounds).
"""
import sys
from io import BytesIO
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

FONTS, OUT = sys.argv[1], sys.argv[2]


def instance(path, wght):
    f = TTFont(path)
    f = instantiateVariableFont(f, {'wght': wght})
    buf = BytesIO()
    f.save(buf)
    buf.seek(0)
    return TTFont(buf)


def text_path(font, text, size, tracking):
    """Return (svg path d, width, (ymin, ymax)) for text set at `size` with extra `tracking` per letter (font units)."""
    gs = font.getGlyphSet()
    cmap = font.getBestCmap()
    scale = size / font['head'].unitsPerEm
    pen = SVGPathPen(gs)
    bp = BoundsPen(gs)
    x = 0
    names = [cmap[ord(c)] for c in text]
    for i, n in enumerate(names):
        g = gs[n]
        # y flipped: font units are y-up, SVG is y-down
        g.draw(TransformPen(pen, (scale, 0, 0, -scale, x * scale, 0)))
        g.draw(TransformPen(bp, (scale, 0, 0, -scale, x * scale, 0)))
        x += g.width + (tracking if i < len(names) - 1 else 0)
    xmin, ymin, xmax, ymax = bp.bounds
    return pen.getCommands(), xmin, xmax, ymin, ymax


bold = instance(f'{FONTS}/Cinzel.ttf', 700)
light = instance(f'{FONTS}/Cinzel.ttf', 400)

W = 1000
# Size the name so it spans 94% of the width.
_, a0, a1, _, _ = text_path(bold, 'SWAYARI', 100, 30)
name_d, nx0, nx1, ny0, ny1 = text_path(bold, 'SWAYARI', 100 * (W * 0.94) / (a1 - a0), 30)
tag_d, tx0, tx1, ty0, ty1 = text_path(light, 'DÉCOR & GIFTING', 58, 300)

name_w, tag_w = nx1 - nx0, tx1 - tx0
pad_x = (W - name_w) / 2
name_dx = pad_x - nx0
name_top = 26
name_dy = name_top - ny0  # baseline offset so the tallest point sits at name_top
name_bottom = name_top + (ny1 - ny0)

tag_dx = (W - tag_w) / 2 - tx0
tag_top = name_bottom + 34
tag_dy = tag_top - ty0
tag_bottom = tag_top + (ty1 - ty0)

orn_cy = tag_bottom + 56
H = round(orn_cy + 50)
CX = W / 2

LOTUS = (
    # centre petal + inner jewel
    'M0,-26 C10,-14 10,-2 0,8 C-10,-2 -10,-14 0,-26 Z'
    ' M-15,-17 C-16,-6 -10,3 -1,8 M15,-17 C16,-6 10,3 1,8'
    ' M-30,-6 C-24,4 -12,9 -2,9 M30,-6 C24,4 12,9 2,9'
    ' M-17,12 Q0,17 17,12'
)


def svg(variant, compact=False):
    dark = variant == 'gold'
    h = round(tag_bottom + 16) if compact else H
    if dark:
        stops = [('0', '#FFF1C9'), ('0.32', '#F1D27E'), ('0.55', '#C99A43'), ('0.72', '#F6DC97'), ('1', '#A9772B')]
        edge, edge_op = '#5A3A0C', 0.55
        tag_fill = '#F4EAD3'
        shadow = (
            '<feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="#E3CC9A" flood-opacity="0.35"/>'
            '<feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity="0.55"/>'
        )
    else:
        stops = [('0', '#E9CD84'), ('0.3', '#CFA24C'), ('0.55', '#9C6C22'), ('0.74', '#D7AE5C'), ('1', '#7A5114')]
        edge, edge_op = '#5C3A0A', 0.6
        tag_fill = '#5E1A28'
        shadow = (
            '<feDropShadow dx="0" dy="1.2" stdDeviation="0.6" flood-color="#3A2208" flood-opacity="0.35"/>'
            '<feDropShadow dx="0" dy="7" stdDeviation="8" flood-color="#5E1A28" flood-opacity="0.22"/>'
        )
    ORN = f'''<g transform="translate({CX},{orn_cy:.1f})">
<rect x="-330" y="-0.9" width="285" height="1.8" fill="url(#orn)"/>
<rect x="45" y="-0.9" width="285" height="1.8" fill="url(#ornR)"/>
<g filter="url(#s)">
<path d="{LOTUS}" fill="none" stroke="url(#gl)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" transform="translate(0,-4) scale(1.3)"/>
<path d="M0,-17 L4,-10 L0,-3 L-4,-10 Z M0,18 L5,25 L0,32 L-5,25 Z" fill="url(#gl)" transform="translate(0,-4) scale(1.3)"/>
</g>
</g>
'''
    stop_xml = ''.join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops)
    line_c = '#B8924A' if not dark else '#E3CC9A'
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {h}" role="img" aria-label="SWAYARI — Décor &amp; Gifting">
<defs>
<linearGradient id="g" x1="0" y1="{ny0:.1f}" x2="0" y2="{ny1:.1f}" gradientUnits="userSpaceOnUse">{stop_xml}</linearGradient>
<linearGradient id="gl" x1="0" y1="0" x2="0" y2="1">{stop_xml}</linearGradient>
<linearGradient id="shine" x1="0" y1="{ny0:.1f}" x2="0" y2="{ny1:.1f}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff" stop-opacity="0.55"/><stop offset="0.42" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="orn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="{line_c}" stop-opacity="0"/><stop offset="1" stop-color="{line_c}"/></linearGradient>
<linearGradient id="ornR" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="{line_c}"/><stop offset="1" stop-color="{line_c}" stop-opacity="0"/></linearGradient>
<filter id="s" x="-10%" y="-30%" width="120%" height="170%">{shadow}</filter>
</defs>
<g filter="url(#s)">
<path transform="translate({name_dx:.2f},{name_dy:.2f})" d="{name_d}" fill="url(#g)" stroke="{edge}" stroke-opacity="{edge_op}" stroke-width="1.4" paint-order="stroke"/>
<path transform="translate({name_dx:.2f},{name_dy:.2f})" d="{name_d}" fill="url(#shine)"/>
</g>
<path transform="translate({tag_dx:.2f},{tag_dy:.2f})" d="{tag_d}" fill="{tag_fill}"/>
{"" if compact else ORN}</svg>
'''


for v in ('light', 'gold'):
    with open(f'{OUT}/swayari-logo-{v}.svg', 'w') as fh:
        fh.write(svg(v))
    with open(f'{OUT}/swayari-logo-{v}-compact.svg', 'w') as fh:
        fh.write(svg(v, compact=True))
print('viewBox', W, H)
