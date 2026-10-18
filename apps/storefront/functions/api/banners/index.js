import { jsonResponse, errorResponse } from '../../_utils.js';

export async function onRequestGet(context) {
  const { env } = context;

  try {
    const { results } = await env.DB.prepare(`
      SELECT id, badge, headline, emphasis, supporting, cta_text, cta_href,
             desktop_image, mobile_image, alt, display_order, is_active,
             created_at, updated_at
      FROM campaign_banners
      WHERE is_active = 1
      ORDER BY display_order ASC, created_at ASC
    `).all();

    const banners = (results || []).map(row => ({
      id: row.id,
      badge: row.badge,
      headline: row.headline,
      emphasis: row.emphasis,
      supporting: row.supporting,
      ctaText: row.cta_text,
      ctaHref: row.cta_href,
      desktopImage: row.desktop_image,
      mobileImage: row.mobile_image,
      alt: row.alt,
      displayOrder: row.display_order,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    return jsonResponse({
      success: true,
      banners
    });
  } catch (err) {
    return errorResponse(`Failed to fetch campaign banners: ${err.message}`, 500);
  }
}
