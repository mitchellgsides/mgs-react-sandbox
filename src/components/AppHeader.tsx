import React from "react";
import { Link as RouterLink } from "react-router-dom";
import styled from "styled-components";
import { BiMoon, BiSun } from "react-icons/bi";
import { useAuth } from "../contexts/Auth/authContextDef";
import { PiGraph } from "react-icons/pi";

interface AppHeaderProps {
  toggleTheme: () => void;
  themeMode: "dark" | "light";
}

const AppHeader: React.FC<AppHeaderProps> = ({ toggleTheme, themeMode }) => {
  const { user, isLoading } = useAuth();
  const title = "Equipped Endurance"!;

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
        <PiGraph style={{ padding: "10px", height: 50, width: 50 }} />
        <StyledRouterLink to="/" $isSiteTitle={true}>
          {title}
        </StyledRouterLink>
      </SiteTitle>
      <Nav>
        {user ? (
          <>
            <StyledRouterLink to="/">Home</StyledRouterLink>
            <StyledRouterLink to="/activities">Activities</StyledRouterLink>
            <StyledRouterLink to="/profile">Profile</StyledRouterLink>
            <StyledRouterLink to="/calendar">Calendar</StyledRouterLink>
            <StyledRouterLink to="/upload">Upload</StyledRouterLink>
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
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.md};
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
  display: flex;
  align-items: center;
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
    opacity: 0.8;
    color: ${({ theme }) => theme.colors.secondary};
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

export default AppHeader;
