-- SWAYARI ENTERPRISES D1 Migration 0005: Rich 20-Product Demo Catalogue
--
-- Populates 5 core categories and 20 coherent, beautifully composed sample products
-- across Devotional Frames, Decorative Lamps, Home Accents, Festive Décor, and Gift Sets.
-- All entries have is_demo = 1 so real production queries completely exclude them unless
-- the explicit preview toggle is active in development.

-- 1. Ensure the 5 canonical categories exist
INSERT INTO categories (id, name, slug, description, display_order, is_active, created_at) VALUES
('cat-devotional-frames', 'Devotional Frames', 'devotional-frames', 'Embossed devotional sanctum frames and heritage relief art', 1, 1, '2026-10-18T09:00:00.000Z'),
('cat-decorative-lamps', 'Decorative Lamps', 'decorative-lamps', 'Handcrafted brass deepams, hanging diyas, and temple pillar lamps', 2, 1, '2026-10-18T09:00:00.000Z'),
('cat-home-accents', 'Home Accents', 'home-accents', 'Solid bell-metal brass sculptures, celestial figurines, and ceremonial bells', 3, 1, '2026-10-18T09:00:00.000Z'),
('cat-festive-decor', 'Festive Décor', 'festive-decor', 'Traditional hand-hammered brass urulis, pooja thalis, and festive arrangements', 4, 1, '2026-10-18T09:00:00.000Z'),
('cat-gift-sets', 'Gift Sets', 'gift-sets', 'Curated auspicious hampers, wedding presentation boxes, and celebration chests', 5, 1, '2026-10-18T09:00:00.000Z')
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  display_order = excluded.display_order;

-- 2. Insert the 20 rich sample products
INSERT INTO products (
    id, sku, name, slug, description, category_id, images, material, dimensions,
    has_variants, variants_json, indicative_price, min_quantity, availability_label,
    customisation_info, status, is_demo, created_at, updated_at
) VALUES
-- Devotional Frames (4)
(
    'demo-prod-frame-01', 'SWY-DEMO-101', 'Ornate Sanctum Devotional Gold Relief Frame', 'ornate-sanctum-devotional-gold-relief-frame',
    'Exquisitely detailed sanctum relief panel finished in antique gold tones, housed in an ornate molded timber frame with protective museum glass. A distinguished centerpiece for prayer rooms, entrances, and prestigious gifting. Sample entry for catalogue preview.',
    'cat-devotional-frames', '["/assets/products/demo-frame-sanctum-gold-800.webp","/assets/products/demo-frame-sanctum-gold-800.jpg"]',
    'Gold Foil & Teak Tone Wood', '16" x 20" x 2"', 0, '[]', 6800, 1, 'Sample preview',
    'Custom engraved dedication plaque available upon consultation', 'published', 1, '2026-10-18T09:00:00.000Z', '2026-10-18T09:00:00.000Z'
),
(
    'demo-prod-frame-02', 'SWY-DEMO-102', 'Royal Heritage Gold Embossed Devotional Frame', 'royal-heritage-gold-embossed-devotional-frame',
    'Classical baroque-inspired border framing an intricate embossed devotional panel with radiant gilding. Sealed with archival backing for enduring sanctum preservation. Sample entry for catalogue preview.',
    'cat-devotional-frames', '["/assets/products/demo-frame-baroque-floral-800.webp","/assets/products/demo-frame-baroque-floral-800.jpg"]',
    'Embossed Brass Leaf & Hardwood Frame', '14" x 18" x 1.5"', 0, '[]', 5900, 1, 'Sample preview',
    'Velvet gift box packaging included upon request', 'published', 1, '2026-10-18T09:00:00.000Z', '2026-10-18T09:00:00.000Z'
),
(
    'demo-prod-frame-03', 'SWY-DEMO-103', 'Classic Temple Gold Leaf Framed Collection', 'classic-temple-gold-leaf-framed-collection',
    'A stately framed piece capturing the timeless serenity of temple architecture, finished with subtle patina accents and gold trim molding. Sample entry for catalogue preview.',
    'cat-devotional-frames', '["/assets/products/demo-frame-temple-collection-800.webp","/assets/products/demo-frame-temple-collection-800.jpg"]',
    'Artisanal Embossed Foil & Dark Walnut Frame', '12" x 16" x 1.5"', 0, '[]', 4800, 1, 'Sample preview',
    'Available in paired sets for ceremonial gifting', 'published', 1, '2026-10-18T09:00:00.000Z', '2026-10-18T09:00:00.000Z'
),
(
    'demo-prod-frame-04', 'SWY-DEMO-104', 'Vintage Hand-Carved Teak & Gold Leaf Frame', 'vintage-hand-carved-teak-and-gold-leaf-frame',
    'Rich teak wood surround detailed with traditional floral carvings and an antique burnished gold centerpiece. An heirloom addition to home sanctuaries. Sample entry for catalogue preview.',
    'cat-devotional-frames', '["/assets/products/demo-frame-vintage-altar-800.webp","/assets/products/demo-frame-vintage-altar-800.jpg"]',
    'Hand-Carved Burma Teak & Gold Finish', '18" x 22" x 2"', 0, '[]', 7500, 1, 'Sample preview',
    'Can be customized with personalized blessing note', 'published', 1, '2026-10-18T09:00:00.000Z', '2026-10-18T09:00:00.000Z'
),

