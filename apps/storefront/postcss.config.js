import path from 'path';

export default {
  plugins: {
    tailwindcss: {
      config: path.resolve(process.cwd(), 'apps/storefront/tailwind.config.js')
    },
    autoprefixer: {}
  }
};
