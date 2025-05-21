import React from "react";
import styled, { css } from "styled-components";

// Define Size and Variant types
type ButtonVariant = "primary" | "secondary" | "oauth";
type ButtonSize = "sm" | "md" | "lg";

// Define Props interface for the Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  title?: string; // Optional title, children can also be used
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  children?: React.ReactNode; // Allow children for more complex content like icons + text
}

// Helper function to darken a hex color
const darkenColor = (color: string, amount: number): string => {
  let usePound = false;
  if (color[0] === "#") {
    color = color.slice(1);
    usePound = true;
  }
  const num = parseInt(color, 16);
  let r = (num >> 16) - amount;
  if (r > 255) r = 255;
  else if (r < 0) r = 0;
  let b = ((num >> 8) & 0x00ff) - amount;
  if (b > 255) b = 255;
  else if (b < 0) b = 0;
  let g = (num & 0x0000ff) - amount;
  if (g > 255) g = 255;
  else if (g < 0) g = 0;
  return (
    (usePound ? "#" : "") +
    (g | (b << 8) | (r << 16)).toString(16).padStart(6, "0")
  );
};

// The Button Component
const Button: React.FC<ButtonProps> = ({
  title,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  children,
  type = "button", // Default HTML button type
  ...rest
}) => {
  return (
    <StyledButton
      onClick={onClick}
      variant={variant}
      size={size}
      disabled={disabled}
      type={type}
      {...rest}
    >
      {children || title}
    </StyledButton>
  );
};

export default Button;

// Define base styles and variant/size specific styles
const StyledButton = styled.button<ButtonProps>`
  font-family: ${({ theme }) => theme.fonts.main};
  font-weight: bold;
  border-radius: ${({ theme }) => theme.borderRadius};
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease-in-out,
    box-shadow 0.1s ease-in-out;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  white-space: nowrap;

  // --- Variant Styles ---
  ${({ theme, variant = "primary" }) => {
    let backgroundColor = theme.colors.primary;
    let textColor = theme.colors.light;
    let borderColor = "transparent";

    if (variant === "secondary") {
      backgroundColor = theme.colors.secondary;
    } else if (variant === "oauth") {
      backgroundColor = theme.colors.surface;
      textColor = theme.colors.text;
      borderColor = theme.colors.border;
    }

    return css`
      background-color: ${backgroundColor};
      color: ${textColor};
      border: 1px solid
        ${borderColor === "transparent" ? backgroundColor : borderColor};

      &:hover:not(:disabled) {
        background-color: ${darkenColor(backgroundColor, 20)};
        border-color: ${borderColor === "transparent"
          ? darkenColor(backgroundColor, 20)
          : darkenColor(borderColor, 20)};
      }

      ${variant === "oauth" &&
      css`
        display: flex;
        justify-content: center;
        align-items: center;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

        &:hover:not(:disabled) {
          background-color: ${backgroundColor};
          border-color: ${theme.colors.primary}30;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
        }
      `}
    `;
  }}

  // --- Size Styles ---
  ${({ theme, size = "md" }) => {
    switch (size) {
      case "sm":
        return css`
          padding: ${theme.spacing.xs} ${theme.spacing.sm};
          font-size: 0.875rem;
        `;
      case "lg":
        return css`
          padding: ${theme.spacing.md} ${theme.spacing.lg};
          font-size: 1.125rem;
        `;
      case "md":
      default:
        return css`
          padding: ${theme.spacing.sm} ${theme.spacing.md};
          font-size: 1rem;
        `;
    }
  }}

  // --- Disabled Styles ---
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  // --- Click Animation ---
  &:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2) inset;
  }
`;
