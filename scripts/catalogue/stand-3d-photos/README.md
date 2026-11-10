# 3D colour god stand photos (kit-13)

Made on 2026-11-10 from the owner's seven phone photos of the stands (1 Radha Krishna, 2 Venkateswara
Balaji, 3 Ganesh, 4 Shiva Parivar, 5 Bal Krishna, 6 Ram Darbar, 7 Lakshmi Ganesh Shubh Labh).

The deity artwork is never repainted or regenerated. The steps only:

1. `foilwarp.py` straightens the silver foil from four hand-picked corners (`foil_manual.json`).
2. `compose.py` paints out the stamped plate in the bottom-left corner by copying the same foil
   pattern row from further right. It evens out the phone's uneven light and applies a mild white
   balance. It then places the foil in a clean white mount and a drawn clear-acrylic stand on the
   site's cream backdrop.

```bash
python3 foilwarp.py <photos-dir> <work-dir> 40
python3 compose.py <work-dir> <out-dir>
```

Save the results as WebP (quality 86) to `public/assets/products/`:
- `stand{N}.png` → `kit-13-0N.webp`
- `art{N}.png` → `kit-13-0N-closeup.webp`

The catalogue rows come from `../build-3d-stands.py` (migration 0017).
