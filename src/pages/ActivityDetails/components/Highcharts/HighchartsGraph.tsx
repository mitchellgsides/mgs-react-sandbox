import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import styled, { ThemeProvider } from "styled-components";
import { useActivityDetailsContext } from "../../context/useActivityDetailsContext";
import { darkTheme, lightTheme } from "../../../../theme/theme";
import { useAuthContext } from "../../../../contexts/Auth/useAuthContext";
import { buildChartData } from "./buildChartData";
import { isRunningActivity, convertSpeedToPace } from "../utils/sportUtils";

const HighchartsGraph = () => {
  const { records, selectedActivity } = useActivityDetailsContext();
  const chartRef = useRef<HighchartsReact.RefObject>(null);

  // Debug logs
  useEffect(() => {
    console.log("HighchartsGraph - Selected Activity:", selectedActivity?.id);
    console.log("HighchartsGraph - Records:", records?.length);
  }, [records, selectedActivity]);
  const { profile } = useAuthContext();
  const [zoomInfo, setZoomInfo] = useState<{
    start: string;
    end: string;
  } | null>(null);

  // Reset state when activity changes
  useEffect(() => {
    setZoomInfo(null);
  }, [selectedActivity?.id]);

  // Add resize handler to reflow chart when container size changes
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      // Debounce resize events to avoid excessive reflows
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (chartRef.current?.chart) {
          chartRef.current.chart.reflow();
        }
      }, 150);
    };

    window.addEventListener("resize", handleResize);

    // Also handle when the component mounts/updates with ResizeObserver for container changes
    let resizeObserver: ResizeObserver | null = null;

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });

      // Observe the chart container if it exists
      const chartContainer = chartRef.current?.container?.current;
      if (chartContainer) {
        resizeObserver.observe(chartContainer);
      }
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(resizeTimeout);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [records, selectedActivity]);

  // const currentTheme = profile?.theme === "dark" ? darkTheme : lightTheme;
  const currentTheme = profile?.theme === "dark" ? darkTheme : lightTheme;

  // Helper function to format time for zoom summary - wrapped in useCallback
  const formatTime = useCallback((milliseconds: number) => {
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
  }, []);

  // Smoothing function - applies moving average over specified time window
  // const applySmoothingToSeries = (
  //   data: [number, number][],
  //   windowSeconds: number
  // ) => {
  //   if (windowSeconds <= 1 || data.length === 0) {
  //     return data; // No smoothing needed
  //   }

  //   const windowMs = windowSeconds * 1000;
  //   const smoothedData: [number, number][] = [];

  //   for (let i = 0; i < data.length; i++) {
  //     const currentTime = data[i][0];
  //     const windowStart = currentTime - windowMs / 2;
  //     const windowEnd = currentTime + windowMs / 2;

  //     // Find all points within the smoothing window
  //     const windowPoints = data.filter(
  //       (point) => point[0] >= windowStart && point[0] <= windowEnd
  //     );

  //     if (windowPoints.length > 0) {
  //       // Calculate average value for the window
  //       const averageValue =
  //         windowPoints.reduce((sum, point) => sum + point[1], 0) /
  //         windowPoints.length;
  //       smoothedData.push([currentTime, averageValue]);
  //     } else {
  //       // If no points in window, use original value
  //       smoothedData.push(data[i]);
  //     }
  //   }

  //   return smoothedData;
  // };

  const chartOptions = useMemo(() => {
    if (!records || records.length === 0) {
      return null;
    }

    const {
      yAxes,
      series: seriesData,
      distanceData,
    } = buildChartData(records, currentTheme, selectedActivity);

    return {
      chart: {
        type: "line",
        reflow: true,
        height: 400,
        zoomType: "x",
        backgroundColor: currentTheme.colors.surface,
        marginLeft: 50,
        marginRight: 20,
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        selectionMarkerFill: "rgba(0, 100, 200, 0.25)",
        animation: false,
        style: {
          fontFamily: "inherit",
        },
        resetZoomButton: {
          position: {
            align: "right",
            verticalAlign: "top",
            x: -10,
            y: 10,
          },
        },
        events: {
          click: function (
            this: Highcharts.Chart,
            event: Highcharts.PointerEventObject
          ) {
            console.log("Chart clicked:", event);
          },
          selection: function (
            this: Highcharts.Chart,
            event: Highcharts.SelectEventObject
          ) {
            console.log("Selection event triggered:", event);
            if (event.xAxis && event.xAxis[0]) {
              console.log(
                "xAxis min:",
                event.xAxis[0].min,
                "max:",
                event.xAxis[0].max
              );
              const start = formatTime(event.xAxis[0].min);
              const end = formatTime(event.xAxis[0].max);
              console.log("Formatted times - start:", start, "end:", end);
              setZoomInfo({ start, end });
            } else {
              console.log("No xAxis data in selection event");
            }
            return true; // Allow the zoom
          },
        },
      },
      title: {
        text: `Activity Data - ${selectedActivity?.sport || "Unknown Sport"}`,
        style: {
          fontSize: "18px",
          fontWeight: "bold",
          color: currentTheme.colors.text,
        },
      },
      subtitle: {
        text: `Drag to zoom in on time range`,
        style: {
          color: currentTheme.colors.text,
        },
      },
      xAxis: {
        min: 0,
        type: "datetime",
        title: {
          text: "Active Time",
          style: {
            color: currentTheme.colors.text,
          },
        },
        labels: {
          // eslint-isable-next-line @typescript-eslint/no-explicit-any
          formatter: function (
            this: Highcharts.AxisLabelsFormatterContextObject
          ) {
            return formatTime(this.value as number);
          },
          style: {
            color: currentTheme.colors.text,
          },
        },
        events: {
          afterSetExtremes: function (
            this: Highcharts.Axis,
            event: Highcharts.AxisSetExtremesEventObject
          ) {
            console.log("afterSetExtremes event triggered:", event);
            console.log(
              "Event details - trigger:",
              event.trigger,
              "min:",
              event.min,
              "max:",
              event.max
            );
            const extremes = this.getExtremes();
            console.log(
              "Axis details - dataMin:",
              extremes.dataMin,
              "dataMax:",
              extremes.dataMax
            );

            if (event.min !== undefined && event.max !== undefined) {
              // First check if we're back to full range - this is a reset
              if (
                event.min === extremes.dataMin &&
                event.max === extremes.dataMax
              ) {
                console.log("Chart reset detected, clearing zoom info");
                setZoomInfo(null);
              }
              // Only set zoom info when extremes change from user interaction, not on resets
              else if (event.trigger && event.trigger !== "updatedData") {
                const start = formatTime(event.min);
                const end = formatTime(event.max);
                console.log("Setting zoom info - start:", start, "end:", end);
                setZoomInfo({ start, end });
              }
            }
          },
        },
      },
      yAxis: yAxes,
      series: seriesData,
      tooltip: {
        shared: true,
        crosshairs: [
          {
            width: 1,
            color: "#666666",
            dashStyle: "solid",
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: function (this: any) {
          const timeStr = formatTime(this.x as number);
          let tooltipContent = `<b>Time: ${timeStr}</b><br/>`;

          if (this.points) {
            this.points.forEach((point: Highcharts.Point) => {
              const suffix =
                (point.series.options as Highcharts.SeriesLineOptions).tooltip
                  ?.valueSuffix || "";
              tooltipContent += `<span style="color:${point.color}">${point.series.name}</span>: <b>${point.y}${suffix}</b><br/>`;
            });
          }

          // Add distance information to tooltip if available
          if (distanceData && distanceData.length > 0) {
            // Find the closest distance data point to the current time
            const currentTime = this.x as number;
            const closestDistance = distanceData.reduce((prev, curr) =>
              Math.abs(curr[0] - currentTime) < Math.abs(prev[0] - currentTime)
                ? curr
                : prev
            );
            if (closestDistance) {
              tooltipContent += `<span style="color:${
                currentTheme.colors.success
              }">Distance</span>: <b>${(closestDistance[1] / 1000).toFixed(
                2
              )} km</b><br/>`;
            }
          }

          return tooltipContent;
        },
      },
      legend: {
        enabled: true,
        floating: false,
        layout: "horizontal",
        align: "right",
        verticalAlign: "bottom",
        itemStyle: {
          color: currentTheme.colors.text,
          fontSize: "12px",
          fontWeight: "normal",
        },
        itemHoverStyle: {
          color: currentTheme.colors.text,
        },
        itemHiddenStyle: {
          color: currentTheme.colors.light,
        },
      },
      plotOptions: {
        series: {
          animation: false,
          dataGrouping: {
            groupPixelWidth: 1,
            enabled: true,
          },
          marker: {
            enabled: false,
            states: {
              hover: {
                enabled: true,
                radius: 4,
                lineWidthPlus: 1,
              },
            },
          },
          states: {
            hover: {
              enabled: false,
            },
            inactive: {
              opacity: 1,
            },
          },
        },
        line: {
          lineWidth: 1,
          states: {
            hover: {
              enabled: false,
            },
          },
        },
        area: {
          lineWidth: 1,
          states: {
            hover: {
              enabled: false,
            },
          },
        },
      },
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 500,
            },
            chartOptions: {
              chart: {
                marginLeft: 35,
                marginRight: 15,
              },
              legend: {
                layout: "horizontal",
                align: "center",
                verticalAlign: "bottom",
              },
            },
          },
        ],
      },
      credits: {
        enabled: false,
      },
    };
  }, [records, selectedActivity, formatTime, setZoomInfo, currentTheme]);

  if (!records || records.length === 0) {
    return (
      <ThemeProvider theme={currentTheme}>
        <Container>
          <NoDataMessage>No activity data available for charting</NoDataMessage>
        </Container>
      </ThemeProvider>
    );
  }

  if (!chartOptions) {
    return (
      <ThemeProvider theme={currentTheme}>
        <Container>
          <NoDataMessage>Loading chart data...</NoDataMessage>
        </Container>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={currentTheme}>
      <Container>
        {/* <ControlsSection>
          <ControlGroup>
            <ControlLabel>Data Smoothing:</ControlLabel>
            <SmoothingSelect
              value={smoothingSeconds}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSmoothingSeconds(Number(e.target.value))
              }
            >
              <option value={1}>1 second (no smoothing)</option>
              <option value={2}>2 seconds</option>
              <option value={5}>5 seconds</option>
              <option value={10}>10 seconds</option>
              <option value={30}>30 seconds</option>
            </SmoothingSelect>
          </ControlGroup>
          <ControlGroup>
            <ClearButton onClick={() => setZoomInfo(null)}>Clear</ClearButton>
          </ControlGroup>
        </ControlsSection> */}
        <ChartContainer>
          <HighchartsReact
            ref={chartRef}
            highcharts={Highcharts}
            options={chartOptions}
            allowChartUpdate={true}
            immutable={false}
            updateArgs={[true, true, true]}
          />
        </ChartContainer>
        <DataSummary>
          <SummaryTitle>Activity Summary</SummaryTitle>
          <SummaryTable>
            <SummaryTableHeader>
              <HeaderRow>
                <MetricHeader>Metric</MetricHeader>
                <ValueHeader>Average</ValueHeader>
                <ValueHeader>Max</ValueHeader>
              </HeaderRow>
            </SummaryTableHeader>
            <SummaryTableBody>
              <DataRow>
                <MetricCell>Duration</MetricCell>
                <ValueCell>
                  {records.length > 0 && records[records.length - 1].timer_time
                    ? (() => {
                        const totalSeconds =
                          records[records.length - 1].timer_time || 0;
                        const hours = Math.floor(totalSeconds / 3600);
                        const minutes = Math.floor((totalSeconds % 3600) / 60);
                        const seconds = Math.floor(totalSeconds % 60);

                        if (hours > 0) {
                          return `${hours}:${minutes
                            .toString()
                            .padStart(2, "0")}:${seconds
                            .toString()
                            .padStart(2, "0")}`;
                        }
                        return `${minutes}:${seconds
                          .toString()
                          .padStart(2, "0")}`;
                      })()
                    : "N/A"}
                </ValueCell>
                <MaxNotApplicable>-</MaxNotApplicable>
              </DataRow>
              <DataRow>
                <MetricCell>Power</MetricCell>
                <ValueCell>
                  {records.filter((r) => r.power).length > 0
                    ? `${Math.round(
                        records
                          .filter((r) => r.power)
                          .reduce((sum, r) => sum + (r.power || 0), 0) /
                          records.filter((r) => r.power).length
                      )} W`
                    : "N/A"}
                </ValueCell>
                <ValueCell>
                  {records.filter((r) => r.power).length > 0
                    ? `${Math.max(
                        ...records
                          .filter((r) => r.power)
                          .map((r) => r.power || 0)
                      )} W`
                    : "N/A"}
                </ValueCell>
              </DataRow>
              <DataRow>
                <MetricCell>Cadence</MetricCell>
                <ValueCell>
                  {records.filter((r) => r.cadence).length > 0
                    ? `${Math.round(
                        records
                          .filter((r) => r.cadence)
                          .reduce((sum, r) => sum + (r.cadence || 0), 0) /
                          records.filter((r) => r.cadence).length
                      )} rpm`
                    : "N/A"}
                </ValueCell>
                <ValueCell>
                  {records.filter((r) => r.cadence).length > 0
                    ? `${Math.max(
                        ...records
                          .filter((r) => r.cadence)
                          .map((r) => r.cadence || 0)
                      )} rpm`
                    : "N/A"}
                </ValueCell>
              </DataRow>
              <DataRow>
                <MetricCell>
                  {isRunningActivity(selectedActivity) ? "Pace" : "Speed"}
                </MetricCell>
                <ValueCell>
                  {records.filter((r) => r.speed).length > 0
                    ? (() => {
                        const speedRecords = records.filter((r) => r.speed);
                        const avgSpeedMs =
                          speedRecords.reduce(
                            (sum, r) => sum + (r.speed || 0),
                            0
                          ) / speedRecords.length;

                        if (isRunningActivity(selectedActivity)) {
                          // For running, show pace
                          return convertSpeedToPace(avgSpeedMs);
                        } else {
                          // For cycling/other, show speed
                          // Smart detection: if the raw average is > 15 m/s (54 km/h), it's likely already in km/h
                          if (avgSpeedMs > 15) {
                            return `${avgSpeedMs.toFixed(1)} km/h`;
                          } else {
                            return `${(avgSpeedMs * 3.6).toFixed(1)} km/h`;
                          }
                        }
                      })()
                    : "N/A"}
                </ValueCell>
                <ValueCell>
                  {records.filter((r) => r.speed).length > 0
                    ? (() => {
                        const maxSpeedMs = Math.max(
                          ...records
                            .filter((r) => r.speed)
                            .map((r) => r.speed || 0)
                        );

                        if (isRunningActivity(selectedActivity)) {
                          // For running, show best pace (which is actually minimum time)
                          return convertSpeedToPace(maxSpeedMs);
                        } else {
                          // For cycling/other, show max speed
                          if (maxSpeedMs > 15) {
                            return `${maxSpeedMs.toFixed(1)} km/h`;
                          } else {
                            return `${(maxSpeedMs * 3.6).toFixed(1)} km/h`;
                          }
                        }
                      })()
                    : "N/A"}
                </ValueCell>
              </DataRow>
              <DataRow>
                <MetricCell>Energy (kJ)</MetricCell>
                <ValueCell>
                  {(() => {
                    const powerRecords = records.filter(
                      (r) => r.power && r.timer_time
                    );
                    if (powerRecords.length === 0) return "N/A";

                    let totalEnergy = 0;
                    for (let i = 1; i < powerRecords.length; i++) {
                      const timeDiff =
                        (powerRecords[i].timer_time || 0) -
                        (powerRecords[i - 1].timer_time || 0);
                      const avgPower =
                        ((powerRecords[i].power || 0) +
                          (powerRecords[i - 1].power || 0)) /
                        2;
                      totalEnergy += avgPower * timeDiff; // Watts * seconds = Joules
                    }
                    return `${(totalEnergy / 1000).toFixed(1)} kJ`; // Convert to kilojoules
                  })()}
                </ValueCell>
                <MaxNotApplicable>-</MaxNotApplicable>
              </DataRow>
              <SeparatorRow>
                <td colSpan={3}></td>
              </SeparatorRow>
              <DataRow>
                <MetricCell>Distance</MetricCell>
                <ValueCell>
                  {records.length > 0 && records[records.length - 1].distance
                    ? `${(records[records.length - 1].distance! / 1000).toFixed(
                        2
                      )} km`
                    : "N/A"}
                </ValueCell>
                <MaxNotApplicable>-</MaxNotApplicable>
              </DataRow>
              <DataRow>
                <MetricCell>Elevation Gain</MetricCell>
                <ValueCell>
                  {(() => {
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
                  })()}
                </ValueCell>
                <MaxNotApplicable>-</MaxNotApplicable>
              </DataRow>
              <DataRow>
                <MetricCell>Average Elevation</MetricCell>
                <ValueCell>
                  {records.filter(
                    (r) => r.altitude !== null && r.altitude !== undefined
                  ).length > 0
                    ? `${Math.round(
                        records
                          .filter(
                            (r) =>
                              r.altitude !== null && r.altitude !== undefined
                          )
                          .reduce((sum, r) => sum + (r.altitude || 0), 0) /
                          records.filter(
                            (r) =>
                              r.altitude !== null && r.altitude !== undefined
                          ).length
                      )} m`
                    : "N/A"}
                </ValueCell>
                <MaxNotApplicable>-</MaxNotApplicable>
              </DataRow>
            </SummaryTableBody>
          </SummaryTable>
        </DataSummary>
        {zoomInfo && (
          <ZoomSummary>
            <ZoomTitle>Zoom Selection</ZoomTitle>
            <ZoomTimeRange>
              <ZoomTime>Start: {zoomInfo.start}</ZoomTime>
              <ZoomTime>End: {zoomInfo.end}</ZoomTime>
            </ZoomTimeRange>
          </ZoomSummary>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default HighchartsGraph;

// Styled Components
const Container = styled.div`
  width: 95%;
  background: transparent;
  color: ${(props) => props.theme.colors.text};
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const ChartContainer = styled.div`
  width: 100%;
  margin-bottom: 6px;
  position: relative;
  min-height: 400px;

  /* Force the chart to be responsive */
  & > div {
    width: 100% !important;
    position: relative !important;
  }

  /* Make sure the chart container takes full width and responds to size changes */
  .highcharts-container,
  .highcharts-root {
    width: 100% !important;
    height: 100% !important;
    overflow: visible !important;
    max-width: none !important;
  }

  /* Ensure the SVG inside takes full width and is responsive */
  .highcharts-container svg {
    width: 100% !important;
    height: 100% !important;
    overflow: visible !important;
    max-width: none !important;
  }

  /* Handle chart reflow properly on resize */
  .highcharts-container {
    position: relative !important;
  }
`;

const NoDataMessage = styled.div`
  text-align: center;
  color: ${(props) => props.theme.colors.text};
  font-size: 16px;
  padding: 40px;
`;

const DataSummary = styled.div`
  border-top: 1px solid ${(props) => props.theme.colors.border};
  padding-top: 6px;
`;

const SummaryTitle = styled.h3`
  margin: 0 0 6px 0;
  color: ${(props) => props.theme.colors.text};
  font-size: 16px;
`;

const SummaryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${(props) => props.theme.colors.surface};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const SummaryTableHeader = styled.thead`
  background: ${(props) => props.theme.colors.primary};
`;

const SummaryTableBody = styled.tbody``;

const HeaderRow = styled.tr``;

const DataRow = styled.tr`
  &:nth-child(even) {
    background: ${(props) => props.theme.colors.background};
  }

  &:hover {
    background: ${(props) => props.theme.colors.light};
  }
`;

const SeparatorRow = styled.tr`
  height: 8px;
  background: ${(props) => props.theme.colors.border};

  td {
    padding: 0;
    border: none;
  }
`;

const MetricHeader = styled.th`
  padding: 12px 16px;
  text-align: left;
  color: white;
  font-weight: 600;
  font-size: 14px;
`;

const ValueHeader = styled.th`
  padding: 12px 16px;
  text-align: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
  width: 120px;
`;

const MetricCell = styled.td`
  padding: 12px 16px;
  color: ${(props) => props.theme.colors.text};
  font-weight: 500;
  font-size: 14px;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`;

const ValueCell = styled.td`
  padding: 12px 16px;
  text-align: center;
  color: ${(props) => props.theme.colors.text};
  font-weight: 600;
  font-size: 14px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`;

const MaxNotApplicable = styled.td`
  padding: 12px 16px;
  text-align: center;
  color: ${(props) => props.theme.colors.text};
  opacity: 0.5;
  font-size: 14px;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
`;

const ZoomSummary = styled.div`
  background: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 6px;
  padding: 8px 12px;
  margin-bottom: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ZoomTitle = styled.h4`
  margin: 0 0 6px 0;
  color: ${(props) => props.theme.colors.text};
  font-size: 14px;
  font-weight: 600;
`;

const ZoomTimeRange = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const ZoomTime = styled.span`
  background: ${(props) => props.theme.colors.surface};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 13px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  color: ${(props) => props.theme.colors.text};
  font-weight: 500;
`;

// const ThemeToggleButton = styled.button`
//   padding: 8px 16px;
//   background: ${(props) => props.theme.colors.primary};
//   color: white;
//   border: none;
//   border-radius: 4px;
//   font-size: 14px;
//   font-weight: 500;
//   cursor: pointer;
//   display: flex;
//   align-items: center;
//   gap: 6px;
//   transition: all 0.3s ease;

//   &:hover {
//     background: ${(props) => props.theme.colors.secondary};
//     transform: translateY(-1px);
//   }

//   &:active {
//     transform: translateY(0);
//   }
// `;
