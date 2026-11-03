-- SWAYARI ENTERPRISES D1 Migration 0010: one "God Frames" category, "silver foil" wording
--
-- The owner wants every frame under a single God Frames category, and the artwork always
-- described as silver foil (never as plain silver).

INSERT INTO categories (id, name, slug, description, display_order, is_active, created_at) VALUES
('cat-god-frames', 'God Frames', 'god-frames', 'No. 1 silver foil god frames at ₹99 each — mix any designs, minimum 25 frames per order', 1, 1, '2026-11-03T09:00:00.000Z')
ON CONFLICT(id) DO UPDATE SET name = excluded.name, slug = excluded.slug, description = excluded.description, display_order = excluded.display_order, is_active = 1;

UPDATE products SET category_id = 'cat-god-frames';
DELETE FROM categories WHERE id <> 'cat-god-frames';

UPDATE products SET name = 'Sri Venkateswara Silver Foil Frame', slug = 'sri-venkateswara-silver-foil-frame' WHERE id = 'prod-no1-venkateswara';
UPDATE products SET name = 'Padmavathi Srinivasa Silver Foil Frame', slug = 'padmavathi-srinivasa-silver-foil-frame' WHERE id = 'prod-no1-padmavathi-srinivasa';
UPDATE products SET name = 'Shirdi Sai Baba Silver Foil Frame', slug = 'shirdi-sai-baba-silver-foil-frame' WHERE id = 'prod-no1-sai-baba';
UPDATE products SET name = 'Radha Krishna Silver Foil Frame', slug = 'radha-krishna-silver-foil-frame' WHERE id = 'prod-no1-radha-krishna';
UPDATE products SET name = 'Bal Krishna Silver Foil Frame', slug = 'bal-krishna-silver-foil-frame' WHERE id = 'prod-no1-bal-krishna';
UPDATE products SET name = 'Ram Darbar Silver Foil Frame', slug = 'ram-darbar-silver-foil-frame' WHERE id = 'prod-no1-ram-darbar';
UPDATE products SET name = 'Sanjeevani Hanuman Silver Foil Frame', slug = 'sanjeevani-hanuman-silver-foil-frame' WHERE id = 'prod-no1-hanuman';

UPDATE products SET
  description = REPLACE(description, 'silver-foil relief', 'silver foil relief'),
  material = 'Silver foil embossed artwork with colour highlights, cream mount and clear front cover',
  updated_at = '2026-11-03T09:00:00.000Z';

UPDATE campaign_banners SET headline = 'Silver foil god frames', updated_at = '2026-11-03T09:00:00.000Z' WHERE id = 'banner-devotional-99';
UPDATE campaign_banners SET supporting = 'Silver foil frames that stand on a table or hang on a wall. Minimum order 25 frames; shipping charged extra.', updated_at = '2026-11-03T09:00:00.000Z' WHERE id = 'banner-wedding-guest';
