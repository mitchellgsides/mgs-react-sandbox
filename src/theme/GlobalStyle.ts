import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  html {
    font-size: 16px; /* Base font size */
  }

  body {
    margin: 0;
    padding: 0;
    font-family: ${({ theme }) => theme.fonts.main};
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.5;
    min-height: 100vh;
    width: 100%;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.fonts.heading};
    margin-top: 0;
    color: ${({ theme }) => theme.colors.text};
  }

  h1 {
    font-size: 2rem;
    font-weight: 700;
  }

  h2 {
    font-size: 1.75rem;
    font-weight: 600;
  }

  h3 {
    font-size: 1.5rem;
    font-weight: 600;
  }

  h4 {
    font-size: 1.25rem;
    font-weight: 600;
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      text-decoration: none;
      color: ${({ theme }) => theme.colors.secondary};
    }
  }

  button, input, textarea, select {
    font-family: ${({ theme }) => theme.fonts.main};
  }

  button {
    cursor: pointer;
  }

  /* Remove default styling from lists */
  ul, ol {
    padding-left: 1.5rem;
    margin: 0.5rem 0;
  }
  
  /* Remove default styling from fieldsets */
  fieldset {
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius};
    padding: ${({ theme }) => theme.spacing.sm};
    margin: 0;
  }
  
  /* Style for form elements */
  input, select, textarea {
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius};
    padding: ${({ theme }) => theme.spacing.sm};
  }
`;

export default GlobalStyle;
