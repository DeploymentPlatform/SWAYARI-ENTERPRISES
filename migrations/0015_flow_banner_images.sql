-- SWAYARI ENTERPRISES D1 Migration 0015: Google Flow studio banners for the kit catalogue
-- The old hero photos showed the retired ₹149 frames; these show the kit products.

UPDATE campaign_banners SET
    desktop_image = '/assets/editorial/hero-signature-desktop.webp',
    mobile_image = '/assets/editorial/hero-signature-mobile.webp',
    alt = 'A stotram book in a gold box, a framed Ganesh and a Ganesh stand in silver foil on maroon silk with a brass diya',
    updated_at = '2026-11-04T09:00:00.000Z'
WHERE id = 'banner-devotional-99';

UPDATE campaign_banners SET
    desktop_image = '/assets/editorial/hero-wedding-desktop.webp',
    mobile_image = '/assets/editorial/hero-wedding-mobile.webp',
    alt = 'God stands and stotram cards in red envelopes among marigolds, jasmine and brass lamps',
    updated_at = '2026-11-04T09:00:00.000Z'
WHERE id = 'banner-wedding-guest';

UPDATE campaign_banners SET
    desktop_image = '/assets/editorial/hero-corporate-desktop.webp',
    mobile_image = '/assets/editorial/hero-corporate-mobile.webp',
    alt = 'Maroon velvet gift boxes tied with a cream satin ribbon',
    updated_at = '2026-11-04T09:00:00.000Z'
WHERE id = 'banner-bulk-process';
