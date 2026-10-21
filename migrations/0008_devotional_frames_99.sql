-- SWAYARI ENTERPRISES D1 Migration 0008: Devotional Frames Under ₹99
--
-- 1. Schema Extensions for Devotional God Frames
-- 2. Non-destructive Devotional Categories Upsert (Preserves product associations; NO ON DELETE SET NULL)
-- 3. Archive Incompatible Legacy Seed Products (> ₹99 / Non-Frames)
-- 4. 12 Authentic Devotional Frame Sample Products (All Strictly <= ₹99, Authentic Imagery)
-- 5. Safe Campaign Banners Update (Deactivate legacy seed banners by ID; preserve owner banners)

-- 1. Alter products table with frame-specific fields
ALTER TABLE products ADD COLUMN deity TEXT DEFAULT NULL;
ALTER TABLE products ADD COLUMN frame_size TEXT DEFAULT NULL;
ALTER TABLE products ADD COLUMN orientation TEXT DEFAULT 'portrait';
ALTER TABLE products ADD COLUMN border_finish TEXT DEFAULT 'Antique Gold Foil';

-- 2. Devotional Frame Categories (Safe Upsert using ON CONFLICT to protect foreign key relationships)
INSERT INTO categories (id, name, slug, description, display_order, is_active, created_at) VALUES
('cat-devotional-frames', 'All Devotional Frames', 'devotional-frames', 'Auspicious devotional god frames under ₹99 for wedding return gifts and celebrations', 1, 1, '2026-10-18T07:00:00.000Z'),
('cat-ganesha', 'Lord Ganesha Frames', 'ganesha-frames', 'Auspicious Vighnaharta frames for wedding invitations and welcome return gifts', 2, 1, '2026-10-18T07:00:00.000Z'),
('cat-lakshmi', 'Goddess Lakshmi Frames', 'lakshmi-frames', 'Prosperity and Dhanalakshmi blessings for your wedding guests', 3, 1, '2026-10-18T07:00:00.000Z'),
('cat-balaji', 'Tirupati Balaji Frames', 'balaji-frames', 'Sri Venkateswara Swamy sanctum frames in gold and brass-relief finish', 4, 1, '2026-10-18T07:00:00.000Z'),
('cat-radha-krishna', 'Radha Krishna Frames', 'radha-krishna-frames', 'Divine love and celebratory return gifts for family ceremonies', 5, 1, '2026-10-18T07:00:00.000Z'),
('cat-mini-favors', 'Mini Return Gift Frames', 'mini-return-gift-frames', 'Compact 3×3 & pocket prayer frames under ₹49 and ₹69', 6, 1, '2026-10-18T07:00:00.000Z')
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  display_order = excluded.display_order,
  is_active = excluded.is_active;

-- 3. Archive incompatible legacy seed products (strictly hide items > ₹99 and non-frame decor from storefront while preserving records)
UPDATE products SET status = 'archived' WHERE indicative_price > 99;
UPDATE products SET status = 'archived' WHERE sku LIKE 'SWY-AFFORD-%';

