/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./app/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        bg: '#F9F9F9',
        card: '#FFFFFF',
        primary: '#111111',
        secondary: '#6B7280',
        accent: '#1F2937',
        border: '#E5E7EB'
      }
    }
  },
  plugins: []
}
