import type { DefaultTheme } from "styled-components";

const darkTheme: DefaultTheme = {
  colors: {
    primary: "#D32F2F", // Deeper Red for dark mode
    secondary: "#EF5350", // Lighter Red for dark mode
    success: "#198754", // Keep or adjust if needed
    danger: "#dc3545", // This is already red, ensure distinctness or adjust
    warning: "#ffc107", // Keep or adjust if needed
    info: "#757575", // Neutral info color (gray)
    light: "#adb5bd", // Used for lighter text or elements on dark backgrounds
    dark: "#f8f9fa", // This was for text/elements on dark, might need review if it was for surfaces
    text: "#dee2e6", // Main text (light gray/off-white)
    background: "#212529", // Page background (very dark gray/black)
    surface: "#343a40", // Card/Section background (dark gray)
    border: "#495057", // Border color (medium-dark gray)
  },
  fonts: {
    main: "Arial, sans-serif",
    heading: "Georgia, serif",
  },
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "1rem",
    lg: "1.5rem",
    xl: "2rem",
  },
  breakpoints: {
    xs: "0px",
    sm: "576px",
    md: "768px",
    lg: "992px",
    xl: "1200px",
  },
  borderRadius: "0.25rem",
};

export default darkTheme;
