import React from "react";
import {
  Button as MuiButton,
  ButtonProps as MuiButtonProps,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// Define Size and Variant types to match existing interface
type ButtonVariant = "primary" | "secondary" | "oauth";
type ButtonSize = "sm" | "md" | "lg";

// Define Props interface for the Button (maintaining existing interface)
interface ButtonProps extends Omit<MuiButtonProps, "variant" | "size"> {
  title?: string; // Optional title, children can also be used
  variant?: ButtonVariant;
  size?: ButtonSize;
  children?: React.ReactNode; // Allow children for more complex content like icons + text
}

// Map custom variants to MUI variants
const mapVariantToMui = (variant: ButtonVariant): MuiButtonProps["variant"] => {
  switch (variant) {
    case "primary":
      return "contained";
    case "secondary":
      return "outlined";
    case "oauth":
      return "outlined";
    default:
      return "contained";
  }
};

// Map custom sizes to MUI sizes
const mapSizeToMui = (size: ButtonSize): MuiButtonProps["size"] => {
  switch (size) {
    case "sm":
      return "small";
    case "md":
      return "medium";
    case "lg":
      return "large";
    default:
      return "medium";
  }
};

// Styled MUI Button with custom oauth styling
const StyledMuiButton = styled(MuiButton, {
  shouldForwardProp: (prop) => prop !== "customVariant",
})<{ customVariant?: ButtonVariant }>(({ theme, customVariant }) => ({
  ...(customVariant === "oauth" && {
    borderColor: theme.palette.divider,
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
    "&:hover": {
      borderColor: theme.palette.primary.main,
      backgroundColor: theme.palette.action.hover,
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.15)",
    },
  }),
  textTransform: "none",
  fontWeight: 600,
  "&:hover": {
    transform: "translateY(-1px)",
    transition: "transform 0.2s ease-in-out",
  },
  "&:active:not(:disabled)": {
    transform: "translateY(1px)",
  },
}));

// The Button Component
const Button: React.FC<ButtonProps> = ({
  title,
  variant = "primary",
  size = "md",
  children,
  type = "button",
  ...rest
}) => {
  const muiVariant = mapVariantToMui(variant);
  const muiSize = mapSizeToMui(size);

  return (
    <StyledMuiButton
      variant={muiVariant}
      size={muiSize}
      type={type}
      customVariant={variant}
      {...rest}
    >
      {children || title}
    </StyledMuiButton>
  );
};

export default Button;
