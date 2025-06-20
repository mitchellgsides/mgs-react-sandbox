import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useActivityDetailsContext } from "../../context/useActivityDetailsContext";
import { isRunningActivity } from "../utils/sportUtils";
import { convertSpeedToPace } from "../utils/sportUtils";

const DataSummaryMui = () => {
  const { records, selectedActivity, speedIsKmh } = useActivityDetailsContext();

  if (records == null) return null;

  // Helper function to calculate duration
  const calculateDuration = () => {
    if (records.length > 0 && records[records.length - 1].timer_time) {
      const totalSeconds = records[records.length - 1].timer_time || 0;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = Math.floor(totalSeconds % 60);

      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
          .toString()
          .padStart(2, "0")}`;
      }
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
    return "N/A";
  };

  // Helper function to calculate average power
  const calculateAveragePower = () => {
    const powerRecords = records.filter((r) => r.power);
    if (powerRecords.length === 0) return "N/A";

    const avgPower = Math.round(
      powerRecords.reduce((sum, r) => sum + (r.power || 0), 0) /
        powerRecords.length
    );
    return `${avgPower} W`;
  };

  // Helper function to calculate max power
  const calculateMaxPower = () => {
    const powerRecords = records.filter((r) => r.power);
    if (powerRecords.length === 0) return "N/A";

    const maxPower = Math.round(
      Math.max(...powerRecords.map((r) => r.power || 0))
    );
    return `${maxPower} W`;
  };

  // Helper function to calculate average cadence
  const calculateAverageCadence = () => {
    const cadenceRecords = records.filter((r) => r.cadence);
    if (cadenceRecords.length === 0) return "N/A";

    const avgCadence = Math.round(
      cadenceRecords.reduce((sum, r) => sum + (r.cadence || 0), 0) /
        cadenceRecords.length
    );
    return `${avgCadence} rpm`;
  };

  // Helper function to calculate max cadence
  const calculateMaxCadence = () => {
    const cadenceRecords = records.filter((r) => r.cadence);
    if (cadenceRecords.length === 0) return "N/A";

    const maxCadence = Math.round(
      Math.max(...cadenceRecords.map((r) => r.cadence || 0))
    );
    return `${maxCadence} rpm`;
  };

  // Helper function to calculate speed/pace average
  const calculateAverageSpeedPace = () => {
    const speedRecords = records.filter((r) => r.speed);
    if (speedRecords.length === 0) return "N/A";

    const avgSpeedMs =
      speedRecords.reduce((sum, r) => sum + (r.speed || 0), 0) /
      speedRecords.length;

    if (isRunningActivity(selectedActivity)) {
      return convertSpeedToPace(avgSpeedMs, speedIsKmh);
    } else {
      if (speedIsKmh) {
        return `${avgSpeedMs.toFixed(2)} km/h`;
      } else {
        return `${(avgSpeedMs * 3.6).toFixed(2)} km/h`;
      }
    }
  };

  // Helper function to calculate speed/pace max
  const calculateMaxSpeedPace = () => {
    const speedRecords = records.filter((r) => r.speed);
    if (speedRecords.length === 0) return "N/A";

    const maxSpeedMs = Math.max(...speedRecords.map((r) => r.speed || 0));

    if (isRunningActivity(selectedActivity)) {
      return convertSpeedToPace(maxSpeedMs, speedIsKmh);
    } else {
      if (speedIsKmh) {
        return `${maxSpeedMs.toFixed(2)} km/h`;
      } else {
        return `${(maxSpeedMs * 3.6).toFixed(2)} km/h`;
      }
    }
  };

  // Helper function to calculate energy
  const calculateEnergy = () => {
    const powerRecords = records.filter((r) => r.power && r.timer_time);
    if (powerRecords.length === 0) return "N/A";

    let totalEnergy = 0;
    for (let i = 1; i < powerRecords.length; i++) {
      const timeDiff =
        (powerRecords[i].timer_time || 0) -
        (powerRecords[i - 1].timer_time || 0);
      const avgPower =
        ((powerRecords[i].power || 0) + (powerRecords[i - 1].power || 0)) / 2;
      totalEnergy += avgPower * timeDiff; // Watts * seconds = Joules
    }
    return `${(totalEnergy / 1000).toFixed(1)} kJ`; // Convert to kilojoules
  };

  // Helper function to calculate distance
  const calculateDistance = () => {
    if (records.length > 0 && records[records.length - 1].distance) {
      return `${(records[records.length - 1].distance! / 1000).toFixed(2)} km`;
    }
    return "N/A";
  };

  // Helper function to calculate elevation gain
  const calculateElevationGain = () => {
    const altitudeRecords = records.filter(
      (r) => r.altitude !== null && r.altitude !== undefined
    );
    if (altitudeRecords.length === 0) return "N/A";

    let totalGain = 0;
    for (let i = 1; i < altitudeRecords.length; i++) {
      const gain =
        (altitudeRecords[i].altitude || 0) -
        (altitudeRecords[i - 1].altitude || 0);
      if (gain > 0) totalGain += gain;
    }
    return `${Math.round(totalGain)} m`;
  };

  // Helper function to calculate average elevation
  const calculateAverageElevation = () => {
    const altitudeRecords = records.filter(
      (r) => r.altitude !== null && r.altitude !== undefined
    );
    if (altitudeRecords.length === 0) return "N/A";

    const avgElevation = Math.round(
      altitudeRecords.reduce((sum, r) => sum + (r.altitude || 0), 0) /
        altitudeRecords.length
    );
    return `${avgElevation} m`;
  };

  // Helper function to calculate average heart rate
  const calculateAverageHeartRate = () => {
    const heartRateRecords = records.filter((r) => r.heart_rate);
    if (heartRateRecords.length === 0) return "N/A";

    const avgHeartRate = Math.round(
      heartRateRecords.reduce((sum, r) => sum + (r.heart_rate || 0), 0) /
        heartRateRecords.length
    );
    return `${avgHeartRate} bpm`;
  };

  // Helper function to calculate max heart rate
  const calculateMaxHeartRate = () => {
    const heartRateRecords = records.filter((r) => r.heart_rate);
    if (heartRateRecords.length === 0) return "N/A";

    const maxHeartRate = Math.round(
      Math.max(...heartRateRecords.map((r) => r.heart_rate || 0))
    );
    return `${maxHeartRate} bpm`;
  };

  const performanceMetrics = [
    {
      metric: "Power",
      average: calculateAveragePower(),
      max: calculateMaxPower(),
    },
    {
      metric: "Cadence",
      average: calculateAverageCadence(),
      max: calculateMaxCadence(),
    },
    {
      metric: isRunningActivity(selectedActivity) ? "Pace" : "Speed",
      average: calculateAverageSpeedPace(),
      max: calculateMaxSpeedPace(),
    },
    { metric: "Energy (kJ)", average: calculateEnergy(), max: "-" },
    {
      metric: "Heart Rate",
      average: calculateAverageHeartRate(),
      max: calculateMaxHeartRate(),
    },
  ];

  const locationMetrics = [
    { metric: "Distance", average: calculateDistance(), max: "-" },
    { metric: "Elevation Gain", average: calculateElevationGain(), max: "-" },
    {
      metric: "Average Elevation",
      average: calculateAverageElevation(),
      max: "-",
    },
  ];

  return (
    <Box sx={{ borderTop: 1, borderColor: "divider", pt: 1 }}>
      <Typography variant="h6" sx={{ mb: 1, color: "text.primary" }}>
        Activity Summary
      </Typography>
      <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
        Duration: {calculateDuration()} • {records.length} data points
      </Typography>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "primary.main" }}>
                <TableCell
                  sx={{ color: "primary.contrastText", fontWeight: 600 }}
                >
                  Metric
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ color: "primary.contrastText", fontWeight: 600 }}
                >
                  Average
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ color: "primary.contrastText", fontWeight: 600 }}
                >
                  Max
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {performanceMetrics.map((row) => (
                <TableRow
                  key={row.metric}
                  sx={{
                    "&:nth-of-type(odd)": {
                      bgcolor: "action.hover",
                    },
                    "&:hover": {
                      bgcolor: "action.selected",
                    },
                  }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>{row.metric}</TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 600,
                      fontFamily: "Monaco, Menlo, Ubuntu Mono, monospace",
                    }}
                  >
                    {row.average}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: row.max === "-" ? 400 : 600,
                      opacity: row.max === "-" ? 0.5 : 1,
                      fontFamily:
                        row.max === "-"
                          ? "inherit"
                          : "Monaco, Menlo, Ubuntu Mono, monospace",
                    }}
                  >
                    {row.max}
                  </TableCell>
                </TableRow>
              ))}

              {/* Separator */}
              <TableRow>
                <TableCell
                  colSpan={3}
                  sx={{
                    height: 8,
                    bgcolor: "divider",
                    p: 0,
                    borderBottom: "none",
                  }}
                />
              </TableRow>

              {locationMetrics.map((row) => (
                <TableRow
                  key={row.metric}
                  sx={{
                    "&:nth-of-type(odd)": {
                      bgcolor: "action.hover",
                    },
                    "&:hover": {
                      bgcolor: "action.selected",
                    },
                  }}
                >
                  <TableCell sx={{ fontWeight: 500 }}>{row.metric}</TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 600,
                      fontFamily: "Monaco, Menlo, Ubuntu Mono, monospace",
                    }}
                  >
                    {row.average}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 400,
                      opacity: 0.5,
                    }}
                  >
                    {row.max}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default DataSummaryMui;
