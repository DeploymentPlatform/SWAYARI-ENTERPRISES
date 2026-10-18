/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        ivory: {
          light: '#FDFBF7',
          DEFAULT: '#FAF7F2',
          surface: '#FAF7F2',
          muted: '#F4EFEB',
          border: '#E8E0D5',
          dark: '#EFE9DF'
        },
        burgundy: {
          DEFAULT: '#5C1D24',
          deep: '#421217',
          hover: '#4A161D',
          light: '#FBF0F1',
          accent: '#78262F',
          muted: '#8C3B44'
        },
        gold: {
          DEFAULT: '#C49A45',
          light: '#E8D29E',
          dark: '#9E782F',
          glow: 'rgba(196, 154, 69, 0.18)'
        },
        charcoal: {
          DEFAULT: '#2B2625',
          muted: '#6B6362',
          light: '#9E9493'
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        display: ['"Cinzel"', '"Playfair Display"', 'serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif']
      },
      boxShadow: {
        'subtle': '0 2px 8px -2px rgba(43, 38, 37, 0.05), 0 1px 4px -1px rgba(43, 38, 37, 0.03)',
        'card': '0 4px 20px -2px rgba(92, 29, 36, 0.06), 0 2px 6px -1px rgba(43, 38, 37, 0.04)',
        'card-hover': '0 14px 34px -4px rgba(92, 29, 36, 0.12), 0 6px 14px -2px rgba(43, 38, 37, 0.06)',
        'gold-glow': '0 0 24px rgba(196, 154, 69, 0.22)'
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.16, 1, 0.3, 1)'
      }
    }
  }
};
