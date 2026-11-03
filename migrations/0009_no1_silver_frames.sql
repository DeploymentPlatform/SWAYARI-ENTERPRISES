-- SWAYARI ENTERPRISES D1 Migration 0009: No. 1 silver frames at ₹99
--
-- The owner's real stock replaces every earlier sample listing:
-- 1. Remove all previous products and the categories that only they used
-- 2. Four categories for the new range
-- 3. Seven No. 1 silver-foil frames, ₹99 each, any design mixable in one order
-- 4. Hero banner text that matches the new range

-- 1. Clear the old catalogue (no orders reference these rows)
DELETE FROM products;
DELETE FROM categories;

-- 2. Categories
INSERT INTO categories (id, name, slug, description, display_order, is_active, created_at) VALUES
('cat-balaji', 'Balaji & Padmavathi', 'balaji-frames', 'Lord Venkateswara of Tirumala, alone or with Goddess Padmavathi', 1, 1, '2026-11-03T08:00:00.000Z'),
('cat-krishna', 'Krishna', 'krishna-frames', 'Radha Krishna and little Bal Krishna', 2, 1, '2026-11-03T08:00:00.000Z'),
('cat-ram-hanuman', 'Ram & Hanuman', 'ram-hanuman-frames', 'Ram Darbar and Sanjeevani Hanuman', 3, 1, '2026-11-03T08:00:00.000Z'),
('cat-sai-baba', 'Sai Baba', 'sai-baba-frames', 'Shirdi Sai Baba blessing his devotees', 4, 1, '2026-11-03T08:00:00.000Z');

