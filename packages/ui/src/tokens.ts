// SWAYARI definitive design tokens (mirrors tailwind-preset.cjs).
// Visual palette tuned to Tanishq-inspired luxury with warm ivory surfaces and rich burgundy accents.
export const TOKENS = {
  colors: {
    ivory: '#F7F4EF',
    surface: '#FFFFFF',
    stone: '#F4EFEA',
    stoneDeep: '#E7DFD5',
    ink: '#292421',
    inkSoft: '#544A44',
    inkFaint: '#7A6E66',
    burgundy: '#571C2A',
    burgundyHover: '#441420',
    burgundyDeep: '#35121C',
    burgundySoft: '#F7ECEE',
    gold: '#B49155',
    goldLight: '#D8C29D',
    goldDark: '#8F7138',
    border: '#E7DFD5',
    umber: '#1B1310'
  },
  typography: {
    wordmark: 'Cinzel, "Cormorant Garamond", serif',
    display: '"Playfair Display", "Cormorant Garamond", Georgia, serif',
    sans: '"Plus Jakarta Sans", Jost, system-ui, -apple-system, sans-serif'
  },
  layout: {
    contentWidth: '1360px',
    gutterMobile: '16px',
    gutterTablet: '24px',
    gutterDesktop: '40px',
    sectionGap: { mobile: '40px', desktop: '64px' }
  },
  radius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px'
  },
  imageRatios: {
    product: '1 / 1',
    productVertical: '4 / 5',
    heroDesktop: '1440 / 380',
    heroMobile: '640 / 320'
  }
} as const;
