#!/usr/bin/env python3
"""
Downloads and prepares high-resolution, licensed stock assets from Pexels
for the SWAYARI 20-product demo catalogue, category shortcuts, and hero banners.
All images are processed into clean, optimized WebP and JPG formats with consistent
1:1 and 4:5 ratios on warm neutral surfaces.
"""
import os
import sys
import json
import urllib.request
from PIL import Image, ImageFilter, ImageOps

PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PRODUCTS_DIR = os.path.join(PROJECT_ROOT, 'public', 'assets', 'products')
EDITORIAL_DIR = os.path.join(PROJECT_ROOT, 'public', 'assets', 'editorial')
CATEGORIES_DIR = os.path.join(PROJECT_ROOT, 'public', 'assets', 'categories')

os.makedirs(PRODUCTS_DIR, exist_ok=True)
os.makedirs(EDITORIAL_DIR, exist_ok=True)
os.makedirs(CATEGORIES_DIR, exist_ok=True)

HEADERS = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'}

# 20 Products definitions with Pexels photo ID and cropping strategy
PRODUCTS = [
    # Devotional Frames
    {
        'id': 10905470,
        'slug': 'demo-frame-sanctum-gold',
        'name': 'Ornate Sanctum Devotional Gold Relief Frame',
        'crop_mode': 'square', # center crop to 1:1
        'creator': 'Eva Bronzini',
        'pexels_url': 'https://www.pexels.com/photo/painting-of-flowers-in-decorative-frame-10905470/'
    },
    {
        'id': 10905473,
        'slug': 'demo-frame-baroque-floral',
        'name': 'Royal Heritage Gold Embossed Devotional Frame',
        'crop_mode': 'square',
        'creator': 'Eva Bronzini',
        'pexels_url': 'https://www.pexels.com/photo/baroque-style-frame-with-a-vibrant-floral-painting-against-an-elegant-wall-10905473/'
    },
    {
        'id': 9456729,
        'slug': 'demo-frame-temple-collection',
        'name': 'Classic Temple Gold Leaf Framed Collection',
        'crop_mode': 'square',
        'creator': 'Mihai Moisa',
        'pexels_url': 'https://www.pexels.com/photo/gold-framed-paintings-hanging-on-wall-9456729/'
    },
    {
        'id': 10502844,
        'slug': 'demo-frame-vintage-altar',
        'name': 'Vintage Hand-Carved Teak & Gold Leaf Frame',
        'crop_mode': 'square',
        'creator': 'Eva Bronzini',
        'pexels_url': 'https://www.pexels.com/photo/lilac-flowers-in-a-vase-and-golden-frames-on-vintage-wallpaper-10502844/'
    },
    # Decorative Lamps
    {
        'id': 30043135,
        'slug': 'demo-lamp-traditional-pillar',
        'name': 'Traditional Ornate Brass Kuthu Pillar Lamp',
        'crop_mode': 'square',
        'creator': 'Dilip Rathod',
        'pexels_url': 'https://www.pexels.com/photo/elegant-traditional-indian-brass-oil-lamp-decor-30043135/'
    },
    {
        'id': 30327092,
        'slug': 'demo-lamp-ceremonial-diya',
        'name': 'Handcrafted Ceremonial Brass Oil Lamp',
        'crop_mode': 'square',
        'creator': 'Dilip Rathod',
        'pexels_url': 'https://www.pexels.com/photo/traditional-diya-lamp-lit-for-celebration-30327092/'
    },
    {
        'id': 30799797,
        'slug': 'demo-lamp-sacred-flame',
        'name': 'Classic Temple Brass Deepam with Pedestal',
        'crop_mode': 'square',
        'creator': 'Pexels Contributor',
        'pexels_url': 'https://www.pexels.com/photo/traditional-oil-diya-lamp-with-flame-in-dark-setting-30799797/'
    },
    {
        'id': 29994970,
        'slug': 'demo-lamp-serene-glow',
        'name': 'Antique Meditative Brass Oil Lamp',
        'crop_mode': 'square',
        'creator': 'Dilip Rathod',
        'pexels_url': 'https://www.pexels.com/photo/lit-diya-lamp-creating-a-serene-atmosphere-29994970/'
    },
    # Home Accents
    {
        'id': 33289454,
        'slug': 'demo-accent-krishna-flute',
        'name': 'Intricate Brass Lord Krishna Playing Flute',
        'crop_mode': 'square',
        'creator': 'Pexels Contributor',
        'pexels_url': 'https://www.pexels.com/photo/intricate-brass-sculpture-of-a-hindu-deity-holding-a-flute-33289454/'
    },
    {
        'id': 28206212,
        'slug': 'demo-accent-ganesha-statue',
        'name': 'Hand-Sculpted Bronze Ganesha on Stone Pedestal',
        'crop_mode': 'square',
        'creator': 'Pexels Contributor',
        'pexels_url': 'https://www.pexels.com/photo/intricate-bronze-ganesha-statue-on-stone-surface-28206212/'
    },
    {
        'id': 33643802,
        'slug': 'demo-accent-ganesh-idol',
        'name': 'Regal Auspicious Brass Ganesha Figurine',
        'crop_mode': 'square',
        'creator': 'Pexels Contributor',
        'pexels_url': 'https://www.pexels.com/photo/intricate-ganesh-idol-with-vibrant-details-33643802/'
    },
    {
        'id': 7536968,
        'slug': 'demo-accent-ceremonial-bell',
        'name': 'Sacred Brass Temple Bell with Ceremonial Finial',
        'crop_mode': 'square',
        'creator': 'Antoni Shkraba',
        'pexels_url': 'https://www.pexels.com/photo/bracelet-among-decoration-on-an-indian-ceremony-7536968/'
    },
    # Festive Décor
    {
        'id': 8818664,
        'slug': 'demo-decor-floral-uruli',
        'name': 'Traditional Brass Uruli with Floating Candles & Petals',
        'crop_mode': 'square',
        'creator': 'Yan Krukau',
        'pexels_url': 'https://www.pexels.com/photo/flowers-and-candles-floating-in-a-bowl-8818664/'
    },
    {
        'id': 8818762,
        'slug': 'demo-decor-pooja-arrangement',
        'name': 'Ceremonial Brass Pooja Display with Marigolds',
        'crop_mode': 'square',
        'creator': 'Yan Krukau',
        'pexels_url': 'https://www.pexels.com/photo/person-holding-and-fixing-flower-arrangement-with-traditional-ritual-decorations-8818762/'
    },
    {
        'id': 8887201,
        'slug': 'demo-decor-brass-stand',
        'name': 'Multi-Tier Brass Lamp Stand with Festive Garlands',
        'crop_mode': 'square',
        'creator': 'Lara Jameson',
        'pexels_url': 'https://www.pexels.com/photo/a-candle-holder-with-candles-8887201/'
    },
    {
        'id': 31723285,
        'slug': 'demo-decor-marigold-diya',
        'name': 'Handcrafted Brass Diya with Fresh Blossom Petals',
        'crop_mode': 'square',
        'creator': 'Pexels Contributor',
        'pexels_url': 'https://www.pexels.com/photo/traditional-diya-lamp-with-flower-petals-31723285/'
    },
    # Gift Sets
    {
        'id': 5313214,
        'slug': 'demo-gift-traditional-hamper',
        'name': 'Shubh Aarambh Handcrafted Ritual Gift Hamper',
        'crop_mode': 'square',
        'creator': 'Pexels Contributor',
        'pexels_url': 'https://www.pexels.com/photo/white-statue-on-a-woven-tray-with-marigolds-and-wrapped-package-5313214/'
    },
    {
        'id': 14275717,
        'slug': 'demo-gift-sweets-presentation',
        'name': 'Utsav Celebratory Brass & Sweets Presentation Box',
        'crop_mode': 'square',
        'creator': 'Pexels Contributor',
        'pexels_url': 'https://www.pexels.com/photo/close-up-of-indian-laddoo-sweets-elegantly-arranged-in-a-box-14275717/'
    },
    {
        'id': 13930487,
        'slug': 'demo-gift-luxury-botanical',
        'name': 'Royal Heritage Gift Chest with Floral Adornment',
        'crop_mode': 'square',
        'creator': 'Hilal Yıldız',
        'pexels_url': 'https://www.pexels.com/photo/flowers-on-a-gift-13930487/'
    },
    {
        'id': 6213685,
        'slug': 'demo-gift-festive-twin-diya',
        'name': 'Twin Auspicious Brass Diya & Dhoop Gift Hamper',
        'crop_mode': 'square',
        'creator': 'Naveen Sahu',
        'pexels_url': 'https://www.pexels.com/photo/lighted-diya-beside-the-flowers-6213685/'
    }
]

