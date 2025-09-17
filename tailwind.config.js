/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        'aurora-1': 'aurora-1 12s infinite ease-in-out',
        'aurora-2': 'aurora-2 15s infinite ease-in-out',
        'aurora-3': 'aurora-3 10s infinite ease-in-out',
      },
      keyframes: {
        'aurora-1': {
          '0%, 100%': { transform: 'translateX(-50%) translateY(-50%) scale(1)' },
          '50%': { transform: 'translateX(-30%) translateY(-70%) scale(1.2)' },
        },
        'aurora-2': {
          '0%, 100%': { transform: 'translateX(-25%) translateY(-25%) scale(1)' },
          '50%': { transform: 'translateX(-50%) translateY(-50%) scale(1.1)' },
        },
        'aurora-3': {
          '0%, 100%': { transform: 'translateX(-25%) translateY(-25%) scale(1.2)' },
          '50%': { transform: 'translateX(-10%) translateY(-40%) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
