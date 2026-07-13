/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        moana: {
          orange: '#F5A54A',
          'orange-dark': '#E8943A',
          'orange-light': '#FFD4A0',
          teal: '#A8D5C8',
          'teal-dark': '#7DBFB0',
          blue: '#1A5C8A',
          'blue-light': '#2E86C1',
          'blue-pale': '#EBF5FB',
          cream: '#FFF8F0',
          dark: '#1A1A2E',
          gray: '#555E6E',
        }
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-moana': 'linear-gradient(135deg, #1A5C8A 0%, #2E86C1 50%, #A8D5C8 100%)',
        'gradient-orange': 'linear-gradient(135deg, #F5A54A 0%, #E8943A 100%)',
        'gradient-hero': 'linear-gradient(to bottom, rgba(26,92,138,0.5) 0%, rgba(26,92,138,0.2) 50%, rgba(26,92,138,0.6) 100%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'slide-in-right': 'slideInRight 0.3s ease-out forwards',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        'moana': '0 4px 24px rgba(26,92,138,0.15)',
        'moana-orange': '0 4px 24px rgba(245,165,74,0.3)',
        'card': '0 2px 16px rgba(0,0,0,0.08)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.16)',
      },
    },
  },
  plugins: [],
}
