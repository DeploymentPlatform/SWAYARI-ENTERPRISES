-- SWAYARI ENTERPRISES D1 Migration 0007: Affordable Gifting Schema & Catalogue
--
-- 1. Schema Extensions for Affordable Gifting & Bulk Order Requests
-- 2. 17 Coherent Affordable Gifting Sample Products across ₹99–₹999 & Bespoke Consultation

-- Alter products table with affordable gifting fields
ALTER TABLE products ADD COLUMN price_type TEXT DEFAULT 'piece';
ALTER TABLE products ADD COLUMN set_contents TEXT DEFAULT NULL;
ALTER TABLE products ADD COLUMN order_increment INTEGER DEFAULT 1;
ALTER TABLE products ADD COLUMN is_quote_only INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN bulk_tiers_json TEXT DEFAULT '[]';
ALTER TABLE products ADD COLUMN packaging_options_json TEXT DEFAULT '[]';
ALTER TABLE products ADD COLUMN shipping_info TEXT DEFAULT 'Standard dispatched in 2–4 business days across India';
ALTER TABLE products ADD COLUMN occasions_json TEXT DEFAULT '[]';
ALTER TABLE products ADD COLUMN supports_individual INTEGER DEFAULT 1;
ALTER TABLE products ADD COLUMN supports_bulk INTEGER DEFAULT 1;

-- Alter orders table with bulk request fields
ALTER TABLE orders ADD COLUMN occasion TEXT DEFAULT NULL;
ALTER TABLE orders ADD COLUMN required_date TEXT DEFAULT NULL;
ALTER TABLE orders ADD COLUMN is_bulk_request INTEGER DEFAULT 0;

