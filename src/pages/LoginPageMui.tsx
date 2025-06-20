import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Divider,
  CircularProgress,
  Container,
} from "@mui/material";
import { useAuthContext } from "../contexts/Auth/useAuthContext";
import type { Profile } from "../supabase/supabase.auth";

// OAuth Icon Components
const GoogleIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ marginRight: "8px" }}
  >
    <path
      d="M15.5453 6.54544H14.9091H8.00001V9.45453H12.4109C11.9999 11.0763 10.7308 12.3454 8.00001 12.3454C5.60908 12.3454 3.63635 10.4 3.63635 8.00001C3.63635 5.60908 5.58181 3.63635 8.00001 3.63635C9.05454 3.63635 10.0254 3.98544 10.7818 4.54544L12.8727 2.45453C11.5345 1.22726 9.87272 0.5 8.00001 0.5C3.8909 0.5 0.5 3.8909 0.5 8.00001C0.5 12.1091 3.8909 15.5 8.00001 15.5C12.1091 15.5 15.5 12.1091 15.5 8.00001C15.5 7.52726 15.5 7.05453 15.4727 6.54544H8.00001"
      fill="#FFC107"
    />
    <path
      d="M1.28174 4.31089L3.66356 6.05452C4.37265 4.63634 6.08174 3.63634 8.0001 3.63634C9.05464 3.63634 10.0255 3.98543 10.7819 4.54543L12.8728 2.45452C11.5346 1.22725 9.87283 0.5 8.0001 0.5C5.09101 0.5 2.62192 2.0727 1.28174 4.31089Z"
      fill="#FF3D00"
    />
    <path
      d="M7.99999 15.5C9.82726 15.5 11.4618 14.8 12.7891 13.6182L10.5 11.6727C9.80414 12.1696 8.93666 12.3565 7.99999 12.3455C5.29091 12.3455 3.62726 11.0764 3.18181 9.45458L0.81818 11.3182C2.14545 13.8 4.85454 15.5 7.99999 15.5Z"
      fill="#4CAF50"
    />
    <path
      d="M15.5453 6.54544H14.9091H8.00001V9.45453H12.4109C11.9999 11.0763 10.7308 12.3454 8.00001 12.3454C5.60908 12.3454 3.63635 10.4 3.63635 8.00001C3.63635 5.60908 5.58181 3.63635 8.00001 3.63635C9.05454 3.63635 10.0254 3.98544 10.7818 4.54544L12.8727 2.45453C11.5345 1.22726 9.87272 0.5 8.00001 0.5C3.8909 0.5 0.5 3.8909 0.5 8.00001C0.5 12.1091 3.8909 15.5 8.00001 15.5C12.1091 15.5 15.5 12.1091 15.5 8.00001C15.5 7.52726 15.5 7.05453 15.4727 6.54544H8.00001"
      fill="#1976D2"
    />
  </svg>
);

const GithubIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ marginRight: "8px" }}
  >
    <path
      d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
      fill="currentColor"
    />
  </svg>
);

const LoginPage: React.FC = () => {
  const {
    signUp,
    signInWithPassword,
    signInWithOAuth,
    user,
    isLoading,
    error,
  } = useAuthContext();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [themePreference, setThemePreference] =
    useState<Profile["theme"]>("dark");
  const [isSignUp, setIsSignUp] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await signUp(email, password, {
          first_name: firstName,
          last_name: lastName,
          theme: themePreference,
        });
      } else {
        await signInWithPassword(email, password);
      }
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    try {
      await signInWithOAuth(provider);
    } catch (err) {
      console.error("OAuth error:", err);
    }
  };

  if (user) {
    return (
      <Container
        maxWidth="sm"
        sx={{ mt: 8, display: "flex", justifyContent: "center" }}
      >
        <Typography variant="h5" color="text.secondary">
          You are already logged in as {user.email}.
        </Typography>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="sm"
      sx={{ mt: 8, display: "flex", justifyContent: "center" }}
    >
      <Card sx={{ width: "100%", maxWidth: 400 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            align="center"
            color="primary"
            gutterBottom
          >
            {isSignUp ? "Sign Up" : "Login"}
          </Typography>
          <Typography
            variant="body2"
            align="center"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            {isSignUp
              ? "Create an account to get started"
              : "Welcome back! Please sign in to continue"}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
            {isSignUp && (
              <>
                <TextField
                  fullWidth
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={isLoading}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isLoading}
                  margin="normal"
                />
              </>
            )}

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              margin="normal"
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              margin="normal"
              inputProps={{ minLength: isSignUp ? 6 : undefined }}
            />

            {isSignUp && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Preferred Theme</InputLabel>
                <Select
                  value={themePreference}
                  onChange={(e) =>
                    setThemePreference(e.target.value as Profile["theme"])
                  }
                  disabled={isLoading}
                  label="Preferred Theme"
                >
                  <MenuItem value="dark">Dark</MenuItem>
                  <MenuItem value="light">Light</MenuItem>
                </Select>
              </FormControl>
            )}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ mt: 3, mb: 2 }}
              startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
            >
              {isLoading ? "Loading..." : isSignUp ? "Sign Up" : "Login"}
            </Button>
          </Box>

          <Divider sx={{ my: 2 }}>
            <Typography variant="caption" color="text.secondary">
              OR
            </Typography>
          </Divider>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleOAuthSignIn("google")}
              disabled={isLoading}
              startIcon={<GoogleIcon />}
              sx={{
                borderColor: (theme) => theme.palette.divider,
                color: (theme) => theme.palette.text.primary,
                "&:hover": {
                  borderColor: (theme) => theme.palette.primary.main,
                  backgroundColor: (theme) => theme.palette.action.hover,
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.15)",
                },
              }}
            >
              Continue with Google
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => handleOAuthSignIn("github")}
              disabled={isLoading}
              startIcon={<GithubIcon />}
              sx={{
                borderColor: (theme) => theme.palette.divider,
                color: (theme) => theme.palette.text.primary,
                "&:hover": {
                  borderColor: (theme) => theme.palette.primary.main,
                  backgroundColor: (theme) => theme.palette.action.hover,
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.15)",
                },
              }}
            >
              Continue with GitHub
            </Button>
          </Box>

          <Button
            fullWidth
            variant="text"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setFirstName("");
              setLastName("");
              setThemePreference("dark");
            }}
            disabled={isLoading}
          >
            {isSignUp
              ? "Already have an account? Login"
              : "Don't have an account? Sign Up"}
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default LoginPage;
