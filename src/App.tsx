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
import { useAuth } from "./contexts/authContextDef";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import Header from "./components/Header";
import lightTheme from "./theme/lightTheme";
import darkTheme from "./theme/darkTheme";
import GlobalStyle from "./theme/GlobalStyle";

// A layout for authenticated users
const AuthenticatedLayout: React.FC = () => {
  return (
    // Using ContentWrapper or a more specific styled main element
    <ContentWrapper>
      <Outlet /> {/* Child routes will render here */}
    </ContentWrapper>
  );
};

// A component to protect routes
const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingContainer>Loading application...</LoadingContainer>;
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
  } = useAuth();
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
            <Header toggleTheme={toggleTheme} themeMode={themeMode} />
            <LoadingContainer>Loading application...</LoadingContainer>
          </AppWrapper>
        </Router>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyle />
      <Router>
        <AppWrapper>
          <Header toggleTheme={toggleTheme} themeMode={themeMode} />
          <Routes>
            <Route
              path="/login"
              element={user ? <Navigate to="/" replace /> : <LoginPage />}
            />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route
                path="/"
                element={
                  <PageContainer>
                    <TextBlock>
                      This is your authenticated app content dashboard.
                    </TextBlock>
                    <TextBlock>
                      Navigate to your <Link to="/profile">profile</Link>.
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
                element={<PageContainer>Home Page (Protected)</PageContainer>}
              />
            </Route>

            <Route
              path="*"
              element={<PageContainer>Page Not Found</PageContainer>}
            />
          </Routes>
        </AppWrapper>
      </Router>
    </ThemeProvider>
  );
}

export default App;

// Styled Components for App Layout
const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const ContentWrapper = styled.main`
  flex-grow: 1;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background};
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; // Full viewport height for initial load
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text};
`;

const PageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center; // Example styling
`;

const TextBlock = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text};
`;
