import type { DefaultTheme } from "styled-components";

// Type definitions for Highcharts tooltip context
interface TooltipContext {
  x: number;
  points?: Array<{
    color: string;
    series: {
      name: string;
      options: {
        tooltip?: {
          valueSuffix?: string;
        };
      };
      chart: {
        series: Array<{
          name: string;
          visible: boolean;
          color: string;
          options: {
            tooltip?: {
              valueSuffix?: string;
            };
          };
          data: Array<{
            x: number;
            y: number | null;
          }>;
        }>;
      };
    };
    y: number;
  }>;
}

// Helper function to check if a series has any data
export const hasDataForSeries = (
  seriesName: string,
  allSeriesData: Array<{
    name: string;
    data: Array<{ x: number; y: number | null }>;
  }>
): boolean => {
  const series = allSeriesData.find((s) => s.name === seriesName);
  if (!series || !series.data) return false;

  return series.data.some(
    (point) => point.y !== null && point.y !== undefined && !isNaN(point.y)
  );
};

// Helper function to get value for a specific series at a given time
export const getValueForSeriesAtTime = (
  seriesName: string,
  time: number,
  allSeriesData: Array<{
    name: string;
    data: Array<{ x: number; y: number | null }>;
  }>
): number | null => {
  const series = allSeriesData.find((s) => s.name === seriesName);
  if (!series || !series.data) return null;

  // Find the exact data point at the given time first
  const exactPoint = series.data.find((point) => point.x === time);
  if (
    exactPoint &&
    exactPoint.y !== null &&
    exactPoint.y !== undefined &&
    !isNaN(exactPoint.y)
  ) {
    return exactPoint.y;
  }

  // If no exact match, find the closest data point to the given time
  const validPoints = series.data.filter(
    (point) => point.y !== null && point.y !== undefined && !isNaN(point.y)
  );

  if (validPoints.length === 0) return null;

  const closestPoint = validPoints.reduce((prev, curr) => {
    if (!prev || Math.abs(curr.x - time) < Math.abs(prev.x - time)) {
      return curr;
    }
    return prev;
  });

  return closestPoint ? closestPoint.y : null;
};

