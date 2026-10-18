// SWAYARI design tokens (mirrors tailwind-preset.cjs). See docs/DESIGN_DIRECTION.md.
export const TOKENS = {
  colors: {
    ivory: '#FBF8F3',
    stone: '#F2ECE3',
    stoneDeep: '#E6DDD0',
    ink: '#231C18',
    inkSoft: '#5A4F48',
    inkFaint: '#776B62',
    burgundy: '#6B1F2A',
    burgundyHover: '#581923',
    burgundyDeep: '#3F131A',
    burgundySoft: '#F6ECEB',
    gold: '#B08A4A',
    goldLight: '#D9C29A',
    umber: '#120C08'
  },
  typography: {
    wordmark: 'Cinzel, "Cormorant Garamond", serif',
    display: '"Cormorant Garamond", Georgia, serif',
    sans: 'Jost, system-ui, -apple-system, "Segoe UI", sans-serif'
  },
  layout: {
    contentWidth: '1320px',
    gutterMobile: '16px',
    gutterTablet: '24px',
    gutterDesktop: '40px',
    sectionGap: { mobile: '56px', desktop: '96px' }
  },
  radius: { sharp: '2px', full: '9999px' },
  imageRatios: { product: '4 / 5', editorial: '4 / 5', wide: '3 / 2', heroDesktop: '2.32 / 1', heroMobile: '4 / 5' }
} as const;
