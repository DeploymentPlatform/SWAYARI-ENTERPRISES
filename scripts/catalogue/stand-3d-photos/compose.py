# Step 2: paint out the stamped plate, even the light and build the studio photos.
# Usage: python3 compose.py <work-dir> <out-dir>   (writes stand1-7.png and art1-7.png)
# Builds clean studio product photos of the 3D colour god stands from the owner's phone photos.
# The real foil artwork (deity, colours, embossing) is kept exactly; only perspective is
# straightened, the stamped "999 SILVER" plate is painted out with the foil's own mirrored
# pattern, a mild white balance is applied, and the piece is set in a drawn clear-acrylic stand
# on the site's cream studio backdrop.
import cv2, numpy as np, json, sys, os

WORK, OUTDIR = sys.argv[1], sys.argv[2]   # work dir from foilwarp.py, output dir
S = json.load(open(f'{WORK}/foilsize.json')); W, H, M = S['W'], S['H'], S['m']
STAMP_CY = {1: 1046, 2: 1067, 3: 1033, 4: 1064, 5: 1056, 6: 1053, 7: 1067}
# pieces of the plate area: (x0, x1, dx guess) — each piece is cloned from the same foil row at x+dx,
# where the row was checked by eye to be clear of the deity artwork
PIECES = {1: [(70, 296, 530)], 2: [(84, 168, 650), (168, 248, 600)], 3: [(72, 180, 228), (180, 286, 575)],
          4: [(70, 296, 300)], 5: [(70, 180, 600), (180, 296, 520)], 6: [(70, 296, 330)], 7: [(70, 296, 365)]}


YR = {2: (1053, 1084), 3: (1014, 1054)}


def figure_mask(img, dark=False):
    hsv = cv2.cvtColor(np.clip(img, 0, 255).astype(np.uint8), cv2.COLOR_BGR2HSV)
    m = (hsv[..., 1] > 70) & (hsv[..., 2] > 60)
    return m | (hsv[..., 2] < 100) if dark else m


def remove_stamp(img, k):
    cy = STAMP_CY[k]; y0, y1 = YR.get(k, (cy - 24, cy + 24))
    out = img.astype(np.float32).copy()
    fig = cv2.dilate(figure_mask(img).astype(np.uint8), np.ones((7, 7), np.uint8)).astype(bool)
    figsrc = cv2.dilate(figure_mask(img, dark=True).astype(np.uint8), np.ones((7, 7), np.uint8)).astype(bool)
    pad = 10; used = []
    for x0, x1, g in PIECES[k]:
        tgt = out[y0-pad:y1+pad, x0-pad:x1+pad].copy()
        ring = np.ones(tgt.shape[:2], bool); ring[pad:-pad, pad:-pad] = False
        ring &= ~fig[y0-pad:y1+pad, x0-pad:x1+pad]
        best = None
        for dy in range(-4, 5):
            for dx in range(g - 14, g + 15):
                s = out[y0-pad+dy:y1+pad+dy, x0-pad+dx:x1+pad+dx]
                if s.shape != tgt.shape:
                    continue
                fsrc = figsrc[y0-pad+dy:y1+pad+dy, x0-pad+dx:x1+pad+dx][pad-3:-pad+3, pad-3:-pad+3]
                e = np.mean((s[ring] - tgt[ring]) ** 2) + 4e4 * fsrc.mean()
                if best is None or e < best[0]:
                    best = (e, dx, dy)
        _, dx, dy = best
        s = out[y0-pad+dy:y1+pad+dy, x0-pad+dx:x1+pad+dx].copy()
        sring = ring & ~fig[y0-pad+dy:y1+pad+dy, x0-pad+dx:x1+pad+dx]
        s += (tgt[sring].mean(0) - s[sring].mean(0))   # match the local light level
        mask = np.zeros(tgt.shape[:2], np.float32); mask[pad-3:-pad+3, pad-3:-pad+3] = 1
        mask = cv2.GaussianBlur(mask, (0, 0), 2.5)
        mask *= 1 - cv2.GaussianBlur(fig[y0-pad:y1+pad, x0-pad:x1+pad].astype(np.float32), (0, 0), 1.5)
        out[y0-pad:y1+pad, x0-pad:x1+pad] = tgt * (1 - mask[..., None]) + s * mask[..., None]
        used.append((dx, dy))
    return np.clip(out, 0, 255).astype(np.uint8), used


