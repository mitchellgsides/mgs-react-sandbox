import { format, isSameDay } from "date-fns";
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemButton,
} from "@mui/material";
import WeekSummaryMui from "../WeekSummaryMui";
import WorkoutDetailsMui from "./WorkoutDetailsMui";
import { useCalendarContext } from "../../context/CalendarContext";
import DayText from "../../shared-styles/DayText";
import { WorkoutDuration } from "../../../../components/DisplayStyles";

const DayDetailsMui = () => {
  const { handleWorkoutClick, selectedWorkout, selectedDate, workouts } =
    useCalendarContext();

  // Filter workouts for the selected date
  const dayWorkouts = workouts.filter(
    (wo) => selectedDate && isSameDay(wo.date, selectedDate)
  );

  return (
    <Box
      sx={{
        display: "flex",
        mt: 2,
        height: "auto",
        minHeight: 300,
        maxHeight: "calc(50vh - 100px)",
        gap: 2,
      }}
    >
      {/* Day Details Section */}
      <Paper
        elevation={2}
        sx={{
          flex: 2,
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "primary.main",
            color: "primary.contrastText",
          }}
        >
          <Typography variant="h6" component="h2">
            {selectedDate && format(selectedDate, "EEEE, MMMM d, yyyy")}
          </Typography>
        </Box>

        {/* Content */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 3fr",
            height: "100%",
            minHeight: 250,
            overflow: "hidden",
          }}
        >
          {/* Workout List */}
          <Box
            sx={{
              borderRight: 1,
              borderColor: "divider",
              overflow: "auto",
              maxHeight: "100%",
            }}
          >
            <List dense>
              {dayWorkouts.map((workout) => (
                <ListItem key={workout.id} disablePadding>
                  <ListItemButton
                    selected={selectedWorkout?.id === workout.id}
                    onClick={() => handleWorkoutClick(workout)}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      py: 1,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                      }}
                    >
                      <DayText
                        text={workout.name}
                        size={24}
                        workoutType={workout.type}
                        showIcon
                      />
                    </Box>
                    <WorkoutDuration duration={workout.duration ?? ""} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Workout Details */}
          <Box
            sx={{
              flex: 1,
              overflow: "auto",
              maxHeight: "100%",
              p: 1,
            }}
          >
            {selectedWorkout ? <WorkoutDetailsMui /> : <Box />}
          </Box>
        </Box>
      </Paper>

      {/* Week Summary */}
      <WeekSummaryMui selectedDate={selectedDate} />
    </Box>
  );
};

export default DayDetailsMui;
