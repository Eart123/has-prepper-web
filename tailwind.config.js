/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        has: {
          blue: '#006699',
          orange: '#DD6900',
          darkBlue: '#3F7FAD',
          lightBlue: '#C7D0D7',
          bg: '#E5E5E5',
          cardBg: '#EFEFEF',
          cardBg2: '#DEE3E7',
          cardBg3: '#D1D7DC',
          border: '#98AAB1',
          text: '#000',
          textMuted: '#555',
          red: '#B00000',
          gold: '#F2B935',
          goldLight: '#FFE38A',
          goldDark: '#B07F12',
          green: '#E2451D',
        }
      },
      fontFamily: {
        sans: ['Verdana', 'Tahoma', 'Arial', 'sans-serif'],
        heading: ['"Trebuchet MS"', 'Verdana', 'sans-serif'],
      },
      fontSize: {
        'xs': '10px',
        'sm': '11px',
        'base': '11px',
        'lg': '12px',
        'xl': '13px',
        '2xl': '14px',
        '3xl': '16px',
        '4xl': '22px',
        '5xl': '26px',
      },
    },
  },
  plugins: [],
}