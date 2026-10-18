import { requireAdmin, jsonResponse, errorResponse } from '../../_utils.js';

export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    await requireAdmin(request, env);

    // Fetch the deployed static asset manifest
    const manifestUrl = new URL('/assets/manifest.json', request.url);
    const manifestRes = await env.ASSETS ? env.ASSETS.fetch(manifestUrl) : await fetch(manifestUrl.toString());

    if (!manifestRes.ok) {
      return errorResponse('Asset manifest not found or not yet generated', 404);
    }

    const manifestData = await manifestRes.json();
    return jsonResponse({
      success: true,
      manifest: manifestData
    });
  } catch (err) {
    if (err instanceof Response) return err;
    return errorResponse(`Failed to load asset gallery: ${err.message}`, 500);
  }
}
