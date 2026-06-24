/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  theme: {
    extend: {
      colors: {
        navy: '#0D1429',
        ink: '#10162A',
        mist: '#F5F0E7',
        cream: '#FBF8F1',
        muted: '#77736F',
        warmborder: '#D6CEC3',
        success: '#61B982',
        warning: '#D3A91D',
        danger: '#FF684F',
        royal: '#3158E8',
        mint: '#8CE0AE',
        lavender: '#B9A0F6',
      },
      boxShadow: {
        panel: '0 12px 32px rgba(16, 22, 42, 0.10)',
      },
    },
  },
  plugins: [],
};
