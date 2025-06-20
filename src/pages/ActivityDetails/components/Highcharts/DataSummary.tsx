import styled from "styled-components";
import { useActivityDetailsContext } from "../../context/useActivityDetailsContext";
import { isRunningActivity } from "../utils/sportUtils";
import { convertSpeedToPace } from "../utils/sportUtils";

const DataSummary = () => {
  const { records, selectedActivity, speedIsKmh } = useActivityDetailsContext();

  if (records == null) return null;

  return (
    <DataSummaryContainer>
      <SummaryTitle>Activity Summary</SummaryTitle>
      <SummaryGrid>
        {/* Header */}
        <GridHeader>Metric</GridHeader>
        <GridHeader>Average</GridHeader>
        <GridHeader>Max</GridHeader>

        {/* Duration */}
        <GridMetric>Duration</GridMetric>
        <GridValue>
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
                    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
                }
                return `${minutes}:${seconds.toString().padStart(2, "0")}`;
              })()
            : "N/A"}
        </GridValue>
        <GridValueNA>-</GridValueNA>

        {/* Power */}
        <GridMetric>Power</GridMetric>
        <GridValue>
          {records.filter((r) => r.power).length > 0
            ? `${Math.round(
                records
                  .filter((r) => r.power)
                  .reduce((sum, r) => sum + (r.power || 0), 0) /
                  records.filter((r) => r.power).length
              )} W`
            : "N/A"}
        </GridValue>
        <GridValue>
          {records.filter((r) => r.power).length > 0
            ? `${Math.max(
                ...records.filter((r) => r.power).map((r) => r.power || 0)
              )} W`
            : "N/A"}
        </GridValue>

        {/* Cadence */}
        <GridMetric>Cadence</GridMetric>
        <GridValue>
          {records.filter((r) => r.cadence).length > 0
            ? `${Math.round(
                records
                  .filter((r) => r.cadence)
                  .reduce((sum, r) => sum + (r.cadence || 0), 0) /
                  records.filter((r) => r.cadence).length
              )} rpm`
            : "N/A"}
        </GridValue>
        <GridValue>
          {records.filter((r) => r.cadence).length > 0
            ? `${Math.max(
                ...records.filter((r) => r.cadence).map((r) => r.cadence || 0)
              )} rpm`
            : "N/A"}
        </GridValue>

        {/* Speed/Pace */}
        <GridMetric>
          {isRunningActivity(selectedActivity) ? "Pace" : "Speed"}
        </GridMetric>
        <GridValue>
          {records.filter((r) => r.speed).length > 0
            ? (() => {
                const speedRecords = records.filter((r) => r.speed);
                const avgSpeedMs =
                  speedRecords.reduce((sum, r) => sum + (r.speed || 0), 0) /
                  speedRecords.length;

                if (isRunningActivity(selectedActivity)) {
                  // For running, show pace
                  return convertSpeedToPace(avgSpeedMs, speedIsKmh);
                } else {
                  // For cycling/other, show speed
                  if (speedIsKmh) {
                    return `${avgSpeedMs.toFixed(1)} km/h`;
                  } else {
                    return `${(avgSpeedMs * 3.6).toFixed(1)} km/h`;
                  }
                }
              })()
            : "N/A"}
        </GridValue>
        <GridValue>
          {records.filter((r) => r.speed).length > 0
            ? (() => {
                const maxSpeedMs = Math.max(
                  ...records.filter((r) => r.speed).map((r) => r.speed || 0)
                );

                if (isRunningActivity(selectedActivity)) {
                  // For running, show best pace (which is actually minimum time)
                  return convertSpeedToPace(maxSpeedMs, speedIsKmh);
                } else {
                  // For cycling/other, show max speed
                  if (speedIsKmh) {
                    return `${maxSpeedMs.toFixed(1)} km/h`;
                  } else {
                    return `${(maxSpeedMs * 3.6).toFixed(1)} km/h`;
                  }
                }
              })()
            : "N/A"}
        </GridValue>

        {/* Energy */}
        <GridMetric>Energy (kJ)</GridMetric>
        <GridValue>
          {(() => {
            const powerRecords = records.filter((r) => r.power && r.timer_time);
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
        </GridValue>
        <GridValueNA>-</GridValueNA>

        {/* Separator */}
        <GridSeparator />
        <GridSeparator />
        <GridSeparator />

        {/* Distance */}
        <GridMetric>Distance</GridMetric>
        <GridValue>
          {records.length > 0 && records[records.length - 1].distance
            ? `${(records[records.length - 1].distance! / 1000).toFixed(2)} km`
            : "N/A"}
        </GridValue>
        <GridValueNA>-</GridValueNA>

        {/* Elevation Gain */}
        <GridMetric>Elevation Gain</GridMetric>
        <GridValue>
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
        </GridValue>
        <GridValueNA>-</GridValueNA>

        {/* Average Elevation */}
        <GridMetric>Average Elevation</GridMetric>
        <GridValue>
          {records.filter(
            (r) => r.altitude !== null && r.altitude !== undefined
          ).length > 0
            ? `${Math.round(
                records
                  .filter(
                    (r) => r.altitude !== null && r.altitude !== undefined
                  )
                  .reduce((sum, r) => sum + (r.altitude || 0), 0) /
                  records.filter(
                    (r) => r.altitude !== null && r.altitude !== undefined
                  ).length
              )} m`
            : "N/A"}
        </GridValue>
        <GridValueNA>-</GridValueNA>
      </SummaryGrid>
    </DataSummaryContainer>
  );
};

export default DataSummary;

const DataSummaryContainer = styled.div`
  border-top: 1px solid ${(props) => props.theme.colors.border};
  padding-top: 6px;
`;

const SummaryTitle = styled.h3`
  margin: 0 0 6px 0;
  color: ${(props) => props.theme.colors.text};
  font-size: 16px;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 120px 120px;
  gap: 0;
  background: ${(props) => props.theme.colors.surface};
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const GridHeader = styled.div`
  padding: 12px 16px;
  background: ${(props) => props.theme.colors.primary};
  color: white;
  font-weight: 600;
  font-size: 14px;

  &:first-child {
    text-align: left;
  }

  &:not(:first-child) {
    text-align: center;
  }
`;

const GridMetric = styled.div`
  padding: 12px 16px;
  color: ${(props) => props.theme.colors.text};
  font-weight: 500;
  font-size: 14px;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  background: ${(props) => props.theme.colors.surface};

  &:nth-child(3n + 1):not(:nth-child(-n + 3)) {
    &:nth-child(even) {
      background: ${(props) => props.theme.colors.background};
    }
  }

  &:hover {
    background: ${(props) => props.theme.colors.light};
  }
`;

const GridValue = styled.div`
  padding: 12px 16px;
  text-align: center;
  color: ${(props) => props.theme.colors.text};
  font-weight: 600;
  font-size: 14px;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  background: ${(props) => props.theme.colors.surface};

  &:nth-child(3n + 2):not(:nth-child(-n + 3)) {
    &:nth-child(even) {
      background: ${(props) => props.theme.colors.background};
    }
  }

  &:hover {
    background: ${(props) => props.theme.colors.light};
  }
`;

const GridValueNA = styled.div`
  padding: 12px 16px;
  text-align: center;
  color: ${(props) => props.theme.colors.text};
  opacity: 0.5;
  font-size: 14px;
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  background: ${(props) => props.theme.colors.surface};

  &:nth-child(3n):not(:nth-child(-n + 3)) {
    &:nth-child(even) {
      background: ${(props) => props.theme.colors.background};
    }
  }

  &:hover {
    background: ${(props) => props.theme.colors.light};
  }
`;

const GridSeparator = styled.div`
  height: 8px;
  background: ${(props) => props.theme.colors.border};
  grid-column: 1 / -1;
`;
