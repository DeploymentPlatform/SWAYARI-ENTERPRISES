-- SWAYARI ENTERPRISES D1 Migration 0016: everything on the store under ₹2,999 per piece
-- The owner wants only items whose 1-piece price is ₹2,999 or less. The three wall frames
-- (₹3,299–₹6,799) are archived, not deleted, so earlier requests still show them and they can be
-- brought back from the admin portal. Every other kit design stays, with all of its sizes.

UPDATE products SET status = 'archived', updated_at = '2026-11-04T12:00:00.000Z'
WHERE status = 'published' AND indicative_price > 2999;

UPDATE categories SET is_active = 0 WHERE id = 'cat-wall-frames';

-- Stotram cards and god stands are popular gruhapravesam (housewarming) return gifts too.
UPDATE products SET occasions_json = json_insert(occasions_json, '$[#]', 'griha-pravesh'), updated_at = '2026-11-04T12:00:00.000Z'
WHERE price_group IN ('03', '04') AND occasions_json NOT LIKE '%griha-pravesh%';
