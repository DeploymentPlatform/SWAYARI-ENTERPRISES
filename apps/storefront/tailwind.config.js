import preset from '../../packages/ui/src/tailwind-preset.cjs';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [preset],
  content: [
    './apps/storefront/index.html',
    './apps/storefront/src/**/*.{js,ts,jsx,tsx}',
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './packages/ui/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {}
  },
  plugins: []
};