-- Insert 17 coherent sample products for affordable gifting (all marked with is_demo = 1)
INSERT INTO products (
    id, sku, name, slug, description, category_id, images, material, dimensions,
    has_variants, variants_json, indicative_price, min_quantity, availability_label,
    customisation_info, status, is_demo, price_type, set_contents, order_increment,
    is_quote_only, bulk_tiers_json, packaging_options_json, shipping_info, occasions_json,
    supports_individual, supports_bulk, created_at, updated_at
) VALUES
-- ========================================================
-- TIER 1: ₹99 & UNDER
-- ========================================================
(
    'demo-prod-afford-01', 'SWY-AFFORD-001', 'Handcrafted Raw Silk Brocade Potli Bag',
    'handcrafted-raw-silk-brocade-potli-bag',
    'Traditional Banarasi raw silk brocade potli bag featuring rich golden zari floral weaving, completed with a golden drawstring cord and artisan bell tassels. Designed specifically for elegant wedding return gifting, dry fruit packaging, or sacred coin presentation.',
    'cat-gift-sets',
    '["/assets/products/demo-gift-brocade-potli-800.webp","/assets/products/demo-gift-brocade-potli-800.jpg"]',
    'Raw Silk & Gold Zari Weave with Drawstring Tassels', '8" x 5"',
    0, '[]', 49, 10, 'Sample preview',
    'Custom gold foiled tags available for orders over 50 pieces',
    'published', 1, 'piece', 'Single pouch (minimum order 10 pieces)', 5, 0,
    '[{"min_qty": 25, "unit_price": 45}, {"min_qty": 50, "unit_price": 39}, {"min_qty": 100, "unit_price": 35}]',
    '[{"name": "Standard Poly Wrap", "price": 0, "included": true}, {"name": "Individual Ribboned Gift Tag", "price": 5, "included": false}]',
    'Ships within 3–5 business days. Express bulk freight available.',
    '["Wedding Return Gifts", "Navratri & Haldi Kumkum", "Housewarming"]',
    0, 1, '2026-10-18T08:00:00.000Z', '2026-10-18T08:00:00.000Z'
),
(
    'demo-prod-afford-02', 'SWY-AFFORD-002', 'Pure Solid Brass Kumkum Chimizh (Sindoor Dibbi)',
    'pure-solid-brass-kumkum-chimizh',
    'Auspicious solid bell-metal brass container crafted for keeping kumkum, turmeric, or sacred ashes. Beautifully turned and polished with a secure screw-threaded dome lid, representing lasting tradition and sacred purity.',
    'cat-home-accents',
    '["/assets/products/demo-accent-brass-kumkum-chimizh-800.webp","/assets/products/demo-accent-brass-kumkum-chimizh-800.jpg"]',
    '100% Solid Bell-Metal Brass', '1.5" Diameter x 1.8" Height',
    0, '[]', 85, 1, 'Sample preview',
    'Bulk discount on 20+ units',
    'published', 1, 'piece', 'Single brass chimizh with screw-tight patterned lid', 1, 0,
    '[{"min_qty": 20, "unit_price": 75}, {"min_qty": 50, "unit_price": 68}]',
    '[{"name": "SWAYARI Kraft Gift Box", "price": 0, "included": true}, {"name": "Red Velvet Drawstring Pouch", "price": 12, "included": false}]',
    'Dispatched in 2–3 business days across India.',
    '["Haldi Kumkum", "Navratri Return Gifts", "Varalakshmi Vratham", "Griha Pravesh"]',
    1, 1, '2026-10-18T08:00:00.000Z', '2026-10-18T08:00:00.000Z'
),
(
    'demo-prod-afford-03', 'SWY-AFFORD-003', 'Handmade Shola Pith Floral Garland Tassel',
    'handmade-shola-pith-floral-garland-tassel',
    'Natural, sustainable festive floral tassel intricately carved by hand from organic sholapith reeds. Featherlight and elegant, suitable for toran door hangings, pooja backdrop accents, and auspicious wedding welcome favors.',
    'cat-festive-decor',
    '["/assets/products/demo-decor-shola-pith-tassel-800.webp","/assets/products/demo-decor-shola-pith-tassel-800.jpg"]',
    'Organic Shola Pith Plant Fiber & Cotton Cord', '14" Length',
    0, '[]', 65, 5, 'Sample preview',
    'Bulk packing available for event coordinators',
    'published', 1, 'piece', 'Single hanging garland tassel (minimum order 5 pieces)', 5, 0,
    '[{"min_qty": 25, "unit_price": 55}, {"min_qty": 100, "unit_price": 48}]',
    '[{"name": "Protective Board Packaging", "price": 0, "included": true}]',
    'Eco-friendly crush-proof shipping across India.',
    '["Diwali Décor", "Poojas & Ceremonies", "Wedding Door Hangings"]',
    0, 1, '2026-10-18T08:00:00.000Z', '2026-10-18T08:00:00.000Z'
),
(
    'demo-prod-afford-04', 'SWY-AFFORD-004', 'Handcrafted Terracotta Dhoop Burner with Incense',
    'handcrafted-terracotta-dhoop-burner-with-incense',
    'Rustic natural terracotta dhoop dish hand-shaped on potter wheels, accompanied by four organic cup sambrani dhoop pieces scented with natural loban resin for peaceful meditative evening auras.',
    'cat-festive-decor',
    '["/assets/products/demo-decor-terracotta-dhoop-800.webp","/assets/products/demo-decor-terracotta-dhoop-800.jpg"]',
    'Natural Kiln-Fired Clay & Herbal Cup Sambrani', '3.5" Diameter x 2.5" Height',
    0, '[]', 95, 1, 'Sample preview',
    'Custom fragrance blending upon consultation',
    'published', 1, 'set', '1 terracotta burner dish + 4 pieces herbal cup sambrani dhoop', 1, 0,
    '[{"min_qty": 15, "unit_price": 82}, {"min_qty": 50, "unit_price": 72}]',
    '[{"name": "Eco-Kraft Gift Box with Twine", "price": 0, "included": true}]',
    'Ships safely bubble-wrapped in 2–4 business days.',
    '["Everyday Gifting", "Housewarming", "Evening Prayer"]',
    1, 1, '2026-10-18T08:00:00.000Z', '2026-10-18T08:00:00.000Z'
),

