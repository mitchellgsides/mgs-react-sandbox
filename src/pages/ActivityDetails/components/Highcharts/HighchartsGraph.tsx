import { useMemo, useState, useCallback, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import styled, { ThemeProvider } from "styled-components";
import { useActivityDetailsContext } from "../../context/useActivityDetailsContext";
import { darkTheme, lightTheme } from "../../../../theme/theme";
import { useAuthContext } from "../../../../contexts/Auth/useAuthContext";
import { buildChartData } from "./buildChartData";

const HighchartsGraph = () => {
  const { records, selectedActivity } = useActivityDetailsContext();

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
  const [smoothingSeconds, setSmoothingSeconds] = useState<number>(1);

  // Reset state when activity changes
  useEffect(() => {
    setZoomInfo(null);
  }, [selectedActivity?.id]);

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

    const { yAxes, series: seriesData } = buildChartData(records, currentTheme);

    console.log("xxx zoomInfo", zoomInfo);

    return {
      chart: {
        type: "line",
        height: 400,
        zoomType: "x",
        backgroundColor: currentTheme.colors.surface,
        marginLeft: 60,
        marginRight: 60,
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        selectionMarkerFill: "rgba(0, 100, 200, 0.25)",
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
        text: `Drag to zoom in on time range • Data smoothing: ${smoothingSeconds}s`,
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

          return tooltipContent;
        },
      },
      legend: {
        enabled: true,
        floating: false,
        layout: "horizontal",
        align: "right",
        verticalAlign: "bottom",
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
      credits: {
        enabled: false,
      },
    };
  }, [
    records,
    selectedActivity,
    formatTime,
    setZoomInfo,
    smoothingSeconds,
    currentTheme,
    zoomInfo,
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
        {/* Smoothing Controls */}
        <ControlsSection>
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
        </ControlsSection>
        <ChartContainer>
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </ChartContainer>
        <DataSummary>
          <SummaryTitle>Data Summary</SummaryTitle>
          <SummaryGrid>
            <SummaryItem>
              <SummaryLabel>Total Records:</SummaryLabel>
              <SummaryValue>{records.length.toLocaleString()}</SummaryValue>
            </SummaryItem>
            <SummaryItem>
              <SummaryLabel>Duration:</SummaryLabel>
              <SummaryValue>
                {Math.round(
                  (records[records.length - 1]?.timer_time || 0) / 60
                )}{" "}
                min
              </SummaryValue>
            </SummaryItem>
            <SummaryItem>
              <SummaryLabel>Data Points with HR:</SummaryLabel>
              <SummaryValue>
                {records.filter((r) => r.heart_rate).length}
              </SummaryValue>
            </SummaryItem>
            <SummaryItem>
              <SummaryLabel>Data Points with Power:</SummaryLabel>
              <SummaryValue>
                {records.filter((r) => r.power).length}
              </SummaryValue>
            </SummaryItem>
            <SummaryItem>
              <SummaryLabel>Smoothing Applied:</SummaryLabel>
              <SummaryValue>
                {smoothingSeconds === 1
                  ? "None"
                  : `${smoothingSeconds}s moving average`}
              </SummaryValue>
            </SummaryItem>
          </SummaryGrid>
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
  width: 70vw;
  max-width: 1800px;
  background: transparent;
  color: ${(props) => props.theme.colors.text};
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const ChartContainer = styled.div`
  margin-bottom: 20px;

  /* Make sure the chart container takes full width */
  .highcharts-container,
  .highcharts-root {
    width: 100% !important;
    height: 100% !important;
    overflow: visible !important;
  }

  /* Ensure the SVG inside takes full width */
  .highcharts-container svg {
    width: 100% !important;
    height: 100% !important;
    overflow: visible !important;
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
  padding-top: 20px;
  border: 1px solid red;
`;

const SummaryTitle = styled.h3`
  margin: 0 0 12px 0;
  color: ${(props) => props.theme.colors.text};
  font-size: 16px;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
`;

const SummaryLabel = styled.span`
  color: ${(props) => props.theme.colors.text};
  font-size: 14px;
  opacity: 0.8;
`;

const SummaryValue = styled.span`
  color: ${(props) => props.theme.colors.text};
  font-weight: 600;
  font-size: 14px;
`;

const ZoomSummary = styled.div`
  background: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ZoomTitle = styled.h4`
  margin: 0 0 8px 0;
  color: ${(props) => props.theme.colors.text};
  font-size: 14px;
  font-weight: 600;
`;

const ZoomTimeRange = styled.div`
  display: flex;
  gap: 16px;
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

const ControlsSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: ${(props) => props.theme.colors.background};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 6px;
  flex-wrap: wrap;
  gap: 12px;
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ControlLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${(props) => props.theme.colors.text};
  margin-right: 8px;
`;

const SmoothingSelect = styled.select`
  padding: 6px 12px;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  background: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.text};
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${(props) => props.theme.colors.primary}25;
  }

  option {
    background: ${(props) => props.theme.colors.surface};
    color: ${(props) => props.theme.colors.text};
  }
`;

const ClearButton = styled.button`
  margin-left: 8px;
  padding: 6px 12px;
  background: ${(props) => props.theme.colors.danger};
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    opacity: 0.8;
  }
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
