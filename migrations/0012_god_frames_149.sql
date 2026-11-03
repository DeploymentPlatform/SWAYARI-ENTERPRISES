-- SWAYARI ENTERPRISES D1 Migration 0012: god frames at ₹149, shipping at actual cost
--
-- The owner set the No. 1 silver foil god frames at ₹149 per frame (minimum order stays 25 frames).
-- Shipping is extra and charged at the actual courier cost.

UPDATE products SET
  indicative_price = 149,
  shipping_info = 'Shipping is extra, charged at the actual courier cost for your quantity and delivery PIN code.',
  updated_at = '2026-11-03T12:00:00.000Z'
WHERE id LIKE 'prod-no1-%';

UPDATE categories SET description = 'No. 1 silver foil god frames at ₹149 each — mix any designs, minimum 25 frames per order' WHERE id = 'cat-god-frames';

UPDATE campaign_banners SET emphasis = '₹149 each', updated_at = '2026-11-03T12:00:00.000Z' WHERE id = 'banner-devotional-99';
UPDATE campaign_banners SET supporting = 'Silver foil frames that stand on a table or hang on a wall. Minimum order 25 frames; shipping extra at actual cost.', updated_at = '2026-11-03T12:00:00.000Z' WHERE id = 'banner-wedding-guest';
