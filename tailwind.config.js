/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Zenhand', 'var(--font-cormorant)', 'Georgia', 'Times New Roman', 'serif'],
        body: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['var(--font-cormorant)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', '-apple-system', 'sans-serif'],
      },
      colors: {
        vermilion: '#ee4a44',
        'salmon-pink': '#fc7472',
        lion: '#ab874a',
        flax: '#fced87',
        pistachio: '#b5cf73',
        'fern-green': '#599c2a',
        'vista-blue': '#a3a4e1',
        thistle: '#dcd0f1',
        'delft-blue': '#1d1f2c',
        'cobalt-blue': '#3b66f3',
        indigo: '#5e5372',
        'surface-dark': '#0f1117',
        'surface-elevated': '#1a1d28',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'scale-in': 'scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'blur-in': 'blurIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulseSlow 4s ease-in-out infinite',
        'gradient': 'gradientShift 8s ease infinite',
      },
      keyframes: {
        fadeIn: {
          to: { opacity: 1 },
        },
        fadeInUp: {
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        slideUp: {
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        scaleIn: {
          to: { opacity: 1, transform: 'scale(1)' },
        },
        blurIn: {
          to: { opacity: 1, filter: 'blur(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseSlow: {
          '0%, 100%': { opacity: 0.4, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(1.05)' },
        },
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
