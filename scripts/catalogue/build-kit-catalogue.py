"""Builds the D1 migration for the Swayari website kit catalogue (prices valid from 4 November 2026).

Source of truth: scripts/catalogue/kit-pricing-2026-11-04.json (the owner's pricing.json, unchanged).
Every design becomes its own product page; designs of one product share a price group, so a buyer
can mix designs to reach a quantity slab. Products with sizes (stands, long frame, diya frames)
carry per-size MRP and slabs in variants_json.

Wording rule from the owner: say "silver foil" (never "silver" alone); never claim real, pure, fine or
999 silver, and never print "999".

Usage: python3 scripts/catalogue/build-kit-catalogue.py > migrations/0013_kit_catalogue.sql
"""
import json
import os
import re
import sys
from datetime import datetime, timedelta, timezone

HERE = os.path.dirname(os.path.abspath(__file__))
KIT = json.load(open(os.path.join(HERE, 'kit-pricing-2026-11-04.json')))

# Lowest quantity of each slab, per slab set in the kit.
SLAB_STARTS = {'gift': [1, 10, 50, 100], 'frame': [1, 3, 10, 25]}

CATEGORIES = [
    # id, name, slug, description, display order
    ('cat-god-frames', 'God Frames', 'god-frames',
     'Silver foil god frames in carved gold-trimmed frames, from gift-boxed colour frames to grand 14 × 17 pooja-room pieces', 1),
    ('cat-stotram-frames', 'Stotram Frames', 'stotram-frames',
     'Silver foil stotram flip frames and gold border stotram frames in Telugu', 2),
    ('cat-god-stands', 'God Stands', 'god-stands',
     'Colour silver foil god images in clear acrylic stands, in three sizes', 3),
    ('cat-stotram-cards', 'Stotram Cards', 'stotram-cards',
     'Silver foil stotram cards in red gift covers, the favourite return gift for functions and vratams', 4),
    ('cat-wall-frames', 'Wall Frames', 'wall-frames',
     'Long 5 gods, 10 gods and 12 gods silver foil wall frames for the pooja room entrance and hall', 5),
]

