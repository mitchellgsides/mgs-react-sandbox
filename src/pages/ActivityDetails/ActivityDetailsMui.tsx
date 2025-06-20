import React, { useCallback, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  IconButton,
  TextField,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Link as MuiLink,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
} from "@mui/material";
import {
  ArrowBack,
  Edit,
  Delete,
  Save,
  Cancel,
  BarChart,
  ShowChart,
  AccessTime,
  StraightenRounded,
} from "@mui/icons-material";
import styled from "styled-components";
import { useParams, Link, useNavigate } from "react-router-dom";
import { DateTime } from "luxon";
import { useActivityDetailsContext } from "./context/useActivityDetailsContext";
import HighchartsGraph from "./components/Highcharts/HighchartsGraph";
import HighstockGraph from "./components/Highcharts/HighstockGraph";
import {
  isRunningActivity,
  convertSpeedToPace,
} from "./components/utils/sportUtils";

const ActivityDetails = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    activities,
    loading,
    error,
    records,
    recordsLoading,
    selectedActivity,
    setSelectedActivity,
    deleteActivityById,
    deleting,
    updateActivityById,
    updating,
    domain,
    setDomain,
  } = useActivityDetailsContext();

  // Edit states
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isHighstock, setIsHighstock] = useState(false);

  // Handle delete button click
  const handleDeleteClick = useCallback(() => {
    setConfirmDelete(true);
    setDeleteError(null);
  }, []);

  // Handle confirmation of delete
  const handleConfirmDelete = useCallback(async () => {
    if (!selectedActivity) return;

    try {
      const result = await deleteActivityById(selectedActivity.id);

      if (result.success) {
        navigate("/activities");
      } else {
        setDeleteError(result.error || "Failed to delete activity");
        setConfirmDelete(false);
      }
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteError("An unexpected error occurred");
      setConfirmDelete(false);
    }
  }, [selectedActivity, deleteActivityById, navigate]);

  // Handle cancel delete
  const handleCancelDelete = useCallback(() => {
    setConfirmDelete(false);
    setDeleteError(null);
  }, []);

  // Edit handlers
  const handleEditTitle = useCallback(() => {
    if (selectedActivity) {
      setEditTitle(selectedActivity.name || "");
      setEditingTitle(true);
      setUpdateError(null);
    }
  }, [selectedActivity]);

  const handleEditDescription = useCallback(() => {
    if (selectedActivity) {
      setEditDescription(selectedActivity.description || "");
      setEditingDescription(true);
      setUpdateError(null);
    }
  }, [selectedActivity]);

  const handleSaveTitle = useCallback(async () => {
    if (!selectedActivity) return;

    try {
      const result = await updateActivityById(selectedActivity.id, {
        name: editTitle,
      });

      if (result.success) {
        setEditingTitle(false);
        setUpdateError(null);
      } else {
        setUpdateError(result.error || "Failed to update title");
      }
    } catch (err) {
      console.error("Update error:", err);
      setUpdateError("An unexpected error occurred");
    }
  }, [selectedActivity, editTitle, updateActivityById]);

  const handleSaveDescription = useCallback(async () => {
    if (!selectedActivity) return;

    try {
      const result = await updateActivityById(selectedActivity.id, {
        description: editDescription,
      });

      if (result.success) {
        setEditingDescription(false);
        setUpdateError(null);
      } else {
        setUpdateError(result.error || "Failed to update description");
      }
    } catch (err) {
      console.error("Update error:", err);
      setUpdateError("An unexpected error occurred");
    }
  }, [selectedActivity, editDescription, updateActivityById]);

  const handleCancelEdit = useCallback(() => {
    setEditingTitle(false);
    setEditingDescription(false);
    setUpdateError(null);
  }, []);

  // Effect to set selected activity based on URL parameter
  React.useEffect(() => {
    if (!activityId) return;

    const activity = activities.find((a) => a.id === activityId);
    if (activity && activity !== selectedActivity) {
      setSelectedActivity(activity);
    }
  }, [activityId, activities, selectedActivity, setSelectedActivity]);

  if (loading) {
    return (
      <Container sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">Error loading activities: {error}</Alert>
      </Container>
    );
  }

  if (!selectedActivity) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">Activity not found</Alert>
      </Container>
    );
  }

  const formatActivityDate = (timestamp: string): string => {
    try {
      return DateTime.fromISO(timestamp).toFormat("MMMM dd, yyyy 'at' h:mm a");
    } catch (error) {
      console.error("Error formatting activity date:", error);
      return "Unknown date";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
      {/* Back Link */}
      <MuiLink
        component={Link}
        to="/activities"
        sx={{ display: "flex", alignItems: "center", mb: 2 }}
      >
        <ArrowBack sx={{ mr: 1 }} />
        Back to Activities
      </MuiLink>

      {updateError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {updateError}
        </Alert>
      )}

      {deleteError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {deleteError}
        </Alert>
      )}

      {/* Activity Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              {editingTitle ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <TextField
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    variant="outlined"
                    fullWidth
                    disabled={updating}
                  />
                  <IconButton
                    onClick={handleSaveTitle}
                    disabled={updating}
                    color="primary"
                  >
                    <Save />
                  </IconButton>
                  <IconButton onClick={handleCancelEdit} disabled={updating}>
                    <Cancel />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="h4" component="h1">
                    {selectedActivity.name || "Unnamed Activity"}
                  </Typography>
                  <IconButton onClick={handleEditTitle} size="small">
                    <Edit />
                  </IconButton>
                </Box>
              )}

              <Typography variant="h6" color="text.secondary" gutterBottom>
                {formatActivityDate(selectedActivity.activity_timestamp)}
              </Typography>

              {selectedActivity.sport && (
                <Chip
                  label={selectedActivity.sport}
                  color="primary"
                  sx={{ mb: 2 }}
                />
              )}
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleDeleteClick}
                disabled={deleting}
              >
                Delete
              </Button>
            </Box>
          </Box>

          {/* Description */}
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Description
            </Typography>
            {editingDescription ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <TextField
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  multiline
                  rows={3}
                  variant="outlined"
                  fullWidth
                  disabled={updating}
                />
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<Save />}
                    onClick={handleSaveDescription}
                    disabled={updating}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleCancelEdit}
                    disabled={updating}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                <Typography variant="body1" sx={{ flex: 1 }}>
                  {selectedActivity.description || "No description provided"}
                </Typography>
                <IconButton onClick={handleEditDescription} size="small">
                  <Edit />
                </IconButton>
              </Box>
            )}
          </Box>

          {/* Stats Grid */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {selectedActivity.total_timer_time && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatsCard>
                  <Typography variant="subtitle2" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="h6">
                    {(() => {
                      const totalSeconds =
                        selectedActivity.total_timer_time || 0;
                      const hours = Math.floor(totalSeconds / 3600);
                      const minutes = Math.floor((totalSeconds % 3600) / 60);
                      const seconds = Math.floor(totalSeconds % 60);

                      if (hours > 0) {
                        return `${hours}:${minutes
                          .toString()
                          .padStart(2, "0")}:${seconds
                          .toString()
                          .padStart(2, "0")}`;
                      }
                      return `${minutes}:${seconds
                        .toString()
                        .padStart(2, "0")}`;
                    })()}
                  </Typography>
                </StatsCard>
              </Grid>
            )}

            {selectedActivity.avg_speed && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatsCard>
                  <Typography variant="subtitle2" color="text.secondary">
                    Avg {isRunningActivity(selectedActivity) ? "Pace" : "Speed"}
                  </Typography>
                  <Typography variant="h6">
                    {isRunningActivity(selectedActivity)
                      ? convertSpeedToPace(selectedActivity.avg_speed, true)
                      : `${(selectedActivity.avg_speed * 3.6).toFixed(1)} km/h`}
                  </Typography>
                </StatsCard>
              </Grid>
            )}

            {selectedActivity.avg_power && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatsCard>
                  <Typography variant="subtitle2" color="text.secondary">
                    Avg Power
                  </Typography>
                  <Typography variant="h6">
                    {selectedActivity.avg_power} W
                  </Typography>
                </StatsCard>
              </Grid>
            )}

            {selectedActivity.max_power && (
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatsCard>
                  <Typography variant="subtitle2" color="text.secondary">
                    Max Power
                  </Typography>
                  <Typography variant="h6">
                    {selectedActivity.max_power} W
                  </Typography>
                </StatsCard>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Chart Toggle */}
      <Box sx={{ display: "flex", justifyContent: "center", mb: 2, gap: 2 }}>
        {/* Chart Type Toggle */}
        <ToggleButtonGroup
          value={isHighstock ? "highstock" : "highcharts"}
          exclusive
          onChange={(_, value) => setIsHighstock(value === "highstock")}
        >
          <ToggleButton value="highcharts">
            <BarChart sx={{ mr: 1 }} />
            Standard Chart
          </ToggleButton>
          <ToggleButton value="highstock">
            <ShowChart sx={{ mr: 1 }} />
            Time Series Chart
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Domain Toggle */}
        <ToggleButtonGroup
          value={domain}
          exclusive
          onChange={(_, value) => value && setDomain(value)}
        >
          <ToggleButton value="time">
            <AccessTime sx={{ mr: 1 }} />
            Time
          </ToggleButton>
          <ToggleButton value="distance">
            <StraightenRounded sx={{ mr: 1 }} />
            Distance
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Charts */}
      <ChartSection>
        <Typography variant="h5" gutterBottom>
          Activity Data
        </Typography>
        <ChartContainer>
          {recordsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : records && records.length > 0 ? (
            isHighstock ? (
              <HighstockGraph />
            ) : (
              <HighchartsGraph />
            )
          ) : (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <Typography color="text.secondary">
                No chart data available for this activity.
              </Typography>
            </Box>
          )}
        </ChartContainer>
      </ChartSection>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDelete}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the activity "
            {selectedActivity.name || "Unnamed Activity"}"? This action cannot
            be undone and will permanently remove all associated data.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : undefined}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

const StatsCard = styled(Paper)`
  padding: 16px;
  text-align: center;
  height: 100%;
`;

const ChartSection = styled.section`
  width: 100%;
  margin: 6px 0;
`;

const ChartContainer = styled.div`
  width: 100%;
  min-height: 600px;
  position: relative;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 6px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 768px) {
    padding: 6px;
    min-height: 500px;
  }
`;

export default ActivityDetails;
