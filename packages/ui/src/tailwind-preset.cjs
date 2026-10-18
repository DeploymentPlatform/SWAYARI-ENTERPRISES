/**
 * SWAYARI design tokens shared by both portals.
 * Definitive design direction: Tanishq-inspired visual refinement with Amazon-style fast shopping layout.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#F7F4EF',
          light: '#FAF7F2',
          surface: '#FFFFFF',
          muted: '#F4EFEA',
          dark: '#E7DFD5',
          border: '#E7DFD5'
        },
        surface: {
          DEFAULT: '#FFFFFF',
          card: '#FFFFFF',
          muted: '#FAF7F2'
        },
        stone: {
          DEFAULT: '#F4EFEA',
          deep: '#E7DFD5',
          shade: '#DDD4C7'
        },
        ink: {
          DEFAULT: '#292421',
          soft: '#544A44',
          faint: '#7A6E66'
        },
        charcoal: {
          DEFAULT: '#292421',
          muted: '#544A44',
          light: '#7A6E66'
        },
        burgundy: {
          DEFAULT: '#571C2A',
          hover: '#441420',
          deep: '#35121C',
          accent: '#7A2437',
          muted: '#8A3B4C',
          light: '#F7ECEE',
          soft: '#F7ECEE'
        },
        gold: {
          DEFAULT: '#B49155',
          light: '#D8C29D',
          dark: '#8F7138',
          glow: 'rgba(180, 145, 85, 0.2)'
        },
        umber: '#1B1310'
      },
      fontFamily: {
        display: ['"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        serif: ['"Playfair Display"', '"Cormorant Garamond"', 'Georgia', 'serif'],
        wordmark: ['Cinzel', '"Playfair Display"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Jost', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif']
      },
      fontSize: {
        label: ['0.8125rem', { lineHeight: '1.2', letterSpacing: '0.12em' }],
        'display-sm': ['1.875rem', { lineHeight: '1.15', letterSpacing: '-0.01em' }],
        'display-md': ['2.5rem', { lineHeight: '1.1', letterSpacing: '-0.015em' }],
        'display-lg': ['3.25rem', { lineHeight: '1.05', letterSpacing: '-0.02em' }],
        'display-xl': ['4rem', { lineHeight: '1.02', letterSpacing: '-0.025em' }]
      },
      aspectRatio: {
        product: '1 / 1',
        'product-tall': '4 / 5',
        editorial: '4 / 5',
        wide: '16 / 9',
        banner: '1440 / 380'
      },
      maxWidth: {
        content: '85rem', // ~1360px
        prose: '38rem',
        wide: '90rem'     // 1440px
      },
      spacing: {
        gutter: '1rem',
        section: '3.5rem'
      },
      borderRadius: {
        sharp: '2px',
        card: '4px',
        pill: '9999px'
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(41, 36, 33, 0.05)',
        soft: '0 2px 8px -2px rgba(41, 36, 33, 0.06), 0 1px 4px -1px rgba(41, 36, 33, 0.04)',
        card: '0 4px 16px -4px rgba(41, 36, 33, 0.08), 0 2px 6px -2px rgba(41, 36, 33, 0.04)',
        'card-hover': '0 12px 24px -6px rgba(87, 28, 42, 0.12), 0 4px 10px -2px rgba(41, 36, 33, 0.06)',
        hover: '0 12px 24px -6px rgba(87, 28, 42, 0.12), 0 4px 10px -2px rgba(41, 36, 33, 0.06)',
        drawer: '-4px 0 28px -4px rgba(41, 36, 33, 0.18)',
        dialog: '0 20px 40px -8px rgba(41, 36, 33, 0.25)',
        modal: '0 20px 40px -8px rgba(41, 36, 33, 0.25)'
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }
    }
  }
};