FAMILY = {
    '01': dict(cat='cat-stotram-frames', name='{d} Desk Stotram Flip Frame', slug='{s}-desk-stotram-flip-frame',
               body='A spiral-bound desk flip book whose silver foil pages carry the complete {d} in Telugu, presented in a gold textured gift box with a red base and a clear window. It stands open on a desk or pooja shelf, so the prayer is always within reach.',
               material='Silver foil pages, spiral binding, gold textured gift box with red base and clear window',
               dims=None, size='Desk flip frame', orientation='landscape', border='Gold textured gift box',
               packaging=[{'name': 'Gold textured gift box', 'price': 0, 'included': True}],
               contents='One silver foil stotram flip book in its gift box',
               occasions=['festivals-vratams', 'griha-pravesh', 'wedding-return-gifts']),
    '02': dict(cat='cat-stotram-frames', name='{d} Gold Border Stotram Frame', slug='{s}-gold-border-stotram-frame',
               body='A silver foil stotram book of {d} with a colour image of the deity, framed in a broad gold textured border with a red inner lining. Made to stand in the pooja room or to be gifted on a day that matters.',
               material='Silver foil stotram book, colour deity print, gold textured border with red lining',
               dims=None, size='Framed stotram', orientation='portrait', border='Broad gold textured border',
               packaging=[], contents='One framed silver foil stotram book',
               occasions=['pooja-room', 'griha-pravesh', 'festivals-vratams']),
    '03': dict(cat='cat-stotram-cards', name='{d} Silver Foil Stotram Card', slug='{s}-silver-foil-stotram-card',
               body='A silver foil card printed with {d} in Telugu and a colour image of the deity, sealed in a clear sleeve and presented in a red gift cover. Slim, light and easy to hand to every guest.',
               material='Silver foil card in a clear sleeve, red gift cover',
               dims=None, size='Stotram card', orientation='portrait', border='Red gift cover',
               packaging=[{'name': 'Red gift cover', 'price': 0, 'included': True}],
               contents='One silver foil stotram card in a clear sleeve with a red gift cover',
               occasions=['wedding-return-gifts', 'festivals-vratams']),
    '04': dict(cat='cat-god-stands', name='{d} Silver Foil God Stand', slug='{s}-silver-foil-god-stand',
               body='A colour-enamelled silver foil image of {d} set in a clear acrylic table stand. Choose No. 1 (small), No. 2 (medium) or No. 3 (large) for the desk, the car dashboard or the pooja shelf.',
               material='Colour-enamelled silver foil image in a clear acrylic stand',
               dims='No. 1 small · No. 2 medium · No. 3 large', size='No. 1 · No. 2 · No. 3', orientation='portrait',
               border='Clear acrylic block', packaging=[], contents='One acrylic god stand',
               occasions=['wedding-return-gifts', 'corporate-gifting', 'festivals-vratams']),
    '05': dict(cat='cat-wall-frames', name='Long 5 Gods Silver Foil Wall Frame', slug='long-5-gods-silver-foil-wall-frame',
               body='A long wall frame with five embossed silver foil deities on a deep maroon background, in a gold-trimmed wooden frame. Made to sit above a door or the pooja room entrance and greet everyone who walks in.',
               material='Embossed silver foil deities on maroon, gold-trimmed wooden frame',
               dims='11 × 24 in or 13 × 34 in', size='11 × 24 · 13 × 34 in', orientation='landscape',
               border='Gold-trimmed wooden frame', packaging=[], contents='One wall frame',
               occasions=['pooja-room', 'griha-pravesh']),
    '06': dict(cat='cat-wall-frames', name='10 Gods Silver Foil Wall Frame', slug='10-gods-silver-foil-wall-frame',
               body='A grand wall frame with ten embossed silver foil deities in two rows on a deep maroon background, in a gold-trimmed wooden frame. A centrepiece for the pooja room or the living hall.',
               material='Embossed silver foil deities on maroon, gold-trimmed wooden frame',
               dims='20 × 26 in', size='20 × 26 in', orientation='landscape',
               border='Gold-trimmed wooden frame', packaging=[], contents='One wall frame',
               occasions=['pooja-room', 'griha-pravesh']),
    '07': dict(cat='cat-wall-frames', name='12 Gods Silver Foil Wall Frame', slug='12-gods-silver-foil-wall-frame',
               body='A grand wall frame with twelve embossed silver foil deities in two rows on a deep maroon background, in a gold-trimmed wooden frame. A centrepiece for the pooja room or the living hall.',
               material='Embossed silver foil deities on maroon, gold-trimmed wooden frame',
               dims='20 × 30 in', size='20 × 30 in', orientation='landscape',
               border='Gold-trimmed wooden frame', packaging=[], contents='One wall frame',
               occasions=['pooja-room', 'griha-pravesh']),
    '08': dict(cat='cat-god-frames', name='{d} Silver Foil God Frame 8×10', slug='{s}-silver-foil-god-frame-8x10',
               body='An embossed silver foil image of {d} with foil corner ornaments on a deep maroon background, in a carved gold-trimmed frame. At 8 × 10 inches it suits a shelf, a study table or a thoughtful gift.',
               material='Embossed silver foil artwork on maroon, carved gold-trimmed frame',
               dims='8 × 10 in', size='8 × 10 in', orientation='portrait', border='Carved gold-trimmed frame',
               packaging=[], contents='One framed artwork',
               occasions=['griha-pravesh', 'pooja-room', 'corporate-gifting']),
    '09': dict(cat='cat-god-frames', name='{d} Silver Foil God Frame with Diyas', slug='{s}-silver-foil-god-frame-with-diyas',
               body='An embossed silver foil image of {d} flanked by lamps and foil ornaments on a deep maroon background, in a carved gold-trimmed frame. Available in 10 × 12 and 12 × 14 inches.',
               material='Embossed silver foil artwork on maroon, carved gold-trimmed frame',
               dims='10 × 12 in or 12 × 14 in', size='10 × 12 · 12 × 14 in', orientation='portrait',
               border='Carved gold-trimmed frame', packaging=[], contents='One framed artwork',
               occasions=['griha-pravesh', 'pooja-room']),
    '10': dict(cat='cat-god-frames', name='{d} Colour God Frame No. 2', slug='{s}-colour-god-frame-no-2',
               body='A colour-enamelled silver foil image of {d} in a carved maroon-and-gold frame, packed in a red gift box so it is ready to hand over.',
               material='Colour-enamelled silver foil artwork, carved maroon-and-gold frame',
               dims='No. 2', size='No. 2', orientation='portrait', border='Carved maroon-and-gold frame',
               packaging=[{'name': 'Red gift box', 'price': 0, 'included': True}],
               contents='One framed artwork in a red gift box',
               occasions=['wedding-return-gifts', 'corporate-gifting', 'griha-pravesh']),
    '11': dict(cat='cat-god-frames', name='{d} Colour God Frame No. 3', slug='{s}-colour-god-frame-no-3',
               body='A colour-enamelled silver foil image of {d} on a cream mount in a carved maroon-and-gold frame. Larger than No. 2, and packed in a red gift box.',
               material='Colour-enamelled silver foil artwork, cream mount, carved maroon-and-gold frame',
               dims='No. 3', size='No. 3', orientation='portrait', border='Carved maroon-and-gold frame',
               packaging=[{'name': 'Red gift box', 'price': 0, 'included': True}],
               contents='One framed artwork in a red gift box',
               occasions=['wedding-return-gifts', 'corporate-gifting', 'griha-pravesh']),
    '12': dict(cat='cat-god-frames', name='{d} Grand Silver Foil God Frame 14×17', slug='{s}-grand-silver-foil-god-frame-14x17',
               body='A large embossed silver foil image of {d} with lamps and a decorative base on a deep maroon background, in a carved gold-trimmed frame. At 14 × 17 inches it is a statement piece for the pooja room.',
               material='Embossed silver foil artwork on maroon, carved gold-trimmed frame',
               dims='14 × 17 in', size='14 × 17 in', orientation='portrait', border='Carved gold-trimmed frame',
               packaging=[], contents='One framed artwork',
               occasions=['pooja-room', 'griha-pravesh']),
}

