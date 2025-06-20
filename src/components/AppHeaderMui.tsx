import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Button,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import styled from "styled-components";
import { BiMoon, BiSun } from "react-icons/bi";
import { PiGraph } from "react-icons/pi";
import { useAuthContext } from "../contexts/Auth/useAuthContext";
import LoadingSpinner from "./LoadingSpinner";

interface AppHeaderProps {
  toggleTheme: () => void;
  themeMode: "dark" | "light";
}

const AppHeader: React.FC<AppHeaderProps> = ({ toggleTheme, themeMode }) => {
  const { user, isLoading } = useAuthContext();
  const title = "Equipped Endurance";

  if (isLoading) {
    return (
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          <LoadingSpinner />
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
          <LogoIcon>
            <PiGraph />
          </LogoIcon>
          <Typography
            variant="h6"
            component={RouterLink}
            to="/"
            sx={{
              textDecoration: "none",
              color: "inherit",
              fontWeight: "bold",
              "&:hover": {
                opacity: 0.8,
              },
            }}
          >
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {user ? (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/"
                sx={{ fontWeight: "bold" }}
              >
                Home
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/activities"
                sx={{ fontWeight: "bold" }}
              >
                Activities
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/profile"
                sx={{ fontWeight: "bold" }}
              >
                Profile
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/calendar"
                sx={{ fontWeight: "bold" }}
              >
                Calendar
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/calendar-mui"
                sx={{ fontWeight: "bold" }}
              >
                Calendar Mui
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/upload"
                sx={{ fontWeight: "bold" }}
              >
                Upload
              </Button>
              <IconButton
                color="inherit"
                onClick={toggleTheme}
                aria-label={`Switch to ${
                  themeMode === "light" ? "dark" : "light"
                } mode`}
                sx={{
                  fontSize: "1.5rem",
                  "&:hover": {
                    opacity: 0.8,
                  },
                }}
              >
                {themeMode === "light" ? <BiMoon /> : <BiSun />}
              </IconButton>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
                sx={{ fontWeight: "bold" }}
              >
                Login
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

const LogoIcon = styled.div`
  padding: 10px;
  height: 50px;
  width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
`;

export default AppHeader;