-- 4. Upsert 12 Authentic Devotional Frame Sample Products (All <= ₹99 with Authentic Photographs)
INSERT INTO products (
    id, sku, name, slug, description, category_id, images, material, dimensions,
    has_variants, variants_json, indicative_price, min_quantity, availability_label,
    customisation_info, status, is_demo, price_type, set_contents, order_increment,
    is_quote_only, bulk_tiers_json, packaging_options_json, shipping_info, occasions_json,
    supports_individual, supports_bulk, deity, frame_size, orientation, border_finish,
    created_at, updated_at
) VALUES
(
    'demo-prod-godframe-01', 'SWY-FRAME-001', 'Sri Venkateswara Sanctum Gold Frame',
    'sri-venkateswara-sanctum-gold-frame',
    'Sacred relief devotional frame depicting Lord Venkateswara (Tirupati Balaji) in resplendent golden temple attire. Ideal wedding return gift carrying divine protection and blessings for visiting families.',
    'cat-balaji',
    '["/assets/products/venkateswara-frame-960.webp","/assets/products/venkateswara-frame-photo-781.webp"]',
    'Gold Foil Relief Plaque in Teak-finish Border', '4" x 6"',
    0, '[]', 89, 10, 'Sample preview',
    'Personalised blessing cards or family event tags available on bulk request',
    'published', 1, 'piece', 'Single framed devotional plaque', 5, 0,
    '[{"min_qty": 25, "unit_price": 79}, {"min_qty": 50, "unit_price": 69}, {"min_qty": 100, "unit_price": 59}]',
    '[{"name": "Standard Protective Wrap", "price": 0, "included": true}, {"name": "Individual Gift Box with Ribbon", "price": 8, "included": false}]',
    'Dispatched in 2–4 business days. Shipping charged separately upon team confirmation.',
    '["Wedding Return Gifts", "Housewarming", "Family Celebrations"]',
    1, 1, 'Balaji', 'Classic 4"×6"', 'portrait', 'Antique Gold Foil',
    '2026-10-18T07:01:00.000Z', '2026-10-18T07:01:00.000Z'
),
(
    'demo-prod-godframe-02', 'SWY-FRAME-002', 'Bala Krishna Golden Flute Devotional Frame',
    'bala-krishna-golden-flute-devotional-frame',
    'Charming devotional frame of Bala Krishna playing the divine flute surrounded by floral motifs. A favorite auspicious keepsake for weddings, baby showers, and family celebrations.',
    'cat-radha-krishna',
    '["/assets/products/bala-krishna-frame-960.webp","/assets/products/bala-krishna-frame-photo-823.webp"]',
    'Embossed Golden Foil Plaque in Ornate Beaded Frame', '4" x 6"',
    0, '[]', 79, 10, 'Sample preview',
    'Event name and date sticker on reverse available for bulk requests',
    'published', 1, 'piece', 'Single framed devotional plaque', 5, 0,
    '[{"min_qty": 25, "unit_price": 72}, {"min_qty": 50, "unit_price": 65}, {"min_qty": 100, "unit_price": 55}]',
    '[{"name": "Standard Bubble Sleeving", "price": 0, "included": true}, {"name": "Gold Organza Pouch", "price": 6, "included": false}]',
    'Dispatched in 2–4 business days. Shipping charged separately upon team confirmation.',
    '["Wedding Return Gifts", "Navratri & Haldi Kumkum", "Family Celebrations"]',
    1, 1, 'Krishna', 'Classic 4"×6"', 'portrait', 'Antique Gold Foil',
    '2026-10-18T07:02:00.000Z', '2026-10-18T07:02:00.000Z'
),
(
    'demo-prod-godframe-03', 'SWY-FRAME-003', 'Radha Krishna Divine Blessings Frame',
    'radha-krishna-divine-blessings-frame',
    'Exquisite commemorative devotional frame portraying Radha and Krishna in celebratory vrindavan posture. Designed specifically as a premium wedding return gift within ₹99.',
    'cat-radha-krishna',
    '["/assets/products/radha-krishna-frame-960.webp","/assets/products/radha-krishna-frame-photo-744.webp"]',
    'Archival Print with Gold-Embossed Highlight Trim', '5" x 7"',
    0, '[]', 99, 10, 'Sample preview',
    'Custom gold foiled thank-you tags available on 50+ pieces',
    'published', 1, 'piece', 'Single framed devotional plaque', 5, 0,
    '[{"min_qty": 25, "unit_price": 89}, {"min_qty": 50, "unit_price": 79}, {"min_qty": 100, "unit_price": 69}]',
    '[{"name": "Standard Poly Seal", "price": 0, "included": true}, {"name": "Presentation Gift Box", "price": 10, "included": false}]',
    'Dispatched in 2–4 business days. Shipping charged separately upon team confirmation.',
    '["Wedding Return Gifts", "Family Celebrations"]',
    1, 1, 'Radha Krishna', 'Royal 5"×7"', 'portrait', 'Antique Gold Foil',
    '2026-10-18T07:03:00.000Z', '2026-10-18T07:03:00.000Z'
),
(
    'demo-prod-godframe-04', 'SWY-FRAME-004', 'Veera Hanuman Raksha Kavach Frame',
    'veera-hanuman-raksha-kavach-frame',
    'Devotional frame of Lord Hanuman conferring strength, courage and auspicious protection. A popular thank-you gift for poojas, weddings, and sacred gatherings.',
    'cat-devotional-frames',
    '["/assets/products/hanuman-frame-960.webp","/assets/products/hanuman-frame-photo-741.webp"]',
    'Embossed Metallic Relief Plaque with Glass-free Acrylic Shield', '4" x 6"',
    0, '[]', 69, 10, 'Sample preview',
    'Custom packing options available upon enquiry',
    'published', 1, 'piece', 'Single framed devotional plaque', 5, 0,
    '[{"min_qty": 25, "unit_price": 62}, {"min_qty": 50, "unit_price": 55}, {"min_qty": 100, "unit_price": 49}]',
    '[{"name": "Standard Wrap", "price": 0, "included": true}]',
    'Dispatched in 2–4 business days. Shipping charged separately upon team confirmation.',
    '["Wedding Return Gifts", "Housewarming", "Family Celebrations"]',
    1, 1, 'Hanuman', 'Classic 4"×6"', 'portrait', 'Antique Gold Foil',
    '2026-10-18T07:04:00.000Z', '2026-10-18T07:04:00.000Z'
),
(
    'demo-prod-godframe-05', 'SWY-FRAME-005', 'Lord Ganesha Siddhivinayak Temple Frame',
    'lord-ganesha-siddhivinayak-temple-frame',
    'Traditional Lord Ganesha framed relief featuring modak and lotus motifs. The quintessential auspicious choice for wedding invitations, welcome hampers and return gifting.',
    'cat-ganesha',
    '["/assets/products/ganesha-frame-800.webp","/assets/products/ganesha-frame-800.jpg"]',
    'Gold Foil Relief in Rosewood Finish Border', '3" x 3"',
    0, '[]', 85, 15, 'Sample preview',
    'Event personalisation tag available',
    'published', 1, 'piece', 'Single framed devotional plaque with desktop strut', 5, 0,
    '[{"min_qty": 30, "unit_price": 75}, {"min_qty": 60, "unit_price": 68}, {"min_qty": 120, "unit_price": 58}]',
    '[{"name": "Standard Seal", "price": 0, "included": true}]',
    'Dispatched in 2–4 business days. Shipping charged separately upon team confirmation.',
    '["Wedding Return Gifts", "Housewarming", "Navratri & Haldi Kumkum"]',
    1, 1, 'Ganesha', 'Mini 3"×3"', 'square', 'Temple Teak Finish',
    '2026-10-18T07:05:00.000Z', '2026-10-18T07:05:00.000Z'
),
(
    'demo-prod-godframe-06', 'SWY-FRAME-006', 'Goddess Lakshmi Ashta-Lakshmi Blessings Frame',
    'goddess-lakshmi-ashta-lakshmi-blessings-frame',
    'Radiant Goddess Lakshmi seated on a sacred pink lotus shower of golden coins. An auspicious token of prosperity and joy for marriage guests.',
    'cat-lakshmi',
    '["/assets/products/lakshmi-frame-800.webp","/assets/products/lakshmi-frame-800.jpg"]',
    'Gold Foil Embossed Art with Deep Laminated Shield', '4" x 6"',
    0, '[]', 95, 10, 'Sample preview',
    'Gift box option available',
    'published', 1, 'piece', 'Single framed devotional plaque', 5, 0,
    '[{"min_qty": 25, "unit_price": 85}, {"min_qty": 50, "unit_price": 75}, {"min_qty": 100, "unit_price": 65}]',
    '[{"name": "Standard Cushion Pack", "price": 0, "included": true}, {"name": "Velvet Gift Case", "price": 12, "included": false}]',
    'Dispatched in 2–4 business days. Shipping charged separately upon team confirmation.',
    '["Wedding Return Gifts", "Navratri & Haldi Kumkum", "Housewarming"]',
    1, 1, 'Lakshmi', 'Classic 4"×6"', 'portrait', 'Antique Gold Foil',
    '2026-10-18T07:06:00.000Z', '2026-10-18T07:06:00.000Z'
),
(
    'demo-prod-godframe-07', 'SWY-FRAME-007', 'Saraswati Devi Divine Wisdom Mini Frame',
    'saraswati-devi-divine-wisdom-mini-frame',
    'Auspicious mini prayer frame depicting Goddess Saraswati with veena and sacred scriptures. A thoughtful return gift for family ceremonies and spiritual gatherings.',
    'cat-mini-favors',
    '["/assets/products/saraswati-frame-800.webp","/assets/products/saraswati-frame-800.jpg"]',
    'Golden Motif Plaque with Desktop Stand Backing', '3" x 3"',
    0, '[]', 59, 20, 'Sample preview',
    'Custom thank-you tags for wedding requests',
    'published', 1, 'piece', 'Single mini prayer frame', 5, 0,
    '[{"min_qty": 40, "unit_price": 52}, {"min_qty": 80, "unit_price": 45}, {"min_qty": 150, "unit_price": 39}]',
    '[{"name": "Protective Envelope", "price": 0, "included": true}]',
    'Dispatched in 2–4 business days. Shipping charged separately upon team confirmation.',
    '["Wedding Return Gifts", "Navratri & Haldi Kumkum"]',
    1, 1, 'Saraswati', 'Mini 3"×3"', 'square', 'Antique Gold Foil',
    '2026-10-18T07:07:00.000Z', '2026-10-18T07:07:00.000Z'
),
(
    'demo-prod-godframe-08', 'SWY-FRAME-008', 'Shiva Parvati Kalyanam Wedding Favors Frame',
    'shiva-parvati-kalyanam-wedding-favors-frame',
    'Divine wedding posture of Lord Shiva and Goddess Parvati in wide landscape orientation. Symbolic of sacred union and enduring marital harmony.',
    'cat-devotional-frames',
    '["/assets/products/shiva-parvati-frame-800.webp","/assets/products/shiva-parvati-frame-800.jpg"]',
    'Wide Metallic Foil Relief in Antique Wood Trim', '6" x 4"',
    0, '[]', 89, 10, 'Sample preview',
    'Engraved couple initials on backing plaque available',
    'published', 1, 'piece', 'Single landscape framed plaque', 5, 0,
    '[{"min_qty": 25, "unit_price": 79}, {"min_qty": 50, "unit_price": 69}, {"min_qty": 100, "unit_price": 59}]',
    '[{"name": "Standard Poly Pack", "price": 0, "included": true}]',
    'Dispatched in 2–4 business days. Shipping charged separately upon team confirmation.',
    '["Wedding Return Gifts", "Family Celebrations"]',
    1, 1, 'Shiva Parvati', 'Wide 6"×4"', 'landscape', 'Classic Rosewood Finish',
    '2026-10-18T07:08:00.000Z', '2026-10-18T07:08:00.000Z'
),
(
    'demo-prod-godframe-09', 'SWY-FRAME-009', 'Tirupati Balaji & Padmavathi Pocket Frame',
    'tirupati-balaji-padmavathi-pocket-frame',
    'Pocket-sized sacred prayer frame featuring Lord Balaji and Goddess Padmavathi. Highly portable devotional token under ₹49 for mass wedding distributions.',
    'cat-mini-favors',
    '["/assets/products/venkateswara-frame-600.webp"]',
    'Laminated Acrylic Pocket Frame with Gold Edging', '2.5" x 3.5"',
    0, '[]', 49, 25, 'Sample preview',
    'Bulk quantities supplied in sets of 25',
    'published', 1, 'piece', 'Single pocket prayer frame', 5, 0,
    '[{"min_qty": 50, "unit_price": 42}, {"min_qty": 100, "unit_price": 36}, {"min_qty": 200, "unit_price": 29}]',
    '[{"name": "Individual Cellophane Sleeve", "price": 0, "included": true}]',
    'Dispatched in 2–4 business days. Shipping charged separately upon team confirmation.',
    '["Wedding Return Gifts", "Family Celebrations"]',
    1, 1, 'Balaji', 'Pocket 2.5"×3.5"', 'portrait', 'Antique Gold Foil',
    '2026-10-18T07:09:00.000Z', '2026-10-18T07:09:00.000Z'
),
(
    'demo-prod-godframe-10', 'SWY-FRAME-010', 'Shree Ganesha Mangal Murti Golden Frame',
    'shree-ganesha-mangal-murti-golden-frame',
    'Auspicious pocket and mini pooja altar frame of Lord Ganesha in warm antique gold foil. Pure auspiciousness starting at just ₹49.',
    'cat-ganesha',
    '["/assets/products/ganesha-frame-600.webp","/assets/products/ganesha-frame-600.jpg"]',
    'Gold Foil Relief in Beaded Metallic Finish Border', '3" x 3"',
    0, '[]', 49, 25, 'Sample preview',
    'Personalised tags available on bulk request',
    'published', 1, 'piece', 'Single square mini frame', 5, 0,
    '[{"min_qty": 50, "unit_price": 42}, {"min_qty": 100, "unit_price": 36}, {"min_qty": 200, "unit_price": 29}]',
    '[{"name": "Standard Sleeve", "price": 0, "included": true}]',
    'Dispatched in 2–4 business days. Shipping charged separately upon team confirmation.',
    '["Wedding Return Gifts", "Housewarming", "Navratri & Haldi Kumkum"]',
    1, 1, 'Ganesha', 'Mini 3"×3"', 'square', 'Antique Gold Foil',
    '2026-10-18T07:10:00.000Z', '2026-10-18T07:10:00.000Z'
),
(
    'demo-prod-godframe-11', 'SWY-FRAME-011', 'Lord Murugan Divine Vel Auspicious Frame',
    'lord-murugan-divine-vel-auspicious-frame',
    'Auspicious devotional frame portraying Lord Murugan with the divine Vel and mayur (peacock). Revered return gift for South Indian weddings and sashtiapthapoorthi ceremonies.',
    'cat-devotional-frames',
    '["/assets/products/murugan-frame-800.webp","/assets/products/murugan-frame-800.jpg"]',
    'Gold Foil Embossed Plaque in Teak Finish Frame', '4" x 6"',
    0, '[]', 75, 15, 'Sample preview',
    'Event tags available for bulk orders',
    'published', 1, 'piece', 'Single framed devotional plaque', 5, 0,
    '[{"min_qty": 30, "unit_price": 68}, {"min_qty": 60, "unit_price": 59}, {"min_qty": 100, "unit_price": 49}]',
    '[{"name": "Standard Wrap", "price": 0, "included": true}]',
    'Dispatched in 2–4 business days. Shipping charged separately upon team confirmation.',
    '["Wedding Return Gifts", "Family Celebrations"]',
    1, 1, 'Murugan', 'Classic 4"×6"', 'portrait', 'Temple Teak Finish',
    '2026-10-18T07:11:00.000Z', '2026-10-18T07:11:00.000Z'
),
(
    'demo-prod-godframe-12', 'SWY-FRAME-012', 'Shirdi Sai Baba Shraddha Saburi Frame',
    'shirdi-sai-baba-shraddha-saburi-frame',
    'Peaceful and serene devotional frame of Shirdi Sai Baba blessing devotees with Shraddha and Saburi. A beloved keepsake for wedding and housewarming guests.',
    'cat-devotional-frames',
    '["/assets/products/sai-baba-frame-800.webp","/assets/products/sai-baba-frame-800.jpg"]',
    'Gold Embossed Relief in Ornate Border', '4" x 6"',
    0, '[]', 65, 15, 'Sample preview',
    'Custom thank-you tags for bulk requests',
    'published', 1, 'piece', 'Single framed devotional plaque', 5, 0,
    '[{"min_qty": 30, "unit_price": 58}, {"min_qty": 60, "unit_price": 50}, {"min_qty": 100, "unit_price": 42}]',
    '[{"name": "Standard Poly Pack", "price": 0, "included": true}]',
    'Dispatched in 2–4 business days. Shipping charged separately upon team confirmation.',
    '["Wedding Return Gifts", "Housewarming", "Family Celebrations"]',
    1, 1, 'Sai Baba', 'Classic 4"×6"', 'portrait', 'Antique Gold Foil',
    '2026-10-18T07:12:00.000Z', '2026-10-18T07:12:00.000Z'
)
ON CONFLICT(id) DO UPDATE SET
    sku = excluded.sku,
    name = excluded.name,
    slug = excluded.slug,
    description = excluded.description,
    category_id = excluded.category_id,
    images = excluded.images,
    material = excluded.material,
    dimensions = excluded.dimensions,
    indicative_price = excluded.indicative_price,
    min_quantity = excluded.min_quantity,
    order_increment = excluded.order_increment,
    bulk_tiers_json = excluded.bulk_tiers_json,
    packaging_options_json = excluded.packaging_options_json,
    shipping_info = excluded.shipping_info,
    occasions_json = excluded.occasions_json,
    deity = excluded.deity,
    frame_size = excluded.frame_size,
    orientation = excluded.orientation,
    border_finish = excluded.border_finish;