-- ========================================================
-- TIER 2: ₹100–₹299
-- ========================================================
(
    'demo-prod-afford-05', 'SWY-AFFORD-005', 'Classic Brass Akhand Diya with Glass Chimney (Small)',
    'classic-brass-akhand-diya-with-glass-chimney-small',
    'Sleek brass deepam designed for continuous safe burning without wind disturbance. Crafted from golden lacquered brass with a thermal-shock resistant borosilicate glass chimney and decorative brass snuffer lid.',
    'cat-decorative-lamps',
    '["/assets/products/demo-lamp-brass-akhand-diya-800.webp","/assets/products/demo-lamp-brass-akhand-diya-800.jpg"]',
    'Virgin Brass with Heat-Resistant Borosilicate Glass', '4.5" Height x 2.75" Base Diameter',
    0, '[]', 199, 1, 'Sample preview',
    'Available with pre-packed oil & wicks set',
    'published', 1, 'piece', '1 brass lamp base, 1 borosilicate glass globe, 1 brass snuffer lid', 1, 0,
    '[{"min_qty": 10, "unit_price": 175}, {"min_qty": 30, "unit_price": 155}]',
    '[{"name": "Individual Padded Gift Box", "price": 0, "included": true}]',
    'Special shock-proof glass packaging dispatched in 2–3 business days.',
    '["Diwali", "Housewarming", "Daily Pooja", "Corporate Festive Gifts"]',
    1, 1, '2026-10-18T08:00:00.000Z', '2026-10-18T08:00:00.000Z'
),
(
    'demo-prod-afford-06', 'SWY-AFFORD-006', 'Royal Meenakari Hand-Painted Peacock Trinket Box',
    'royal-meenakari-hand-painted-peacock-trinket-box',
    'Artisanal Rajasthani meenakari enamelled trinket box in royal lapis blue and emerald tones, featuring an embossed dancing peacock lid with secure magnetic closure. A precious keepsake for rings and sacred accessories.',
    'cat-gift-sets',
    '["/assets/products/demo-gift-meenakari-peacock-box-800.webp","/assets/products/demo-gift-meenakari-peacock-box-800.jpg"]',
    'Enamelled Brass & Metal Alloy', '3" x 3" x 1.5"',
    0, '[]', 165, 1, 'Sample preview',
    'Custom engraved foil logo inside lid available for 50+ units',
    'published', 1, 'piece', '1 enamelled peacock box with hinged magnetic lid', 1, 0,
    '[{"min_qty": 15, "unit_price": 145}, {"min_qty": 50, "unit_price": 130}]',
    '[{"name": "Gold Organza Pouch", "price": 0, "included": true}, {"name": "Velvet Rigid Box", "price": 25, "included": false}]',
    'Dispatched within 2–4 business days.',
    '["Wedding Favors", "Bridal Shower", "Anniversary Gifts"]',
    1, 1, '2026-10-18T08:00:00.000Z', '2026-10-18T08:00:00.000Z'
),
(
    'demo-prod-afford-07', 'SWY-AFFORD-007', 'Carved Mango Wood Elephant Tealight Candle Holder',
    'carved-mango-wood-elephant-tealight-candle-holder',
    'Hand-sculpted royal elephant figurine in seasoned mango timber with a burnt walnut patina finish. Crowned with an inlaid metallic tealight cup to cast an ambient gentle glow across dining tables and consoles.',
    'cat-festive-decor',
    '["/assets/products/demo-decor-wood-elephant-tealight-800.webp","/assets/products/demo-decor-wood-elephant-tealight-800.jpg"]',
    'Sustainable Seasoned Mango Wood & Metal Cup', '4" Length x 2.5" Height x 2" Width',
    0, '[]', 140, 1, 'Sample preview',
    'Bulk customisation for corporate events',
    'published', 1, 'piece', '1 carved elephant wooden holder + 1 complimentary wax tealight', 1, 0,
    '[{"min_qty": 20, "unit_price": 120}, {"min_qty": 50, "unit_price": 105}]',
    '[{"name": "Eco-Kraft Carton with Tealight", "price": 0, "included": true}]',
    'Dispatched in 2–3 business days.',
    '["Housewarming", "Diwali Décor", "Table Centrepiece"]',
    1, 1, '2026-10-18T08:00:00.000Z', '2026-10-18T08:00:00.000Z'
),
(
    'demo-prod-afford-08', 'SWY-AFFORD-008', 'Auspicious Brass Pooja Ghanti with Nandi Finial',
    'auspicious-brass-pooja-ghanti-with-nandi-finial',
    'Sacred handheld devotional prayer bell cast from pure bell-metal brass, crowned with an intricately detailed Nandi bull finial. Precision balanced to ring with a sweet, sustaining acoustic resonance.',
    'cat-home-accents',
    '["/assets/products/demo-accent-brass-nandi-bell-800.webp","/assets/products/demo-accent-brass-nandi-bell-800.jpg"]',
    'Pure Bell Metal Brass', '4.5" Height x 1.75" Flare Diameter',
    0, '[]', 260, 1, 'Sample preview',
    'Pair with brass aarti thali',
    'published', 1, 'piece', '1 brass handheld prayer bell with tuned clapper', 1, 0,
    '[{"min_qty": 10, "unit_price": 230}, {"min_qty": 25, "unit_price": 210}]',
    '[{"name": "Traditional Gift Wrap", "price": 0, "included": true}]',
    'Dispatched in 2–3 business days.',
    '["Pooja Mandir", "Griha Pravesh", "Elder Blessings"]',
    1, 1, '2026-10-18T08:00:00.000Z', '2026-10-18T08:00:00.000Z'
),

