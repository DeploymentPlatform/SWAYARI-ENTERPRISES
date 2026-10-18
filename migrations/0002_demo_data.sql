-- SWAYARI ENTERPRISES D1 Migration 0002: Optional Seed Demo Preview Data
-- All sample items are strictly marked with is_demo = 1
-- Real production storefront filters out is_demo = 1 or unconfirmed items

-- Sample Categories (marked for preview)
INSERT OR IGNORE INTO categories (id, name, slug, description, display_order, is_active, created_at)
VALUES 
('cat-silver-art', 'Silver Plated Art', 'silver-plated-art', 'Handcrafted silver-embossed framed devotional art and mementos', 1, 1, '2026-10-18T12:00:00.000Z'),
('cat-brass-decor', 'Brass Décor', 'brass-decor', 'Timeless artisanal brass lamps, urulis, and heirloom centerpieces', 2, 1, '2026-10-18T12:00:00.000Z'),
('cat-corporate-gifting', 'Corporate & Festive Gifting', 'corporate-festive-gifting', 'Curated luxury gifting sets for weddings, celebrations, and corporate milestones', 3, 1, '2026-10-18T12:00:00.000Z');

-- Sample Demo Product (Based on provided Radha Krishna framed plaque photo)
-- Note: Clearly labeled as Sample Preview Product with unconfirmed dimensions/material pending owner confirmation.
INSERT OR IGNORE INTO products (
    id,
    sku,
    name,
    slug,
    description,
    category_id,
    images,
    material,
    dimensions,
    has_variants,
    variants_json,
    indicative_price,
    min_quantity,
    availability_label,
    customisation_info,
    status,
    is_demo,
    created_at,
    updated_at
) VALUES (
    'demo-prod-radha-krishna-frame',
    'SWY-DEMO-001',
    'Radha Krishna Embossed Frame (Sample Preview)',
    'radha-krishna-embossed-frame-sample',
    'Sample catalogue preview entry: Handcrafted relief plaque depicting Radha Krishna with intricate floral borders. Frame details, silver-foil finish, and packaging subject to official catalogue confirmation.',
    'cat-silver-art',
    '["/assets/demo/sample_product_1.jpeg"]',
    'Embossed Relief Plaque in Ornate Synthetic Wooden Frame (Details To Be Confirmed)',
    'Dimensions to be confirmed upon final catalogue release',
    1,
    '[{"id":"standard","name":"Standard Frame","indicative_price":null},{"id":"premium-gift-box","name":"Standard Frame with Velvet Gift Box","indicative_price":null}]',
    NULL, -- Null indicates Price on Request
    1,
    'Sample Preview Only',
    'Custom name plaque engraving and festive gift wraps available for bulk orders upon consultation.',
    'published', -- Published with is_demo = 1 so it only appears when preview demo mode is enabled
    1,
    '2026-10-18T12:00:00.000Z',
    '2026-10-18T12:00:00.000Z'
);
