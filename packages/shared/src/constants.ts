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
