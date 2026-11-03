-- SWAYARI ENTERPRISES D1 Migration 0011: premium photography for the God Frames range
--
-- Every product gets a studio shot, a real-life usage scene and the frame back (stand and hook).
-- The three hero banners show the frames on display, on a wedding return-gift table and packed for bulk orders.

UPDATE products SET images = '["/assets/products/gf-venkateswara-studio.webp","/assets/products/gf-venkateswara-lifestyle.webp","/assets/products/gf-back-stand.webp"]', updated_at = '2026-11-03T10:00:00.000Z' WHERE id = 'prod-no1-venkateswara';
UPDATE products SET images = '["/assets/products/gf-padmavathi-srinivasa-studio.webp","/assets/products/gf-padmavathi-srinivasa-lifestyle.webp","/assets/products/gf-back-stand.webp"]', updated_at = '2026-11-03T10:00:00.000Z' WHERE id = 'prod-no1-padmavathi-srinivasa';
UPDATE products SET images = '["/assets/products/gf-sai-baba-studio.webp","/assets/products/gf-sai-baba-lifestyle.webp","/assets/products/gf-back-stand.webp"]', updated_at = '2026-11-03T10:00:00.000Z' WHERE id = 'prod-no1-sai-baba';
UPDATE products SET images = '["/assets/products/gf-radha-krishna-studio.webp","/assets/products/gf-radha-krishna-lifestyle.webp","/assets/products/gf-back-stand.webp"]', updated_at = '2026-11-03T10:00:00.000Z' WHERE id = 'prod-no1-radha-krishna';
UPDATE products SET images = '["/assets/products/gf-bal-krishna-studio.webp","/assets/products/gf-bal-krishna-lifestyle.webp","/assets/products/gf-back-stand.webp"]', updated_at = '2026-11-03T10:00:00.000Z' WHERE id = 'prod-no1-bal-krishna';
UPDATE products SET images = '["/assets/products/gf-ram-darbar-studio.webp","/assets/products/gf-ram-darbar-lifestyle.webp","/assets/products/gf-back-stand.webp"]', updated_at = '2026-11-03T10:00:00.000Z' WHERE id = 'prod-no1-ram-darbar';
UPDATE products SET images = '["/assets/products/gf-hanuman-studio.webp","/assets/products/gf-hanuman-lifestyle.webp","/assets/products/gf-back-stand.webp"]', updated_at = '2026-11-03T10:00:00.000Z' WHERE id = 'prod-no1-hanuman';

UPDATE campaign_banners SET desktop_image = '/assets/editorial/hero-god-frames-desktop.webp', mobile_image = '/assets/editorial/hero-god-frames-mobile.webp', alt = 'Five silver foil god frames on a pooja table with brass diyas and marigolds', updated_at = '2026-11-03T10:00:00.000Z' WHERE id = 'banner-devotional-99';
UPDATE campaign_banners SET desktop_image = '/assets/editorial/hero-return-gifts-desktop.webp', mobile_image = '/assets/editorial/hero-return-gifts-mobile.webp', alt = 'Rows of silver foil god frames tied with ribbon on a wedding return-gift table', updated_at = '2026-11-03T10:00:00.000Z' WHERE id = 'banner-wedding-guest';
UPDATE campaign_banners SET desktop_image = '/assets/editorial/hero-bulk-order-desktop.webp', mobile_image = '/assets/editorial/hero-bulk-order-mobile.webp', alt = 'Silver foil god frames packed in gift boxes for a bulk order', updated_at = '2026-11-03T10:00:00.000Z' WHERE id = 'banner-bulk-process';