# Order families appear in (newest created_at first on the storefront).
FAMILY_ORDER = ['11', '02', '01', '09', '10', '08', '12', '04', '03', '05', '06', '07']

DISPLAY_NAME = {
    '5 gods': '5 Gods', '10 gods': '10 Gods', '12 gods': '12 Gods',
    'Krishna with cow': 'Krishna with Cow', 'Multi-god design': 'Multi-God',
    'Standing deity with devotees': 'Standing Deity with Devotees',
    'Venkateswara (Balaji)': 'Venkateswara Balaji',
}

# One line on who the deity is or what the prayer is for.
MEANING = {
    'Aditya Hrudayam': 'Aditya Hrudayam, the hymn to the Sun God that Sage Agastya taught Sri Rama, is recited for courage, health and victory.',
    'Ashta Lakshmi Stotram': 'The Ashta Lakshmi Stotram praises the eight forms of Goddess Lakshmi, from wealth and grain to courage and wisdom.',
    'Bal Krishna': 'Little Krishna with his butter pot and flute brings the joy of a child into the home.',
    'Durga': 'Goddess Durga, protector of the righteous, blesses the family with strength and courage.',
    'Ganesh': 'Lord Ganesha, remover of obstacles, is honoured before every new beginning.',
    'Ganesha Ashtottara Shatanamavali': 'The 108 names of Lord Ganesha, chanted before every pooja and every new beginning.',
    'Hanuman': 'Lord Hanuman, symbol of devotion and strength, guards the home and its people.',
    'Hanuman Chalisa': 'The Hanuman Chalisa, forty verses in praise of Lord Hanuman, is chanted for strength and protection.',
    'Jesus': 'A serene image of Jesus Christ for prayer, blessings and Christmas gifting.',
    'Kanakadhara Stotram': 'The Kanakadhara Stotram by Adi Shankaracharya is chanted to invite the grace and prosperity of Goddess Lakshmi.',
    'Krishna with cow': 'Lord Krishna as the gentle cowherd, playing his flute beside his beloved cow.',
    'Krishnashtakam': 'Krishnashtakam, eight verses in praise of Lord Krishna, brings his blessings of love and joy.',
    'Lakshmi': 'Goddess Lakshmi, giver of wealth and well-being, welcomed into every home.',
    'Lakshmi Ashtottaram': 'The 108 names of Goddess Lakshmi, chanted on Fridays and festival days for prosperity.',
    'Lakshmi Ganesh Saraswati': 'Lakshmi, Ganesha and Saraswati together: prosperity, auspicious beginnings and wisdom in one frame.',
    'Lakshmi Narasimha': 'Lord Lakshmi Narasimha, the protector, seated with Goddess Lakshmi.',
    'Lalitha Harathi': 'The Lalitha Harathi is sung while offering the lamp to Goddess Lalitha at the end of the pooja.',
    'Lalitha Sahasranamam': 'The Lalitha Sahasranamam, the thousand names of Goddess Lalitha Tripura Sundari, is chanted for peace and prosperity.',
    'Lingashtakam': 'Lingashtakam, eight verses in praise of the Shiva Lingam, is chanted for the blessings of Lord Shiva.',
    'Mahishasura Mardini Stotram': 'The Mahishasura Mardini Stotram celebrates Goddess Durga’s victory over evil, chanted especially during Navratri.',
    'Makkah Madina': 'The holy Kaaba of Makkah and the green dome of Madina, a respectful gift for Eid and family occasions.',
    'Mother Mary': 'A tender image of Mother Mary for prayer, blessings and Christmas gifting.',
    'Multi-god design': 'Several deities together in one frame, so the whole family’s blessings are in one place.',
    'Narayana Stotram': 'The Narayana Stotram praises Lord Narayana, the preserver, for peace and protection.',
    'Radha Krishna': 'Radha and Krishna, the eternal symbol of divine love, a cherished gift for couples.',
    'Ram Darbar': 'Sri Rama with Sita, Lakshmana and Hanuman, the symbol of a united, happy family.',
    'Sai Baba': 'Shirdi Sai Baba, with his message of faith and patience, blesses all who pray to him.',
    'Sai Chalisa': 'The Sai Chalisa, forty verses to Shirdi Sai Baba, is chanted for faith, patience and peace.',
    'Saraswati': 'Goddess Saraswati, giver of knowledge, music and the arts, is a lovely gift for students and teachers.',
    'Satyanarayana Aarti': 'The Satyanarayana Aarti is sung at the close of the Satyanarayana Swamy vratam.',
    'Shirdi Sai Baba': 'Prayers to Shirdi Sai Baba, the saint of faith and patience, for his blessings.',
    'Shirdi Sai Baba Aarti': 'The Shirdi Sai Baba Aarti, sung morning and evening at Sai temples, now for your home.',
    'Shiva Mangalashtakam': 'Shiva Mangalashtakam, eight auspicious verses to Lord Shiva, is chanted for well-being.',
    'Shiva Parivar': 'Lord Shiva with Goddess Parvati, Ganesha and Kartikeya: the divine family.',
    'Shiva Parvati': 'Lord Shiva and Goddess Parvati, the divine couple, bless married life with harmony.',
    'Sri Ayyappa Stuti': 'The Sri Ayyappa Stuti in praise of Lord Ayyappa, cherished by devotees during the Mandala season.',
    'Sri Durga Chalisa': 'The Sri Durga Chalisa, forty verses to Goddess Durga, is chanted for courage and protection.',
    'Sri Rama Raksha Stotram': 'The Sri Rama Raksha Stotram is a shield of protection chanted in the name of Sri Rama.',
    'Sri Varalakshmi Vratam': 'The complete Sri Varalakshmi Vratam vidhanam, so the Shravana month pooja can be performed step by step.',
    'Sri Vinayaka Vratakalpam': 'The complete Sri Vinayaka Vratakalpam, so the Vinayaka Chavithi pooja can be performed step by step.',
    'Standing deity with devotees': 'A standing deity blessing devotees gathered at the feet, in fine embossed detail.',
    'Vara Lakshmi': 'Goddess Vara Lakshmi, who grants every boon, worshipped on Varalakshmi Vratam.',
    'Vasavi Kanyaka Parameswari Ashtottaram': 'The 108 names of Sri Vasavi Kanyaka Parameswari, the family deity of many households.',
    'Venkateswara & Padmavathi': 'Lord Venkateswara of Tirumala with Goddess Padmavathi, a blessing for newly-weds and new homes.',
    'Venkateswara (Balaji)': 'Lord Venkateswara of Tirumala, Balaji, the giver of boons, for every home and every beginning.',
    'Venkateswara Govinda Namalu': 'The Govinda Namalu, the beloved names of Lord Venkateswara sung on the way to Tirumala.',
    'Vishnu Sahasranamam': 'The Vishnu Sahasranamam, the thousand names of Lord Vishnu, is chanted for peace, health and prosperity.',
    '5 gods': '',
    '10 gods': '',
    '12 gods': '',
}

