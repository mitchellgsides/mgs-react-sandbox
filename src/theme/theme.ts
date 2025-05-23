import type { DefaultTheme } from "styled-components";

export const lightTheme: DefaultTheme = {
  colors: {
    primary: "#b61a1a", // Deeper Red
    secondary: "#8b4949", // Lighter Red
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
    main: "'Inter', 'Lexend', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    heading:
      "'Lexend', 'Montserrat', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
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

export const darkTheme: DefaultTheme = {
  colors: {
    primary: "#b61a1a", // Deeper Red for dark mode
    secondary: "#8b4949", // Lighter Red for dark mode
    success: "#198754", // Keep or adjust if needed
    danger: "#dc3545", // This is already red, ensure distinctness or adjust
    warning: "#ffc107", // Keep or adjust if needed
    info: "#757575", // Neutral info color (gray)
    light: "#adb5bd", // Used for lighter text or elements on dark backgrounds
    dark: "#f8f9fa", // This was for text/elements on dark, might need review if it was for surfaces
    text: "#dee2e6", // Main text (light gray/off-white)
    /* original dark theme, very dark
    background: "#171212", // Page background (very dark gray/black)
    surface: "#1c1c1c", // Card/Section background (dark gray)
    border: "#1c1c1c", // Border color (medium-dark gray)
    */
    background: "#1e1a1a", // Page background (slightly lighter dark gray)
    surface: "#252525", // Card/Section background (lighter dark gray)
    border: "#323232", // Border color (medium gray with slight contrast)
  },
  fonts: {
    main: "'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
    heading:
      "'Montserrat', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif",
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
