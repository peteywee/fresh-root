// [P2][APP][ENV] Tailwind Config
// Tags: P2, APP, ENV
module.exports = {
  content: [
    "./apps/web/**/*.{js,ts,jsx,tsx,html}",
    // add other paths if needed
  ],
  theme: {
    extend: {
      colors: {
        surface: "#1a2332",
        "surface-card": "#232f42",
        "surface-accent": "#3a4a5f",
        text: "#f2f4f8",
        "text-muted": "#b2b8cc",
        primary: "#00d4ff",
        "primary-dark": "#0099cc",
        secondary: "#d946ef",
        "secondary-dark": "#a811cc",
      },
    },
  },
  plugins: [],
};
