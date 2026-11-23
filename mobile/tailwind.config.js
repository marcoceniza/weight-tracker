/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      boxShadow: {
        'aura-sm': '0 4px 14px -2px rgba(76, 53, 222, 0.08)',
        aura: '0 8px 24px -4px rgba(76, 53, 222, 0.06)',
        'aura-glow': '0 8px 20px -2px rgba(76, 53, 222, 0.28)',
        'aura-sheet': '0 16px 36px -6px rgba(76, 53, 222, 0.12)'
      }
    }
  },
  plugins: []
};
