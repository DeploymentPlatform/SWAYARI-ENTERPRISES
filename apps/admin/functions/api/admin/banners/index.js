import { jsonResponse, errorResponse, requireAdminAuth, generateCryptoId, logAudit } from '../../../_utils.js';

export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    await requireAdminAuth(request, env);
  } catch (authRes) {
    return authRes;
  }

  try {
    const { results } = await env.DB.prepare(`
      SELECT * FROM campaign_banners
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
    return errorResponse(`Failed to load campaign banners: ${err.message}`, 500);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let session;
  try {
    session = await requireAdminAuth(request, env);
  } catch (authRes) {
    return authRes;
  }

  try {
    const body = await request.json();
    const {
      badge,
      headline,
      emphasis,
      supporting,
      ctaText,
      ctaHref,
      desktopImage,
      mobileImage,
      alt,
      displayOrder = 0,
      isActive = true
    } = body;

    if (!headline || !ctaText || !ctaHref || !desktopImage || !mobileImage) {
      return errorResponse('Headline, CTA text, CTA destination, desktop image, and mobile image are required', 400);
    }

    // Links and images must stay on this site: no javascript:, no outside redirects.
    const isInternalPath = v => typeof v === 'string' && /^\/(?![\/\\])[^\s<>"']*$/.test(v) && v.length <= 300;
    const isSiteImage = v => typeof v === 'string' && /^\/assets\/[a-zA-Z0-9/_.-]+\.(webp|jpe?g|png|avif)$/.test(v);
    if (!isInternalPath(ctaHref)) {
      return errorResponse('Button link must be a page on this site, for example /shop', 400);
    }
    if (!isSiteImage(desktopImage) || !isSiteImage(mobileImage)) {
      return errorResponse('Banner images must be images from this site (/assets/...)', 400);
    }

    const bannerId = `banner-${generateCryptoId(8)}`;
    const now = new Date().toISOString();

    await env.DB.prepare(`
      INSERT INTO campaign_banners (
        id, badge, headline, emphasis, supporting, cta_text, cta_href,
        desktop_image, mobile_image, alt, display_order, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      bannerId,
      badge || null,
      headline,
      emphasis || null,
      supporting || null,
      ctaText,
      ctaHref,
      desktopImage,
      mobileImage,
      alt || headline,
      Number(displayOrder) || 0,
      isActive ? 1 : 0,
      now,
      now
    ).run();

    await logAudit(env, 'campaign_banner', bannerId, 'admin_create_banner', session.user.email, { headline, ctaHref });

    return jsonResponse({
      success: true,
      bannerId
    }, 201);
  } catch (err) {
    return errorResponse(`Failed to create campaign banner: ${err.message}`, 500);
  }
}
