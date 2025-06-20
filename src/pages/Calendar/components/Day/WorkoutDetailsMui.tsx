import { Typography, Box, Button, Chip } from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { Link } from "react-router-dom";
import { useCalendarContext } from "../../context/CalendarContext";
import TypeIcon from "../../shared-styles/TypeIcon";

const WorkoutDetailsMui = () => {
  const { selectedWorkout } = useCalendarContext();

  if (!selectedWorkout) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "text.secondary",
          fontStyle: "italic",
        }}
      >
        <Typography variant="body1">
          Select a workout to view details
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 3,
          pb: 2,
          borderBottom: 1,
          borderColor: "divider",
          flexWrap: "wrap",
        }}
      >
        {selectedWorkout.type && (
          <Box sx={{ mr: 2, display: "flex", alignItems: "center" }}>
            <TypeIcon size={32} type={selectedWorkout.type} />
          </Box>
        )}

        <Typography
          variant="h5"
          component="h3"
          sx={{ mr: "auto", fontWeight: 600 }}
        >
          {selectedWorkout.name}
        </Typography>

        <Typography variant="body2" color="text.secondary">
          {selectedWorkout.date.toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </Typography>
      </Box>

      {/* Details Section */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Duration:
          </Typography>
          <Chip
            label={`${selectedWorkout.duration} min`}
            color="primary"
            variant="outlined"
          />
        </Box>

        <Box>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Description:
          </Typography>
          <Typography variant="body2">
            {selectedWorkout.description || "No description available"}
          </Typography>
        </Box>
      </Box>

      {/* Action Section */}
      <Box
        sx={{
          mt: 2,
          pt: 2,
          borderTop: 1,
          borderColor: "divider",
          position: "sticky",
          bottom: 0,
          bgcolor: "background.paper",
          zIndex: 1,
        }}
      >
        <Button
          component={Link}
          to={`/activities/${selectedWorkout.id}`}
          variant="contained"
          startIcon={<Visibility />}
          fullWidth
          sx={{
            borderRadius: 2,
            py: 1.5,
          }}
        >
          View Full Details
        </Button>
      </Box>
    </Box>
  );
};

export default WorkoutDetailsMui;
