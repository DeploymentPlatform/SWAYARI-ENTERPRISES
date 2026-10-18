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

    await logAudit(env, {
      userId: session.userId,
      action: 'update_banner',
      resourceType: 'campaign_banner',
      resourceId: bannerId,
      details: { headline, isActive }
    });

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

    await logAudit(env, {
      userId: session.userId,
      action: 'delete_banner',
      resourceType: 'campaign_banner',
      resourceId: bannerId
    });

    return jsonResponse({
      success: true,
      message: 'Campaign banner deleted successfully'
    });
  } catch (err) {
    return errorResponse(`Failed to delete campaign banner: ${err.message}`, 500);
  }
}
