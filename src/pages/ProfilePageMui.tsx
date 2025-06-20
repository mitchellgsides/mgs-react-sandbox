import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Grid,
  Box,
  CircularProgress,
} from "@mui/material";
import { useAuthContext } from "../contexts/Auth/useAuthContext";
import type { Profile } from "../supabase/supabase.auth";

const ProfilePage: React.FC = () => {
  const { user, profile, updateUserProfile, isLoading } = useAuthContext();
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [theme, setTheme] = useState<Profile["theme"]>("dark");
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateMessage, setUpdateMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setTheme(profile.theme || "dark");
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMessage(null);

    try {
      await updateUserProfile({
        first_name: firstName,
        last_name: lastName,
        theme: theme,
      });
      setUpdateMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
      setIsEditMode(false);
    } catch (error) {
      console.error("Profile update error:", error);
      setUpdateMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFirstName(profile.first_name || "");
      setLastName(profile.last_name || "");
      setTheme(profile.theme || "dark");
    }
    setIsEditMode(false);
    setUpdateMessage(null);
  };

  const SignOutButton = () => {
    const { signOut } = useAuthContext();

    const handleSignOut = async () => {
      try {
        await signOut();
      } catch (error) {
        console.error("Sign out error:", error);
      }
    };

    return (
      <Button
        variant="outlined"
        color="error"
        fullWidth
        onClick={handleSignOut}
        sx={{ mt: 3 }}
      >
        Sign Out
      </Button>
    );
  };

  if (isLoading) {
    return (
      <Container
        maxWidth="md"
        sx={{ mt: 4, display: "flex", justifyContent: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h5" align="center" color="text.secondary">
          Please log in to view your profile.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h3" color="primary" align="center" gutterBottom>
        Profile
      </Typography>

      {/* Profile Information */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h5" color="primary">
              Profile Information
            </Typography>
            {!isEditMode && (
              <Button variant="outlined" onClick={() => setIsEditMode(true)}>
                Edit
              </Button>
            )}
          </Box>

          {updateMessage && (
            <Alert severity={updateMessage.type} sx={{ mb: 2 }}>
              {updateMessage.text}
            </Alert>
          )}

          {isEditMode ? (
            <Box component="form" onSubmit={handleSubmit}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    gap: 2,
                    flexDirection: { xs: "column", sm: "row" },
                  }}
                >
                  <TextField
                    fullWidth
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isUpdating}
                  />
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isUpdating}
                  />
                </Box>
                <FormControl fullWidth>
                  <InputLabel>Theme Preference</InputLabel>
                  <Select
                    value={theme}
                    onChange={(e) =>
                      setTheme(e.target.value as Profile["theme"])
                    }
                    disabled={isUpdating}
                    label="Theme Preference"
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isUpdating}
                  startIcon={
                    isUpdating ? <CircularProgress size={20} /> : undefined
                  }
                >
                  {isUpdating ? "Updating..." : "Save Changes"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
              </Box>
            </Box>
          ) : (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  First Name:
                </Typography>
                <Typography variant="body1">
                  {profile?.first_name || "Not provided"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Name:
                </Typography>
                <Typography variant="body1">
                  {profile?.last_name || "Not provided"}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Email:
                </Typography>
                <Typography variant="body1">{user.email}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Current Theme:
                </Typography>
                <Typography variant="body1">
                  {profile?.theme === "light" ? "Light" : "Dark"}
                </Typography>
              </Grid>
              <Grid size={12}>
                <Typography variant="subtitle2" color="text.secondary">
                  Last Sign In:
                </Typography>
                <Typography variant="body1">
                  {new Date(user.last_sign_in_at || "").toLocaleString()}
                </Typography>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      <SignOutButton />
    </Container>
  );
};

export default ProfilePage;
