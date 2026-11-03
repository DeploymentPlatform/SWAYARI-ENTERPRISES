-- SWAYARI ENTERPRISES D1 Migration 0014: hero banners for the kit catalogue
-- Replaces the "₹149 each / minimum 25 frames" banner copy with the new collection story.
-- Only the three live banners change; owner edits made later in the admin portal win (updated_at moves on).

UPDATE campaign_banners SET
    badge = 'Silver foil god frames',
    headline = 'Blessings, beautifully',
    emphasis = 'framed.',
    supporting = 'Balaji, Lakshmi, Ganesh, Sai Baba and more in carved frames — from ₹329, bulk prices from ₹249.',
    cta_text = 'Shop god frames',
    cta_href = '/shop?category=god-frames',
    updated_at = '2026-11-04T06:00:00.000Z'
WHERE id = 'banner-devotional-99';

UPDATE campaign_banners SET
    badge = 'Wedding return gifts',
    headline = 'A blessing in every',
    emphasis = 'guest''s hands.',
    supporting = 'Silver foil stotram cards from ₹39 and god stands from ₹49 in bulk. Mix designs to reach a slab.',
    cta_text = 'Shop return gifts',
    cta_href = '/shop?occasion=wedding-return-gifts',
    updated_at = '2026-11-04T06:00:00.000Z'
WHERE id = 'banner-wedding-guest';

UPDATE campaign_banners SET
    badge = 'Order from 1 piece',
    headline = 'Fill your cart.',
    emphasis = 'We confirm the rest.',
    supporting = 'Send your cart as a request — no payment online. We call to confirm stock, packing and delivery at actual cost.',
    cta_text = 'How ordering works',
    cta_href = '/ordering-policy',
    updated_at = '2026-11-04T06:00:00.000Z'
WHERE id = 'banner-bulk-process';
