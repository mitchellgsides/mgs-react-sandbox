import type { ActivityRecord } from "../../context/ActivityDetailsContext";
import type { Activity } from "../../../../supabase/supabase.fitFiles";
import type { DefaultTheme } from "styled-components";
import {
  isRunningActivity,
  convertSpeedToPaceDecimal,
  getSeriesOpacity,
  formatPaceTooltip,
  formatSpeedTooltip,
} from "../utils/sportUtils";

export const buildChartData = (
  records: ActivityRecord[],
  theme: DefaultTheme,
  activity: Activity | null = null
) => {
  const isRunning = isRunningActivity(activity);
  // Note: isCycling detection available for future cycling-specific features

  const processedData = records.map((record) => ({
    time: record.timer_time || 0, // Using timer_time as x-axis (active time in seconds)
    timeMs: (record.timer_time || 0) * 1000, // Convert to milliseconds for Highcharts
    heartRate: record.heart_rate || null,
    power: record.power || null,
    speed: record.speed ? record.speed : null,
    // For running activities, convert speed to pace (decimal minutes per km)
    pace:
      record.speed && isRunning
        ? convertSpeedToPaceDecimal(record.speed)
        : null,
    cadence: record.cadence || null,
    distance: record.distance ? record.distance : null,
    altitude: record.altitude || null,
  }));
  // Create series data arrays (no custom smoothing - let Highstock handle it)
  const heartRateData = processedData
    .filter((d) => d.heartRate !== null)
    .map((d) => [d.timeMs, d.heartRate!]);

  const powerData = processedData
    .filter((d) => d.power !== null)
    .map((d) => [d.timeMs, d.power!]);

  const speedData = processedData
    .filter((d) => d.speed !== null)
    .map((d) => [d.timeMs, d.speed!]);

  const paceData = processedData
    .filter((d) => d.pace !== null)
    .map((d) => [d.timeMs, d.pace!]);

  const cadenceData = processedData
    .filter((d) => d.cadence !== null)
    .map((d) => [d.timeMs, d.cadence!]);

  const distanceData = processedData
    .filter((d) => d.distance !== null)
    .map((d) => [d.timeMs, d.distance!]);

  const altitudeData = processedData
    .filter((d) => d.altitude !== null)
    .map((d) => [d.timeMs, Math.round(d.altitude! * 1000)]);

  // HasData functions
  const hasHeartRateData = heartRateData.length > 0;
  const hasPowerData = powerData.length > 0;
  const hasSpeedData = speedData.length > 0;
  const hasPaceData = paceData.length > 0;
  const hasCadenceData = cadenceData.length > 0;
  // Note: hasDistanceData removed since distance is no longer plotted as a series
  const hasAltitudeData = altitudeData.length > 0;

  // Build y-axes dynamically based on available data
  const yAxes = [];
  let offsetCount = 0;

  if (hasPowerData) {
    yAxes.push({
      //   opposite: false,
      endOnTick: false,
      plotLines: [
        {
          color: "white",
          value: 300,
          id: "FTP",
          label: {
            text: `FTP ${300}w`,
            align: "right",
            x: -5,
            style: {
              color: "white",
              fontWeight: "bold",
              fontSize: "12px",
              fontFamily: "proxima-nova",
              textShadow: "2px 2px 8px rgba(0,0,0,0.6)",
            },
          },
          zIndex: 5,
          width: 1,
          // shadow: true,
        },
      ],
      id: "power",
      title: {
        text: "Power (W)",
        style: { color: theme.colors.warning },
      },
      labels: {
        align: "left",
        x: 5,
        y: -5,
        style: {
          fontSize: "9px",
          color: theme.colors.text,
          fontFamily: theme.fonts.main,
        },
        zIndex: 1,
        enabled: true,
      },
      gridLineColor: "transparent",
      //   offset: offsetCount > 0 ? offsetCount * 50 : 0,
      minRange: Math.max(...powerData.map((i) => i[1]), 450),
    });
    offsetCount++;
  }

  if (hasHeartRateData) {
    yAxes.push({
      id: "heartrate",
      title: {
        text: "Heart Rate (bpm)",
        style: { color: theme.colors.danger },
      },
      gridLineColor: "transparent",
      labels: {
        align: "left",
        x: 5,
        y: -5,
        style: {
          fontSize: "9px",
          color: theme.colors.text,
          fontFamily: theme.fonts.main,
        },
      },
      min: 40,
      zIndex: 1,
      //   offset: offsetCount > 1 ? Math.floor(offsetCount / 2) * 50 : 0,
    });
  }

  if (hasSpeedData || hasPaceData) {
    const isShowingPace = isRunning && hasPaceData;
    yAxes.push({
      id: isShowingPace ? "pace" : "speed",
      title: {
        text: isShowingPace ? "Pace (min/km)" : "Speed (km/h)",
        style: { color: theme.colors.info },
      },
      labels: {
        style: { color: theme.colors.info },
      },
      min: 0,
      gridLineColor: "transparent",
      softMax: isShowingPace
        ? Math.max(...paceData.map((i) => i[1]))
        : Math.max(...speedData.map((i) => i[1])),
      plotLines: [],
      endOnTick: false,
      // For pace, reverse the axis so faster times (lower values) are at the top
      reversed: isShowingPace,
    });
  }

  if (hasCadenceData) {
    yAxes.push({
      id: "cadence",
      title: {
        text: "Cadence (rpm)",
        style: { color: theme.colors.secondary },
      },
      labels: {
        style: { color: theme.colors.secondary },
      },
      gridLineColor: "transparent",
      //   opposite: true,
      offset: offsetCount > 0 ? offsetCount * 50 : 0,
    });
    offsetCount++;
  }

  if (hasAltitudeData) {
    yAxes.push({
      id: "altitude",
      startOnTick: false,
      endOnTick: false,
      min: Math.min(...altitudeData.map((i) => i[1]), 0),
      max: Math.max(...altitudeData.map((i) => i[1]), 1000),
      title: {
        text: "Altitude (m)",
        style: { color: theme.colors.light },
      },
      gridLineColor: "transparent",
      labels: {
        enabled: true,
      },
    });
  }

  // Configure data grouping based on selected interval
  const dataGroupingConfig = {
    enabled: true,
    approximation: "average",
    groupPixelWidth: 1,
    units: [["second", [1, 5, 10, 30, 60]]],
  };

  return {
    config: dataGroupingConfig,
    yAxes: [...yAxes],
    // Keep distance data available for summary/tooltip usage
    distanceData,
    series: [
      hasHeartRateData && {
        name: "Heart Rate",
        data: heartRateData,
        yAxis: "heartrate",
        type: "line",
        color: theme.colors.danger,
        opacity: getSeriesOpacity("Heart Rate", activity),
        tooltip: {
          valueSuffix: " bpm",
        },
      },
      hasPowerData && {
        name: "Power",
        data: powerData,
        yAxis: "power",
        type: "line",
        color: theme.colors.warning,
        opacity: getSeriesOpacity("Power", activity),
        tooltip: {
          valueSuffix: " w",
        },
      },
      // Show pace for running activities, speed for cycling/others
      isRunning && hasPaceData
        ? {
            name: "Pace",
            data: paceData,
            yAxis: "pace",
            type: "line",
            color: theme.colors.info,
            opacity: getSeriesOpacity("Speed", activity), // Use "Speed" key for consistency
            tooltip: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter: function (this: any) {
                return `<span style="color:${this.color}">${
                  this.series.name
                }</span>: <b>${formatPaceTooltip(this.y)}</b><br/>`;
              },
              useHTML: false,
            },
          }
        : hasSpeedData && {
            name: "Speed",
            data: speedData,
            yAxis: "speed",
            type: "line",
            color: theme.colors.info,
            opacity: getSeriesOpacity("Speed", activity),
            tooltip: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter: function (this: any) {
                return `<span style="color:${this.color}">${
                  this.series.name
                }</span>: <b>${formatSpeedTooltip(this.y)}</b><br/>`;
              },
              useHTML: false,
            },
          },
      hasCadenceData && {
        name: "Cadence",
        data: cadenceData,
        yAxis: "cadence",
        type: "line",
        color: theme.colors.secondary,
        opacity: getSeriesOpacity("Cadence", activity),
        tooltip: {
          valueSuffix: " rpm",
        },
      },
      // Note: Distance series removed from chart display but data still available for summary/tooltip
      hasAltitudeData && {
        name: "Altitude",
        data: altitudeData, // Ensure no null values
        yAxis: "altitude",
        type: "area",
        color: `${theme.colors.light}4f`, // Adding transparency
        opacity: getSeriesOpacity("Altitude", activity),
        tooltip: {
          valueSuffix: " m",
        },
      },
    ].filter(Boolean),
  };
};
