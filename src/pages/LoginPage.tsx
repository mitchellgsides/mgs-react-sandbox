import React, { useState } from "react";
import styled from "styled-components";
import { useAuth } from "../contexts/Auth/authContextDef";
import { darkTheme } from "../theme/theme";
import type { Profile } from "../supabase/supabase.auth";
import Button from "../lib/components/Button";

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

// Login page component
const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [themePreference, setThemePreference] =
    useState<Profile["theme"]>("dark");

  const {
    signInWithPassword,
    signInWithOAuth,
    signUp,
    isLoading,
    error,
    user,
  } = useAuth();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSignUp) {
      await signUp(email, password, {
        first_name: firstName,
        last_name: lastName,
        theme: themePreference,
      });
    } else {
      await signInWithPassword(email, password);
    }
  };

  if (user) {
    return (
      <PageWrapper>
        <InfoText>You are already logged in as {user.email}.</InfoText>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <FormContainer>
        <Title>{isSignUp ? "Sign Up" : "Login"}</Title>
        {isSignUp ? (
          <SubTitle>Create an account to get started</SubTitle>
        ) : (
          <SubTitle>Welcome back! Please sign in to continue</SubTitle>
        )}
        <StyledForm onSubmit={handleSubmit}>
          {isSignUp && (
            <>
              <InputGroup>
                <Label htmlFor="firstName">First Name:</Label>
                <Input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </InputGroup>
              <InputGroup>
                <Label htmlFor="lastName">Last Name:</Label>
                <Input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </InputGroup>
            </>
          )}
          <InputGroup>
            <Label htmlFor="email">Email:</Label>
            <Input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </InputGroup>
          <InputGroup>
            <Label htmlFor="password">Password:</Label>
            <Input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={isSignUp ? 6 : undefined}
            />
          </InputGroup>
          {isSignUp && (
            <InputGroup>
              <Label htmlFor="themePreference">Preferred Theme:</Label>
              <Select
                id="themePreference"
                value={themePreference}
                onChange={(e) =>
                  setThemePreference(e.target.value as Profile["theme"])
                }
                disabled={isLoading}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </Select>
            </InputGroup>
          )}
          {error && <ErrorMessage>Error: {error.message}</ErrorMessage>}
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            size="md"
          >
            {isLoading ? "Processing..." : isSignUp ? "Sign Up" : "Login"}
          </Button>
        </StyledForm>{" "}
        <OrDivider>
          <OrText>OR</OrText>
        </OrDivider>
        <OAuthButtonsContainer>
          <Button
            type="button"
            variant="oauth"
            onClick={() => signInWithOAuth("google")}
            disabled={isLoading}
            size="md"
          >
            <GoogleIcon /> Continue with Google
          </Button>
          <Button
            type="button"
            variant="oauth"
            onClick={() => signInWithOAuth("github")}
            disabled={isLoading}
            size="md"
          >
            <GithubIcon /> Continue with GitHub
          </Button>
        </OAuthButtonsContainer>
        {isSignUp && (
          <OAuthInfo>
            When you sign up with OAuth, we'll automatically create a profile
            for you.
          </OAuthInfo>
        )}
        <Button
          variant="secondary"
          size="md"
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
      </FormContainer>
    </PageWrapper>
  );
};

// Styled Components
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background};
`;

const FormContainer = styled.div`
  width: 100%;
  max-width: 400px;
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  color: ${({ theme }) => theme.colors.text};

  display: flex; // Added for layout
  flex-direction: column; // Added for layout
  gap: ${({ theme }) =>
    theme.spacing
      .lg}; // Added for spacing between Title, Form, and Toggle Button

  ${({ theme }) =>
    theme.colors.background === darkTheme.colors.background &&
    `
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  `}
`;

const Title = styled.h2`
  text-align: center;
  /* margin-bottom removed as FormContainer gap will handle it */
  color: ${({ theme }) => theme.colors.primary};
`;

const SubTitle = styled.p`
  text-align: center;
  margin-top: -8px;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.8;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 1rem;
  background-color: ${({ theme }) =>
    theme.colors.background === darkTheme.colors.background
      ? "#2c3034"
      : theme.colors.background};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}33;
  }

  &:disabled {
    background-color: ${({ theme }) =>
      theme.colors.background === darkTheme.colors.background
        ? "#454a4e"
        : theme.colors.border};
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 1rem;
  background-color: ${({ theme }) =>
    theme.colors.background === darkTheme.colors.background
      ? "#2c3034"
      : theme.colors.background};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary}33;
  }

  &:disabled {
    background-color: ${({ theme }) =>
      theme.colors.background === darkTheme.colors.background
        ? "#454a4e"
        : theme.colors.border};
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.danger};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: 0.9rem;
`;

const InfoText = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
`;

// OAuth related styled components
const OrDivider = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
  width: 100%;

  &:before,
  &:after {
    content: "";
    flex: 1;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  }
`;

const OrText = styled.span`
  padding: 0 10px;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.9rem;
  opacity: 0.8;
`;

const OAuthButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
  width: 100%;
  margin-bottom: ${({ theme }) => theme.spacing.sm};

  button {
    transition: all 0.2s ease;

    &:hover {
      transform: translateY(-2px);
    }
  }
`;

const OAuthInfo = styled.p`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.7;
  text-align: center;
  margin-top: -8px;
  margin-bottom: 8px;
`;

export default LoginPage;