-- 5. Safe Campaign Banners Management:
-- Safely deactivate older seed banners by explicit IDs (DO NOT delete all banners; preserves owner-created banners)
UPDATE campaign_banners SET is_active = 0 WHERE id IN (
  'banner-moments', 'banner-devotional', 'banner-lighting', 'banner-uruli',
  'banner-under-999', 'banner-under-99', 'banner-bulk'
);

INSERT INTO campaign_banners (
    id, badge, headline, emphasis, supporting, cta_text, cta_href,
    desktop_image, mobile_image, alt, display_order, is_active, created_at, updated_at
) VALUES
(
    'banner-devotional-99', 'Auspicious Celebrations', 'Devotional frames', '₹99 & under',
    'Thoughtful return gifts for your special celebrations. Choose your designs and quantities. Shipping quoted separately.',
    'Explore Frames', '/shop',
    '/assets/editorial/hero-devotional-collection-desktop.webp',
    '/assets/editorial/hero-devotional-collection-mobile.webp',
    'Devotional sanctum frames for weddings and celebrations',
    1, 1, '2026-10-18T10:00:00.000Z', '2026-10-18T10:00:00.000Z'
),
(
    'banner-wedding-guest', 'Cherished Keepsakes', 'A thoughtful thank-you', 'for every guest.',
    'Blessings of Ganesha, Lakshmi, Balaji & Radha Krishna. High quality devotional frames quoted separately for bulk shipping.',
    'Request a Bulk Quote', '/shop?bulk=1',
    '/assets/editorial/hero-wedding-favors-desktop.webp',
    '/assets/editorial/hero-wedding-favors-mobile.webp',
    'Auspicious wedding return gift frames',
    2, 1, '2026-10-18T10:00:00.000Z', '2026-10-18T10:00:00.000Z'
),
(
    'banner-bulk-process', 'Seamless Bulk Requests', 'Choose your frames.', 'Tell us your quantity.',
    'Select your preferred deity designs. Our team contacts you to confirm availability, pricing, packing and delivery.',
    'Explore Frames', '/shop',
    '/assets/editorial/hero-bulk-process-desktop.webp',
    '/assets/editorial/hero-bulk-process-mobile.webp',
    'Bulk devotional return gifts',
    3, 1, '2026-10-18T10:00:00.000Z', '2026-10-18T10:00:00.000Z'
)
ON CONFLICT(id) DO UPDATE SET
    badge = excluded.badge,
    headline = excluded.headline,
    emphasis = excluded.emphasis,
    supporting = excluded.supporting,
    cta_text = excluded.cta_text,
    cta_href = excluded.cta_href,
    desktop_image = excluded.desktop_image,
    mobile_image = excluded.mobile_image,
    alt = excluded.alt,
    display_order = excluded.display_order,
    is_active = excluded.is_active;
