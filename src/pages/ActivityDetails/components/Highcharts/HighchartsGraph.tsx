import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import styled, { ThemeProvider } from "styled-components";
import { useActivityDetailsContext } from "../../context/useActivityDetailsContext";
import { darkTheme, lightTheme } from "../../../../theme/theme";
import { useAuthContext } from "../../../../contexts/Auth/useAuthContext";
import { buildChartData } from "./buildChartData";
// import { isRunningActivity, convertSpeedToPace } from "../utils/sportUtils";
import { createTooltipConfig } from "./tooltipHelpers";
import DataSummary from "./DataSummaryMui";
import ZoomDataSummary from "./ZoomDataSummary";

const HighchartsGraph = () => {
  const { records, selectedActivity, speedIsKmh, domain } =
    useActivityDetailsContext();
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
    } = buildChartData(
      records,
      currentTheme,
      selectedActivity,
      speedIsKmh,
      domain
    );

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
        panKey: "shift",
        panning: {
          enabled: false,
        },
        zooming: {
          mouseWheel: false,
          singleTouch: false,
          pinchType: "",
        },
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
              let start: string, end: string;
              if (domain === "distance") {
                // For distance domain, format as distance values
                const startKm = event.xAxis[0].min / 1000;
                const endKm = event.xAxis[0].max / 1000;
                start =
                  startKm < 1
                    ? `${event.xAxis[0].min.toFixed(0)}m`
                    : `${startKm.toFixed(2)}km`;
                end =
                  endKm < 1
                    ? `${event.xAxis[0].max.toFixed(0)}m`
                    : `${endKm.toFixed(2)}km`;
              } else {
                // For time domain, format as time values
                start = formatTime(event.xAxis[0].min);
                end = formatTime(event.xAxis[0].max);
              }
              console.log("Formatted values - start:", start, "end:", end);
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
        type: domain === "distance" ? "linear" : "datetime",
        title: {
          text: domain === "distance" ? "Distance (km)" : "Active Time",
          style: {
            color: currentTheme.colors.text,
          },
        },
        labels: {
          // eslint-isable-next-line @typescript-eslint/no-explicit-any
          formatter: function (
            this: Highcharts.AxisLabelsFormatterContextObject
          ) {
            if (domain === "distance") {
              const km = (this.value as number) / 1000;
              return km < 1
                ? `${(this.value as number).toFixed(0)}m`
                : `${km.toFixed(1)}km`;
            }
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
                let start: string, end: string;
                if (domain === "distance") {
                  // For distance domain, format as distance values
                  const startKm = event.min / 1000;
                  const endKm = event.max / 1000;
                  start =
                    startKm < 1
                      ? `${event.min.toFixed(0)}m`
                      : `${startKm.toFixed(2)}km`;
                  end =
                    endKm < 1
                      ? `${event.max.toFixed(0)}m`
                      : `${endKm.toFixed(2)}km`;
                } else {
                  // For time domain, format as time values
                  start = formatTime(event.min);
                  end = formatTime(event.max);
                }
                console.log("Setting zoom info - start:", start, "end:", end);
                setZoomInfo({ start, end });
              }
            }
          },
        },
      },
      yAxis: yAxes,
      series: seriesData,
      tooltip: createTooltipConfig(
        distanceData,
        currentTheme,
        formatTime,
        seriesData
          .filter((s): s is Exclude<typeof s, false> => Boolean(s))
          .map((s) => s.name), // Pass available series names
        domain
      ),
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
          stickyTracking: false, // Allow tooltip to show anywhere on chart
          findNearestPointBy: "x", // Find nearest point by x-axis value
        },
        line: {
          lineWidth: 1,
          states: {
            hover: {
              enabled: false,
            },
          },
          stickyTracking: false,
        },
        area: {
          lineWidth: 1,
          states: {
            hover: {
              enabled: false,
            },
          },
          stickyTracking: false,
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
  }, [
    records,
    selectedActivity,
    formatTime,
    setZoomInfo,
    currentTheme,
    speedIsKmh,
    domain,
  ]);

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
        <DataSummary />
        {zoomInfo && (
          <>
            <ZoomSummary>
              <ZoomTitle>Zoom Selection</ZoomTitle>
              <ZoomTimeRange>
                <ZoomTime>Start: {zoomInfo.start}</ZoomTime>
                <ZoomTime>End: {zoomInfo.end}</ZoomTime>
              </ZoomTimeRange>
            </ZoomSummary>
            <ZoomDataSummary zoomRange={zoomInfo} domain={domain} />
          </>
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
