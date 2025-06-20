import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import styled, { ThemeProvider } from "styled-components"; // Import styled
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import LoginPageMui from "./pages/LoginPageMui";
import ProfilePageMui from "./pages/ProfilePageMui";
import {
  CalendarPage,
  CalendarPageMui,
  CalendarContextProvider,
} from "./pages/Calendar";
import AppHeader from "./components/AppHeaderMui";
import { lightTheme, darkTheme } from "./theme/theme";
import { lightMuiTheme, darkMuiTheme } from "./theme/muiTheme";
import GlobalStyle from "./theme/GlobalStyle";
import { useAuthContext } from "./contexts/Auth/useAuthContext";

import { UploadPage } from "./pages/UploadPageMui";
import ActivityDetails from "./pages/ActivityDetails/ActivityDetailsMui";
import ActivityListPage from "./pages/ActivityDetails/ActivityListPageMui";
import { QueryClientProvider } from "./providers/QueryClientProvider";
import ActivityDetailsProvider from "./pages/ActivityDetails/context/ActivityDetailsContext";
import LoadingSpinner from "./components/LoadingSpinner";
import HomePageMui from "./pages/HomePageMui";

// A layout for authenticated users
const AuthenticatedLayout: React.FC = () => {
  return (
    // Using ContentWrapper or a more specific styled main element
    <ContentWrapper>
      <Outlet /> {/* Child routes will render here too */}
    </ContentWrapper>
  );
};

// A component to protect routes
const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
      </LoadingContainer>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <AuthenticatedLayout />;
};

type ThemeMode = "light" | "dark";

function App() {
  const {
    user,
    profile,
    isLoading: isAuthLoading,
    updateUserProfile,
  } = useAuthContext();
  const [themeMode, setThemeMode] = useState<ThemeMode>(
    profile?.theme ?? "dark"
  );

  // Update local theme when profile changes
  useEffect(() => {
    if (profile?.theme) {
      setThemeMode(profile.theme);
    }
  }, [profile]);

  // Update theme in state and in Supabase
  const toggleTheme = () => {
    const newTheme = themeMode === "light" ? "dark" : "light";
    setThemeMode(newTheme);

    // If user is logged in, save theme preference to profile
    if (user && profile) {
      updateUserProfile({ theme: newTheme });
    }
  };

  const currentTheme = themeMode === "light" ? lightTheme : darkTheme;
  const currentMuiTheme = themeMode === "light" ? lightMuiTheme : darkMuiTheme;

  if (isAuthLoading && !user && window.location.pathname !== "/login") {
    return (
      <MuiThemeProvider theme={currentMuiTheme}>
        <ThemeProvider theme={currentTheme}>
          <CssBaseline />
          <GlobalStyle />
          <Router>
            <AppWrapper>
              <AppHeader toggleTheme={toggleTheme} themeMode={themeMode} />
              <LoadingContainer>
                <LoadingSpinner />
              </LoadingContainer>
            </AppWrapper>
          </Router>
        </ThemeProvider>
      </MuiThemeProvider>
    );
  }

  return (
    <QueryClientProvider>
      <MuiThemeProvider theme={currentMuiTheme}>
        <ThemeProvider theme={themeMode === "light" ? lightTheme : darkTheme}>
          <CssBaseline />
          <GlobalStyle />
          <Router>
            <AppWrapper>
              <AppHeader toggleTheme={toggleTheme} themeMode={themeMode} />
              <ContentWrapper>
                <Routes>
                  <Route
                    path="/login"
                    element={
                      user ? <Navigate to="/" replace /> : <LoginPageMui />
                    }
                  />

                  {/* Protected Routes */}
                  <Route
                    element={
                      <ProtectedRoute>
                        <ActivityDetailsProvider>
                          <Outlet />
                        </ActivityDetailsProvider>
                      </ProtectedRoute>
                    }
                  >
                    <Route
                      path="/"
                      element={
                        <PageContainer>
                          <HomePageMui />
                        </PageContainer>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <PageContainer>
                          <ProfilePageMui />
                        </PageContainer>
                      }
                    />
                    <Route
                      path="/home"
                      element={
                        <PageContainer>Home Page (Protected)</PageContainer>
                      }
                    />
                    <Route path="/activities">
                      <Route
                        index
                        element={
                          <PageContainer>
                            <ActivityListPage />
                          </PageContainer>
                        }
                      />
                      <Route
                        path=":activityId"
                        element={
                          <PageContainer>
                            <ActivityDetails />
                          </PageContainer>
                        }
                      />
                    </Route>
                    <Route
                      path="/upload"
                      element={
                        <PageContainer>
                          <UploadPage />
                        </PageContainer>
                      }
                    />
                    <Route
                      path="/calendar"
                      element={
                        <PageContainer className="calendar-page">
                          <CalendarContextProvider>
                            <CalendarPage />
                          </CalendarContextProvider>
                        </PageContainer>
                      }
                    />
                    <Route
                      path="/calendar-mui"
                      element={
                        <PageContainer className="calendar-page">
                          <CalendarContextProvider>
                            <CalendarPageMui />
                          </CalendarContextProvider>
                        </PageContainer>
                      }
                    />
                  </Route>

                  <Route
                    path="*"
                    element={<PageContainer>Page Not Found</PageContainer>}
                  />
                </Routes>
              </ContentWrapper>
            </AppWrapper>
          </Router>
        </ThemeProvider>
      </MuiThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

// Styled Components for App Layout
const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const ContentWrapper = styled.main``;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  margin: 0 0;

  &.calendar-page {
    padding: ${({ theme }) => theme.spacing.sm};
    max-width: 100%;
    width: 100%;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.primary};
`;
