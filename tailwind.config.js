/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./app/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: '#F5F5DC',
        card: '#FAF0E6',
        primary: '#000000',
        secondary: '#333333',
        accent: '#000000',
        border: '#D3C6AA'
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      }
    }
  },
  plugins: []
}