-- 3. Products (newest created_at is listed first on the storefront)
INSERT INTO products (
    id, sku, name, slug, description, category_id, images, material, dimensions,
    has_variants, variants_json, indicative_price, min_quantity, availability_label,
    customisation_info, status, is_demo, price_type, set_contents, order_increment,
    is_quote_only, bulk_tiers_json, packaging_options_json, shipping_info, occasions_json,
    supports_individual, supports_bulk, deity, frame_size, orientation, border_finish,
    created_at, updated_at
) VALUES
(
    'prod-no1-venkateswara', 'SWY-N1-001', 'Sri Venkateswara Silver Frame', 'sri-venkateswara-silver-frame',
    'Lord Venkateswara of Tirumala in silver-foil relief, with his garlands, namam and golden temple arch picked out in colour. A much-loved return gift for weddings, griha pravesh and family poojas.',
    'cat-balaji', '["/assets/products/no1-venkateswara.webp","/assets/products/no1-back-stand.webp"]',
    'Silver-foil embossed artwork with colour highlights, cream mount and clear front cover', NULL,
    0, '[]', 99, 1, 'Ready to order',
    'Mix this design with any other frame in the same order.',
    'published', 0, 'piece', 'One framed artwork with fold-out table stand and wall hook', 1,
    0, '[]', '[{"name": "Protective wrap", "price": 0, "included": true}]',
    'Shipping charges are extra and confirmed by our team for your quantity and delivery PIN code.',
    '["Wedding Return Gifts", "Housewarming", "Family Celebrations"]',
    1, 1, 'Balaji', 'No. 1', 'portrait', 'Maroon frame with gold floral border',
    '2026-11-03T08:07:00.000Z', '2026-11-03T08:07:00.000Z'
),
(
    'prod-no1-padmavathi-srinivasa', 'SWY-N1-002', 'Padmavathi Srinivasa Silver Frame', 'padmavathi-srinivasa-silver-frame',
    'Goddess Padmavathi and Lord Srinivasa side by side under their temple arches, in silver-foil relief with bright colour highlights. A wide frame that carries the divine couple''s blessing to newly-weds and new homes.',
    'cat-balaji', '["/assets/products/no1-padmavathi-srinivasa.webp","/assets/products/no1-back-stand.webp"]',
    'Silver-foil embossed artwork with colour highlights, cream mount and clear front cover', NULL,
    0, '[]', 99, 1, 'Ready to order',
    'Mix this design with any other frame in the same order.',
    'published', 0, 'piece', 'One framed artwork with fold-out table stand and wall hook', 1,
    0, '[]', '[{"name": "Protective wrap", "price": 0, "included": true}]',
    'Shipping charges are extra and confirmed by our team for your quantity and delivery PIN code.',
    '["Wedding Return Gifts", "Housewarming", "Family Celebrations"]',
    1, 1, 'Balaji Padmavathi', 'No. 1', 'landscape', 'Maroon frame with gold floral border',
    '2026-11-03T08:06:00.000Z', '2026-11-03T08:06:00.000Z'
),
(
    'prod-no1-sai-baba', 'SWY-N1-003', 'Shirdi Sai Baba Silver Frame', 'shirdi-sai-baba-silver-frame',
    'Shirdi Sai Baba with his hand raised in blessing, in silver-foil relief with his saffron head cloth and shawl coloured by hand. A calm, comforting keepsake for devotees, poojas and family gatherings.',
    'cat-sai-baba', '["/assets/products/no1-sai-baba.webp","/assets/products/no1-back-stand.webp"]',
    'Silver-foil embossed artwork with colour highlights, cream mount and clear front cover', NULL,
    0, '[]', 99, 1, 'Ready to order',
    'Mix this design with any other frame in the same order.',
    'published', 0, 'piece', 'One framed artwork with fold-out table stand and wall hook', 1,
    0, '[]', '[{"name": "Protective wrap", "price": 0, "included": true}]',
    'Shipping charges are extra and confirmed by our team for your quantity and delivery PIN code.',
    '["Wedding Return Gifts", "Housewarming", "Family Celebrations"]',
    1, 1, 'Sai Baba', 'No. 1', 'portrait', 'Maroon frame with gold floral border',
    '2026-11-03T08:05:00.000Z', '2026-11-03T08:05:00.000Z'
),
(
    'prod-no1-radha-krishna', 'SWY-N1-004', 'Radha Krishna Silver Frame', 'radha-krishna-silver-frame',
    'Radha and Krishna together on a lotus, Krishna with his flute and peacock feather, in silver-foil relief with pink, green and blue colour work. A joyful gift for weddings, engagements and anniversaries.',
    'cat-krishna', '["/assets/products/no1-radha-krishna.webp","/assets/products/no1-back-stand.webp"]',
    'Silver-foil embossed artwork with colour highlights, cream mount and clear front cover', NULL,
    0, '[]', 99, 1, 'Ready to order',
    'Mix this design with any other frame in the same order.',
    'published', 0, 'piece', 'One framed artwork with fold-out table stand and wall hook', 1,
    0, '[]', '[{"name": "Protective wrap", "price": 0, "included": true}]',
    'Shipping charges are extra and confirmed by our team for your quantity and delivery PIN code.',
    '["Wedding Return Gifts", "Navratri & Haldi Kumkum", "Family Celebrations"]',
    1, 1, 'Radha Krishna', 'No. 1', 'portrait', 'Maroon frame with gold floral border',
    '2026-11-03T08:04:00.000Z', '2026-11-03T08:04:00.000Z'
),
(
    'prod-no1-bal-krishna', 'SWY-N1-005', 'Bal Krishna Silver Frame', 'bal-krishna-silver-frame',
    'Little Krishna with his pot of butter and flute, in silver-foil relief with a green peacock feather and golden jewellery. A sweet choice for naming ceremonies, baby showers, birthdays and Janmashtami.',
    'cat-krishna', '["/assets/products/no1-bal-krishna.webp","/assets/products/no1-back-stand.webp"]',
    'Silver-foil embossed artwork with colour highlights, cream mount and clear front cover', NULL,
    0, '[]', 99, 1, 'Ready to order',
    'Mix this design with any other frame in the same order.',
    'published', 0, 'piece', 'One framed artwork with fold-out table stand and wall hook', 1,
    0, '[]', '[{"name": "Protective wrap", "price": 0, "included": true}]',
    'Shipping charges are extra and confirmed by our team for your quantity and delivery PIN code.',
    '["Wedding Return Gifts", "Navratri & Haldi Kumkum", "Family Celebrations"]',
    1, 1, 'Bal Krishna', 'No. 1', 'portrait', 'Maroon frame with gold floral border',
    '2026-11-03T08:03:00.000Z', '2026-11-03T08:03:00.000Z'
),
(
    'prod-no1-ram-darbar', 'SWY-N1-006', 'Ram Darbar Silver Frame', 'ram-darbar-silver-frame',
    'Sri Rama with Sita Devi and Lakshmana, and Hanuman kneeling at their feet, in silver-foil relief with colour highlights. A symbol of a happy, united family, ideal for griha pravesh and family functions.',
    'cat-ram-hanuman', '["/assets/products/no1-ram-darbar.webp","/assets/products/no1-back-stand.webp"]',
    'Silver-foil embossed artwork with colour highlights, cream mount and clear front cover', NULL,
    0, '[]', 99, 1, 'Ready to order',
    'Mix this design with any other frame in the same order.',
    'published', 0, 'piece', 'One framed artwork with fold-out table stand and wall hook', 1,
    0, '[]', '[{"name": "Protective wrap", "price": 0, "included": true}]',
    'Shipping charges are extra and confirmed by our team for your quantity and delivery PIN code.',
    '["Wedding Return Gifts", "Housewarming", "Family Celebrations"]',
    1, 1, 'Ram Darbar', 'No. 1', 'portrait', 'Maroon frame with gold floral border',
    '2026-11-03T08:02:00.000Z', '2026-11-03T08:02:00.000Z'
),
(
    'prod-no1-hanuman', 'SWY-N1-007', 'Sanjeevani Hanuman Silver Frame', 'sanjeevani-hanuman-silver-frame',
    'Lord Hanuman in flight carrying the Sanjeevani mountain, in silver-foil relief with green, red and gold colour work. A gift of strength and protection for poojas and celebrations.',
    'cat-ram-hanuman', '["/assets/products/no1-hanuman.webp","/assets/products/no1-back-stand.webp"]',
    'Silver-foil embossed artwork with colour highlights, cream mount and clear front cover', NULL,
    0, '[]', 99, 1, 'Ready to order',
    'Mix this design with any other frame in the same order.',
    'published', 0, 'piece', 'One framed artwork with fold-out table stand and wall hook', 1,
    0, '[]', '[{"name": "Protective wrap", "price": 0, "included": true}]',
    'Shipping charges are extra and confirmed by our team for your quantity and delivery PIN code.',
    '["Wedding Return Gifts", "Housewarming", "Family Celebrations"]',
    1, 1, 'Hanuman', 'No. 1', 'portrait', 'Maroon frame with gold floral border',
    '2026-11-03T08:01:00.000Z', '2026-11-03T08:01:00.000Z'
);

-- 4. Hero banner text for the new range
UPDATE campaign_banners SET
  headline = 'Devotional silver frames',
  emphasis = '₹99 each',
  supporting = 'Balaji, Padmavathi Srinivasa, Sai Baba, Radha Krishna, Bal Krishna, Ram Darbar and Hanuman. Mix any designs in one order.',
  updated_at = '2026-11-03T08:00:00.000Z'
WHERE id = 'banner-devotional-99';

UPDATE campaign_banners SET
  supporting = 'Silver-foil frames that stand on a table or hang on a wall. Minimum order 25 frames; shipping charged extra.',
  updated_at = '2026-11-03T08:00:00.000Z'
WHERE id = 'banner-wedding-guest';

UPDATE campaign_banners SET
  supporting = 'Pick your designs, tell us how many, and our team calls you to confirm stock, packing and shipping.',
  updated_at = '2026-11-03T08:00:00.000Z'
WHERE id = 'banner-bulk-process';
