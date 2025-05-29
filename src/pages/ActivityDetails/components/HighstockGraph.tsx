import { useCallback, useMemo, useState } from "react";
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import styled from "styled-components";
import { useActivityDetailsContext } from "../context/useActivityDetailsContext";

const HighstockGraph = () => {
  const { records, selectedActivity } = useActivityDetailsContext();
  const [zoomInfo, setZoomInfo] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [groupingInterval, setGroupingInterval] = useState<number>(1);

  console.log("HighstockGraph - zoomInfo:", zoomInfo);
  console.log(
    "HighstockGraph - Component rendered with records:",
    records?.length || 0
  );
  console.log("HighstockGraph - Grouping interval:", groupingInterval);

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
  const chartOptions = useMemo(() => {
    if (!records || records.length === 0) {
      return null;
    }

    // Process data for different series
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
        id: "power",
        title: {
          text: "Power (W)",
          style: { color: "#f39c12" },
        },
        labels: {
          style: { color: "#f39c12" },
        },
        opposite: true,
        offset: offsetCount > 0 ? offsetCount * 50 : 0,
      });
      offsetCount++;
    }

    if (hasHeartRateData) {
      yAxes.push({
        id: "heartrate",
        title: {
          text: "Heart Rate (bpm)",
          style: { color: "#e74c3c" },
        },
        labels: {
          style: { color: "#e74c3c" },
        },
        opposite: false,
        offset: offsetCount > 1 ? Math.floor(offsetCount / 2) * 50 : 0,
      });
    }

    if (hasSpeedData) {
      yAxes.push({
        id: "speed",
        title: {
          text: "Speed (km/h)",
          style: { color: "#3498db" },
        },
        labels: {
          style: { color: "#3498db" },
        },
        opposite: false,
        offset: offsetCount > 1 ? Math.floor(offsetCount / 2) * 50 : 0,
      });
    }

    if (hasCadenceData) {
      yAxes.push({
        id: "cadence",
        title: {
          text: "Cadence (rpm)",
          style: { color: "#9b59b6" },
        },
        labels: {
          style: { color: "#9b59b6" },
        },
        opposite: true,
        offset: offsetCount > 0 ? offsetCount * 50 : 0,
      });
      offsetCount++;
    }

    if (hasDistanceData) {
      yAxes.push({
        id: "distance",
        title: {
          text: "Distance (km)",
          style: { color: "#27ae60" },
        },
        labels: {
          style: { color: "#27ae60" },
        },
        opposite: false,
        offset: offsetCount > 1 ? Math.floor(offsetCount / 2) * 50 : 0,
      });
    }

    if (hasAltitudeData) {
      yAxes.push({
        id: "altitude",
        title: {
          text: "Altitude (m)",
          style: { color: "#7f8c8d" },
        },
        labels: {
          style: { color: "#7f8c8d" },
        },
        opposite: true,
        offset: offsetCount > 0 ? offsetCount * 50 : 0,
      });
    }

    // Configure data grouping based on selected interval
    const dataGroupingConfig = {
      enabled: groupingInterval > 1,
      approximation: "average",
      groupPixelWidth: 2,
      units: [["second", [1, 5, 10, 30, 60]]],
      forced: groupingInterval > 1,
      ...(groupingInterval > 1 && {
        groupAll: true,
        units: [["second", [groupingInterval]]],
      }),
    };

    return {
      chart: {
        type: "line",
        height: 600,
        zoomType: "x",
        backgroundColor: "#ffffff",
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
          theme: {
            fill: "#007bff",
            stroke: "#007bff",
            r: 4,
            style: {
              color: "#ffffff",
              fontWeight: "bold",
              fontSize: "12px",
            },
            states: {
              hover: {
                fill: "#0056b3",
                stroke: "#0056b3",
              },
            },
          },
        },
        events: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          selection: function (this: any, event: any) {
            console.log("Highstock selection event triggered:", event);
            if (event.xAxis && event.xAxis[0]) {
              const start = formatTime(event.xAxis[0].min);
              const end = formatTime(event.xAxis[0].max);
              setZoomInfo({ start, end });
            }
            return true; // Allow the zoom
          },
        },
      },
      title: {
        text: `Activity Data - ${
          selectedActivity?.sport || "Unknown Sport"
        } (Highstock)`,
        style: {
          fontSize: "18px",
          fontWeight: "bold",
        },
      },
      subtitle: {
        text: `Drag to zoom in on time range • Native Highstock smoothing: ${
          groupingInterval === 1 ? "disabled" : `${groupingInterval}s`
        }`,
      },
      xAxis: {
        type: "datetime",
        title: {
          text: "Active Time",
        },
        labels: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter: function (this: any) {
            return formatTime(this.value);
          },
        },
        events: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          afterSetExtremes: function (this: any, event: any) {
            console.log("Highstock afterSetExtremes event triggered:", event);

            if (event.min !== undefined && event.max !== undefined) {
              // Set zoom info when extremes change
              if (event.trigger && event.trigger !== "updatedData") {
                const start = formatTime(event.min);
                const end = formatTime(event.max);
                setZoomInfo({ start, end });
              }

              // Clear zoom info if back to full range
              if (event.min === this.dataMin && event.max === this.dataMax) {
                setZoomInfo(null);
              }
            }
          },
        },
      },
      yAxis: yAxes,
      series: [
        // Altitude as area chart (background) - only if data exists
        ...(hasAltitudeData
          ? [
              {
                name: "Altitude",
                type: "area",
                data: altitudeData,
                yAxis: "altitude",
                color: "rgba(127, 140, 141, 0.7)",
                fillColor: "rgba(127, 140, 141, 0.4)",
                lineWidth: 1,
                zIndex: 1,
                dataGrouping: dataGroupingConfig,
                tooltip: {
                  valueSuffix: " m",
                },
                states: {
                  hover: {
                    lineWidthPlus: 1,
                    brightness: 0.1,
                  },
                },
              },
            ]
          : []),

        // Heart Rate - only if data exists
        ...(hasHeartRateData
          ? [
              {
                name: "Heart Rate",
                data: heartRateData,
                yAxis: "heartrate",
                color: "#e74c3c",
                lineWidth: 1,
                zIndex: 3,
                dataGrouping: dataGroupingConfig,
                tooltip: {
                  valueSuffix: " bpm",
                },
                states: {
                  hover: {
                    lineWidthPlus: 1,
                    brightness: 0.1,
                  },
                },
              },
            ]
          : []),

        // Power - only if data exists
        ...(hasPowerData
          ? [
              {
                name: "Power",
                data: powerData,
                yAxis: "power",
                color: "#f39c12",
                lineWidth: 1,
                zIndex: 3,
                dataGrouping: dataGroupingConfig,
                tooltip: {
                  valueSuffix: " W",
                },
                states: {
                  hover: {
                    lineWidthPlus: 1,
                    brightness: 0.1,
                  },
                },
              },
            ]
          : []),

        // Speed - only if data exists
        ...(hasSpeedData
          ? [
              {
                name: "Speed",
                data: speedData,
                yAxis: "speed",
                color: "#3498db",
                lineWidth: 1,
                zIndex: 3,
                dataGrouping: dataGroupingConfig,
                tooltip: {
                  valueSuffix: " km/h",
                },
                states: {
                  hover: {
                    lineWidthPlus: 1,
                    brightness: 0.1,
                  },
                },
              },
            ]
          : []),

        // Cadence - only if data exists
        ...(hasCadenceData
          ? [
              {
                name: "Cadence",
                data: cadenceData,
                yAxis: "cadence",
                color: "#9b59b6",
                lineWidth: 1,
                zIndex: 3,
                dataGrouping: dataGroupingConfig,
                tooltip: {
                  valueSuffix: " rpm",
                },
                states: {
                  hover: {
                    lineWidthPlus: 1,
                    brightness: 0.1,
                  },
                },
              },
            ]
          : []),

        // Distance - only if data exists
        ...(hasDistanceData
          ? [
              {
                name: "Distance",
                data: distanceData,
                yAxis: "distance",
                color: "#27ae60",
                lineWidth: 1,
                zIndex: 3,
                dataGrouping: dataGroupingConfig,
                tooltip: {
                  valueSuffix: " km",
                },
                states: {
                  hover: {
                    lineWidthPlus: 1,
                    brightness: 0.1,
                  },
                },
              },
            ]
          : []),
      ],
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
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderColor: "#cccccc",
        borderRadius: 4,
        shadow: true,
        useHTML: false,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: function (this: any) {
          const timeStr = formatTime(this.x);
          let tooltipContent = `<b>Time: ${timeStr}</b><br/>`;

          if (this.points) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            this.points.forEach((point: any) => {
              const suffix = point.series.tooltipOptions?.valueSuffix || "";
              tooltipContent += `<span style="color:${point.color}">${point.series.name}</span>: <b>${point.y}${suffix}</b><br/>`;
            });
          }

          return tooltipContent;
        },
      },
      legend: {
        enabled: true,
        layout: "horizontal",
        align: "center",
        verticalAlign: "bottom",
      },
      plotOptions: {
        series: {
          animation: false,
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
              lineWidthPlus: 1,
              halo: {
                size: 8,
                opacity: 0.25,
              },
            },
            inactive: {
              opacity: 1,
            },
          },
          events: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mouseOver: function (this: any) {
              // Highlight all series when hovering over any series
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              this.chart.series.forEach((series: any) => {
                if (series !== this) {
                  series.setState("hover");
                }
              });
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            mouseOut: function (this: any) {
              // Remove hover state from all series
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              this.chart.series.forEach((series: any) => {
                series.setState("");
              });
            },
          },
        },
        line: {
          lineWidth: 1, // Thinner lines
          states: {
            hover: {
              lineWidthPlus: 1,
            },
          },
        },
        area: {
          lineWidth: 1, // Thinner lines
          states: {
            hover: {
              lineWidthPlus: 1,
            },
          },
        },
      },
      // Highstock-specific options
      navigator: {
        enabled: true,
        height: 50,
        margin: 20,
      },
      scrollbar: {
        enabled: true,
      },
      rangeSelector: {
        enabled: false, // Disable the date/range selector at the top
      },
      credits: {
        enabled: false,
      },
    };
  }, [records, selectedActivity, formatTime, setZoomInfo, groupingInterval]);

  if (!records || records.length === 0) {
    return (
      <Container>
        <NoDataMessage>No activity data available for charting</NoDataMessage>
      </Container>
    );
  }

  if (!chartOptions) {
    return (
      <Container>
        <NoDataMessage>Loading chart data...</NoDataMessage>
      </Container>
    );
  }

  return (
    <Container>
      {/* Smoothing Controls */}
      <ControlsSection>
        <ControlGroup>
          <ControlLabel>Data Grouping (Highstock Native):</ControlLabel>
          <SmoothingSelect
            value={groupingInterval}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setGroupingInterval(Number(e.target.value))
            }
          >
            <option value={1}>Disabled</option>
            <option value={5}>5 seconds</option>
            <option value={10}>10 seconds</option>
            <option value={30}>30 seconds</option>
            <option value={60}>1 minute</option>
          </SmoothingSelect>
        </ControlGroup>

        {/* Test buttons for zoom functionality */}
        <ControlGroup>
          <button
            onClick={() => setZoomInfo({ start: "1:23", end: "4:56" })}
            style={{
              padding: "6px 12px",
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            Test Zoom
          </button>
          <button
            onClick={() => setZoomInfo(null)}
            style={{
              marginLeft: "8px",
              padding: "6px 12px",
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "12px",
            }}
          >
            Clear
          </button>
        </ControlGroup>
      </ControlsSection>

      {zoomInfo && (
        <ZoomSummary>
          <ZoomTitle>Zoom Selection</ZoomTitle>
          <ZoomTimeRange>
            <ZoomTime>Start: {zoomInfo.start}</ZoomTime>
            <ZoomTime>End: {zoomInfo.end}</ZoomTime>
          </ZoomTimeRange>
        </ZoomSummary>
      )}
      <ChartContainer>
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </ChartContainer>
      <DataSummary>
        <SummaryTitle>Data Summary (Highstock)</SummaryTitle>
        <SummaryGrid>
          <SummaryItem>
            <SummaryLabel>Total Records:</SummaryLabel>
            <SummaryValue>{records.length.toLocaleString()}</SummaryValue>
          </SummaryItem>
          <SummaryItem>
            <SummaryLabel>Duration:</SummaryLabel>
            <SummaryValue>
              {Math.round((records[records.length - 1]?.timer_time || 0) / 60)}{" "}
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
            <SummaryValue>{records.filter((r) => r.power).length}</SummaryValue>
          </SummaryItem>
          <SummaryItem>
            <SummaryLabel>Native Grouping:</SummaryLabel>
            <SummaryValue>
              {groupingInterval === 1
                ? "Disabled"
                : `${groupingInterval}s average`}
            </SummaryValue>
          </SummaryItem>
          <SummaryItem>
            <SummaryLabel>Chart Type:</SummaryLabel>
            <SummaryValue>Highstock with Navigator</SummaryValue>
          </SummaryItem>
        </SummaryGrid>
      </DataSummary>
    </Container>
  );
};

