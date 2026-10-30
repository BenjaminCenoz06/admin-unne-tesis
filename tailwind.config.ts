import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#f1f7f3', 100: '#dcebe1', 500: '#2f7a52', 600: '#256542', 700: '#1d5136', 900: '#0f2c1d' },
        gold: '#c9a24a',
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
export default config;
