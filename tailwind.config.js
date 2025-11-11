const defaultTheme = require('tailwindcss/defaultTheme')
module.exports = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['Karla', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: '#232323',
        secondary: '#EF5AC1',
        third: '#83DE7A',
        background: '#f6f6f6'
      },
      spacing: {
        '100': '30rem',
        '128': '49rem',
      },
      screens: {
        'sm': '640px',

        'md': '768px',

        'lg': '1024px',

        'xl': '1280px',

        '2xl': '1536px',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      },
    },
  },
  plugins: [],
}