-- ========================================================
-- TIER 3: ₹300–₹499
-- ========================================================
(
    'demo-prod-afford-09', 'SWY-AFFORD-009', 'Paired Brass Peacock Mayur Diya Set (Set of 2)',
    'paired-brass-peacock-mayur-diya-set',
    'Auspicious pair of traditional brass deepams crowned with finely sculpted mayur (peacock) crests and scalloped oil reservoirs. Designed for flanking thresholds, rangolis, and altar sanctums during festive occasions.',
    'cat-decorative-lamps',
    '["/assets/products/demo-lamp-peacock-mayur-pair-800.webp","/assets/products/demo-lamp-peacock-mayur-pair-800.jpg"]',
    'Solid Brass with Gloss Lacquer', '3.5" Height each',
    0, '[]', 380, 1, 'Sample preview',
    'Gift boxed in festive red presentation carton',
    'published', 1, 'set', 'Pair of 2 matching brass peacock deepams', 1, 0,
    '[{"min_qty": 10, "unit_price": 340}, {"min_qty": 25, "unit_price": 310}]',
    '[{"name": "Satin-Lined Dual Box", "price": 0, "included": true}]',
    'Dispatched in 2–3 business days.',
    '["Diwali Gifting", "Wedding Return Gifts", "Housewarming"]',
    1, 1, '2026-10-18T08:00:00.000Z', '2026-10-18T08:00:00.000Z'
),
(
    'demo-prod-afford-10', 'SWY-AFFORD-010', 'German Silver Floral Embossed Dry Fruit Bowl with Spoon',
    'german-silver-floral-embossed-dry-fruit-bowl-with-spoon',
    'Exquisitely carved silver-plated bowl with embossed floral scrolling, scallop border, and matching leaf-motif spoon. Complete with a royal velvet presentation case, representing distinguished celebratory hospitality.',
    'cat-gift-sets',
    '["/assets/products/demo-gift-silver-dryfruit-bowl-800.webp","/assets/products/demo-gift-silver-dryfruit-bowl-800.jpg"]',
    'Silver-Plated White Metal Alloy', '4.5" Bowl Diameter + 4" Matching Spoon',
    0, '[]', 340, 1, 'Sample preview',
    'Velvet box included in standard pricing',
    'published', 1, 'set', '1 embossed bowl, 1 matching floral spoon, 1 velvet presentation box', 1, 0,
    '[{"min_qty": 10, "unit_price": 300}, {"min_qty": 30, "unit_price": 275}]',
    '[{"name": "Velvet Presentation Box (Included)", "price": 0, "included": true}]',
    'Dispatched in 2–4 business days.',
    '["Wedding Return Gifts", "Upanayanam", "Anniversary Gifts"]',
    1, 1, '2026-10-18T08:00:00.000Z', '2026-10-18T08:00:00.000Z'
),
(
    'demo-prod-afford-11', 'SWY-AFFORD-011', 'Laser-Cut Wooden Coaster Gift Set with Heritage Motifs',
    'laser-cut-wooden-coaster-gift-set-with-heritage-motifs',
    'Six architectural wooden drink coasters carved with classical Indian jharokha and jaali lattice motifs. Coated with heat- and moisture-resistant natural oil polish and supplied with a matching wooden desk holder.',
    'cat-festive-decor',
    '["/assets/products/demo-decor-wooden-heritage-coasters-800.webp","/assets/products/demo-decor-wooden-heritage-coasters-800.jpg"]',
    'Engineered High-Density Teak Veneer & Natural Oil Polish', '3.75" x 3.75" each (Set of 6)',
    0, '[]', 320, 1, 'Sample preview',
    'Laser engraved company crest available for bulk requests',
    'published', 1, 'set', '6 coasters with distinct heritage jaali cutouts + 1 matching holder', 1, 0,
    '[{"min_qty": 15, "unit_price": 280}, {"min_qty": 50, "unit_price": 250}]',
    '[{"name": "Matching Wooden Stand & Ribbon Box", "price": 0, "included": true}]',
    'Dispatched in 2–3 business days.',
    '["Corporate Gifting", "Housewarming", "Festive Celebrations"]',
    1, 1, '2026-10-18T08:00:00.000Z', '2026-10-18T08:00:00.000Z'
),
(
    'demo-prod-afford-12', 'SWY-AFFORD-012', 'Mini Brass Pooja Thali Gift Ensemble (5-Piece Set)',
    'mini-brass-pooja-thali-gift-ensemble',
    'Complete 5-piece miniature devotional altar set in brilliant polished brass. Contains a patterned puja plate, oil deepam, dhoop stand, sacred kumkum cup, and brass bell, nestled together in a gold presentation carton.',
    'cat-gift-sets',
    '["/assets/products/demo-gift-mini-brass-pooja-thali-800.webp","/assets/products/demo-gift-mini-brass-pooja-thali-800.jpg"]',
    'Solid Polished Brass', '6" Plate Diameter',
    0, '[]', 490, 1, 'Sample preview',
    'Personalised blessing cards available upon consultation',
    'published', 1, 'set', '1 plate (6"), 1 mini diya, 1 incense holder, 1 kumkum cup, 1 brass bell', 1, 0,
    '[{"min_qty": 10, "unit_price": 440}, {"min_qty": 25, "unit_price": 400}]',
    '[{"name": "Festive Gold Box with Window", "price": 0, "included": true}]',
    'Dispatched in 2–4 business days.',
    '["Navratri", "Diwali", "Housewarming", "Pooja Return Gifts"]',
    1, 1, '2026-10-18T08:00:00.000Z', '2026-10-18T08:00:00.000Z'
),

