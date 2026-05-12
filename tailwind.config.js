/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './hooks/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        cream: '#FFF8F0',
        peach: '#FFBF9B',
        sage: '#B8D4B8',
        lavender: '#C9BEE8',
        honey: '#F7CE6B',
        blush: '#F2B8C6',
      },
    },
  },
  plugins: [],
};
