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

export const MAX_FRAME_PRICE = 99;
export const MAX_FRAME_PRICE_PAISE = 9900;

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
  headline: 'Devotional frames ₹99 & under',
  supporting: 'Thoughtful return gifts for your special celebrations.',
  proposition: 'Devotional frames ₹99 & under',
  entryLevel: '₹49 & under',
  shippingNote: 'Shipping is charged separately and confirmed by our team.'
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
    id: 'all-99',
    label: 'All Frames (≤ ₹99)',
    shortLabel: 'All ≤ ₹99',
    minPrice: 0,
    maxPrice: 99,
    description: 'Devotional god frames in gold & teak finishes strictly under ₹99'
  },
  {
    id: 'under-49',
    label: 'Pocket & Mini (≤ ₹49)',
    shortLabel: 'Under ₹49',
    minPrice: 0,
    maxPrice: 49,
    description: 'Pocket prayer frames and mini Ganesha & Balaji favors from ₹49'
  },
  {
    id: '50-79',
    label: 'Classic 4"×6" (₹50–₹79)',
    shortLabel: '₹50–₹79',
    minPrice: 50,
    maxPrice: 79,
    description: 'Bala Krishna, Hanuman and Saraswati Devi frames in ornate borders'
  },
  {
    id: '80-99',
    label: 'Royal & Sanctum (₹80–₹99)',
    shortLabel: '₹80–₹99',
    minPrice: 80,
    maxPrice: 99,
    description: 'Sri Venkateswara and Radha Krishna gold-foil sanctum frames'
  }
];

// Backwards compatibility alias for components referencing BUDGET_BANDS
export const BUDGET_BANDS = FRAME_PRICE_BANDS;
export type BudgetBandDefinition = FramePriceBandDefinition;

export const DEITIES = [
  { id: 'all', name: 'All Deities' },
  { id: 'ganesha', name: 'Ganesha' },
  { id: 'lakshmi', name: 'Lakshmi' },
  { id: 'balaji', name: 'Balaji (Venkateswara)' },
  { id: 'radha-krishna', name: 'Radha Krishna' },
  { id: 'krishna', name: 'Bala Krishna' },
  { id: 'shiva-parvati', name: 'Shiva Parvati' },
  { id: 'saraswati', name: 'Saraswati' },
  { id: 'hanuman', name: 'Hanuman' },
  { id: 'murugan', name: 'Murugan' },
  { id: 'sai-baba', name: 'Sai Baba' }
] as const;

export const FRAME_SIZES = [
  { id: 'all', name: 'All Sizes' },
  { id: 'pocket', name: 'Pocket 2.5"×3.5"' },
  { id: 'mini', name: 'Mini 3"×3"' },
  { id: 'classic', name: 'Classic 4"×6"' },
  { id: 'royal', name: 'Royal 5"×7"' },
  { id: 'wide', name: 'Wide 6"×4"' }
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
    description: 'Sacred Ganesha and Balaji sanctum frames for new home blessings'
  },
  {
    id: 'navratri-haldi',
    name: 'Navratri & Haldi Kumkum',
    badge: 'Sacred Blessings',
    description: 'Goddess Lakshmi, Saraswati and Radha Krishna mini return favors'
  },
  {
    id: 'family-celebrations',
    name: 'Family Celebrations & Poojas',
    badge: 'Spiritual Keepsakes',
    description: 'Revered devotional frames for sashtiapthapoorthi, satyanarayan pooja and milestones'
  }
] as const;
