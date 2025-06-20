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
    };
    y: number;
  }>;
}

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

// Main tooltip formatter function
export const createTooltipFormatter = (
  distanceData: number[][],
  currentTheme: DefaultTheme,
  formatTime: (ms: number) => string
) => {
  return function (this: TooltipContext): string {
    const timeStr = formatTime(this.x);
    let tooltipContent = `<b>Time: ${timeStr}</b><br/>`;

    if (this.points) {
      this.points.forEach((point) => {
        const suffix = point.series.options.tooltip?.valueSuffix || "";
        tooltipContent += `<span style="color:${point.color}">${point.series.name}</span>: <b>${point.y}${suffix}</b><br/>`;
      });
    }

    // Add distance information to tooltip if available
    if (distanceData && distanceData.length > 0) {
      // Find the closest distance data point to the current time
      const currentTime = this.x;
      const closestDistance = distanceData.reduce((prev, curr) =>
        Math.abs(curr[0] - currentTime) < Math.abs(prev[0] - currentTime)
          ? curr
          : prev
      );
      if (closestDistance && closestDistance.length >= 2) {
        tooltipContent += `<span style="color:${
          currentTheme.colors.success
        }">Distance</span>: <b>${(closestDistance[1] / 1000).toFixed(
          2
        )} km</b><br/>`;
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
  formatTime: (ms: number) => string
) => ({
  shared: true,
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
  formatter: createTooltipFormatter(distanceData, currentTheme, formatTime),
  positioner: createTooltipPositioner(),
});
