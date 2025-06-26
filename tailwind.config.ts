/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        screens: {
          'xs': '375px', // iPhone SE
          'sm': '640px',
          'md': '768px',
          'lg': '1024px', // Nest Hub Max
          'xl': '1280px',
          '2xl': '1536px',
        },
        spacing: {
          '18': '4.5rem',
          '88': '22rem',
        }
      },
    },
    plugins: [],
  }
  
  