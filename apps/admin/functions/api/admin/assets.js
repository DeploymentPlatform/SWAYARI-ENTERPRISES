import { jsonResponse, errorResponse, requireAdminAuth } from '../../_utils.js';

export async function onRequestGet(context) {
  const { request, env } = context;

  try {
    await requireAdminAuth(request, env);
  } catch (authRes) {
    return authRes;
  }

  // Deployed standard assets catalog
  const defaultAssets = [
    {
      path: '/assets/demo/sample_product_1.jpeg',
      name: 'Radha Krishna Embossed Frame (Sample)',
      category: 'demo',
      type: 'image/jpeg'
    },
    {
      path: '/assets/demo/sample_product_2.jpeg',
      name: 'Mayur Brass Diya Uruli (Sample)',
      category: 'demo',
      type: 'image/jpeg'
    },
    {
      path: '/assets/demo/sample_product_3.jpeg',
      name: 'Ganesha Sanctum Idol (Sample)',
      category: 'demo',
      type: 'image/jpeg'
    },
    {
      path: '/assets/demo/sample_product_4.jpeg',
      name: 'Ornate Bell Metal Lamp (Sample)',
      category: 'demo',
      type: 'image/jpeg'
    },
    {
      path: '/assets/brand/swayari_brand_card.jpeg',
      name: 'SWAYARI Brand Heritage Card',
      category: 'brand',
      type: 'image/jpeg'
    },
    {
      path: '/assets/brand/swayari-logo.svg',
      name: 'SWAYARI Official Crest Logo',
      category: 'brand',
      type: 'image/svg+xml'
    }
  ];

  return jsonResponse({
    success: true,
    assets: defaultAssets
  });
}
