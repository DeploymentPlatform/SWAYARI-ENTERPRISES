# Step 1: straighten the silver foil of each phone photo (1.jpg … 7.jpg) using hand-picked corners.
# Usage: python3 foilwarp.py <photos-dir> <work-dir> 40
import cv2, numpy as np, sys, json
import os
HERE = os.path.dirname(os.path.abspath(__file__))
IMG, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
FOIL = json.load(open(HERE + '/foil_manual.json'))  # foil corners picked by eye: TL, TR, BR, BL
asp = []
for k, q in FOIL.items():
    q = np.float32(q)
    w = (np.linalg.norm(q[1]-q[0]) + np.linalg.norm(q[2]-q[3])) / 2
    h = (np.linalg.norm(q[3]-q[0]) + np.linalg.norm(q[2]-q[1])) / 2
    asp.append(w / h)
A = float(np.median(asp)); print('foil aspects', [round(a, 3) for a in asp], 'median', round(A, 3))
H = 1100; W = int(round(H * A)); m = int(sys.argv[3]) if len(sys.argv) > 3 else 40
tiles = []
for k, q in FOIL.items():
    im = cv2.imread(f'{IMG}/{k}.jpg')
    M = cv2.getPerspectiveTransform(np.float32(q), np.float32([[m, m], [W+m, m], [W+m, H+m], [m, H+m]]))
    wp = cv2.warpPerspective(im, M, (W + 2*m, H + 2*m), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REPLICATE)
    cv2.imwrite(f'{OUT}/foil{k}.png', wp)
    t = wp.copy()
    cv2.rectangle(t, (m, m), (W+m, H+m), (0, 0, 255), 2)
    tiles.append(cv2.resize(t, ((W+2*m)//3, (H+2*m)//3), interpolation=cv2.INTER_AREA))
blank = np.full_like(tiles[0], 255)
cv2.imwrite(OUT + '/foils.jpg', np.vstack([np.hstack(tiles[:4]), np.hstack(tiles[4:] + [blank])]), [cv2.IMWRITE_JPEG_QUALITY, 88])
json.dump({'W': W, 'H': H, 'm': m}, open(OUT + '/foilsize.json', 'w'))
print('foil size', W, H)