def even_light(img, strength=0.85):
    """Flatten the phone's uneven lighting across the foil (low-frequency only; detail and colour kept)."""
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
    L = lab[..., 0]
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    bgm = ((hsv[..., 1] < 45) & (hsv[..., 2] > 90)).astype(np.float32)
    small = (img.shape[1] // 8, img.shape[0] // 8)
    Ls, ms = cv2.resize(L * bgm, small, interpolation=cv2.INTER_AREA), cv2.resize(bgm, small, interpolation=cv2.INTER_AREA)
    num, den = cv2.GaussianBlur(Ls, (0, 0), 9), cv2.GaussianBlur(ms, (0, 0), 9)
    illum = cv2.resize(num / np.maximum(den, 1e-3), (img.shape[1], img.shape[0]), interpolation=cv2.INTER_CUBIC)
    target = float(np.median(L[bgm > 0]))
    gain = np.clip(target / np.maximum(illum, 1), 0.85, 1.2)
    lab[..., 0] = np.clip(L * (1 + strength * (gain - 1)), 0, 255)
    return cv2.cvtColor(lab.astype(np.uint8), cv2.COLOR_LAB2BGR)


SPECKS = {1: [(841, 75)]}


def white_balance(img, strength=0.8):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    sel = (hsv[..., 1] < 40) & (hsv[..., 2] > 120) & (hsv[..., 2] < 240)
    mean = img[sel].reshape(-1, 3).mean(0)
    target = mean.mean() * np.array([0.985, 1.0, 1.02])   # a touch warm, like silver foil under soft light
    gain = 1 + strength * (target / mean - 1)
    return np.clip(img.astype(np.float32) * gain, 0, 255).astype(np.uint8), gain


def sharpen(img, amount=0.55, sigma=1.1):
    blur = cv2.GaussianBlur(img, (0, 0), sigma)
    return cv2.addWeighted(img, 1 + amount, blur, -amount, 0)


def lerp(a, b, t):
    return np.asarray(a, np.float32) * (1 - t) + np.asarray(b, np.float32) * t


def backdrop(size):
    h = w = size
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    t = (yy / h)[..., None]
    top, bot = np.array([214, 230, 242], np.float32), np.array([186, 210, 229], np.float32)  # BGR cream
    bg = top * (1 - t) + bot * t
    # soft key light from the upper left
    glow = np.exp(-(((xx - w * 0.36) / (w * 0.55)) ** 2 + ((yy - h * 0.25) / (h * 0.5)) ** 2))
    bg += glow[..., None] * np.array([14, 12, 9], np.float32)
    # gentle vignette
    vig = ((xx - w / 2) / (w * 0.75)) ** 2 + ((yy - h / 2) / (h * 0.75)) ** 2
    bg *= (1 - 0.10 * np.clip(vig, 0, 1))[..., None]
    return bg


def rounded_mask(h, w, r, ss=1):
    m = np.zeros((h, w), np.uint8)
    cv2.rectangle(m, (r, 0), (w - 1 - r, h - 1), 255, -1)
    cv2.rectangle(m, (0, r), (w - 1, h - 1 - r), 255, -1)
    for cx, cy in ((r, r), (w - 1 - r, r), (r, h - 1 - r), (w - 1 - r, h - 1 - r)):
        cv2.circle(m, (cx, cy), r, 255, -1, cv2.LINE_AA)
    return m.astype(np.float32) / 255


def make_mount(foil, fw):
    """White moulded mount around the foil (foil already scaled to width fw)."""
    fh = foil.shape[0]
    b = int(round(fw * 0.10))
    mw, mh = fw + 2 * b, fh + 2 * b
    yy = np.linspace(0, 1, mh, dtype=np.float32)[:, None, None]
    mount = lerp([248, 246, 247], [234, 230, 232], yy) * np.ones((1, mw, 1), np.float32)
    # moulded bevel: lighter outer lip, soft rounded slope toward the foil
    d = np.minimum.reduce([np.arange(mw)[None, :].repeat(mh, 0), (mw - 1 - np.arange(mw))[None, :].repeat(mh, 0),
                           np.arange(mh)[:, None].repeat(mw, 1), (mh - 1 - np.arange(mh))[:, None].repeat(mw, 1)]).astype(np.float32)
    lip = np.exp(-((d - b * 0.18) / (b * 0.10)) ** 2)
    mount += lip[..., None] * 6
    inner = np.clip((d - b * 0.55) / (b * 0.45), 0, 1)
    mount -= (inner ** 2)[..., None] * 10
    mount[b:b + fh, b:b + fw] = foil.astype(np.float32)
    # the mount's inner lip throws a soft shadow onto the recessed foil (light from top-left)
    sh = np.zeros((mh, mw), np.float32)
    sh[:, :] = 1; sh[b:b + fh, b:b + fw] = 0
    sh = cv2.GaussianBlur(cv2.warpAffine(sh, np.float32([[1, 0, 3], [0, 1, 4]]), (mw, mh)), (0, 0), 5)
    inside = np.zeros((mh, mw), np.float32); inside[b:b + fh, b:b + fw] = 1
    mount *= (1 - 0.30 * sh * inside)[..., None]
    # crisp highlight on the lip edge
    cv2.rectangle(mount, (b - 2, b - 2), (b + fw + 1, b + fh + 1), (250, 249, 250), 1, cv2.LINE_AA)
    # thin grey bezel around the mount, as on the real piece
    cv2.rectangle(mount, (0, 0), (mw - 1, mh - 1), (150, 146, 148), 2, cv2.LINE_AA)
    return np.clip(mount, 0, 255), b


def alpha_paste(dst, src, x, y, alpha=None):
    h, w = src.shape[:2]
    a = np.ones((h, w), np.float32) if alpha is None else alpha
    roi = dst[y:y + h, x:x + w]
    roi[:] = roi * (1 - a[..., None]) + src * a[..., None]


def soft_shadow(canvas, box, blur, strength, offset=(0, 0), scale=(1.0, 1.0)):
    h, w = canvas.shape[:2]
    m = np.zeros((h, w), np.float32)
    x0, y0, x1, y1 = box
    cx, cy = (x0 + x1) / 2 + offset[0], (y0 + y1) / 2 + offset[1]
    hw, hh = (x1 - x0) / 2 * scale[0], (y1 - y0) / 2 * scale[1]
    cv2.rectangle(m, (int(cx - hw), int(cy - hh)), (int(cx + hw), int(cy + hh)), 1, -1)
    m = cv2.GaussianBlur(m, (0, 0), blur)
    canvas *= (1 - strength * m)[..., None]


def stand_photo(foil, size=2000):
    """Full piece: mount inside a clear acrylic stand, on the cream backdrop."""
    fw = int(size * 0.495)
    fh = int(round(fw * H / W))
    f = cv2.resize(foil, (fw, fh), interpolation=cv2.INTER_AREA)
    mount, b = make_mount(f, fw)
    mh, mw = mount.shape[:2]
    a = int(fw * 0.07); top = int(fw * 0.09); base = int(fw * 0.30)
    bw, bh = mw + 2 * a, top + mh + base
    bx, by = (size - bw) // 2, int(size * 0.49 - bh / 2)
    canvas = backdrop(size)
    # floor contact shadow + long soft shadow to the back right
    soft_shadow(canvas, (bx, by + bh - 30, bx + bw, by + bh + 6), 26, 0.30)
    soft_shadow(canvas, (bx, by + int(bh * 0.25), bx + bw, by + bh), 70, 0.08, offset=(int(bw * 0.10), 10), scale=(1.0, 0.95))
    r = int(fw * 0.035)
    am = rounded_mask(bh, bw, r)
    roi = canvas[by:by + bh, bx:bx + bw].copy()
    # acrylic body: backdrop seen through clear acrylic — slightly brighter, a hint of cool tint
    body = roi * 0.86 + np.array([252, 250, 246], np.float32) * 0.14
    yy = np.linspace(0, 1, bh, dtype=np.float32)[:, None, None]
    body *= lerp(1.02, 0.97, yy)
    # the stand's curved back leg seen through the base
    leg = np.zeros((bh, bw), np.float32)
    cv2.ellipse(leg, (bw // 2, top + mh + int(base * 0.95)), (int(bw * 0.28), int(base * 0.62)), 0, 180, 360, 1, 3, cv2.LINE_AA)
    leg = cv2.GaussianBlur(leg, (0, 0), 1.6)
    body = body * (1 - 0.10 * leg[..., None]) + 255 * 0.10 * leg[..., None]
    # small locking clip under the mount
    cv2.rectangle(body, (bw // 2 - int(bw * 0.08), top + mh + 4), (bw // 2 + int(bw * 0.08), top + mh + 16), (236, 238, 240), -1, cv2.LINE_AA)
    # edge thickness: bright rim with a darker inner line, deeper along the base
    d = np.minimum.reduce([np.arange(bw)[None, :].repeat(bh, 0), (bw - 1 - np.arange(bw))[None, :].repeat(bh, 0),
                           np.arange(bh)[:, None].repeat(bw, 1)]).astype(np.float32)
    rim = np.exp(-((d - 4) / 3.0) ** 2)
    inner_line = np.exp(-((d - 15) / 2.2) ** 2)
    body += rim[..., None] * 42
    body -= inner_line[..., None] * np.array([26, 22, 20], np.float32)
    db = (bh - 1 - np.arange(bh))[:, None].repeat(bw, 1).astype(np.float32)
    body -= (np.exp(-((db - 10) / 6.0) ** 2))[..., None] * np.array([34, 30, 26], np.float32)
    body += (np.exp(-((db - 2) / 2.0) ** 2))[..., None] * 40
    # specular streak across the face
    yy2, xx2 = np.mgrid[0:bh, 0:bw].astype(np.float32)
    streak = np.exp(-(((xx2 - bw * 0.78) + (yy2 - bh * 0.1) * 0.55) / (bw * 0.05)) ** 2)
    body += streak[..., None] * 18
    # mount inside the acrylic, with a small shadow behind it
    mx, my = a, top
    sh = np.zeros((bh, bw), np.float32); sh[my + 8:my + mh + 10, mx + 6:mx + mw + 8] = 1
    body *= (1 - 0.22 * cv2.GaussianBlur(sh, (0, 0), 10))[..., None]
    body[my:my + mh, mx:mx + mw] = mount
    # reflection of the acrylic front over the artwork (very faint)
    body[my:my + mh, mx:mx + mw] += streak[my:my + mh, mx:mx + mw, None] * 10
    alpha_paste(canvas, body, bx, by, am)
    out = cv2.resize(np.clip(canvas, 0, 255).astype(np.uint8), (size // 2, size // 2), interpolation=cv2.INTER_AREA)
    return out


def art_photo(foil, size=2000):
    """Close-up of the framed artwork (mount only) on the backdrop."""
    fh = int(size * 0.80)
    fw = int(round(fh * W / H))
    f = cv2.resize(foil, (fw, fh), interpolation=cv2.INTER_CUBIC if fw > W else cv2.INTER_AREA)
    mount, b = make_mount(f, fw)
    mh, mw = mount.shape[:2]
    canvas = backdrop(size)
    x, y = (size - mw) // 2, (size - mh) // 2
    soft_shadow(canvas, (x, y, x + mw, y + mh), 40, 0.30, offset=(18, 26))
    canvas[y:y + mh, x:x + mw] = mount
    return cv2.resize(np.clip(canvas, 0, 255).astype(np.uint8), (size // 2, size // 2), interpolation=cv2.INTER_AREA)


os.makedirs(OUTDIR, exist_ok=True)
log = {}
for k in range(1, 8):
    img = cv2.imread(f'{WORK}/foil{k}.png')
    img, shift = remove_stamp(img, k)
    for (sx, sy) in SPECKS.get(k, []):
        m = np.zeros(img.shape[:2], np.uint8); cv2.circle(m, (sx, sy), 7, 255, -1)
        img = cv2.inpaint(img, m, 5, cv2.INPAINT_TELEA)
    cv2.imwrite(f'{WORK}/clean{k}.png', img)
    foil = img[M + 3:M + H - 3, M + 3:M + W - 3]
    foil = cv2.resize(foil, (W, H), interpolation=cv2.INTER_CUBIC)
    foil = even_light(foil)
    foil, gain = white_balance(foil)
    foil = sharpen(foil)
    cv2.imwrite(f'{OUTDIR}/stand{k}.png', stand_photo(foil))
    cv2.imwrite(f'{OUTDIR}/art{k}.png', art_photo(foil))
    log[k] = {'stamp_shift': shift, 'wb_gain': [round(float(g), 3) for g in gain]}
print(json.dumps(log))
