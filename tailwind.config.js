/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        admin: {
          main: "var(--bg-main)",
          card: "var(--bg-card)",
          hover: "var(--bg-card-hover)",
          surface: "var(--bg-surface)",
          primary: "var(--primary)",
          "primary-hover": "var(--primary-hover)",
          "primary-glow": "var(--primary-glow)",
          muted: "var(--text-muted)",
          subtle: "var(--text-subtle)",
          success: "var(--success)",
          "success-bg": "var(--success-bg)",
          warning: "var(--warning)",
          "warning-bg": "var(--warning-bg)",
          danger: "var(--danger)",
          "danger-bg": "var(--danger-bg)",
          border: ({ opacityValue }) =>
            opacityValue !== undefined
              ? `rgba(244, 114, 182, ${opacityValue})`
              : "rgba(244, 114, 182, 0.35)",
          "border-hover": ({ opacityValue }) =>
            opacityValue !== undefined
              ? `rgba(244, 114, 182, ${opacityValue})`
              : "rgba(244, 114, 182, 0.65)",
        },
      },
      borderRadius: {
        admin: "var(--radius-sm)",
        "admin-md": "var(--radius-md)",
        "admin-lg": "var(--radius-lg)",
      },
      boxShadow: {
        admin: "var(--shadow-card)",
        glow: "var(--shadow-glow)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        display: ["Outfit", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
