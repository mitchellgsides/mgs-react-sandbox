import { useCallback, useState } from "react";
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  Box,
  Chip,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { DateTime } from "luxon";
import { useNavigate } from "react-router-dom";
import { useActivityDetailsContext } from "./context/useActivityDetailsContext";
import type { Activity } from "../../supabase/supabase.fitFiles";

const ActivityListPage = () => {
  const navigate = useNavigate();
  const {
    activities,
    loading,
    error,
    setSelectedActivity,
    deleteActivityById,
    deleting,
  } = useActivityDetailsContext();

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const formatDate = useCallback((timestamp: string): string => {
    try {
      return DateTime.fromISO(timestamp).toFormat("MMMM dd, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  }, []);

  const handleActivityClick = useCallback(
    (activity: Activity) => {
      console.log("Clicked activity full metadata:", activity);
      setSelectedActivity(activity);
      navigate(`/activities/${activity.id}`);
    },
    [setSelectedActivity, navigate]
  );

  const handleDeleteClick = useCallback(
    (e: React.MouseEvent, activityId: string) => {
      e.stopPropagation(); // Prevent activity click
      setConfirmDelete(activityId);
      setDeleteError(null);
    },
    []
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!confirmDelete) return;

    try {
      const result = await deleteActivityById(confirmDelete);
      if (result.success) {
        setConfirmDelete(null);
        setDeleteError(null);
      } else {
        setDeleteError(result.error || "Failed to delete activity");
      }
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteError("An unexpected error occurred");
    }
  }, [confirmDelete, deleteActivityById]);

  const handleCancelDelete = useCallback(() => {
    setConfirmDelete(null);
    setDeleteError(null);
  }, []);

  if (loading) {
    return (
      <Container
        maxWidth="md"
        sx={{ mt: 4, display: "flex", justifyContent: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Error loading activities: {error}</Alert>
      </Container>
    );
  }

  if (activities.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box textAlign="center">
          <Typography variant="h5" color="text.secondary" gutterBottom>
            No activities found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload some FIT files to get started!
          </Typography>
        </Box>
      </Container>
    );
  }

  const activityToDelete = activities.find((a) => a.id === confirmDelete);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h3" color="primary" gutterBottom>
        Activities
      </Typography>

      {deleteError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {deleteError}
        </Alert>
      )}

      <List>
        {activities.map((activity) => (
          <ListItem
            key={activity.id}
            disablePadding
            sx={{
              mb: 1,
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.paper",
              "&:hover": {
                bgcolor: "action.hover",
                transform: "translateX(4px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            <ListItemButton
              onClick={() => handleActivityClick(activity)}
              sx={{ py: 2 }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="h6" component="span">
                      {activity.name || "Unnamed Activity"}
                    </Typography>
                    {activity.sport && (
                      <Chip
                        label={activity.sport}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
                secondary={formatDate(activity.activity_timestamp)}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={(e) => handleDeleteClick(e, activity.id)}
                  disabled={deleting}
                  color="error"
                >
                  {deleting && confirmDelete === activity.id ? (
                    <CircularProgress size={20} />
                  ) : (
                    <DeleteIcon />
                  )}
                </IconButton>
              </ListItemSecondaryAction>
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Confirmation Dialog */}
      <Dialog
        open={!!confirmDelete}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the activity "
            {activityToDelete?.name || "Unnamed Activity"}"? This action cannot
            be undone.
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

export default ActivityListPage;
