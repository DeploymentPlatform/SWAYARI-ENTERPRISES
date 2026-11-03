/**
 * SWAYARI design tokens shared by both portals.
 * Design direction: "temple-luxe" — warm ivory paper, deep oxblood and antique gold, an elegant
 * Cormorant display serif, generous whitespace and calm, purposeful motion.
 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        ivory: {
          DEFAULT: '#F8F4EC',
          light: '#FCFAF5',
          surface: '#FFFFFF',
          muted: '#F3ECE0',
          dark: '#E8DDCB',
          border: '#E6DACB'
        },
        surface: {
          DEFAULT: '#FFFFFF',
          card: '#FFFFFF',
          muted: '#FCFAF5'
        },
        stone: {
          DEFAULT: '#F3ECE0',
          deep: '#E6DACB',
          shade: '#D8CAB6'
        },
        ink: {
          DEFAULT: '#211A17',
          soft: '#5A4E47',
          faint: '#857870'
        },
        charcoal: {
          DEFAULT: '#211A17',
          muted: '#5A4E47',
          light: '#857870'
        },
        burgundy: {
          DEFAULT: '#5E1A28',
          hover: '#4A1320',
          deep: '#2E0C14',
          accent: '#7C2236',
          muted: '#8F3A4D',
          light: '#F6EBEC',
          soft: '#F6EBEC'
        },
        gold: {
          DEFAULT: '#B8924A',
          light: '#E3CC9A',
          pale: '#F4EAD3',
          dark: '#8C6B2E',
          glow: 'rgba(184, 146, 74, 0.22)'
        },
        umber: '#170F0C'
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        wordmark: ['Cinzel', '"Cormorant Garamond"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif']
      },
      fontSize: {
        label: ['0.75rem', { lineHeight: '1.2', letterSpacing: '0.16em' }],
        'display-sm': ['2rem', { lineHeight: '1.1', letterSpacing: '-0.01em' }],
        'display-md': ['2.75rem', { lineHeight: '1.05', letterSpacing: '-0.015em' }],
        'display-lg': ['3.75rem', { lineHeight: '1.02', letterSpacing: '-0.02em' }],
        'display-xl': ['4.75rem', { lineHeight: '0.98', letterSpacing: '-0.025em' }]
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
        section: '5rem'
      },
      borderRadius: {
        sharp: '6px',
        card: '18px',
        pill: '9999px'
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(33, 26, 23, 0.05)',
        soft: '0 2px 10px -2px rgba(33, 26, 23, 0.06), 0 1px 4px -1px rgba(33, 26, 23, 0.04)',
        card: '0 1px 0 rgba(255,255,255,0.8) inset, 0 6px 24px -10px rgba(46, 12, 20, 0.14), 0 2px 6px -2px rgba(33, 26, 23, 0.05)',
        'card-hover': '0 24px 48px -18px rgba(94, 26, 40, 0.28), 0 8px 18px -8px rgba(33, 26, 23, 0.10)',
        hover: '0 24px 48px -18px rgba(94, 26, 40, 0.28), 0 8px 18px -8px rgba(33, 26, 23, 0.10)',
        gold: '0 0 0 1px rgba(184, 146, 74, 0.35), 0 10px 30px -12px rgba(184, 146, 74, 0.45)',
        drawer: '-12px 0 40px -8px rgba(23, 15, 12, 0.25)',
        dialog: '0 30px 60px -12px rgba(23, 15, 12, 0.35)',
        modal: '0 30px 60px -12px rgba(23, 15, 12, 0.35)'
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.16, 1, 0.3, 1)'
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        },
        'ken-burns': {
          '0%': { transform: 'scale(1.0) translate3d(0,0,0)' },
          '100%': { transform: 'scale(1.08) translate3d(-1%, -1%, 0)' }
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        'fade-up': 'fade-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.6s ease-out both',
        shimmer: 'shimmer 2.2s linear infinite',
        'ken-burns': 'ken-burns 14s ease-out both',
        marquee: 'marquee 40s linear infinite',
        float: 'float 5s ease-in-out infinite',
        'spin-slow': 'spin-slow 24s linear infinite'
      }
    }
  }
};