-- Decorative Lamps (4)
(
    'demo-prod-lamp-01', 'SWY-DEMO-105', 'Traditional Ornate Brass Kuthu Pillar Lamp', 'traditional-ornate-brass-kuthu-pillar-lamp',
    'An imposing traditional Kuthu Vilakku pillar lamp cast in solid bell-metal brass, featuring tiered oil wells and a majestic top finial. Hand-polished to a luminous golden lustre. Sample entry for catalogue preview.',
    'cat-decorative-lamps', '["/assets/products/demo-lamp-traditional-pillar-800.webp","/assets/products/demo-lamp-traditional-pillar-800.jpg"]',
    'Solid Bell-Metal Brass', 'Height: 24", Base: 7"', 0, '[]', 14500, 1, 'Sample preview',
    'Available in 18", 24", and 30" heights', 'published', 1, '2026-10-18T09:00:00.000Z', '2026-10-18T09:00:00.000Z'
),
(
    'demo-prod-lamp-02', 'SWY-DEMO-106', 'Handcrafted Ceremonial Brass Oil Lamp', 'handcrafted-ceremonial-brass-oil-lamp',
    'A gracefully balanced ceremonial brass diya designed with five auspicious wicks and an ergonomic central handle. Ideal for morning rituals and festival aartis. Sample entry for catalogue preview.',
    'cat-decorative-lamps', '["/assets/products/demo-lamp-ceremonial-diya-800.webp","/assets/products/demo-lamp-ceremonial-diya-800.jpg"]',
    'High-Density Cast Brass', 'Height: 9", Width: 5.5"', 0, '[]', 3850, 1, 'Sample preview',
    'Includes spare cotton wicks and brass wick adjuster', 'published', 1, '2026-10-18T09:00:00.000Z', '2026-10-18T09:00:00.000Z'
),
(
    'demo-prod-lamp-03', 'SWY-DEMO-107', 'Classic Temple Brass Deepam with Pedestal', 'classic-temple-brass-deepam-with-pedestal',
    'Solid circular pedestal deepam with flared oil bowl crafted from heirloom brass alloy. Engineered for stable burning during prolonged ceremonies and poojas. Sample entry for catalogue preview.',
    'cat-decorative-lamps', '["/assets/products/demo-lamp-sacred-flame-800.webp","/assets/products/demo-lamp-sacred-flame-800.jpg"]',
    'Pure Bell-Metal Brass', 'Height: 8", Dia: 5"', 0, '[]', 2950, 1, 'Sample preview',
    'Mirror-finish hand-buffed surface', 'published', 1, '2026-10-18T09:00:00.000Z', '2026-10-18T09:00:00.000Z'
),
(
    'demo-prod-lamp-04', 'SWY-DEMO-108', 'Antique Meditative Brass Oil Lamp', 'antique-meditative-brass-oil-lamp',
    'Compact devotional diya with decorative lip and floral relief engraving, casting a peaceful radiant glow in private meditation rooms and alcoves. Sample entry for catalogue preview.',
    'cat-decorative-lamps', '["/assets/products/demo-lamp-serene-glow-800.webp","/assets/products/demo-lamp-serene-glow-800.jpg"]',
    'Antique Burnished Brass', 'Height: 6", Dia: 4"', 0, '[]', 2250, 1, 'Sample preview',
    'Tarnish-resistant clear protective lacquer coating', 'published', 1, '2026-10-18T09:00:00.000Z', '2026-10-18T09:00:00.000Z'
),

