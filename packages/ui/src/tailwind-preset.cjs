/**
 * SWAYARI design tokens shared by both portals.
 * See docs/DESIGN_DIRECTION.md for rationale and contrast figures.
 * Legacy token names (ivory-*, charcoal-*, burgundy-light …) are kept so existing classes resolve.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#FBF8F3',
          light: '#FDFBF8',
          surface: '#FBF8F3',
          muted: '#F2ECE3',
          dark: '#E6DDD0',
          border: '#E6DDD0'
        },
        stone: {
          DEFAULT: '#F2ECE3',
          deep: '#E6DDD0',
          shade: '#D8CCBB'
        },
        ink: {
          DEFAULT: '#231C18',
          soft: '#5A4F48',
          faint: '#776B62'
        },
        charcoal: {
          DEFAULT: '#231C18',
          muted: '#5A4F48',
          light: '#776B62'
        },
        burgundy: {
          DEFAULT: '#6B1F2A',
          hover: '#581923',
          deep: '#3F131A',
          accent: '#7E2734',
          muted: '#8C3B44',
          light: '#F6ECEB',
          soft: '#F6ECEB'
        },
        gold: {
          DEFAULT: '#B08A4A',
          light: '#D9C29A',
          dark: '#8A6A33',
          glow: 'rgba(176, 138, 74, 0.18)'
        },
        umber: '#120C08'
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        wordmark: ['Cinzel', '"Cormorant Garamond"', 'serif'],
        sans: ['Jost', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif']
      },
      fontSize: {
        label: ['0.8125rem', { lineHeight: '1.2', letterSpacing: '0.14em' }],
        'display-sm': ['2rem', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'display-md': ['2.75rem', { lineHeight: '1.06', letterSpacing: '-0.015em' }],
        'display-lg': ['3.5rem', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        'display-xl': ['4.5rem', { lineHeight: '0.98', letterSpacing: '-0.02em' }]
      },
      maxWidth: {
        content: '82.5rem', // 1320px
        prose: '38rem'
      },
      spacing: {
        gutter: '1rem',
        section: '5rem'
      },
      borderRadius: {
        sharp: '2px'
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(35, 28, 24, 0.05)',
        card: '0 1px 2px rgba(35, 28, 24, 0.04), 0 8px 24px -12px rgba(35, 28, 24, 0.12)',
        'card-hover': '0 2px 4px rgba(35, 28, 24, 0.05), 0 18px 40px -18px rgba(35, 28, 24, 0.22)',
        drawer: '-24px 0 60px -20px rgba(18, 12, 8, 0.35)',
        dialog: '0 30px 80px -20px rgba(18, 12, 8, 0.45)'
      },
      aspectRatio: {
        product: '4 / 5',
        editorial: '4 / 5',
        wide: '3 / 2',
        hero: '2.32 / 1'
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }
    }
  }
};
