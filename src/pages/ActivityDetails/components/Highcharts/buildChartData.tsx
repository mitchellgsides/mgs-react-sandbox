import type { ActivityRecord } from "../../context/ActivityDetailsContext";
import type { DefaultTheme } from "styled-components";

export const buildChartData = (
  records: ActivityRecord[],
  theme: DefaultTheme
) => {
  const processedData = records.map((record) => ({
    time: record.timer_time, // Using timer_time as x-axis (active time in seconds)
    timeMs: record.timer_time * 1000, // Convert to milliseconds for Highcharts
    heartRate: record.heart_rate || null,
    power: record.power || null,
    speed: record.speed ? record.speed : null,
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

  const cadenceData = processedData
    .filter((d) => d.cadence !== null)
    .map((d) => [d.timeMs, d.cadence!]);

  const distanceData = processedData
    .filter((d) => d.distance !== null)
    .map((d) => [d.timeMs, d.distance!]);

  const altitudeData = processedData
    .filter((d) => d.altitude !== null)
    .map((d) => [d.timeMs, d.altitude!]);

  // HasData functions
  const hasHeartRateData = heartRateData.length > 0;
  const hasPowerData = powerData.length > 0;
  const hasSpeedData = speedData.length > 0;
  const hasCadenceData = cadenceData.length > 0;
  const hasDistanceData = distanceData.length > 0;
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

  if (hasSpeedData) {
    yAxes.push({
      id: "speed",
      title: {
        text: "Speed (km/h)",
        style: { color: theme.colors.info },
      },
      labels: {
        style: { color: theme.colors.info },
      },
      min: 0,
      gridLineColor: "transparent",
      softMax: Math.max(...speedData.map((i) => i[1])),
      //   opposite: false,
      plotLines: [],
      endOnTick: false,
      //   offset: offsetCount > 1 ? Math.floor(offsetCount / 2) * 50 : 0,
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

  if (hasDistanceData) {
    yAxes.push({
      id: "distance",
      title: {
        // text: "Distance (km)",
        text: "",
        style: { color: theme.colors.success },
      },
      labels: {
        text: "",
        style: { color: theme.colors.success },
      },
      gridLineColor: "transparent",
      plotLines: [],
      //   opposite: false,
      //   offset: offsetCount > 1 ? Math.floor(offsetCount / 2) * 50 : 0,
    });
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
    series: [
      hasHeartRateData && {
        name: "Heart Rate",
        data: heartRateData,
        yAxis: "heartrate",
        type: "line",
        color: theme.colors.danger,
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
        tooltip: {
          valueSuffix: " w",
        },
      },
      hasSpeedData && {
        name: "Speed",
        data: speedData,
        yAxis: "speed",
        type: "line",
        color: theme.colors.info,
        tooltip: {
          valueSuffix: " km/h",
        },
      },
      hasCadenceData && {
        name: "Cadence",
        data: cadenceData,
        yAxis: "cadence",
        type: "line",
        color: theme.colors.secondary,
        tooltip: {
          valueSuffix: " rpm",
        },
      },
      hasDistanceData && {
        name: "Distance",
        data: distanceData,
        yAxis: "distance",
        type: "line",
        color: theme.colors.success,
        tooltip: {
          valueSuffix: " km",
        },
      },
      hasAltitudeData && {
        name: "Altitude",
        data: altitudeData, // Ensure no null values
        yAxis: "altitude",
        type: "area",
        color: `${theme.colors.light}4f`, // Adding transparency
        tooltip: {
          valueSuffix: " m",
        },
      },
    ].filter(Boolean),
  };
};
