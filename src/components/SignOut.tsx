import React from "react";
import styled from "styled-components"; // Import styled
import { useAuth } from "../contexts/authContextDef"; // Adjust the path as necessary
import Button from "../lib/components/Button";

const SignOutButton: React.FC = () => {
  const { signOut, isLoading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <StyledSignOutButton onClick={handleSignOut} disabled={isLoading}>
      {isLoading ? "Signing out..." : "Sign Out"}
    </StyledSignOutButton>
  );
};

// Styled component for the sign-out button
const StyledSignOutButton = styled(Button)``;

export default SignOutButton;
