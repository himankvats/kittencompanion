/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // TODO: Add custom brand colours, fonts, and spacing as needed
      colors: {
        primary: '#4F46E5',   // indigo-600
        secondary: '#F59E0B', // amber-500
      },
    },
  },
  plugins: [],
};
