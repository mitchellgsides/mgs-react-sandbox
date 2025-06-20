import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  Link,
} from "react-router-dom";
import styled, { ThemeProvider } from "styled-components"; // Import styled
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import CalendarPage from "./pages/Calendar/CalendarPage";
import AppHeader from "./components/AppHeader";
import { lightTheme, darkTheme } from "./theme/theme";
import GlobalStyle from "./theme/GlobalStyle";
import { useAuthContext } from "./contexts/Auth/useAuthContext";
import { CalendarContextProvider } from "./pages/Calendar/context/CalendarContext";
import { UploadPage } from "./pages/UploadPage";
import ActivityDetails from "./pages/ActivityDetails/ActivityDetails";
import ActivityListPage from "./pages/ActivityDetails/ActivityListPage";
import { QueryClientProvider } from "./providers/QueryClientProvider";
import ActivityDetailsProvider from "./pages/ActivityDetails/context/ActivityDetailsContext";
import LoadingSpinner from "./components/LoadingSpinner";
import HomePage from "./pages/HomePage";

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

  if (isAuthLoading && !user && window.location.pathname !== "/login") {
    return (
      <ThemeProvider theme={currentTheme}>
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
    );
  }

  return (
    <QueryClientProvider>
      <ThemeProvider theme={themeMode === "light" ? lightTheme : darkTheme}>
        <GlobalStyle />
        <Router>
          <AppWrapper>
            <AppHeader toggleTheme={toggleTheme} themeMode={themeMode} />
            <ContentWrapper>
              <Routes>
                <Route
                  path="/login"
                  element={user ? <Navigate to="/" replace /> : <LoginPage />}
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
                        <HomePage />
                        <TextBlock>
                          Navigate to your <Link to="/profile">profile</Link> or
                          check out the <Link to="/calendar">calendar</Link>.
                        </TextBlock>
                      </PageContainer>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <PageContainer>
                        <ProfilePage />
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

const TextBlock = styled.p`
  margin-bottom: 1rem;
  font-size: 1.1rem;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
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
