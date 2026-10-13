/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Royal purple brand — matches the logo
        brand: {
          50:  '#FAF5FF',
          100: '#F3E8FF',
          200: '#E9D5FF',
          300: '#D8B4FE',
          400: '#C084FC',
          500: '#A855F7',
          600: '#9333EA',
          700: '#7C3AED',
          800: '#6D28D9',
          900: '#5B21B6',
        },
        // Dark background palette — deep charcoal/near-black (not navy blue)
        dark: {
          50:  '#F8F8F8',
          100: '#EBEBEB',
          200: '#D4D4D4',
          300: '#A8A8A8',
          400: '#737373',
          500: '#525252',
          600: '#3D3D3D',
          700: '#2A2A2A',
          800: '#1A1A1A',
          900: '#0F0F0F',
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #C084FC 0%, #7C3AED 100%)',
        'brand-gradient-dark': 'linear-gradient(135deg, #A855F7 0%, #6D28D9 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(8px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};