export default HighstockGraph;

// Styled Components (reused from HighchartsGraph)
const Container = styled.div`
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
  width: 100%;
  max-width: 1400px;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 700px; /* Slightly taller to accommodate navigator */
  margin-bottom: 20px;
  overflow-x: auto;
`;

const NoDataMessage = styled.div`
  text-align: center;
  color: #666;
  font-size: 16px;
  padding: 40px;
`;

const DataSummary = styled.div`
  border-top: 1px solid #e9ecef;
  padding-top: 20px;
`;

const SummaryTitle = styled.h3`
  margin: 0 0 12px 0;
  color: #333;
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
  background: #f8f9fa;
  border-radius: 4px;
`;

const SummaryLabel = styled.span`
  color: #666;
  font-size: 14px;
`;

const SummaryValue = styled.span`
  color: #333;
  font-weight: 600;
  font-size: 14px;
`;

const ZoomSummary = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ZoomTitle = styled.h4`
  margin: 0 0 8px 0;
  color: #495057;
  font-size: 14px;
  font-weight: 600;
`;

const ZoomTimeRange = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const ZoomTime = styled.span`
  background: #ffffff;
  border: 1px solid #ced4da;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 13px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  color: #212529;
  font-weight: 500;
`;

const ControlsSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #e3f2fd; /* Light blue background to distinguish from regular chart */
  border: 1px solid #90caf9;
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
  color: #1565c0; /* Blue color to distinguish */
  margin-right: 8px;
`;

const SmoothingSelect = styled.select`
  padding: 6px 12px;
  border: 1px solid #64b5f6;
  border-radius: 4px;
  background: white;
  font-size: 14px;
  color: #1565c0;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.25);
  }
`;
