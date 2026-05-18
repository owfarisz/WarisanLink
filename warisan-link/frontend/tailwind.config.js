/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        warisan: {
          gold: '#e2b96f',
          dark: '#1a1a2e',
          cream: '#f5f0e8',
          green: '#22c55e',
          amber: '#f59e0b',
          red: '#ef4444',
        },
      },
      fontFamily: {
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
      },
    },
  },
  plugins: [],
};
