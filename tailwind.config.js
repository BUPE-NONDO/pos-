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
        "background-light": "#FAF9F7",
        "background-dark": "#1A0F1A",
        "catalog-bg": "#FFFFFF",
        "cart-bg": "#F8F6F3",
        "gold": "#C4A56A",
        "gold-dark": "#9B8558",
        "purple-light": "#8B4789",
        "purple-dark": "#4A1E42",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Inter", "sans-serif"],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-purple-gold': 'linear-gradient(135deg, #6B2D5C 0%, #8B4789 50%, #C4A56A 100%)',
        'gradient-gold-purple': 'linear-gradient(135deg, #C4A56A 0%, #8B4789 50%, #6B2D5C 100%)',
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        'glow-purple': '0 0 20px rgba(107, 45, 92, 0.3)',
        'glow-gold': '0 0 20px rgba(196, 165, 106, 0.3)',
        'premium': '0 10px 40px rgba(107, 45, 92, 0.15)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}


