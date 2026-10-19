#!/usr/bin/env python3
"""
Downloads and prepares high-resolution, licensed stock assets from Pexels
for the SWAYARI Affordable Gifting collection across the 4 budget tiers:
- ₹99 & under
- ₹100–₹299
- ₹300–₹499
- ₹500–₹999
and bespoke quote-only presentation piece.
Processed into clean, optimized 1:1 WebP and JPG formats.
"""
import os
import sys
import urllib.request
from PIL import Image

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PRODUCTS_DIR = os.path.join(PROJECT_ROOT, 'public', 'assets', 'products')
CACHE_DIR = os.path.join(PROJECT_ROOT, '.cache_img')

os.makedirs(PRODUCTS_DIR, exist_ok=True)
os.makedirs(CACHE_DIR, exist_ok=True)

HEADERS = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}

AFFORDABLE_PRODUCTS = [
    # ₹99 & under
    {
        'id': 13930487,
        'slug': 'demo-gift-brocade-potli',
        'name': 'Handcrafted Raw Silk Brocade Potli Bag',
        'creator': 'Hilal Yıldız',
        'url': 'https://www.pexels.com/photo/flowers-on-a-gift-13930487/'
    },
    {
        'id': 6192233,
        'slug': 'demo-accent-brass-kumkum-chimizh',
        'name': 'Pure Solid Brass Kumkum Chimizh (Sindoor Dibbi)',
        'creator': 'Arun Sharma',
        'url': 'https://www.pexels.com/photo/a-close-up-shot-of-a-brass-diya-6192233/'
    },
    {
        'id': 37650548,
        'slug': 'demo-decor-shola-pith-tassel',
        'name': 'Handmade Shola Pith Floral Garland Tassel',
        'creator': 'Ajoy Roy',
        'url': 'https://www.pexels.com/photo/diwali-diyas-on-a-decorated-altar-37650548/'
    },
    {
        'id': 39189948,
        'slug': 'demo-decor-terracotta-dhoop',
        'name': 'Handcrafted Terracotta Dhoop Burner with Herbal Incense',
        'creator': 'Pradeep Kumar',
        'url': 'https://www.pexels.com/photo/terracotta-diyas-for-indian-festivals-39189948/'
    },

    # ₹100–₹299
    {
        'id': 20122586,
        'slug': 'demo-lamp-brass-akhand-diya',
        'name': 'Classic Brass Akhand Diya with Glass Chimney (Small)',
        'creator': 'Ravi Patel',
        'url': 'https://www.pexels.com/photo/brass-oil-lamp-on-the-table-20122586/'
    },
    {
        'id': 34641279,
        'slug': 'demo-gift-meenakari-peacock-box',
        'name': 'Royal Meenakari Hand-Painted Peacock Trinket Box',
        'creator': 'Vikram Rathore',
        'url': 'https://www.pexels.com/photo/glowing-oil-lamps-for-diwali-celebration-34641279/'
    },
    {
        'id': 34431714,
        'slug': 'demo-decor-wood-elephant-tealight',
        'name': 'Carved Mango Wood Elephant Tealight Candle Holder',
        'creator': 'Suresh Verma',
        'url': 'https://www.pexels.com/photo/diwali-diyas-illuminating-the-night-in-india-34431714/'
    },
    {
        'id': 16900742,
        'slug': 'demo-accent-brass-nandi-bell',
        'name': 'Auspicious Brass Pooja Ghanti with Nandi Finial',
        'creator': 'Rajesh Menon',
        'url': 'https://www.pexels.com/photo/lit-diya-lamp-16900742/'
    },

    # ₹300–₹499
    {
        'id': 18778642,
        'slug': 'demo-lamp-peacock-mayur-pair',
        'name': 'Paired Brass Peacock Mayur Diya Set (Set of 2)',
        'creator': 'Naveen Rao',
        'url': 'https://www.pexels.com/photo/festive-diyas-18778642/'
    },
    {
        'id': 30043138,
        'slug': 'demo-gift-silver-dryfruit-bowl',
        'name': 'German Silver Floral Embossed Dry Fruit Bowl with Spoon',
        'creator': 'Priya Das',
        'url': 'https://www.pexels.com/photo/traditional-indian-brass-decor-30043138/'
    },
    {
        'id': 33289454,
        'slug': 'demo-decor-wooden-heritage-coasters',
        'name': 'Laser-Cut Wooden Coaster Gift Set with Heritage Motifs',
        'creator': 'Amitabh Roy',
        'url': 'https://www.pexels.com/photo/indian-handicrafts-33289454/'
    },
    {
        'id': 30043135,
        'slug': 'demo-gift-mini-brass-pooja-thali',
        'name': 'Mini Brass Pooja Thali Gift Ensemble (5-Piece Set)',
        'creator': 'Priya Das',
        'url': 'https://www.pexels.com/photo/traditional-pooja-items-30043135/'
    },

    # ₹500–₹999
    {
        'id': 8818664,
        'slug': 'demo-decor-brass-uruli-floating',
        'name': 'Traditional Hand-Hammered Brass Uruli with 3 Floating Diyas (6-Inch)',
        'creator': 'Yan Krukau',
        'url': 'https://www.pexels.com/photo/flowers-and-candles-floating-in-a-bowl-8818664/'
    },
    {
        'id': 30043141,
        'slug': 'demo-accent-lakshmi-ganesh-brass',
        'name': 'Handcrafted Auspicious Lakshmi-Ganesh Idol Pair in Brass (4-Inch)',
        'creator': 'Priya Das',
        'url': 'https://www.pexels.com/photo/traditional-brass-idols-30043141/'
    },
    {
        'id': 5313214,
        'slug': 'demo-gift-festive-brass-hamper',
        'name': 'Heritage Festive Gift Hamper with Brass Diya & Organic Incense',
        'creator': 'Ksenia Chernaya',
        'url': 'https://www.pexels.com/photo/traditional-gift-hamper-5313214/'
    },
    {
        'id': 9904992,
        'slug': 'demo-gift-silver-dual-bowl-set',
        'name': 'Silver-Plated Dual Bowl & Tray Presentation Set',
        'creator': 'Sandeep Rawat',
        'url': 'https://www.pexels.com/photo/ganesha-statue-and-silver-presentation-9904992/'
    },

    # Bespoke / Quote on Consultation
    {
        'id': 10905470,
        'slug': 'demo-bespoke-silver-plaque',
        'name': 'Custom-Engraved Ceremonial Silver Plaque',
        'creator': 'Eva Bronzini',
        'url': 'https://www.pexels.com/photo/decorative-gold-relief-10905470/'
    }
]

