 
/** @type {import('tailwindcss').Config} */
export default { // Note: Vite uses 'export default' instead of 'module.exports'
  content: [
    "./index.html", // Crucial for Vite to scan your main HTML
    "./src/**/*.{js,ts,jsx,tsx}", // Ensure .jsx is included for React components
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}