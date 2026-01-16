/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Design System: Real Estate Dashboard
        primary: {
          DEFAULT: '#0F766E',
          light: '#14B8A6',
          dark: '#134E4A',
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          800: '#115E59',
          900: '#134E4A',
        },
        accent: {
          DEFAULT: '#0369A1',
          light: '#0EA5E9',
          dark: '#075985',
          gold: '#D4AF37',
        },
        surface: {
          DEFAULT: '#F0FDFA',
          glass: 'rgba(255, 255, 255, 0.8)',
          'glass-dark': 'rgba(15, 118, 110, 0.1)',
        },
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        sans: ['Josefin Sans', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(15, 118, 110, 0.1)',
        'glass-lg': '0 16px 48px 0 rgba(15, 118, 110, 0.15)',
        'glass-xl': '0 24px 64px 0 rgba(15, 118, 110, 0.2)',
        'soft': '0 4px 20px -4px rgba(15, 118, 110, 0.1)',
        'soft-lg': '0 8px 30px -6px rgba(15, 118, 110, 0.15)',
        'glow': '0 0 40px rgba(20, 184, 166, 0.3)',
      },
      backdropBlur: {
        'glass': '16px',
      },
      animation: {
        'fade-in': 'fadeIn 300ms ease-out',
        'slide-up': 'slideUp 300ms ease-out',
        'slide-down': 'slideDown 300ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
