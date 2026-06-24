/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        navy: '#0f2f5f',
        ink: '#172033',
        mist: '#f4f7fb',
        success: '#1f9d6a',
        warning: '#d98c00',
        danger: '#c2413a',
      },
      boxShadow: {
        panel: '0 12px 30px rgba(15, 47, 95, 0.08)',
      },
    },
  },
  plugins: [],
};
