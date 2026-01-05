/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nature: {
          emerald: '#064E3B',
          teal: '#14B8A6',
          gold: '#FCD34D',
          forest: '#047857',
          mint: '#5EEAD4',
        }
      },
      backdropBlur: {
        'xl': '24px',
        '2xl': '40px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-lg': '0 20px 60px 0 rgba(31, 38, 135, 0.45)',
        'glow': '0 0 20px rgba(252, 211, 77, 0.4)',
        'glow-teal': '0 0 30px rgba(20, 184, 166, 0.5)',
      },
      animation: {
        'gradient-shift': 'gradient-shift 15s ease infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: 1, boxShadow: '0 0 20px rgba(252, 211, 77, 0.4)' },
          '50%': { opacity: 0.8, boxShadow: '0 0 40px rgba(252, 211, 77, 0.8)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