# Deity tags; the storefront filter ids (balaji, lakshmi, …) must appear inside these words.
TAG_RULES = [
    (('venkateswara', 'balaji', 'govinda', 'padmavathi'), 'Balaji'),
    (('lakshmi', 'kanakadhara'), 'Lakshmi'),
    (('ganesh', 'vinayaka'), 'Ganesh'),
    (('lalitha', 'durga', 'mahishasura', 'vasavi', 'saraswati'), 'Devi'),
    (('krishna',), 'Krishna'),
    (('shiva', 'linga'), 'Shiva'),
    (('hanuman',), 'Hanuman'),
    (('sai baba', 'sai chalisa', 'shirdi'), 'Sai Baba'),
    (('ram darbar', 'rama raksha'), 'Sri Rama'),
    (('vishnu', 'narayana', 'narasimha'), 'Vishnu'),
    (('gods', 'multi-god', 'lakshmi ganesh saraswati', 'standing deity', 'shiva parivar', 'ram darbar'), 'Multi-God'),
    (('jesus', 'mary', 'makkah'), 'Interfaith'),
    (('aditya',), 'Surya'),
    (('ayyappa',), 'Ayyappa'),
]

FESTIVE = ('varalakshmi', 'vinayaka', 'vara lakshmi', 'mahishasura', 'durga', 'lakshmi')


