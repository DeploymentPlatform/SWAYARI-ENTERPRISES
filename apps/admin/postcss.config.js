import path from 'path';

export default {
  plugins: {
    tailwindcss: {
      config: path.resolve(process.cwd(), 'apps/admin/tailwind.config.js')
    },
    autoprefixer: {}
  }
};
