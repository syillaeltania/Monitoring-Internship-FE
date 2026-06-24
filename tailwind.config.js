/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        navy: '#0f2f5f',
        ink: '#1F2937',
        mist: '#EEF3F7',
        success: '#1f9d6a',
        warning: '#d98c00',
        danger: '#c2413a',
      },
      boxShadow: {
        panel: '0 4px 16px rgba(15, 23, 42, 0.06)',
      },
    },
  },
  plugins: [],
};