def slugify(text):
    return re.sub(r'-+', '-', re.sub(r'[^a-z0-9]+', '-', text.lower())).strip('-')


def q(value):
    if value is None:
        return 'NULL'
    if isinstance(value, bool):
        return '1' if value else '0'
    if isinstance(value, (int, float)):
        return str(value)
    return "'" + str(value).replace("'", "''") + "'"


def tiers_for(product, prices):
    starts = SLAB_STARTS['gift' if product['slabs'][0].startswith('1–9') else 'frame']
    return [{'min_qty': s, 'unit_price': p} for s, p in zip(starts, prices)]


def tags_for(design):
    low = design.lower()
    tags = [tag for words, tag in TAG_RULES if any(w in low for w in words)]
    return ' · '.join(dict.fromkeys(tags)) or None


def main():
    image_dir = os.path.join(HERE, '..', '..', 'public', 'assets', 'products')
    out = []
    w = out.append
    w('-- SWAYARI ENTERPRISES D1 Migration 0013: full catalogue from the Swayari website kit')
    w('-- Generated by scripts/catalogue/build-kit-catalogue.py from kit-pricing-2026-11-04.json — do not edit by hand.')
    w('--')
    w('-- * Adds price_group (designs of one product share quantity slabs) and mrp (struck-through price).')
    w('-- * Archives the earlier No. 1 frames (kept for old requests) and hides their categories.')
    w('-- * One product per design; sizes and per-size slabs live in variants_json.')
    w('')
    w('ALTER TABLE products ADD COLUMN price_group TEXT DEFAULT NULL;')
    w('ALTER TABLE products ADD COLUMN mrp INTEGER DEFAULT NULL;')
    w('')
    w("UPDATE products SET status = 'archived', updated_at = '2026-11-04T06:00:00.000Z' WHERE status = 'published';")
    w('UPDATE categories SET is_active = 0;')
    for cid, name, slug, desc, order in CATEGORIES:
        w(f"INSERT INTO categories (id, name, slug, description, display_order, is_active, created_at) VALUES "
          f"({q(cid)}, {q(name)}, {q(slug)}, {q(desc)}, {order}, 1, '2026-11-04T06:00:00.000Z') "
          f"ON CONFLICT(id) DO UPDATE SET name = excluded.name, slug = excluded.slug, description = excluded.description, "
          f"display_order = excluded.display_order, is_active = 1;")
    w('')

    cols = ('id, sku, name, slug, description, category_id, images, material, dimensions, has_variants, variants_json, '
            'indicative_price, mrp, price_group, min_quantity, availability_label, customisation_info, status, is_demo, '
            'price_type, set_contents, order_increment, is_quote_only, bulk_tiers_json, packaging_options_json, '
            'shipping_info, occasions_json, supports_individual, supports_bulk, deity, frame_size, orientation, '
            'border_finish, created_at, updated_at')
    base_time = datetime(2026, 11, 4, 6, 0, tzinfo=timezone.utc)
    products = {p['id']: p for p in KIT['products']}
    missing = []
    count = 0
    for rank, fid in enumerate(FAMILY_ORDER):
        product = products[fid]
        fam = FAMILY[fid]
        rows = {v['label']: v for v in product['variants']}
        for design_index, design in enumerate(product['designs']):
            raw = design['name']
            d = DISPLAY_NAME.get(raw, raw)
            codes = [os.path.basename(p)[:5] for p in design['photos']]
            first = codes[0]
            labels = design['variants']
            multi = len(product['variants']) > 1 and len(labels) > 1
            row_index = [v['label'] for v in product['variants']].index(labels[0])
            group = fid if multi or len(product['variants']) == 1 else f"{fid}{'ABCD'[row_index]}"
            default = rows[labels[0]]
            variants = []
            if multi:
                for label in labels:
                    v = rows[label]
                    variants.append({'id': slugify(label), 'name': label, 'mrp': v['mrp'],
                                     'indicativePrice': v['prices'][0], 'tiers': tiers_for(product, v['prices'])})
            images = [f'/assets/products/kit-{c}.webp' for c in codes]
            images += [f'/assets/products/kit-{c}.webp' for c in KIT_COMMON.get(fid, [])]
            for img in images:
                if not os.path.exists(os.path.join(image_dir, os.path.basename(img))):
                    missing.append(img)
            meaning = MEANING.get(raw, '')
            body = fam['body'].format(d=d)
            description = f'{meaning} {body}'.strip() if meaning else body
            occasions = list(fam['occasions'])
            if any(k in raw.lower() for k in FESTIVE) and 'festivals-vratams' not in occasions:
                occasions.append('festivals-vratams')
            name = fam['name'].format(d=d)
            slug = fam['slug'].format(s=slugify(d))
            created = (base_time - timedelta(minutes=rank * 100 + design_index)).strftime('%Y-%m-%dT%H:%M:%S.000Z')
            values = [
                f'kit-{first}', f'SWY-{fid}-{first[3:]}', name, slug, description, fam['cat'], json.dumps(images),
                fam['material'], fam['dims'], multi, json.dumps(variants, ensure_ascii=False),
                default['prices'][0], default['mrp'], group, 1, 'Ready to order',
                'Mix designs of this product to reach a bulk price slab.', 'published', False, 'piece',
                fam['contents'], 1, False, json.dumps(tiers_for(product, default['prices'])),
                json.dumps(fam['packaging']),
                'Delivery is extra, charged at actual cost for your location and confirmed before dispatch.',
                json.dumps(occasions), True, True, tags_for(raw), fam['size'], fam['orientation'], fam['border'],
                created, created,
            ]
            w(f'INSERT INTO products ({cols}) VALUES ({", ".join(q(v) for v in values)}) '
              'ON CONFLICT(id) DO UPDATE SET '
              + ', '.join(f'{c.strip()} = excluded.{c.strip()}' for c in cols.split(',') if c.strip() not in ('id', 'created_at'))
              + ';')
            count += 1
    w('')
    w(f'-- {count} products')
    print('\n'.join(out))
    if missing:
        print(f'-- WARNING: {len(set(missing))} image files not found yet in public/assets/products', file=sys.stderr)
        for m in sorted(set(missing)):
            print('   ', m, file=sys.stderr)


# Extra photos shown on every design of a product (gift box, size comparison).
KIT_COMMON = {'04': ['04-11'], '10': ['10-07'], '11': ['11-06']}

if __name__ == '__main__':
    main()
