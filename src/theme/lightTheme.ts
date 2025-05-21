import type { DefaultTheme } from "styled-components";

const lightTheme: DefaultTheme = {
  colors: {
    primary: "#B71C1C", // Deeper Red
    secondary: "#E57373", // Lighter Red
    success: "#28a745",
    danger: "#dc3545", // This is already a red, you might want to adjust if it clashes
    warning: "#ffc107",
    info: "#17a2b8", // You might want to choose a neutral info color or one that complements red
    light: "#f8f9fa",
    dark: "#343a40",
    text: "#212529", // Main text
    background: "#ffffff", // Page background
    surface: "#ffffff", // Card/Section background
    border: "#dee2e6",
  },
  fonts: {
    main: "Arial, sans-serif",
    heading: "Georgia, serif",
  },
  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
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

export default lightTheme;