-- Home Accents (4)
(
    'demo-prod-accent-01', 'SWY-DEMO-109', 'Intricate Brass Lord Krishna Playing Flute', 'intricate-brass-lord-krishna-playing-flute',
    'Sublimely sculpted solid brass Krishna figurine in tribhanga posture holding the divine bansuri, adorned with an ornate peacock feather crown and traditional jewellery. Sample entry for catalogue preview.',
    'cat-home-accents', '["/assets/products/demo-accent-krishna-flute-800.webp","/assets/products/demo-accent-krishna-flute-800.jpg"]',
    'Solid Bell-Metal Brass', 'Height: 12", Weight: 2.8 kg', 0, '[]', 8900, 1, 'Sample preview',
    'Certified heavy brass casting with fine hand-chiselled details', 'published', 1, '2026-10-18T09:00:00.000Z', '2026-10-18T09:00:00.000Z'
),
(
    'demo-prod-accent-02', 'SWY-DEMO-110', 'Hand-Sculpted Bronze Ganesha on Stone Pedestal', 'hand-sculpted-bronze-ganesha-on-stone-pedestal',
    'Auspicious Lord Ganesha seated in meditation, hand-cast in rich bronze patina with fine four-armed iconography and serene facial countenance. Sample entry for catalogue preview.',
    'cat-home-accents', '["/assets/products/demo-accent-ganesha-statue-800.webp","/assets/products/demo-accent-ganesha-statue-800.jpg"]',
    'Lost-Wax Cast Bronze', 'Height: 10", Weight: 3.2 kg', 0, '[]', 9800, 1, 'Sample preview',
    'Pooja sanctified and cushioned felt bottom', 'published', 1, '2026-10-18T09:00:00.000Z', '2026-10-18T09:00:00.000Z'
),
(
    'demo-prod-accent-03', 'SWY-DEMO-111', 'Regal Auspicious Brass Ganesha Figurine', 'regal-auspicious-brass-ganesha-figurine',
    'Classic domestic Ganapati with modak and abhaya mudra, sculpted with flowing robes and a decorated circular halo. Sample entry for catalogue preview.',
    'cat-home-accents', '["/assets/products/demo-accent-ganesh-idol-800.webp","/assets/products/demo-accent-ganesh-idol-800.jpg"]',
    'Solid Brass with Golden Patina', 'Height: 8", Weight: 1.9 kg', 0, '[]', 5400, 1, 'Sample preview',
    'Perfect for housewarming and desk installations', 'published', 1, '2026-10-18T09:00:00.000Z', '2026-10-18T09:00:00.000Z'
),
(
    'demo-prod-accent-04', 'SWY-DEMO-112', 'Sacred Brass Temple Bell with Ceremonial Finial', 'sacred-brass-temple-bell-with-ceremonial-finial',
    'A resonant bell-metal ghanti featuring a sculpted deity handle and heavy brass clapper that produces a pure, lingering acoustic vibration. Sample entry for catalogue preview.',
    'cat-home-accents', '["/assets/products/demo-accent-ceremonial-bell-800.webp","/assets/products/demo-accent-ceremonial-bell-800.jpg"]',
    'Resonant Bell Metal (Kansa Alloy)', 'Height: 7.5", Dia: 3.5"', 0, '[]', 2750, 1, 'Sample preview',
    'Tested for clear sustain and acoustic purity', 'published', 1, '2026-10-18T09:00:00.000Z', '2026-10-18T09:00:00.000Z'
),

