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

/** Highest price allowed for any item on SWAYARI (everything is under ₹999). */
export const MAX_FRAME_PRICE = 999;
export const MAX_FRAME_PRICE_PAISE = 99900;

/** Smallest order we accept, counted across every design in one request. */
export const MIN_ORDER_FRAMES = 25;

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
  headline: 'Devotional gifts under ₹999',
  supporting: 'Thoughtful return gifts for your special celebrations.',
  proposition: 'Everything under ₹999 — silver foil god frames from ₹99',
  minimumOrder: 'Minimum order 25 frames — mix any designs',
  shippingNote: 'Shipping charges are extra and confirmed by our team.'
} as const;

export interface FramePriceBandDefinition {
  id: string;
  label: string;
  shortLabel: string;
  minPrice: number;
  maxPrice: number;
  description?: string;
}

export const FRAME_PRICE_BANDS: FramePriceBandDefinition[] = [
  {
    id: 'under-199',
    label: 'Under ₹199',
    shortLabel: '< ₹199',
    minPrice: 0,
    maxPrice: 199,
    description: 'Return gifts for every guest, including our ₹99 god frames'
  },
  {
    id: '200-499',
    label: '₹200 – ₹499',
    shortLabel: '₹200–499',
    minPrice: 200,
    maxPrice: 499,
    description: 'Special gifts for close family and friends'
  },
  {
    id: '500-999',
    label: '₹500 – ₹999',
    shortLabel: '₹500–999',
    minPrice: 500,
    maxPrice: 999,
    description: 'Premium keepsakes, still under ₹999'
  }
];

// Backwards compatibility alias for components referencing BUDGET_BANDS
export const BUDGET_BANDS = FRAME_PRICE_BANDS;
export type BudgetBandDefinition = FramePriceBandDefinition;

export const DEITIES = [
  { id: 'all', name: 'All Deities' },
  { id: 'balaji', name: 'Balaji & Padmavathi' },
  { id: 'sai', name: 'Sai Baba' },
  { id: 'krishna', name: 'Krishna' },
  { id: 'ram', name: 'Ram Darbar' },
  { id: 'hanuman', name: 'Hanuman' }
] as const;

export const FRAME_SIZES = [
  { id: 'all', name: 'All Sizes' },
  { id: 'no. 1', name: 'No. 1' }
] as const;

export const ORIENTATIONS = [
  { id: 'all', name: 'All Orientations' },
  { id: 'portrait', name: 'Portrait' },
  { id: 'landscape', name: 'Landscape' },
  { id: 'square', name: 'Square' }
] as const;

export const OCCASIONS = [
  {
    id: 'wedding-return',
    name: 'Wedding Return Gifts',
    badge: 'Bulk Favors',
    description: 'Auspicious devotional god frames for your wedding guests and family ceremonies'
  },
  {
    id: 'housewarming',
    name: 'Griha Pravesh & Housewarming',
    badge: 'New Beginnings',
    description: 'Balaji, Padmavathi Srinivasa and Ram Darbar frames for new home blessings'
  },
  {
    id: 'navratri-haldi',
    name: 'Navratri & Haldi Kumkum',
    badge: 'Sacred Blessings',
    description: 'Radha Krishna and Bal Krishna frames for haldi kumkum and festive gatherings'
  },
  {
    id: 'family-celebrations',
    name: 'Family Celebrations & Poojas',
    badge: 'Spiritual Keepsakes',
    description: 'Revered devotional frames for sashtiapthapoorthi, satyanarayan pooja and milestones'
  }
] as const;
