import { useMemo } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import styled from "styled-components";
import { useActivityDetailsContext } from "../context/ActivityDetailsContext";

const HighchartsGraph = () => {
  const { records, selectedActivity } = useActivityDetailsContext();

  const chartOptions = useMemo(() => {
    if (!records || records.length === 0) {
      return null;
    }

    // Process data for different series
    const processedData = records.map((record, index) => ({
      time: record.timer_time, // Using timer_time as x-axis (active time in seconds)
      timeMs: record.timer_time * 1000, // Convert to milliseconds for Highcharts
      heartRate: record.heart_rate || null,
      power: record.power || null,
      speed: record.speed ? record.speed : null,
      cadence: record.cadence || null,
      distance: record.distance ? record.distance : null,
      altitude: record.altitude || null,
      elapsedTime:
        index *
        (records.length > 1
          ? (records[records.length - 1].timer_time - records[0].timer_time) /
            (records.length - 1)
          : 1),
    }));

    // Create series data arrays
    const heartRateData = processedData
      .filter((d) => d.heartRate !== null)
      .map((d) => [d.timeMs, d.heartRate]);

    const powerData = processedData
      .filter((d) => d.power !== null)
      .map((d) => [d.timeMs, d.power]);

    const speedData = processedData
      .filter((d) => d.speed !== null)
      .map((d) => [d.timeMs, d.speed]);

    const cadenceData = processedData
      .filter((d) => d.cadence !== null)
      .map((d) => [d.timeMs, d.cadence]);

    const distanceData = processedData
      .filter((d) => d.distance !== null)
      .map((d) => [d.timeMs, d.distance]);

    const altitudeData = processedData
      .filter((d) => d.altitude !== null)
      .map((d) => [d.timeMs, d.altitude]);

    return {
      chart: {
        type: "line",
        height: 600,
        zoomType: "x",
        backgroundColor: "#ffffff",
      },
      title: {
        text: `Activity Data - ${selectedActivity?.sport || "Unknown Sport"}`,
        style: {
          fontSize: "18px",
          fontWeight: "bold",
        },
      },
      subtitle: {
        text: "Drag to zoom in on time range",
      },
      xAxis: {
        type: "datetime",
        title: {
          text: "Active Time",
        },
        labels: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter: function (this: any) {
            const totalSeconds = Number(this.value) / 1000;
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = Math.floor(totalSeconds % 60);

            if (hours > 0) {
              return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
                .toString()
                .padStart(2, "0")}`;
            }
            return `${minutes}:${seconds.toString().padStart(2, "0")}`;
          },
        },
      },
      yAxis: [
        {
          // Primary Y-Axis - Heart Rate
          id: "heartrate",
          title: {
            text: "Heart Rate (bpm)",
            style: { color: "#e74c3c" },
          },
          labels: {
            style: { color: "#e74c3c" },
          },
          opposite: false,
        },
        {
          // Secondary Y-Axis - Power
          id: "power",
          title: {
            text: "Power (W)",
            style: { color: "#f39c12" },
          },
          labels: {
            style: { color: "#f39c12" },
          },
          opposite: true,
        },
        {
          // Third Y-Axis - Speed
          id: "speed",
          title: {
            text: "Speed (km/h)",
            style: { color: "#3498db" },
          },
          labels: {
            style: { color: "#3498db" },
          },
          opposite: false,
          offset: 80,
        },
        {
          // Fourth Y-Axis - Cadence
          id: "cadence",
          title: {
            text: "Cadence (rpm)",
            style: { color: "#9b59b6" },
          },
          labels: {
            style: { color: "#9b59b6" },
          },
          opposite: true,
          offset: 80,
        },
        {
          // Fifth Y-Axis - Distance
          id: "distance",
          title: {
            text: "Distance (km)",
            style: { color: "#27ae60" },
          },
          labels: {
            style: { color: "#27ae60" },
          },
          opposite: false,
          offset: 160,
        },
        {
          // Sixth Y-Axis - Altitude
          id: "altitude",
          title: {
            text: "Altitude (m)",
            style: { color: "#95a5a6" },
          },
          labels: {
            style: { color: "#95a5a6" },
          },
          opposite: true,
          offset: 160,
        },
      ],
      series: [
        // Altitude as area chart (background)
        ...(altitudeData.length > 0
          ? [
              {
                name: "Altitude",
                type: "area",
                data: altitudeData,
                yAxis: "altitude",
                color: "rgba(149, 165, 166, 0.3)",
                fillColor: "rgba(149, 165, 166, 0.1)",
                lineWidth: 1,
                zIndex: 1,
                tooltip: {
                  valueSuffix: " m",
                },
              },
            ]
          : []),

        // Heart Rate
        ...(heartRateData.length > 0
          ? [
              {
                name: "Heart Rate",
                data: heartRateData,
                yAxis: "heartrate",
                color: "#e74c3c",
                lineWidth: 2,
                zIndex: 3,
                tooltip: {
                  valueSuffix: " bpm",
                },
              },
            ]
          : []),

        // Power
        ...(powerData.length > 0
          ? [
              {
                name: "Power",
                data: powerData,
                yAxis: "power",
                color: "#f39c12",
                lineWidth: 2,
                zIndex: 3,
                tooltip: {
                  valueSuffix: " W",
                },
              },
            ]
          : []),

        // Speed
        ...(speedData.length > 0
          ? [
              {
                name: "Speed",
                data: speedData,
                yAxis: "speed",
                color: "#3498db",
                lineWidth: 2,
                zIndex: 3,
                tooltip: {
                  valueSuffix: " km/h",
                },
              },
            ]
          : []),

        // Cadence
        ...(cadenceData.length > 0
          ? [
              {
                name: "Cadence",
                data: cadenceData,
                yAxis: "cadence",
                color: "#9b59b6",
                lineWidth: 2,
                zIndex: 3,
                tooltip: {
                  valueSuffix: " rpm",
                },
              },
            ]
          : []),

        // Distance (cumulative)
        ...(distanceData.length > 0
          ? [
              {
                name: "Distance",
                data: distanceData,
                yAxis: "distance",
                color: "#27ae60",
                lineWidth: 2,
                zIndex: 3,
                tooltip: {
                  valueSuffix: " km",
                },
              },
            ]
          : []),
      ],
      tooltip: {
        shared: true,
        crosshairs: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: function (this: any) {
          const totalSeconds = Number(this.x) / 1000;
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = Math.floor(totalSeconds % 60);

          let timeStr;
          if (hours > 0) {
            timeStr = `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
              .toString()
              .padStart(2, "0")}`;
          } else {
            timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;
          }

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
        line: {
          animation: false,
          marker: {
            enabled: false,
            states: {
              hover: {
                enabled: true,
                radius: 4,
              },
            },
          },
        },
        area: {
          animation: false,
          marker: {
            enabled: false,
          },
        },
      },
      credits: {
        enabled: false,
      },
    };
  }, [records, selectedActivity]);

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
        </SummaryGrid>
      </DataSummary>
    </Container>
  );
};

export default HighchartsGraph;

// Styled Components
const Container = styled.div`
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 20px 0;
  width: 1000px;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 600px;
  margin-bottom: 20px;
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