// Helper function to format time for tooltips
export const formatTimeForTooltip = (milliseconds: number): string => {
  const totalSeconds = milliseconds / 1000;
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

// Helper function to convert speed (m/s) to pace (min/km)
export const formatPace = (speedMs: number): string => {
  if (speedMs <= 0) return "∞:∞";

  const paceSecondsPerKm = 1000 / speedMs; // seconds per km
  const minutes = Math.floor(paceSecondsPerKm / 60);
  const seconds = Math.round(paceSecondsPerKm % 60);

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

// Helper function to format values based on series name
export const formatTooltipValue = (
  seriesName: string,
  value: number,
  suffix: string
): string => {
  const lowerName = seriesName.toLowerCase();

  // Power, cadence, heart rate, altitude - round to nearest integer
  if (
    lowerName.includes("power") ||
    lowerName.includes("cadence") ||
    lowerName.includes("heart") ||
    lowerName.includes("altitude") ||
    lowerName.includes("elevation")
  ) {
    return `${Math.round(value)}${suffix}`;
  }

  // Speed for cycling - round to 2 decimal places
  if (lowerName.includes("speed")) {
    return `${value.toFixed(2)}${suffix}`;
  }

  // Pace - convert from m/s to min/km format
  if (lowerName.includes("pace")) {
    return formatPace(value);
  }

  // Distance - round to 2 decimal places
  if (lowerName.includes("distance")) {
    return `${value.toFixed(2)}${suffix}`;
  }

  // Default - round to 1 decimal place
  return `${value.toFixed(1)}${suffix}`;
};

// Helper function to format distance for tooltips
export const formatDistanceForTooltip = (meters: number): string => {
  const km = meters / 1000;
  if (km < 1) {
    return `${meters.toFixed(0)} m`;
  }
  return `${km.toFixed(2)} km`;
};

// Helper function to find corresponding time for a distance value
export const getTimeForDistance = (
  distanceValue: number,
  distanceTimeData: number[][]
): number | null => {
  if (!distanceTimeData || distanceTimeData.length === 0) return null;

  // Find the exact distance point first
  const exactPoint = distanceTimeData.find(
    (point) => point[0] === distanceValue
  );
  if (exactPoint) {
    return exactPoint[1]; // Return the time value
  }

  // If no exact match, find the closest distance point
  const closestPoint = distanceTimeData.reduce((prev, curr) => {
    if (
      !prev ||
      Math.abs(curr[0] - distanceValue) < Math.abs(prev[0] - distanceValue)
    ) {
      return curr;
    }
    return prev;
  });

  return closestPoint ? closestPoint[1] : null;
};

// Main tooltip formatter function
export const createTooltipFormatter = (
  distanceData: number[][],
  currentTheme: DefaultTheme,
  formatTime: (ms: number) => string,
  availableSeriesNames?: string[], // Optional list of all available series names
  domain: "time" | "distance" = "time"
) => {
  return function (this: TooltipContext): string {
    // Format the x-axis value based on domain
    const xAxisStr =
      domain === "distance"
        ? formatDistanceForTooltip(this.x)
        : formatTime(this.x);

    let tooltipContent = `<b>${
      domain === "distance" ? "Distance" : "Time"
    }: ${xAxisStr}</b><br/>`;

    // When in distance mode, also show the corresponding time
    if (domain === "distance" && distanceData && distanceData.length > 0) {
      const correspondingTime = getTimeForDistance(this.x, distanceData);
      if (correspondingTime !== null) {
        const timeStr = formatTimeForTooltip(correspondingTime);
        tooltipContent += `<b>Time: ${timeStr}</b><br/>`;
      }
    }

    // Get all series from the chart to check what data is available
    const allSeries = this.points?.[0]?.series?.chart?.series || [];
    const allSeriesData = allSeries.map((s) => ({
      name: s.name,
      color: s.color,
      visible: s.visible,
      data: s.data,
      options: s.options,
    }));

    // Define the series we want to show (in order of preference)
    const seriesToShow = availableSeriesNames || [
      "Power",
      "Heart Rate",
      "Cadence",
      "Speed",
      "Pace",
      "Altitude",
      "Elevation",
    ];

    // Show series that have data available, even if no value at this specific point
    seriesToShow.forEach((seriesName) => {
      const seriesData = allSeriesData.find(
        (s) => s.name === seriesName && s.visible
      );

      if (seriesData && hasDataForSeries(seriesName, allSeriesData)) {
        // Try to get value from current points first
        const currentPoint = this.points?.find(
          (p) => p.series.name === seriesName
        );
        let value: number | null = null;
        let suffix = "";

        if (currentPoint) {
          value = currentPoint.y;
          suffix = currentPoint.series.options.tooltip?.valueSuffix || "";
        } else {
          // If no current point, try to get nearest value
          value = getValueForSeriesAtTime(seriesName, this.x, allSeriesData);
          suffix = seriesData.options.tooltip?.valueSuffix || "";
        }

        if (value !== null && value !== undefined && !isNaN(value)) {
          const formattedValue = formatTooltipValue(seriesName, value, suffix);
          tooltipContent += `<span style="color:${seriesData.color}">${seriesName}</span>: <b>${formattedValue}</b><br/>`;
        } else {
          // Show "N/A" for series that have data but no value at this point
          tooltipContent += `<span style="color:${seriesData.color}">${seriesName}</span>: <b>N/A</b><br/>`;
        }
      }
    });

    // Add distance information to tooltip if available
    if (distanceData && distanceData.length > 0) {
      const currentTime = this.x;
      const closestDistance = distanceData.reduce((prev, curr) =>
        Math.abs(curr[0] - currentTime) < Math.abs(prev[0] - currentTime)
          ? curr
          : prev
      );
      if (closestDistance && closestDistance.length >= 2) {
        const distanceKm = (closestDistance[1] / 1000).toFixed(2);
        tooltipContent += `<span style="color:${currentTheme.colors.success}">Distance</span>: <b>${distanceKm} km</b><br/>`;
      }
    }

    return tooltipContent;
  };
};

// Tooltip positioner to keep consistent height
export const createTooltipPositioner = () => {
  return function (
    this: { chart: { plotLeft: number; plotTop: number; plotWidth: number } },
    labelWidth: number,
    _labelHeight: number,
    point: { plotX: number }
  ): { x: number; y: number } {
    const chart = this.chart;
    const plotLeft = chart.plotLeft;
    const plotTop = chart.plotTop;
    const plotWidth = chart.plotWidth;

    // Calculate x position (follow mouse horizontally but with padding)
    let x = point.plotX + plotLeft;

    // Keep tooltip within chart bounds horizontally
    if (x + labelWidth > plotLeft + plotWidth) {
      x = plotLeft + plotWidth - labelWidth - 10;
    }
    if (x < plotLeft) {
      x = plotLeft + 10;
    }

    // Fixed y position - always show tooltip at the top of the chart area
    const y = plotTop + 10;

    return { x, y };
  };
};

// Complete tooltip configuration
export const createTooltipConfig = (
  distanceData: number[][],
  currentTheme: DefaultTheme,
  formatTime: (ms: number) => string,
  availableSeriesNames?: string[],
  domain: "time" | "distance" = "time"
) => ({
  shared: true,
  split: false, // Keep tooltip unified - important for Highstock
  followPointer: true, // Make tooltip follow the mouse
  hideDelay: 100,
  outside: false,
  crosshairs: [
    {
      width: 1,
      color: "#666666",
      dashStyle: "solid" as const,
    },
    false,
  ],
  backgroundColor: currentTheme.colors.surface,
  borderColor: currentTheme.colors.border,
  borderRadius: 4,
  shadow: true,
  useHTML: false,
  style: {
    color: currentTheme.colors.text,
  },
  formatter: createTooltipFormatter(
    distanceData,
    currentTheme,
    formatTime,
    availableSeriesNames,
    domain
  ),
  positioner: createTooltipPositioner(),
});
