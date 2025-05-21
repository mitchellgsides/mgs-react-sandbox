import React, { useState } from "react";
import styled from "styled-components";
import { useAuth } from "../contexts/Auth/authContextDef";
import { darkTheme } from "../theme/theme"; // Adjust path as necessary
import type { Profile } from "../supabase/supabase.auth"; // Assuming Profile type is defined here
import SignOutButton from "../components/SignOut";

const ProfilePage: React.FC = () => {
  const { user, profile, updateUserProfile, updatePassword, isLoading, error } =
    useAuth(); // Get userProfile and new updateUserProfile

  const [editableProfile, setEditableProfile] = useState<Partial<Profile>>({}); // Initialize with empty or fetched profile
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false); // New state

  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditableProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditProfileToggle = () => {
    if (!isEditingProfile) {
      // When entering edit mode, set the editable profile to the current profile
      setEditableProfile(profile || {});
    }
    setIsEditingProfile(!isEditingProfile);
    setFormError(null);
    setSuccessMessage(null);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    const { ...updatesToSubmit } = editableProfile as Profile;

    try {
      await updateUserProfile(updatesToSubmit);
      setEditableProfile(updatesToSubmit);

      setSuccessMessage("Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (err) {
      console.error(err);
      setFormError("Failed to update profile. " + (err as Error).message);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    try {
      await updatePassword(passwordData.newPassword);
      setSuccessMessage("Password updated successfully!");
      setPasswordData({ newPassword: "", confirmPassword: "" });
      // Optionally close the form on success:
      // setIsChangingPassword(false);
    } catch (err) {
      console.error(err);
      setFormError("Failed to update password. " + (err as Error).message);
    }
  };

  const toggleChangePasswordVisibility = () => {
    setIsChangingPassword(!isChangingPassword);
    // Clear messages when toggling visibility if the form isn't submitted
    if (!isChangingPassword) {
      setFormError(null);
      setSuccessMessage(null);
      setPasswordData({ newPassword: "", confirmPassword: "" }); // Reset password fields
    }
  };

  if (!user) {
    return (
      <PageWrapper>
        <InfoText>Please log in to view your profile.</InfoText>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Title>Your Profile</Title>

      {/* Global messages can stay here or be moved into sections */}
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
      {/* Form-specific messages will be shown within their sections if preferred */}

      <ProfileSection>
        <SectionHeader>
          <SectionTitle>Personal Information</SectionTitle>
          {!isEditingProfile && (
            <EditButton onClick={handleEditProfileToggle} disabled={isLoading}>
              Edit
            </EditButton>
          )}
        </SectionHeader>
        {isEditingProfile ? (
          <StyledForm onSubmit={handleProfileSubmit}>
            {formError && !successMessage && (
              <ErrorMessage>{formError}</ErrorMessage>
            )}
            {successMessage && (
              <SuccessMessage>{successMessage}</SuccessMessage>
            )}
            <InputGroup>
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                type="text"
                value={editableProfile.first_name}
                onChange={handleProfileInputChange}
                disabled={isLoading}
              />
            </InputGroup>
            <InputGroup>
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                type="text"
                value={editableProfile.last_name}
                onChange={handleProfileInputChange}
                disabled={isLoading}
              />
            </InputGroup>
            <InputGroup>
              <Label htmlFor="theme">Theme Preference</Label>
              <Select
                id="theme"
                name="theme"
                value={editableProfile.theme || "dark"}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setEditableProfile((prev) => ({
                    ...prev,
                    theme: e.target.value as "light" | "dark",
                  }))
                }
                disabled={isLoading}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </Select>
            </InputGroup>
            <ButtonContainer>
              <SubmitButton type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </SubmitButton>
              <CancelButton
                type="button"
                onClick={handleEditProfileToggle}
                disabled={isLoading}
              >
                Cancel
              </CancelButton>
            </ButtonContainer>
          </StyledForm>
        ) : (
          <>
            {successMessage && isEditingProfile === false && (
              <SuccessMessage>{successMessage}</SuccessMessage>
            )}
            {/* Show success message here after saving */}
            <InfoGrid>
              <InfoLabel>First Name:</InfoLabel>
              <InfoValue>{profile?.first_name || "Not set"}</InfoValue>
              <InfoLabel>Last Name:</InfoLabel>
              <InfoValue>{profile?.last_name || "Not set"}</InfoValue>
            </InfoGrid>
          </>
        )}
      </ProfileSection>

      <ProfileSection>
        <SectionHeader>
          <SectionTitle>Account Security</SectionTitle>
          {!isChangingPassword && (
            <ActionButton
              onClick={toggleChangePasswordVisibility}
              disabled={isLoading}
            >
              Change Password
            </ActionButton>
          )}
        </SectionHeader>
        {isChangingPassword && (
          <>
            <StyledForm onSubmit={handlePasswordSubmit}>
              {formError && !successMessage && (
                <ErrorMessage>{formError}</ErrorMessage>
              )}
              {successMessage && (
                <SuccessMessage>{successMessage}</SuccessMessage>
              )}
              <InputGroup>
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  disabled={isLoading}
                />
              </InputGroup>
              <InputGroup>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  disabled={isLoading}
                />
              </InputGroup>
              <ButtonContainer>
                <SubmitButton type="submit" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update Password"}
                </SubmitButton>
                <CancelButton
                  onClick={toggleChangePasswordVisibility}
                  disabled={isLoading}
                >
                  Cancel
                </CancelButton>
              </ButtonContainer>
            </StyledForm>
          </>
        )}
        {/* Display general account details if password form is hidden */}
        {!isChangingPassword && (
          <InfoGrid style={{ marginTop: isChangingPassword ? 0 : "1rem" }}>
            <InfoLabel>Email:</InfoLabel>
            <InfoValue>{user.email}</InfoValue>
            <InfoLabel>Current Theme:</InfoLabel>
            <InfoValue>
              {profile?.theme === "light" ? "Light" : "Dark"}
            </InfoValue>
            <InfoLabel>Last Sign In:</InfoLabel>
            <InfoValue>
              {new Date(user.last_sign_in_at || "").toLocaleString()}
            </InfoValue>
          </InfoGrid>
        )}
      </ProfileSection>

      <SignOutButton />
    </PageWrapper>
  );
};

// Styled Components (similar to LoginPage, adapt as needed)
const PageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ProfileSection = styled.section`
  width: 100%;
  max-width: 600px;
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  ${({ theme }) =>
    theme.colors.background === darkTheme.colors.background &&
    ` 
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4); // Darker shadow for dark mode
  `}
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: ${({ theme }) => theme.spacing.sm};
`;

const SectionTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.5rem;
  margin: 0;
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
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 1rem;
  // Use a specific input background or a slightly different shade from the page background
  // For instance, if you want inputs to be distinct from the main page background in dark mode:
  background-color: ${({ theme }) =>
    theme.colors.background === darkTheme.colors.background
      ? "#2c3034"
      : theme.colors.background};
  // Or, if theme.colors.background is already what you want for inputs:
  // background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
  &:disabled {
    background-color: ${({ theme }) =>
      theme.colors.border}; // This might need adjustment for dark mode
    // For dark mode disabled:
    // background-color: ${({ theme }) =>
      theme.colors.background === darkTheme.colors.background
        ? "#404040"
        : theme.colors.border};
    cursor: not-allowed;
  }
`;

const ButtonBase = styled.button`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, opacity 0.2s ease-in-out;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled(ButtonBase)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.info};
  }
`;

const EditButton = styled(ButtonBase)`
  background-color: ${({ theme }) => theme.colors.secondary};
  color: white;
  &:hover:not(:disabled) {
    opacity: 0.8;
  }
`;

const CancelButton = styled(ButtonBase)`
  background-color: transparent;
  color: ${({ theme }) => theme.colors.secondary};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.border};
  }
`;

const ActionButton = styled(ButtonBase)`
  background-color: ${({ theme }) => theme.colors.secondary};
  color: white;
  &:hover:not(:disabled) {
    opacity: 0.8;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const MessageBase = styled.p`
  text-align: center;
  margin: ${({ theme }) => theme.spacing.md} 0;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius};
  font-size: 0.9rem;
`;

const ErrorMessage = styled(MessageBase)`
  color: ${({ theme }) => theme.colors.danger};
  background-color: ${({ theme }) => theme.colors.danger}22; // Faint background
`;

const SuccessMessage = styled(MessageBase)`
  color: ${({ theme }) => theme.colors.success};
  background-color: ${({ theme }) =>
    theme.colors.success}22; // Faint background
`;

const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const InfoText = styled.p`
  font-size: 1.1rem;
  text-align: center;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  align-items: center;
`;

const InfoLabel = styled.span`
  font-weight: bold;
  text-align: right;
`;

const InfoValue = styled.span`
  text-align: left;
`;

export default ProfilePage;