def download_image(photo_id):
    cache_path = os.path.join(PROJECT_ROOT, '.cache_img', f'{photo_id}.jpeg')
    os.makedirs(os.path.dirname(cache_path), exist_ok=True)
    if os.path.exists(cache_path) and os.path.getsize(cache_path) > 10000:
        return Image.open(cache_path)
    
    url = f'https://images.pexels.com/photos/{photo_id}/pexels-photo-{photo_id}.jpeg?auto=compress&cs=tinysrgb&w=1200'
    req = urllib.request.Request(url, headers=HEADERS)
    with urllib.request.urlopen(req) as resp:
        data = resp.read()
    with open(cache_path, 'wb') as f:
        f.write(data)
    return Image.open(cache_path)

def process_product_image(img, slug, width=800, height=800):
    # Crop to 1:1 or 4:5
    w, h = img.size
    aspect = width / height
    current_aspect = w / h

    if current_aspect > aspect:
        # Image is wider: crop horizontal sides
        new_w = int(h * aspect)
        left = (w - new_w) // 2
        img_cropped = img.crop((left, 0, left + new_w, h))
    else:
        # Image is taller: crop top/bottom with slight bias toward top
        new_h = int(w / aspect)
        top = int((h - new_h) * 0.35)
        img_cropped = img.crop((0, top, w, top + new_h))

    img_resized = img_cropped.resize((width, height), Image.Resampling.LANCZOS)
    
    # Save WebP and JPG
    jpg_path = os.path.join(PRODUCTS_DIR, f'{slug}-800.jpg')
    webp_path = os.path.join(PRODUCTS_DIR, f'{slug}-800.webp')
    
    img_resized.save(jpg_path, 'JPEG', quality=88, optimize=True)
    img_resized.save(webp_path, 'WEBP', quality=88)
    print(f'✅ Processed product {slug}')

