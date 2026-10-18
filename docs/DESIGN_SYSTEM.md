# SWAYARI Design System & Brand Visual Standard

> **Brand:** SWAYARI  
> **Subtitle:** Décor & Gifting  
> **Aesthetic Philosophy:** Warm ivory minimalism, sacred metal craftsmanship, and editorial restraint inspired by luxury Indian homeware traditions (referencing the compositional clarity of *Ellementry*).

---

## 1. Brand Color Tokens

| Token Name | Hex Code | HSL / Opacity | Purpose |
| :--- | :--- | :--- | :--- |
| **`ivory-light`** | `#FDFBF7` | `43°, 50%, 98%` | Top notification banner, high-light card backgrounds |
| **`ivory-surface` (Base)** | `#FAF7F2` | `38°, 43%, 96%` | Primary application canvas, body background |
| **`ivory-muted`** | `#F4EFEB` | `33°, 31%, 94%` | Secondary panels, subtle dividers, pill buttons |
| **`ivory-border`** | `#E8E0D5` | `35°, 28%, 87%` | Structural card borders, input borders, divider rules |
| **`burgundy-deep`** | `#421217` | `354°, 57%, 17%` | Heritage top ribbon, high-contrast dark accents |
| **`burgundy` (Primary)** | `#5C1D24` | `353°, 52%, 24%` | Primary brand accent, CTA buttons, active state, price highlights |
| **`burgundy-hover`** | `#4A161D` | `353°, 54%, 19%` | Interactive hover state for primary controls |
| **`burgundy-light`** | `#FBF0F1` | `351°, 58%, 96%` | Icon badge backdrops, subtle notification badges |
| **`gold` (Accent)** | `#C49A45` | `40°, 52%, 52%` | Fine decorative rules, lotus crest accents, trust emblems |
| **`gold-light`** | `#E8D29E` | `42°, 62%, 77%` | Subtle gold gradients, emblem fills |
| **`charcoal` (Text)** | `#2B2625` | `12°, 6%, 16%` | Primary heading and high-legibility body text |
| **`charcoal-muted`** | `#6B6362` | `10°, 4%, 40%` | Secondary descriptions, captions, dimensions |
| **`charcoal-light`** | `#9E9493` | `7°, 5%, 60%` | SKU codes, timestamps, unselected tabs |

---

## 2. Typography Scale & Fonts

SWAYARI uses three curated Google Fonts:

1. **Display & Brand Wordmark:** `Cinzel` (`500`, `600`, `700`)
   - Used for the SWAYARI brand wordmark, crest headings, and ceremonial ribbons.
   - Letter-spacing: `0.15em` to `0.25em` tracking.
2. **Headings & Titles:** `Playfair Display` (`400`, `500`, `600`, `700`, `italic`)
   - Used for editorial hero titles, section headlines, and product names.
   - Line-height: `1.15` to `1.25` for editorial elegance.
3. **Body & Controls:** `Plus Jakarta Sans` (`300`, `400`, `500`, `600`, `700`)
   - Used for body text, specifications, form fields, and administrative tabular data.
   - High x-height ensures superior readability across mobile and desktop viewports.

### Heading Hierarchy
- **`Hero Display H1`:** `text-3xl sm:text-4xl lg:text-5xl font-serif tracking-tight leading-[1.15]`
- **`Section H2`:** `text-2xl sm:text-3xl font-serif text-charcoal tracking-tight`
- **`Card / Subheading H3`:** `text-base sm:text-lg font-serif font-medium text-charcoal`
- **`Micro Heading H4`:** `text-xs uppercase tracking-wider font-semibold text-charcoal`
- **`Body Text`:** `text-xs sm:text-sm font-light text-charcoal-muted leading-relaxed`

---

## 3. Product Photography & Image Aspect Ratios

- **Catalogue & Product Cards:** Strict **`4:5` aspect ratio** (`aspect-[4/5]`)
  - Ensures tall, dignified vertical framing for idols, urulis, and framed artwork.
  - Consistent neutral background behind all product shots.
  - Subtle hover transition: `transform duration-500 scale-103`.
- **Editorial Brand Banners:** **`4:3` or `21:9` aspect ratio** for studio and craftsmanship visuals.
- **Thumbnails:** Strict **`1:1` square or `4:5` mini-cards** with `rounded-lg` borders.

---

## 4. Spacing & Grid System

- **Container:** Max-width `max-w-7xl` (`1280px`) with fluid padding `px-4 sm:px-6 lg:px-8`.
- **Vertical Flow:** Generous spacing between sections: `py-12 lg:py-20`, `space-y-16 sm:space-y-24`.
- **Product Grids:**
  - Mobile (< 640px): 1 column (`grid-cols-1`) or 2 columns where comfortable.
  - Tablet (640px – 1024px): 2 columns (`sm:grid-cols-2`).
  - Desktop (1024px – 1280px): 3 columns (`lg:grid-cols-3`).
  - Wide Desktop (1280px+): 4 columns (`xl:grid-cols-4`).
- **Gap:** `gap-6 sm:gap-8` ensures items breathe without clutter.

---

## 5. Controls & Component Standards

### Primary Action Buttons
- Surface: `#5C1D24` (Burgundy)
- Text: `#FDFBF7` (Ivory Light), `font-medium tracking-wide`
- Radius: `rounded-md` (4px to 6px) — avoided hyper-rounded pill buttons for structural formality.
- Shadow: `shadow-card` transitioning to `shadow-card-hover` on hover.

### Secondary Action Buttons
- Surface: `bg-white`, Border: `border-ivory-border`
- Text: `#2B2625` (Charcoal)
- Hover: `hover:bg-ivory-muted hover:border-burgundy/40`

### Input Fields & Selects
- Background: `bg-ivory-light` or `bg-white`
- Border: `border border-ivory-border`
- Focus: `focus:border-burgundy focus:ring-1 focus:ring-burgundy/20`
- Padding: `p-2.5 sm:p-3 text-xs`

### Mandatory Disclaimer Treatment
- Box style: `bg-ivory-muted/80 rounded-xl p-4 border border-ivory-border`
- Text: Exact required phrasing in quotes, italic or light font with warning/info icon.

---

## 6. Motion & Accessibility

- **Micro-Transitions:** Durations kept between `150ms` and `300ms` with luxury timing `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Reduced Motion:** All transforms and scale effects gracefully degrade when `@media (prefers-reduced-motion: reduce)` is active.
- **Focus Rings:** Visible high-contrast focus rings on keyboard navigation (`focus-visible:outline-2 focus-visible:outline-burgundy`).
- **Contrast Ratios:** All body text meets WCAG AA standards (minimum 4.5:1 against ivory backgrounds).