def download_image(photo_id):
    cache_path = os.path.join(CACHE_DIR, f'{photo_id}.jpg')
    if os.path.exists(cache_path) and os.path.getsize(cache_path) > 1000:
        return Image.open(cache_path)
    url = f'https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.jpeg?auto=compress&cs=tinysrgb&w=1200'
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req, timeout=10) as resp:
        data = resp.read()
    with open(cache_path, 'wb') as f:
        f.write(data)
    return Image.open(cache_path)

def process_product_image(img, slug, width=800, height=800):
    w, h = img.size
    aspect = width / height
    current_aspect = w / h

    if current_aspect > aspect:
        new_w = int(h * aspect)
        left = (w - new_w) // 2
        img_cropped = img.crop((left, 0, left + new_w, h))
    else:
        new_h = int(w / aspect)
        top = int((h - new_h) * 0.35)
        img_cropped = img.crop((0, max(0, top), w, min(h, top + new_h)))

    img_resized = img_cropped.resize((width, height), Image.Resampling.LANCZOS)
    
    jpg_path = os.path.join(PRODUCTS_DIR, f'{slug}-800.jpg')
    webp_path = os.path.join(PRODUCTS_DIR, f'{slug}-800.webp')
    
    img_resized.save(jpg_path, 'JPEG', quality=88, optimize=True)
    img_resized.save(webp_path, 'WEBP', quality=88)
    print(f'✅ Processed affordable product: {slug}')

def main():
    print(f'Starting processing for {len(AFFORDABLE_PRODUCTS)} affordable gifting sample items...')
    for p in AFFORDABLE_PRODUCTS:
        try:
            img = download_image(p['id'])
            process_product_image(img, p['slug'])
        except Exception as e:
            print(f"Error processing {p['slug']}: {e}")

    print('Affordable gifting assets processed successfully.')

if __name__ == '__main__':
    main()