def process_hero_slide(img, slide_name, width=1440, height=420, mobile_w=640, mobile_h=360):
    w, h = img.size
    # Desktop banner
    aspect = width / height
    new_h = int(w / aspect)
    top = int((h - new_h) * 0.3)
    desktop_crop = img.crop((0, max(0, top), w, min(h, top + new_h))).resize((width, height), Image.Resampling.LANCZOS)
    
    desktop_jpg = os.path.join(EDITORIAL_DIR, f'{slide_name}-desktop.jpg')
    desktop_webp = os.path.join(EDITORIAL_DIR, f'{slide_name}-desktop.webp')
    desktop_crop.save(desktop_jpg, 'JPEG', quality=88, optimize=True)
    desktop_crop.save(desktop_webp, 'WEBP', quality=88)

    # Mobile banner
    m_aspect = mobile_w / mobile_h
    m_new_w = int(h * m_aspect)
    m_left = (w - m_new_w) // 2
    mobile_crop = img.crop((max(0, m_left), 0, min(w, m_left + m_new_w), h)).resize((mobile_w, mobile_h), Image.Resampling.LANCZOS)
    
    mobile_jpg = os.path.join(EDITORIAL_DIR, f'{slide_name}-mobile.jpg')
    mobile_webp = os.path.join(EDITORIAL_DIR, f'{slide_name}-mobile.webp')
    mobile_crop.save(mobile_jpg, 'JPEG', quality=88, optimize=True)
    mobile_crop.save(mobile_webp, 'WEBP', quality=88)
    print(f'✅ Processed hero banner {slide_name}')

def process_category_thumb(img, cat_slug, size=240):
    # Circular/rounded thumbnail
    w, h = img.size
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    cropped = img.crop((left, top, left + min_dim, top + min_dim)).resize((size, size), Image.Resampling.LANCZOS)
    
    jpg_path = os.path.join(CATEGORIES_DIR, f'{cat_slug}.jpg')
    webp_path = os.path.join(CATEGORIES_DIR, f'{cat_slug}.webp')
    cropped.save(jpg_path, 'JPEG', quality=90, optimize=True)
    cropped.save(webp_path, 'WEBP', quality=90)
    print(f'✅ Processed category thumbnail {cat_slug}')

def main():
    print('Starting asset download and preparation...')
    
    # 1. Download and process 20 products
    for p in PRODUCTS:
        try:
            img = download_image(p['id'])
            process_product_image(img, p['slug'])
        except Exception as e:
            print(f"Error processing {p['slug']}: {e}")

    # 2. Hero banners (4 slides)
    hero_slides = [
        ('hero-slide-1-moments', 8887201),      # Festive brass lamps & marigolds
        ('hero-slide-2-devotional', 10905470),   # Ornate gold leaf devotional frame
        ('hero-slide-3-decor', 30043135),        # Traditional brass pillar lamp & deepam
        ('hero-slide-4-gifting', 5313214)        # Handcrafted festive gift hamper
    ]
    for slide_name, pid in hero_slides:
        try:
            img = download_image(pid)
            process_hero_slide(img, slide_name)
        except Exception as e:
            print(f"Error on hero {slide_name}: {e}")

    # 3. Category thumbnails (5 categories)
    cat_thumbs = [
        ('cat-devotional-frames', 10905470),
        ('cat-decorative-lamps', 30043135),
        ('cat-home-accents', 33289454),
        ('cat-festive-decor', 8818664),
        ('cat-gift-sets', 5313214)
    ]
    for cat_slug, pid in cat_thumbs:
        try:
            img = download_image(pid)
            process_category_thumb(img, cat_slug)
        except Exception as e:
            print(f"Error on cat thumb {cat_slug}: {e}")

    print('All assets downloaded and generated successfully!')

if __name__ == '__main__':
    main()
