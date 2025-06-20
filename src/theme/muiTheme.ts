import { createTheme, type ThemeOptions } from "@mui/material/styles";
import {
  lightTheme as styledLightTheme,
  darkTheme as styledDarkTheme,
} from "./theme";

// Create MUI theme based on our styled-components theme
const createMuiTheme = (mode: "light" | "dark") => {
  const styledTheme = mode === "light" ? styledLightTheme : styledDarkTheme;

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: styledTheme.colors.primary,
        light: mode === "light" ? "#e57373" : "#ff6b6b",
        dark: mode === "light" ? "#8b0000" : "#8b0000",
        contrastText: "#ffffff",
      },
      secondary: {
        main: styledTheme.colors.secondary,
        light: mode === "light" ? "#bcaaa4" : "#a1887f",
        dark: mode === "light" ? "#5d4037" : "#3e2723",
        contrastText: mode === "light" ? "#000000" : "#ffffff",
      },
      error: {
        main: styledTheme.colors.danger,
        light: "#ef5350",
        dark: "#c62828",
        contrastText: "#ffffff",
      },
      warning: {
        main: styledTheme.colors.warning,
        light: "#ffeb3b",
        dark: "#f57c00",
        contrastText: "#000000",
      },
      info: {
        main: styledTheme.colors.info,
        light: mode === "light" ? "#4fc3f7" : "#81c784",
        dark: mode === "light" ? "#0277bd" : "#388e3c",
        contrastText: "#ffffff",
      },
      success: {
        main: styledTheme.colors.success,
        light: "#81c784",
        dark: "#388e3c",
        contrastText: "#ffffff",
      },
      background: {
        default: styledTheme.colors.background,
        paper: styledTheme.colors.surface,
      },
      text: {
        primary: styledTheme.colors.text,
        secondary:
          mode === "light" ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.7)",
        disabled:
          mode === "light" ? "rgba(0, 0, 0, 0.38)" : "rgba(255, 255, 255, 0.5)",
      },
      divider: styledTheme.colors.border,
      grey:
        mode === "light"
          ? {
              50: "#fafafa",
              100: "#f5f5f5",
              200: "#eeeeee",
              300: "#e0e0e0",
              400: "#bdbdbd",
              500: "#9e9e9e",
              600: "#757575",
              700: "#616161",
              800: "#424242",
              900: "#212121",
            }
          : {
              50: "#fafafa",
              100: "#f5f5f5",
              200: "#eeeeee",
              300: "#e0e0e0",
              400: "#bdbdbd",
              500: "#9e9e9e",
              600: "#757575",
              700: "#616161",
              800: "#424242",
              900: "#212121",
            },
    },
    typography: {
      fontFamily: styledTheme.fonts.main,
      h1: {
        fontFamily: styledTheme.fonts.heading,
        fontWeight: 700,
        fontSize: "2rem",
        lineHeight: 1.167,
        letterSpacing: "-0.01562em",
      },
      h2: {
        fontFamily: styledTheme.fonts.heading,
        fontWeight: 600,
        fontSize: "1.75rem",
        lineHeight: 1.2,
        letterSpacing: "-0.00833em",
      },
      h3: {
        fontFamily: styledTheme.fonts.heading,
        fontWeight: 600,
        fontSize: "1.5rem",
        lineHeight: 1.167,
        letterSpacing: "0em",
      },
      h4: {
        fontFamily: styledTheme.fonts.heading,
        fontWeight: 600,
        fontSize: "1.25rem",
        lineHeight: 1.235,
        letterSpacing: "0.00735em",
      },
      h5: {
        fontFamily: styledTheme.fonts.heading,
        fontWeight: 600,
        fontSize: "1.125rem",
        lineHeight: 1.334,
        letterSpacing: "0em",
      },
      h6: {
        fontFamily: styledTheme.fonts.heading,
        fontWeight: 600,
        fontSize: "1rem",
        lineHeight: 1.6,
        letterSpacing: "0.0075em",
      },
      body1: {
        fontFamily: styledTheme.fonts.main,
        fontWeight: 400,
        fontSize: "1rem",
        lineHeight: 1.5,
        letterSpacing: "0.00938em",
      },
      body2: {
        fontFamily: styledTheme.fonts.main,
        fontWeight: 400,
        fontSize: "0.875rem",
        lineHeight: 1.43,
        letterSpacing: "0.01071em",
      },
      button: {
        fontFamily: styledTheme.fonts.main,
        fontWeight: 600,
        fontSize: "0.875rem",
        lineHeight: 1.75,
        letterSpacing: "0.02857em",
        textTransform: "none",
      },
      caption: {
        fontFamily: styledTheme.fonts.main,
        fontWeight: 400,
        fontSize: "0.75rem",
        lineHeight: 1.66,
        letterSpacing: "0.03333em",
      },
      overline: {
        fontFamily: styledTheme.fonts.main,
        fontWeight: 400,
        fontSize: "0.75rem",
        lineHeight: 2.66,
        letterSpacing: "0.08333em",
        textTransform: "uppercase",
      },
    },
    spacing: 8, // MUI uses 8px as base spacing unit
    shape: {
      borderRadius: 4, // Convert rem to px (0.25rem = 4px)
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 576,
        md: 768,
        lg: 992,
        xl: 1200,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: styledTheme.borderRadius,
            textTransform: "none",
            fontWeight: 600,
            padding: `${styledTheme.spacing.sm} ${styledTheme.spacing.md}`,
            "&:hover": {
              transform: "translateY(-1px)",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
            },
          },
          contained: {
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            "&:hover": {
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            },
          },
          outlined: {
            borderWidth: "1px",
            "&:hover": {
              borderWidth: "1px",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: styledTheme.borderRadius,
            border: `1px solid ${styledTheme.colors.border}`,
            boxShadow:
              mode === "light"
                ? "0 2px 8px rgba(0, 0, 0, 0.1)"
                : "0 2px 8px rgba(0, 0, 0, 0.3)",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-root": {
              borderRadius: styledTheme.borderRadius,
              "& fieldset": {
                borderColor: styledTheme.colors.border,
              },
              "&:hover fieldset": {
                borderColor: styledTheme.colors.primary,
              },
              "&.Mui-focused fieldset": {
                borderColor: styledTheme.colors.primary,
                borderWidth: "2px",
              },
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: styledTheme.colors.primary,
            color: styledTheme.colors.light,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: styledTheme.colors.surface,
            border: `1px solid ${styledTheme.colors.border}`,
          },
        },
      },
      MuiList: {
        styleOverrides: {
          root: {
            backgroundColor: styledTheme.colors.surface,
          },
        },
      },
      MuiListItem: {
        styleOverrides: {
          root: {
            borderRadius: styledTheme.borderRadius,
            margin: `${styledTheme.spacing.xs} 0`,
            "&:hover": {
              backgroundColor:
                mode === "light"
                  ? "rgba(0, 0, 0, 0.04)"
                  : "rgba(255, 255, 255, 0.08)",
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: styledTheme.borderRadius,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: styledTheme.borderRadius,
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
};

export const lightMuiTheme = createMuiTheme("light");
export const darkMuiTheme = createMuiTheme("dark");
