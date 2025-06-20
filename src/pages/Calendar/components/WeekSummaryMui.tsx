import { endOfWeek, format, startOfWeek } from "date-fns";
import { Paper, Typography, Box } from "@mui/material";

type WeekSummaryProps = {
  selectedDate: Date | null;
};

const WeekSummaryMui = ({ selectedDate }: WeekSummaryProps) => {
  return (
    <Paper
      elevation={2}
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "primary.main",
          color: "primary.contrastText",
        }}
      >
        <Typography variant="h6" component="h3">
          Week Summary
        </Typography>
      </Box>

      <Box sx={{ p: 3, flex: 1 }}>
        <Typography variant="body1">
          Summary of events for the week of{" "}
          {selectedDate != null &&
            format(
              startOfWeek(selectedDate, { weekStartsOn: 0 }),
              "MMM d"
            )}{" "}
          -{" "}
          {selectedDate != null &&
            format(endOfWeek(selectedDate, { weekStartsOn: 0 }), "MMM d")}
        </Typography>
      </Box>
    </Paper>
  );
};

export default WeekSummaryMui;
