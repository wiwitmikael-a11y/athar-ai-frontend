/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'aurora-1': 'aurora-1 20s infinite ease-in-out',
        'aurora-2': 'aurora-2 25s infinite ease-in-out',
        'aurora-3': 'aurora-3 30s infinite ease-in-out',
        'aurora-4': 'aurora-4 18s infinite ease-in-out',
        'aurora-5': 'aurora-5 22s infinite ease-in-out',
        'pulse-glow': 'pulse-glow 3s infinite ease-in-out',
        'float': 'float 6s infinite ease-in-out',
        'shimmer': 'shimmer 2s infinite linear',
        'gradient-x': 'gradient-x 3s ease infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
      },
      keyframes: {
        'aurora-1': {
          '0%, 100%': { 
            transform: 'translateX(-50%) translateY(-50%) scale(1) rotate(0deg)',
            opacity: '0.4'
          },
          '25%': { 
            transform: 'translateX(-30%) translateY(-70%) scale(1.3) rotate(90deg)',
            opacity: '0.6'
          },
          '50%': { 
            transform: 'translateX(-70%) translateY(-30%) scale(1.1) rotate(180deg)',
            opacity: '0.8'
          },
          '75%': { 
            transform: 'translateX(-40%) translateY(-60%) scale(1.4) rotate(270deg)',
            opacity: '0.5'
          },
        },
        'aurora-2': {
          '0%, 100%': { 
            transform: 'translateX(-25%) translateY(-25%) scale(1.2) rotate(45deg)',
            opacity: '0.3'
          },
          '33%': { 
            transform: 'translateX(-60%) translateY(-50%) scale(0.9) rotate(135deg)',
            opacity: '0.7'
          },
          '66%': { 
            transform: 'translateX(-20%) translateY(-70%) scale(1.5) rotate(225deg)',
            opacity: '0.5'
          },
        },
        'aurora-3': {
          '0%, 100%': { 
            transform: 'translateX(-25%) translateY(-25%) scale(1) rotate(0deg)',
            opacity: '0.5'
          },
          '40%': { 
            transform: 'translateX(-10%) translateY(-60%) scale(1.3) rotate(120deg)',
            opacity: '0.8'
          },
          '80%': { 
            transform: 'translateX(-50%) translateY(-20%) scale(1.1) rotate(240deg)',
            opacity: '0.4'
          },
        },
        'aurora-4': {
          '0%, 100%': { 
            transform: 'translateX(-60%) translateY(-40%) scale(1.1) rotate(30deg)',
            opacity: '0.4'
          },
          '50%': { 
            transform: 'translateX(-20%) translateY(-80%) scale(1.4) rotate(210deg)',
            opacity: '0.7'
          },
        },
        'aurora-5': {
          '0%, 100%': { 
            transform: 'translateX(-80%) translateY(-60%) scale(0.8) rotate(60deg)',
            opacity: '0.6'
          },
          '30%': { 
            transform: 'translateX(-40%) translateY(-20%) scale(1.2) rotate(150deg)',
            opacity: '0.4'
          },
          '70%': { 
            transform: 'translateX(-10%) translateY(-50%) scale(1.5) rotate(300deg)',
            opacity: '0.8'
          },
        },
        'pulse-glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 30px rgba(139, 92, 246, 0.5), 0 0 60px rgba(139, 92, 246, 0.2)',
            transform: 'scale(1.02)'
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'gradient-x': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      colors: {
        aurora: {
          purple: '#8B5CF6',
          blue: '#3B82F6', 
          cyan: '#06B6D4',
          emerald: '#10B981',
          pink: '#EC4899',
          violet: '#7C3AED',
          indigo: '#6366F1',
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-lg': '0 0 40px rgba(139, 92, 246, 0.4)',
        'inner-glow': 'inset 0 0 20px rgba(255, 255, 255, 0.1)',
      }
    },
  },
  plugins: [],
}
