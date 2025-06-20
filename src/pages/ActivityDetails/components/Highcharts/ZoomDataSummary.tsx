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

type ZoomRange = {
  start: string;
  end: string;
};

type ZoomDataSummaryProps = {
  zoomRange: ZoomRange;
  domain: "time" | "distance";
};

const ZoomDataSummary = ({ zoomRange, domain }: ZoomDataSummaryProps) => {
  const { records, selectedActivity, speedIsKmh } = useActivityDetailsContext();

  // Add debug logging
  console.log("ZoomDataSummary component rendered with:");
  console.log("- zoomRange:", zoomRange);
  console.log("- domain:", domain);
  console.log("- records count:", records?.length || 0);

  if (!records || records.length === 0) return null;

  // Helper function to parse time string to milliseconds
  const parseTimeToMs = (timeStr: string): number => {
    const parts = timeStr.split(":").map(Number);

    if (parts.length === 2) {
      // Format is MM:SS (minutes:seconds)
      const [minutes, seconds] = parts;
      return (minutes * 60 + seconds) * 1000;
    } else if (parts.length === 3) {
      // Format is HH:MM:SS (hours:minutes:seconds)
      const [hours, minutes, seconds] = parts;
      return (hours * 3600 + minutes * 60 + seconds) * 1000;
    } else {
      // Fallback: treat as seconds
      return parts[0] * 1000;
    }
  };

  // Helper function to parse distance string to meters
  const parseDistanceToMeters = (distanceStr: string): number => {
    const value = parseFloat(distanceStr.replace(/[^\d.]/g, ""));
    if (distanceStr.includes("km")) {
      return value * 1000; // Convert km to meters
    }
    return value; // Already in meters
  };

  // Filter records based on zoom range
  const getFilteredRecords = () => {
    console.log("ZoomDataSummary - Filtering records");
    console.log("Domain:", domain);
    console.log("Zoom range:", zoomRange);
    console.log("Total records:", records.length);

    if (domain === "time") {
      const startMs = parseTimeToMs(zoomRange.start);
      const endMs = parseTimeToMs(zoomRange.end);

      console.log("Parsed time range - start:", startMs, "end:", endMs);
      console.log(
        "Start seconds:",
        startMs / 1000,
        "End seconds:",
        endMs / 1000
      );
      console.log(
        "Sample record timer_time values:",
        records.slice(0, 5).map((r) => r.timer_time)
      );
      console.log(
        "Sample record timer_time range:",
        Math.min(...records.map((r) => r.timer_time || 0)),
        "to",
        Math.max(...records.map((r) => r.timer_time || 0))
      );

      // Convert milliseconds to seconds for comparison with timer_time
      // The chart x-axis is in milliseconds from start of activity
      // timer_time is in seconds from start of activity
      const startSeconds = startMs / 1000;
      const endSeconds = endMs / 1000;

      console.log(
        "Looking for timer_time between:",
        startSeconds,
        "and",
        endSeconds
      );

      const filtered = records.filter((record) => {
        const recordTime = record.timer_time || 0;
        // Direct comparison: timer_time is elapsed seconds from start
        const isInRange =
          recordTime >= startSeconds && recordTime <= endSeconds;
        return isInRange;
      });

      console.log("Filtered records count:", filtered.length);
      if (filtered.length > 0) {
        console.log(
          "First filtered record timer_time:",
          filtered[0].timer_time
        );
        console.log(
          "Last filtered record timer_time:",
          filtered[filtered.length - 1].timer_time
        );
      }
      return filtered;
    } else {
      // Distance mode - fixed to handle properly formatted distance strings
      const startMeters = parseDistanceToMeters(zoomRange.start);
      const endMeters = parseDistanceToMeters(zoomRange.end);

      console.log("Distance range - start:", startMeters, "end:", endMeters);
      console.log(
        "Distance range - parsed start:",
        zoomRange.start,
        "->",
        startMeters,
        "meters"
      );
      console.log(
        "Distance range - parsed end:",
        zoomRange.end,
        "->",
        endMeters,
        "meters"
      );
      console.log(
        "Sample record distance values (in km):",
        records.slice(0, 5).map((r) => r.distance)
      );
      console.log(
        "Sample record distance range (in km):",
        Math.min(...records.map((r) => r.distance || 0)),
        "to",
        Math.max(...records.map((r) => r.distance || 0))
      );

      const filtered = records.filter((record) => {
        // record.distance is in km, convert to meters for comparison
        const recordDistanceMeters = (record.distance || 0) * 1000;
        const isInRange =
          recordDistanceMeters >= startMeters &&
          recordDistanceMeters <= endMeters;
        return isInRange;
      });

      console.log("Filtered records count:", filtered.length);
      if (filtered.length > 0) {
        console.log(
          "First filtered record distance:",
          filtered[0].distance,
          "km"
        );
        console.log(
          "Last filtered record distance:",
          filtered[filtered.length - 1].distance,
          "km"
        );
      }
      return filtered;
    }
  };

  const filteredRecords = getFilteredRecords();

  if (filteredRecords.length === 0) {
    return (
      <Box sx={{ borderTop: 1, borderColor: "warning.main", pt: 1, mt: 1 }}>
        <Typography variant="h6" sx={{ mb: 1, color: "warning.main" }}>
          Zoom Selection Summary
        </Typography>
        <Paper elevation={2} sx={{ borderRadius: 2, p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            No data available for selected zoom range
          </Typography>
        </Paper>
      </Box>
    );
  }

  // Helper function to calculate duration for zoomed range
  const calculateZoomDuration = () => {
    if (filteredRecords.length === 0) return "N/A";

    const firstRecord = filteredRecords[0];
    const lastRecord = filteredRecords[filteredRecords.length - 1];
    const totalSeconds =
      (lastRecord.timer_time || 0) - (firstRecord.timer_time || 0);

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Helper function to calculate average power for zoomed range
  const calculateAveragePower = () => {
    const powerRecords = filteredRecords.filter((r) => r.power);
    if (powerRecords.length === 0) return "N/A";

    const avgPower = Math.round(
      powerRecords.reduce((sum, r) => sum + (r.power || 0), 0) /
        powerRecords.length
    );
    return `${avgPower} W`;
  };

  // Helper function to calculate max power for zoomed range
  const calculateMaxPower = () => {
    const powerRecords = filteredRecords.filter((r) => r.power);
    if (powerRecords.length === 0) return "N/A";

    const maxPower = Math.round(
      Math.max(...powerRecords.map((r) => r.power || 0))
    );
    return `${maxPower} W`;
  };

  // Helper function to calculate average cadence for zoomed range
  const calculateAverageCadence = () => {
    const cadenceRecords = filteredRecords.filter((r) => r.cadence);
    if (cadenceRecords.length === 0) return "N/A";

    const avgCadence = Math.round(
      cadenceRecords.reduce((sum, r) => sum + (r.cadence || 0), 0) /
        cadenceRecords.length
    );
    return `${avgCadence} rpm`;
  };

  // Helper function to calculate max cadence for zoomed range
  const calculateMaxCadence = () => {
    const cadenceRecords = filteredRecords.filter((r) => r.cadence);
    if (cadenceRecords.length === 0) return "N/A";

    const maxCadence = Math.round(
      Math.max(...cadenceRecords.map((r) => r.cadence || 0))
    );
    return `${maxCadence} rpm`;
  };

  // Helper function to calculate speed/pace average for zoomed range
  const calculateAverageSpeedPace = () => {
    const speedRecords = filteredRecords.filter((r) => r.speed);
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

  // Helper function to calculate speed/pace max for zoomed range
  const calculateMaxSpeedPace = () => {
    const speedRecords = filteredRecords.filter((r) => r.speed);
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

  // Helper function to calculate energy for zoomed range
  const calculateEnergy = () => {
    const powerRecords = filteredRecords.filter((r) => r.power && r.timer_time);
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

  // Helper function to calculate distance for zoomed range
  const calculateDistance = () => {
    if (filteredRecords.length === 0) return "N/A";

    const firstRecord = filteredRecords[0];
    const lastRecord = filteredRecords[filteredRecords.length - 1];

    if (!firstRecord.distance || !lastRecord.distance) return "N/A";

    const distanceDiff = (lastRecord.distance - firstRecord.distance) / 1000; // Convert to km
    return `${distanceDiff.toFixed(2)} km`;
  };

  // Helper function to calculate elevation gain for zoomed range
  const calculateElevationGain = () => {
    const altitudeRecords = filteredRecords.filter(
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

  // Helper function to calculate average elevation for zoomed range
  const calculateAverageElevation = () => {
    const altitudeRecords = filteredRecords.filter(
      (r) => r.altitude !== null && r.altitude !== undefined
    );
    if (altitudeRecords.length === 0) return "N/A";

    const avgElevation = Math.round(
      altitudeRecords.reduce((sum, r) => sum + (r.altitude || 0), 0) /
        altitudeRecords.length
    );
    return `${avgElevation} m`;
  };

  // Helper function to calculate average heart rate for zoomed range
  const calculateAverageHeartRate = () => {
    const heartRateRecords = filteredRecords.filter((r) => r.heart_rate);
    if (heartRateRecords.length === 0) return "N/A";

    const avgHeartRate = Math.round(
      heartRateRecords.reduce((sum, r) => sum + (r.heart_rate || 0), 0) /
        heartRateRecords.length
    );
    return `${avgHeartRate} bpm`;
  };

  // Helper function to calculate max heart rate for zoomed range
  const calculateMaxHeartRate = () => {
    const heartRateRecords = filteredRecords.filter((r) => r.heart_rate);
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
    <Box sx={{ borderTop: 1, borderColor: "warning.main", pt: 1, mt: 1 }}>
      <Typography variant="h6" sx={{ mb: 1, color: "warning.main" }}>
        Zoom Selection Summary
      </Typography>
      <Typography variant="body2" sx={{ mb: 1, color: "text.secondary" }}>
        Range: {zoomRange.start} - {zoomRange.end} • {filteredRecords.length}{" "}
        data points • Duration: {calculateZoomDuration()}
      </Typography>

      <Paper elevation={2} sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: "warning.main" }}>
                <TableCell
                  sx={{ color: "warning.contrastText", fontWeight: 600 }}
                >
                  Metric
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ color: "warning.contrastText", fontWeight: 600 }}
                >
                  Average
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ color: "warning.contrastText", fontWeight: 600 }}
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

export default ZoomDataSummary;