-- ========================================================
-- TIER 4: ₹500–₹999
-- ========================================================
(
    'demo-prod-afford-13', 'SWY-AFFORD-013', 'Traditional Hand-Hammered Brass Uruli with 3 Floating Diyas (6-Inch)',
    'traditional-hand-hammered-brass-uruli-6-inch',
    'Classic handcrafted brass uruli bowl shaped with artisan hammer-strike facets and rounded rim. Paired with three brass floating flower diyas to create captivating entryway and center-table water displays.',
    'cat-festive-decor',
    '["/assets/products/demo-decor-brass-uruli-floating-800.webp","/assets/products/demo-decor-brass-uruli-floating-800.jpg"]',
    'Heavy Gauge Hand-Hammered Brass', '6.5" Rim Diameter x 2.25" Depth',
    0, '[]', 680, 1, 'Sample preview',
    'Includes 3 matching brass floating diyas',
    'published', 1, 'set', '1 brass uruli bowl + 3 matching mini floating brass leaf diyas', 1, 0,
    '[{"min_qty": 5, "unit_price": 620}, {"min_qty": 15, "unit_price": 570}]',
    '[{"name": "Heavy Duty SWAYARI Gift Box", "price": 0, "included": true}]',
    'Reinforced packaging; ships in 2–3 business days.',
    '["Housewarming", "Diwali Décor", "Living Room Centrepiece"]',
    1, 1, '2026-10-18T08:00:00.000Z', '2026-10-18T08:00:00.000Z'
),
(
    'demo-prod-afford-14', 'SWY-AFFORD-014', 'Handcrafted Auspicious Lakshmi-Ganesh Idol Pair in Brass (4-Inch)',
    'handcrafted-auspicious-lakshmi-ganesh-idol-pair-in-brass',
    'Revered pair of Lord Ganesha and Goddess Lakshmi cast in solid bell-metal brass with antique patina highlights. Designed to bestow auspicious beginnings and abundance upon homes, offices, and sanctums.',
    'cat-home-accents',
    '["/assets/products/demo-accent-lakshmi-ganesh-brass-800.webp","/assets/products/demo-accent-lakshmi-ganesh-brass-800.jpg"]',
    'Solid Cast Brass with Antique Patina Wash', '4" Height each',
    0, '[]', 750, 1, 'Sample preview',
    'Festive red brocade box packaging included',
    'published', 1, 'set', '1 Lakshmi idol + 1 Ganesha idol in presentation box', 1, 0,
    '[{"min_qty": 5, "unit_price": 690}, {"min_qty": 20, "unit_price": 630}]',
    '[{"name": "Royal Brocade Box with Foam Cushioning", "price": 0, "included": true}]',
    'Dispatched in 2–3 business days.',
    '["Diwali Pujan", "New Office Opening", "Housewarming", "Wedding Blessing"]',
    1, 1, '2026-10-18T08:00:00.000Z', '2026-10-18T08:00:00.000Z'
),
(
    'demo-prod-afford-15', 'SWY-AFFORD-015', 'Heritage Festive Gift Hamper with Brass Diya & Organic Incense',
    'heritage-festive-gift-hamper-with-brass-diya-and-incense',
    'Thoughtfully curated celebratory hamper uniting handcrafted bell-metal brass lighting, an artisan prayer bell, and pure organic flora incense sticks. Arranged in a reusable handwoven bamboo tray with festive organza ribbon.',
    'cat-gift-sets',
    '["/assets/products/demo-gift-festive-brass-hamper-800.webp","/assets/products/demo-gift-festive-brass-hamper-800.jpg"]',
    'Handwoven Bamboo Tray, Brass Diya, Herbal Incense, Rolled Brass Bell', '10" x 8" x 3.5" Presentation Tray',
    0, '[]', 890, 1, 'Sample preview',
    'Custom branding and bulk delivery options available',
    'published', 1, 'set', '1 brass diya, 1 brass bell, 20 charcoal-free flora incense sticks, 1 holder, 1 handmade basket', 1, 0,
    '[{"min_qty": 5, "unit_price": 820}, {"min_qty": 15, "unit_price": 760}]',
    '[{"name": "Shrink-Wrapped Woven Tray with Golden Ribbon", "price": 0, "included": true}, {"name": "Custom Greeting Card Included", "price": 0, "included": true}]',
    'Dispatched in 2–4 business days.',
    '["Corporate Diwali Gifting", "Family Celebrations", "Festival Hospitality"]',
    1, 1, '2026-10-18T08:00:00.000Z', '2026-10-18T08:00:00.000Z'
),
(
    'demo-prod-afford-16', 'SWY-AFFORD-016', 'Silver-Plated Dual Bowl & Tray Presentation Set',
    'silver-plated-dual-bowl-and-tray-presentation-set',
    'Distinguished German silver dining and celebration gift set. Includes two intricately embossed bowls, two matching teaspoons, and an engraved serving tray, sealed in clear protective anti-tarnish glaze and presented in a velvet chest.',
    'cat-gift-sets',
    '["/assets/products/demo-gift-silver-dual-bowl-set-800.webp","/assets/products/demo-gift-silver-dual-bowl-set-800.jpg"]',
    'German Silver with Lacquer Anti-Tarnish Finish', '8" x 4.5" Tray + Two 3.5" Bowls + 2 Spoons',
    0, '[]', 950, 1, 'Sample preview',
    'Velvet gift box included in pricing',
    'published', 1, 'set', '2 etched bowls, 2 matching spoons, 1 rectangular embossed tray, velvet box', 1, 0,
    '[{"min_qty": 5, "unit_price": 880}, {"min_qty": 15, "unit_price": 820}]',
    '[{"name": "Royal Velvet Box with Clasp (Included)", "price": 0, "included": true}]',
    'Dispatched in 2–4 business days.',
    '["Wedding Return Gifts", "Milestone Anniversaries", "VIP Corporate Guests"]',
    1, 1, '2026-10-18T08:00:00.000Z', '2026-10-18T08:00:00.000Z'
),

