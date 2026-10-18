-- SWAYARI ENTERPRISES D1 Migration 0004: Honest preview catalogue for visual review
--
-- Uses the four product photographs supplied by the owner (framed devotional relief pieces).
-- Every row stays is_demo = 1, so the public storefront never lists them unless the explicit
-- preview dataset is requested. Only details visible in the photographs are stated; material,
-- dimensions and prices remain unconfirmed. No purity, gift-box or engraving claims.

-- The earlier demo category name implied a material ("Silver Plated") that is not confirmed.
UPDATE categories
SET name = 'Devotional Frames',
    description = 'Framed devotional relief pieces for prayer rooms, homes and gifting'
WHERE id = 'cat-silver-art';

UPDATE categories SET description = 'Decorative pieces for the home' WHERE id = 'cat-brass-decor';
UPDATE categories SET description = 'Gifting for celebrations, festivals and special occasions' WHERE id = 'cat-corporate-gifting';

UPDATE products
SET name = 'Radha Krishna Framed Relief',
    description = 'Radha and Krishna in an embossed relief panel with coloured detailing, set behind glass in a dark wood-tone frame with a gilded floral border. Sample entry for catalogue preview: size, materials and finish are to be confirmed by our team.',
    images = '["/assets/products/radha-krishna-frame-960.jpg","/assets/products/radha-krishna-frame-photo-744.jpg"]',
    material = NULL,
    dimensions = NULL,
    has_variants = 0,
    variants_json = '[]',
    customisation_info = NULL,
    availability_label = 'Sample preview',
    updated_at = '2026-10-18T15:30:00.000Z'
WHERE id = 'demo-prod-radha-krishna-frame';

INSERT OR IGNORE INTO products (
    id, sku, name, slug, description, category_id, images, material, dimensions,
    has_variants, variants_json, indicative_price, min_quantity, availability_label,
    customisation_info, status, is_demo, created_at, updated_at
) VALUES
(
    'demo-prod-bala-krishna-frame', 'SWY-DEMO-002', 'Bala Krishna Framed Relief', 'bala-krishna-framed-relief-sample',
    'Bala Krishna with a bowl of butter, shown in an embossed relief panel with coloured detailing, set behind glass in a dark wood-tone frame with a gilded floral border. Sample entry for catalogue preview: size, materials and finish are to be confirmed by our team.',
    'cat-silver-art',
    '["/assets/products/bala-krishna-frame-960.jpg","/assets/products/bala-krishna-frame-photo-823.jpg"]',
    NULL, NULL, 0, '[]', NULL, 1, 'Sample preview', NULL, 'published', 1,
    '2026-10-18T11:59:00.000Z', '2026-10-18T15:30:00.000Z'
),
(
    'demo-prod-venkateswara-frame', 'SWY-DEMO-003', 'Sri Venkateswara Framed Relief', 'sri-venkateswara-framed-relief-sample',
    'Sri Venkateswara in an embossed relief panel with coloured garland detailing, set behind glass in a dark wood-tone frame with a gilded floral border. Sample entry for catalogue preview: size, materials and finish are to be confirmed by our team.',
    'cat-silver-art',
    '["/assets/products/venkateswara-frame-960.jpg","/assets/products/venkateswara-frame-photo-781.jpg"]',
    NULL, NULL, 0, '[]', NULL, 1, 'Sample preview', NULL, 'published', 1,
    '2026-10-18T11:58:00.000Z', '2026-10-18T15:30:00.000Z'
),
(
    'demo-prod-hanuman-frame', 'SWY-DEMO-004', 'Hanuman Framed Relief', 'hanuman-framed-relief-sample',
    'Hanuman carrying the mountain, shown in an embossed relief panel with coloured detailing, set behind glass in a dark wood-tone frame with a gilded floral border. Sample entry for catalogue preview: size, materials and finish are to be confirmed by our team.',
    'cat-silver-art',
    '["/assets/products/hanuman-frame-960.jpg","/assets/products/hanuman-frame-photo-741.jpg"]',
    NULL, NULL, 0, '[]', NULL, 1, 'Sample preview', NULL, 'published', 1,
    '2026-10-18T11:57:00.000Z', '2026-10-18T15:30:00.000Z'
);
