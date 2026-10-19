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
  headline: 'Thoughtful gifts. Beautifully priced.',
  supporting: 'Discover gifts for celebrations, return gifting and everyday moments.',
  proposition: 'Gifts ₹999 & under',
  entryLevel: '₹99 & under'
} as const;

export interface BudgetBandDefinition {
  id: string;
  label: string;
  shortLabel: string;
  minPrice: number;
  maxPrice: number;
  description: string;
}

export const BUDGET_BANDS: BudgetBandDefinition[] = [
  {
    id: 'under-99',
    label: '₹99 & under',
    shortLabel: 'Under ₹99',
    minPrice: 0,
    maxPrice: 99,
    description: 'Raw silk potlis, solid brass kumkum chimizhs & floral tassels'
  },
  {
    id: '100-299',
    label: '₹100–₹299',
    shortLabel: '₹100–₹299',
    minPrice: 100,
    maxPrice: 299,
    description: 'Akhand deepams, meenakari peacock boxes & tuned prayer bells'
  },
  {
    id: '300-499',
    label: '₹300–₹499',
    shortLabel: '₹300–₹499',
    minPrice: 300,
    maxPrice: 499,
    description: 'German silver bowls, paired mayur diyas & mini pooja thali sets'
  },
  {
    id: '500-999',
    label: '₹500–₹999',
    shortLabel: '₹500–₹999',
    minPrice: 500,
    maxPrice: 999,
    description: 'Hand-hammered brass urulis, deity idol pairs & festive hampers'
  }
];

export const OCCASIONS = [
  {
    id: 'wedding-return',
    name: 'Wedding & Return Gifting',
    badge: 'Bulk Favors',
    description: 'Auspicious keepsakes, silver bowls & brocade potlis for your cherished guests',
    popularBudgets: ['under-99', '100-299', '300-499']
  },
  {
    id: 'housewarming',
    name: 'Griha Pravesh & Housewarming',
    badge: 'New Beginnings',
    description: 'Sacred brass urulis, akhand deepams & welcoming home accents',
    popularBudgets: ['100-299', '500-999']
  },
  {
    id: 'festive-celebrations',
    name: 'Diwali & Festive Celebrations',
    badge: 'Festive Lights',
    description: 'Curated brass deepams, fragrant dhoop burners & celebratory hampers',
    popularBudgets: ['under-99', '300-499', '500-999']
  },
  {
    id: 'navratri-haldi',
    name: 'Navratri & Haldi Kumkum',
    badge: 'Sacred Blessings',
    description: 'Solid brass kumkum boxes, shola garlands & festive gift pouches',
    popularBudgets: ['under-99', '100-299']
  },
  {
    id: 'corporate-milestone',
    name: 'Corporate & Commemorations',
    badge: 'Executive',
    description: 'Engraved teak coasters, dual bowl presentation sets & bespoke plaques',
    popularBudgets: ['300-499', '500-999']
  }
] as const;
