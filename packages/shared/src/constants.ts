export const BRAND = {
  name: 'SWAYARI',
  subtitle: 'Décor & Gifting',
  company: 'SWAYARI ENTERPRISES',
  officialEmail: 'swayarienterprises@gmail.com',
  palette: {
    ivoryLight: '#FDFBF7',
    ivorySurface: '#FAF7F2',
    ivoryCard: '#FFFFFF',
    ivoryMuted: '#F4EFEB',
    ivoryBorder: '#E6DDD5',
    burgundyPrimary: '#5C1D24',
    burgundyHover: '#4A161D',
    burgundyLight: '#FBF0F1',
    goldAccent: '#C49A45',
    goldLight: '#E8D29E',
    goldGlow: 'rgba(196, 154, 69, 0.15)',
    charcoalText: '#2B2625',
    charcoalMuted: '#6B6362',
    charcoalLight: '#9E9493'
  }
} as const;

/** Sanity cap for any single price on SWAYARI (the largest wall frame is well below it). */
export const MAX_FRAME_PRICE = 20000;
export const MAX_FRAME_PRICE_PAISE = 2000000;

/** No order-wide minimum: buyers start at 1 piece and slabs reward larger quantities. */
export const MIN_ORDER_FRAMES = 1;

/** The gifting promise shown across the site. */
export const GIFTING_PRICE_CAP = 2999;

export const ORDER_DISCLAIMER_TEXT =
  'Our team will contact you to confirm availability, final pricing, shipping charges and delivery details. Submitting this request does not confirm a purchase or reserve stock.';

export const ORDER_STATUSES = [
  { value: 'new_request', label: 'New Request', color: 'blue' },
  { value: 'contacted', label: 'Contacted', color: 'amber' },
  { value: 'quoted', label: 'Quoted', color: 'purple' },
  { value: 'confirmed', label: 'Confirmed', color: 'indigo' },
  { value: 'dispatched', label: 'Dispatched', color: 'emerald' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' }
] as const;

export const SESSION_COOKIE_NAMES = {
  customer: 'swayari_customer_session',
  admin: 'swayari_admin_session'
} as const;

export const BRAND_TAGLINES = {
  headline: 'Devotional gifting under ₹2,999',
  supporting: 'Silver foil stotram frames, god frames and return gifts for every celebration.',
  proposition: 'Gifting under ₹2,999 — return gifts from ₹39',
  minimumOrder: 'Order from 1 piece — mix designs to unlock bulk prices',
  shippingNote: 'Delivery is extra, charged at actual cost for your location.',
  priceNote: 'Prices per piece in INR. Delivery charges extra. Mix designs to reach a slab.'
} as const;

export interface FramePriceBandDefinition {
  id: string;
  label: string;
  shortLabel: string;
  minPrice: number;
  maxPrice: number;
  description?: string;
}

/** Shop-by-budget bands, matched against the 1-piece price. */
export const FRAME_PRICE_BANDS: FramePriceBandDefinition[] = [
  {
    id: 'under-299',
    label: 'Under ₹299',
    shortLabel: '< ₹299',
    minPrice: 0,
    maxPrice: 299,
    description: 'Stotram cards, god stands and colour frames for every guest'
  },
  {
    id: '300-999',
    label: '₹300 – ₹999',
    shortLabel: '₹300–999',
    minPrice: 300,
    maxPrice: 999,
    description: 'Stotram flip frames, god frames and gifts for close family'
  },
  {
    id: '1000-2999',
    label: '₹1,000 – ₹2,999',
    shortLabel: '₹1k–2,999',
    minPrice: 1000,
    maxPrice: 2999,
    description: 'Grand god frames for the pooja room and special occasions'
  },
  {
    id: '3000-plus',
    label: 'Wall frames ₹3,000+',
    shortLabel: '₹3,000+',
    minPrice: 3000,
    maxPrice: 20000,
    description: '5, 10 and 12 god wall frames for the pooja room entrance'
  }
];

// Backwards compatibility alias for components referencing BUDGET_BANDS
export const BUDGET_BANDS = FRAME_PRICE_BANDS;
export type BudgetBandDefinition = FramePriceBandDefinition;

/** Deity filters; the id is matched as a keyword inside each product's deity tags. */
export const DEITIES = [
  { id: 'all', name: 'All Gods' },
  { id: 'balaji', name: 'Balaji' },
  { id: 'lakshmi', name: 'Lakshmi' },
  { id: 'ganesh', name: 'Ganesh' },
  { id: 'devi', name: 'Devi' },
  { id: 'krishna', name: 'Krishna' },
  { id: 'shiva', name: 'Shiva' },
  { id: 'hanuman', name: 'Hanuman' },
  { id: 'sai', name: 'Sai Baba' },
  { id: 'rama', name: 'Sri Rama' },
  { id: 'vishnu', name: 'Vishnu' },
  { id: 'multi', name: 'Many Gods' },
  { id: 'interfaith', name: 'Other Faiths' }
] as const;

export const FRAME_SIZES = [{ id: 'all', name: 'All Sizes' }] as const;

export const ORIENTATIONS = [
  { id: 'all', name: 'All Orientations' },
  { id: 'portrait', name: 'Portrait' },
  { id: 'landscape', name: 'Landscape' },
  { id: 'square', name: 'Square' }
] as const;

/** Occasions; the id is stored on each product (occasions_json) and used in /shop?occasion=. */
export const OCCASIONS = [
  {
    id: 'wedding-return-gifts',
    name: 'Wedding Return Gifts',
    badge: 'Most gifted',
    description: 'Stotram cards, god stands and colour frames your guests will keep for years'
  },
  {
    id: 'griha-pravesh',
    name: 'Griha Pravesh',
    badge: 'New beginnings',
    description: 'Balaji, Lakshmi and Ganesh frames to bless a new home'
  },
  {
    id: 'festivals-vratams',
    name: 'Festivals & Vratams',
    badge: 'Sacred days',
    description: 'Varalakshmi Vratam, Vinayaka Chavithi, Diwali and Navratri gifts'
  },
  {
    id: 'pooja-room',
    name: 'Pooja Room',
    badge: 'For the home',
    description: 'Grand silver foil god frames and wall frames for your pooja room'
  },
  {
    id: 'corporate-gifting',
    name: 'Corporate Gifting',
    badge: 'Bulk pricing',
    description: 'Gift-boxed frames and stands for clients, teams and festive hampers'
  }
] as const;
