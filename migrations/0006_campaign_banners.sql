-- SWAYARI ENTERPRISES D1 Migration 0006: Dynamic Campaign Banners
CREATE TABLE IF NOT EXISTS campaign_banners (
    id TEXT PRIMARY KEY,
    badge TEXT,
    headline TEXT NOT NULL,
    emphasis TEXT,
    supporting TEXT,
    cta_text TEXT NOT NULL,
    cta_href TEXT NOT NULL,
    desktop_image TEXT NOT NULL,
    mobile_image TEXT NOT NULL,
    alt TEXT,
    display_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

INSERT OR IGNORE INTO campaign_banners (
    id, badge, headline, emphasis, supporting, cta_text, cta_href,
    desktop_image, mobile_image, alt, display_order, is_active, created_at, updated_at
) VALUES
(
    'banner-moments', 'Artisanal Festive Collection', 'Gifts for Meaningful', 'Moments.',
    'Handcrafted bell-metal brass lamps, ritual centerpieces, and celebratory keepsakes.',
    'Explore Gifting Sets', '/shop?category=gift-sets',
    '/assets/editorial/hero-slide-1-moments-desktop.webp',
    '/assets/editorial/hero-slide-1-moments-mobile.webp',
    'Festive brass lamps illuminated beside marigolds and celebration offerings',
    1, 1, '2026-10-18T10:00:00.000Z', '2026-10-18T10:00:00.000Z'
),
(
    'banner-devotional', 'Sanctum & Prayer Room', 'Devotional Frames', 'Collection.',
    'Gold and silver embossed deity plaques framed in solid hardwood with archival preservation.',
    'View Sanctum Frames', '/shop?category=devotional-frames',
    '/assets/editorial/hero-slide-2-devotional-desktop.webp',
    '/assets/editorial/hero-slide-2-devotional-mobile.webp',
    'Ornate gold framed devotional sanctum relief panel',
    2, 1, '2026-10-18T10:00:00.000Z', '2026-10-18T10:00:00.000Z'
),
(
    'banner-lighting', 'Heirloom Brassware', 'Artisanal Brass &', 'Temple Lighting.',
    'Traditional Kuthu pillar lamps, tiered deepams, and resonant bell-metal temple bells.',
    'Discover Lighting', '/shop?category=decorative-lamps',
    '/assets/editorial/hero-slide-3-decor-desktop.webp',
    '/assets/editorial/hero-slide-3-decor-mobile.webp',
    'Traditional ornate brass kuthu pillar lamp with multi-tiered flame wells',
    3, 1, '2026-10-18T10:00:00.000Z', '2026-10-18T10:00:00.000Z'
),
(
    'banner-uruli', 'Traditional Living', 'Festive Urulis &', 'Home Accents.',
    'Solid cast brass urulis for fresh floating florals, ornate pooja thalis, and celestial sculptures.',
    'Explore Home Décor', '/shop?category=home-accents',
    '/assets/editorial/hero-slide-4-gifting-desktop.webp',
    '/assets/editorial/hero-slide-4-gifting-mobile.webp',
    'Solid brass floral uruli bowl floating yellow marigold blooms in fresh water',
    4, 1, '2026-10-18T10:00:00.000Z', '2026-10-18T10:00:00.000Z'
);