-- Festive Décor (4)
(
    'demo-prod-decor-01', 'SWY-DEMO-113', 'Traditional Brass Uruli with Floating Candles & Petals', 'traditional-brass-uruli-with-floating-candles-and-petals',
    'A signature shallow circular vessel with broad flared rim and twin side handles, intended for floating fresh marigold petals and glowing tea lights at foyer entrances. Sample entry for catalogue preview.',
    'cat-festive-decor', '["/assets/products/demo-decor-floral-uruli-800.webp","/assets/products/demo-decor-floral-uruli-800.jpg"]',
    'Hand-Hammered Heavy Gauge Brass', 'Dia: 14", Depth: 4"', 0, '[]', 6200, 1, 'Sample preview',
    'Hand-beaten textured rim with leak-proof seamless construction', 'published', 1, '2026-10-18T09:00:00.000Z', '2026-10-18T09:00:00.000Z'
),
(
    'demo-prod-decor-02', 'SWY-DEMO-114', 'Ceremonial Brass Pooja Display with Marigolds', 'ceremonial-brass-pooja-display-with-marigolds',
    'An opulent ritual thali ensemble including incense stand, camphor aarti holder, and flower bowls, designed for major festivals and auspicious occasions. Sample entry for catalogue preview.',
    'cat-festive-decor', '["/assets/products/demo-decor-pooja-arrangement-800.webp","/assets/products/demo-decor-pooja-arrangement-800.jpg"]',
    'Solid Brass with Floral Etching', 'Thali Dia: 12", 5 Piece Set', 0, '[]', 5800, 1, 'Sample preview',
    'Complete ceremonial set presented in silk-lined gift box', 'published', 1, '2026-10-18T09:00:00.000Z', '2026-10-18T09:00:00.000Z'
),
(
    'demo-prod-decor-03', 'SWY-DEMO-115', 'Multi-Tier Brass Lamp Stand with Festive Garlands', 'multi-tier-brass-lamp-stand-with-festive-garlands',
    'Grand tiered candelabra lamp stand with multiple candle/oil cups, designed for festival banquets, Diwali soirées, and grand entrance illumination. Sample entry for catalogue preview.',
    'cat-festive-decor', '["/assets/products/demo-decor-brass-stand-800.webp","/assets/products/demo-decor-brass-stand-800.jpg"]',
    'Cast Brass & Antique Polish', 'Height: 18", Width: 12"', 0, '[]', 8400, 1, 'Sample preview',
    'Disassembles into 3 sections for compact storage', 'published', 1, '2026-10-18T09:00:00.000Z', '2026-10-18T09:00:00.000Z'
),
(
    'demo-prod-decor-04', 'SWY-DEMO-116', 'Handcrafted Brass Diya with Fresh Blossom Petals', 'handcrafted-brass-diya-with-fresh-blossom-petals',
    'Graceful table diya surrounded by an integrated petal saucer that catches wick drips while presenting decorative flowers beautifully. Sample entry for catalogue preview.',
    'cat-festive-decor', '["/assets/products/demo-decor-marigold-diya-800.webp","/assets/products/demo-decor-marigold-diya-800.jpg"]',
    'Spun Heavy Brass', 'Dia: 6.5", Height: 3.5"', 0, '[]', 1950, 1, 'Sample preview',
    'Easy clean finish with heat-insulated base', 'published', 1, '2026-10-18T09:00:00.000Z', '2026-10-18T09:00:00.000Z'
),

