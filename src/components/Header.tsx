import React from "react";
import { Link as RouterLink } from "react-router-dom";
import styled from "styled-components";
import { BiMoon, BiSun } from "react-icons/bi";
import { useAuth } from "../contexts/Auth/authContextDef";

interface HeaderProps {
  toggleTheme: () => void;
  themeMode: "dark" | "light";
}

const Header: React.FC<HeaderProps> = ({ toggleTheme, themeMode }) => {
  const { user, isLoading } = useAuth();
  const title = "TriDay"!;

  if (isLoading) {
    return (
      <StyledHeaderWrapper>
        <SiteTitle>
          <StyledRouterLink to="/" $isSiteTitle={true}>
            {title}
          </StyledRouterLink>
        </SiteTitle>
        <Nav>Loading...</Nav>
      </StyledHeaderWrapper>
    );
  }

  return (
    <StyledHeaderWrapper>
      <SiteTitle>
        <StyledRouterLink to="/" $isSiteTitle={true}>
          {title}
        </StyledRouterLink>
      </SiteTitle>
      <Nav>
        {user ? (
          <>
            <StyledRouterLink to="/">Home</StyledRouterLink>
            <StyledRouterLink to="/profile">Profile</StyledRouterLink>
            <StyledRouterLink to="/calendar">Calendar</StyledRouterLink>
            <ThemeToggleButton
              onClick={toggleTheme}
              aria-label={`Switch to ${
                themeMode === "light" ? "dark" : "light"
              } mode`}
            >
              {themeMode === "light" ? <BiMoon /> : <BiSun />}
            </ThemeToggleButton>
          </>
        ) : (
          <>
            <StyledRouterLink to="/login">Login</StyledRouterLink>
          </>
        )}
      </Nav>
    </StyledHeaderWrapper>
  );
};

// Styled Components
const StyledHeaderWrapper = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  background-color: ${({ theme }) =>
    theme.colors.primary}; // Use primary color for background
  border-bottom: 1px solid ${({ theme }) => theme.colors.border}; // Border might need to contrast with primary
  color: ${({ theme }) =>
    theme.colors
      .light}; // Default text color for items in header (e.g., white/light gray)
`;

const SiteTitle = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const StyledRouterLink = styled(RouterLink)<{ $isSiteTitle?: boolean }>`
  text-decoration: none;
  // Site title and nav links should use a color that contrasts with the primary background
  color: ${({ theme }) => theme.colors.light};
  font-weight: bold;

  &:hover {
    // Adjust hover color to also contrast with primary background and be subtly different
    opacity: 0.8;
    // Alternatively, use a slightly darker or lighter shade of theme.colors.light if available/appropriate
    // color: ${({ theme }) =>
      theme.colors.secondary}; // Example: if secondary contrasts well and fits
  }
`;

const ThemeToggleButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.5rem; // Increased size for better visibility of silhouette
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xs}; // Adjusted padding
  color: ${({ theme }) =>
    theme.colors.light}; // Icon color contrasts with primary background

  &:hover {
    opacity: 0.8; // Simple hover effect for silhouette
  }
`;

export default Header;
