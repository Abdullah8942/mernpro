/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8f6',
          100: '#f9ece6',
          200: '#f3d4c6',
          300: '#e9b69d',
          400: '#dc8f6d',
          500: '#c96d4a',
          600: '#b5553a',
          700: '#964430',
          800: '#7a3a2c',
          900: '#653428',
          950: '#371914',
        },
        secondary: {
          50: '#f8f7f4',
          100: '#efede5',
          200: '#ded9ca',
          300: '#c9c0a8',
          400: '#b2a385',
          500: '#a08d6b',
          600: '#937c5f',
          700: '#7a6650',
          800: '#655545',
          900: '#54473b',
          950: '#2d251e',
        },
        accent: {
          50: '#fef5f6',
          100: '#fde8ea',
          200: '#fcd5da',
          300: '#f9b3bc',
          400: '#f48694',
          500: '#e95c6f',
          600: '#d43d55',
          700: '#b22e45',
          800: '#952940',
          900: '#7f273c',
          950: '#46111c',
        },
        gold: {
          50: '#fbf9f1',
          100: '#f5f0dc',
          200: '#ebe0b8',
          300: '#ddc98c',
          400: '#d1b165',
          500: '#c49a48',
          600: '#af7d3a',
          700: '#916132',
          800: '#774e2e',
          900: '#624128',
          950: '#372113',
        }
      },
      fontFamily: {
        'display': ['Playfair Display', 'serif'],
        'body': ['Poppins', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-up': 'scaleUp 0.3s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'bounce-slow': 'bounceSlow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleUp: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
