/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#6B2D5C",
        secondary: "#C4A56A",
        accent: "#8B4789",
        "background-light": "#FAFAFA",
        "background-dark": "#1A1A1A",
        "catalog-bg": "#FFFFFF",
        "cart-bg": "#F5F5F7",
        "gold": "#C4A56A",
        "gold-dark": "#9B8558",
        "purple-light": "#8B4789",
        "purple-dark": "#4A1E42",
        // Apple-inspired grays
        "gray-50": "#FAFAFA",
        "gray-100": "#F5F5F7",
        "gray-200": "#E8E8ED",
        "gray-300": "#D2D2D7",
        "gray-400": "#AEAEB2",
        "gray-500": "#86868B",
        "gray-600": "#6E6E73",
        "gray-700": "#48484A",
        "gray-800": "#2C2C2E",
        "gray-900": "#1C1C1E",
      },
      fontFamily: {
        display: ["Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        // Apple-style subtle shadows
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'sm': '0 2px 4px 0 rgba(0, 0, 0, 0.06)',
        'DEFAULT': '0 4px 6px -1px rgba(0, 0, 0, 0.08)',
        'md': '0 6px 12px -2px rgba(0, 0, 0, 0.10)',
        'lg': '0 10px 20px -3px rgba(0, 0, 0, 0.12)',
        'xl': '0 20px 30px -5px rgba(0, 0, 0, 0.15)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 8px 16px rgba(0, 0, 0, 0.12)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}