-- ========================================================
-- BESPOKE / QUOTE ONLY
-- ========================================================
(
    'demo-prod-afford-17', 'SWY-AFFORD-017', 'Custom-Engraved Ceremonial Silver Plaque',
    'custom-engraved-ceremonial-silver-plaque',
    'Commissioned heirloom ceremonial plaque crafted with sterling silver repoussé foil over polished Burma teak framing. Tailored with personalized citation inscriptions, institutional emblems, and temple dedication seals. Pricing provided upon specification review.',
    'cat-gift-sets',
    '["/assets/products/demo-bespoke-silver-plaque-800.webp","/assets/products/demo-bespoke-silver-plaque-800.jpg"]',
    'Hallmarked Sterling Silver / Silver Clad on Teak', 'Custom specifications upon consultation',
    0, '[]', NULL, 1, 'Price on Consultation',
    'Complete custom design and lettering proof provided prior to production',
    'published', 1, 'piece', 'Custom designed silver plaque with personalized laser/hand engraving', 1, 1,
    '[]',
    '[{"name": "Bespoke Hardwood Velvet Presentation Case", "price": 0, "included": true}]',
    'Insured courier delivery across India.',
    '["Corporate Honours", "Retirement Felicitations", "Temple Dedications", "Milestone Commemorations"]',
    1, 1, '2026-10-18T08:00:00.000Z', '2026-10-18T08:00:00.000Z'
);