-- Gift Sets (4)
(
    'demo-prod-gift-01', 'SWY-DEMO-117', 'Shubh Aarambh Handcrafted Ritual Gift Hamper', 'shubh-aarambh-handcrafted-ritual-gift-hamper',
    'A thoughtfully curated auspicious welcome hamper comprising an artisanal brass diya, fragrant dhoop cones, decorative marigold toran accents, and sacred Gangajal vessel. Sample entry for catalogue preview.',
    'cat-gift-sets', '["/assets/products/demo-gift-traditional-hamper-800.webp","/assets/products/demo-gift-traditional-hamper-800.jpg"]',
    'Solid Brass & Woven Natural Cane Chest', 'Box: 14" x 10" x 5"', 0, '[]', 4950, 1, 'Sample preview',
    'Personalized calligraphy greeting card included', 'published', 1, '2026-10-18T09:00:00.000Z', '2026-10-18T09:00:00.000Z'
),
(
    'demo-prod-gift-02', 'SWY-DEMO-118', 'Utsav Celebratory Brass & Sweets Presentation Box', 'utsav-celebratory-brass-and-sweets-presentation-box',
    'Deluxe rigid keepsake gifting box with gold-foil SWAYARI emblem, featuring a pair of solid brass diyas and compartments for artisanal festive confections. Sample entry for catalogue preview.',
    'cat-gift-sets', '["/assets/products/demo-gift-sweets-presentation-800.webp","/assets/products/demo-gift-sweets-presentation-800.jpg"]',
    'Textured Maroon Board with Gold Stamping & Brass', 'Box: 12" x 12" x 4"', 0, '[]', 4200, 1, 'Sample preview',
    'Bulk corporate and wedding monogramming available', 'published', 1, '2026-10-18T09:00:00.000Z', '2026-10-18T09:00:00.000Z'
),
(
    'demo-prod-gift-03', 'SWY-DEMO-119', 'Royal Heritage Gift Chest with Floral Adornment', 'royal-heritage-gift-chest-with-floral-adornment',
    'Handmade artisanal presentation box tied with rich satin ribbon and dried botanical blossoms, holding a signature brass home accent and temple bell. Sample entry for catalogue preview.',
    'cat-gift-sets', '["/assets/products/demo-gift-luxury-botanical-800.webp","/assets/products/demo-gift-luxury-botanical-800.jpg"]',
    'Artisanal Handmade Paper & Solid Brass', 'Box: 10" x 8" x 4.5"', 0, '[]', 3600, 1, 'Sample preview',
    'Ideal for bridesmaids, dignitaries, and Diwali greetings', 'published', 1, '2026-10-18T09:00:00.000Z', '2026-10-18T09:00:00.000Z'
),
(
    'demo-prod-gift-04', 'SWY-DEMO-120', 'Twin Auspicious Brass Diya & Dhoop Gift Hamper', 'twin-auspicious-brass-diya-and-dhoop-gift-hamper',
    'Matching set of two handcrafted brass table deepams accompanied by an engraved dhoop burner and natural sandalwood incense cones. Sample entry for catalogue preview.',
    'cat-gift-sets', '["/assets/products/demo-gift-festive-twin-diya-800.webp","/assets/products/demo-gift-festive-twin-diya-800.jpg"]',
    'Heirloom Bell-Metal Brass & Velvet Box', 'Hamper Box: 11" x 7" x 4"', 0, '[]', 3200, 1, 'Sample preview',
    'Custom gold-embossed ribbon branding on orders above 25 units', 'published', 1, '2026-10-18T09:00:00.000Z', '2026-10-18T09:00:00.000Z'
)
ON CONFLICT(id) DO UPDATE SET
  name = excluded.name,
  slug = excluded.slug,
  description = excluded.description,
  category_id = excluded.category_id,
  images = excluded.images,
  material = excluded.material,
  dimensions = excluded.dimensions,
  indicative_price = excluded.indicative_price,
  availability_label = excluded.availability_label,
  customisation_info = excluded.customisation_info,
  status = excluded.status,
  is_demo = excluded.is_demo,
  updated_at = excluded.updated_at;
