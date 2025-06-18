import type { Activity } from "../../../../supabase/supabase.fitFiles";

// Sport detection utilities
export const isRunningActivity = (activity: Activity | null): boolean => {
  if (!activity?.sport) return false;
  const sport = activity.sport.toLowerCase();
  return sport === "running" || sport === "run";
};

export const isCyclingActivity = (activity: Activity | null): boolean => {
  if (!activity?.sport) return false;
  const sport = activity.sport.toLowerCase();
  return sport === "cycling" || sport === "bike" || sport === "biking";
};

// Pace conversion utilities
export const convertSpeedToPace = (speedMs: number): string => {
  // Convert m/s to min/km
  if (speedMs <= 0) return "0:00";

  const kmPerHour = speedMs * 3.6;
  const minPerKm = 60 / kmPerHour;

  const minutes = Math.floor(minPerKm);
  const seconds = Math.round((minPerKm - minutes) * 60);

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export const convertSpeedToPaceDecimal = (speedMs: number): number => {
  // Convert m/s to decimal minutes per km for chart plotting
  if (speedMs <= 0) return 0;

  const kmPerHour = speedMs * 3.6;
  return 60 / kmPerHour; // minutes per km as decimal
};

export const formatPaceTooltip = (paceDecimal: number): string => {
  // Convert decimal minutes per km back to mm:ss format for tooltip
  const minutes = Math.floor(paceDecimal);
  const seconds = Math.round((paceDecimal - minutes) * 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")} min/km`;
};

// Speed formatting for cycling
export const formatSpeedTooltip = (speedMs: number): string => {
  return `${(speedMs * 3.6).toFixed(1)} km/h`;
};

// Chart opacity configuration based on sport
export const getSeriesOpacity = (
  seriesName: string,
  activity: Activity | null
): number => {
  const isRunning = isRunningActivity(activity);
  const isCycling = isCyclingActivity(activity);

  // Default opacity for unknown sports
  if (!isRunning && !isCycling) return 1.0;

  if (isRunning) {
    // For running: pace/speed is primary, others are secondary
    return seriesName === "Speed" ? 1.0 : 0.6;
  }

  if (isCycling) {
    // For cycling: power is primary, others are secondary
    return seriesName === "Power" ? 1.0 : 0.6;
  }

  return 1.0;
};
