import { jsonResponse, errorResponse, requireAdminAuth, logAudit } from '../../../_utils.js';

export async function onRequestPut(context) {
  const { request, env, params } = context;
  const bannerId = params.id;

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
      displayOrder,
      isActive
    } = body;

    // Links and images must stay on this site: no javascript:, no outside redirects.
    const isInternalPath = v => typeof v === 'string' && /^\/(?![\/\\])[^\s<>"']*$/.test(v) && v.length <= 300;
    const isSiteImage = v => typeof v === 'string' && /^\/assets\/[a-zA-Z0-9/_.-]+\.(webp|jpe?g|png|avif)$/.test(v);
    if (ctaHref !== undefined && !isInternalPath(ctaHref)) {
      return errorResponse('Button link must be a page on this site, for example /shop', 400);
    }
    if ((desktopImage !== undefined && !isSiteImage(desktopImage)) || (mobileImage !== undefined && !isSiteImage(mobileImage))) {
      return errorResponse('Banner images must be images from this site (/assets/...)', 400);
    }

    const existing = await env.DB.prepare('SELECT * FROM campaign_banners WHERE id = ?').bind(bannerId).first();
    if (!existing) {
      return errorResponse('Campaign banner not found', 404);
    }

    const now = new Date().toISOString();

    await env.DB.prepare(`
      UPDATE campaign_banners
      SET badge = ?,
          headline = ?,
          emphasis = ?,
          supporting = ?,
          cta_text = ?,
          cta_href = ?,
          desktop_image = ?,
          mobile_image = ?,
          alt = ?,
          display_order = ?,
          is_active = ?,
          updated_at = ?
      WHERE id = ?
    `).bind(
      badge !== undefined ? badge : existing.badge,
      headline !== undefined ? headline : existing.headline,
      emphasis !== undefined ? emphasis : existing.emphasis,
      supporting !== undefined ? supporting : existing.supporting,
      ctaText !== undefined ? ctaText : existing.cta_text,
      ctaHref !== undefined ? ctaHref : existing.cta_href,
      desktopImage !== undefined ? desktopImage : existing.desktop_image,
      mobileImage !== undefined ? mobileImage : existing.mobile_image,
      alt !== undefined ? alt : existing.alt,
      displayOrder !== undefined ? Number(displayOrder) : existing.display_order,
      isActive !== undefined ? (isActive ? 1 : 0) : existing.is_active,
      now,
      bannerId
    ).run();

    await logAudit(env, 'campaign_banner', bannerId, 'admin_update_banner', session.user.email, { headline, isActive });

    return jsonResponse({
      success: true,
      message: 'Campaign banner updated successfully'
    });
  } catch (err) {
    return errorResponse(`Failed to update campaign banner: ${err.message}`, 500);
  }
}

export async function onRequestDelete(context) {
  const { request, env, params } = context;
  const bannerId = params.id;

  let session;
  try {
    session = await requireAdminAuth(request, env);
  } catch (authRes) {
    return authRes;
  }

  try {
    const existing = await env.DB.prepare('SELECT * FROM campaign_banners WHERE id = ?').bind(bannerId).first();
    if (!existing) {
      return errorResponse('Campaign banner not found', 404);
    }

    await env.DB.prepare('DELETE FROM campaign_banners WHERE id = ?').bind(bannerId).run();

    await logAudit(env, 'campaign_banner', bannerId, 'admin_delete_banner', session.user.email);

    return jsonResponse({
      success: true,
      message: 'Campaign banner deleted successfully'
    });
  } catch (err) {
    return errorResponse(`Failed to delete campaign banner: ${err.message}`, 500);
  }
}
