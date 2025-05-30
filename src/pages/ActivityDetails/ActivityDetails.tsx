import React from "react";
import styled from "styled-components";
import { useParams, Link } from "react-router-dom";
import { DateTime } from "luxon";
import { useActivityDetailsContext } from "./context/useActivityDetailsContext";
import HighchartsGraph from "./components/Highcharts/HighchartsGraph";
// import HighstockGraph from "./components/Highcharts/HighstockGraph";

const ActivityDetails = () => {
  const { activityId } = useParams<{ activityId: string }>();
  const {
    activities,
    loading,
    error,
    records,
    selectedActivity,
    setSelectedActivity,
  } = useActivityDetailsContext();

  // Find the activity based on the URL parameter
  React.useEffect(() => {
    if (activityId && activities.length > 0) {
      const activity = activities.find((a) => a.id === activityId);
      if (activity && activity.id !== selectedActivity?.id) {
        setSelectedActivity(activity);
      }
    }
  }, [activityId, activities, selectedActivity?.id, setSelectedActivity]);

  console.log("xxx selectedActivity:", selectedActivity);

  if (loading) {
    return (
      <Container>
        <LoadingText>Loading activity details...</LoadingText>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <ErrorText>{error}</ErrorText>
      </Container>
    );
  }

  if (!selectedActivity) {
    return (
      <Container>
        <LoadingText>No activity selected or activity not found</LoadingText>
      </Container>
    );
  }

  const formatDate = (timestamp: string): string => {
    try {
      return DateTime.fromISO(timestamp).toFormat("MMMM dd, yyyy 'at' h:mm a");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  return (
    <Container>
      <BackLink to="/activities">← Back to Activities</BackLink>
      <Title>Activity Details</Title>

      <ChartSection>
        <ChartTitle>Workout Chart</ChartTitle>
        <HighchartsGraph />
      </ChartSection>

      <ActivityCard>
        <ActivityHeader>
          <ActivityDate>
            {formatDate(selectedActivity.activity_timestamp)}
          </ActivityDate>
          {selectedActivity.sport && (
            <ActivitySport>{selectedActivity.sport}</ActivitySport>
          )}
        </ActivityHeader>

        <StatsGrid>
          {selectedActivity.total_distance && (
            <StatItem>
              <StatLabel>Distance</StatLabel>
              <StatValue>
                {selectedActivity.total_distance.toFixed(2)} km
              </StatValue>
            </StatItem>
          )}

          {selectedActivity.total_timer_time && (
            <StatItem>
              <StatLabel>Duration</StatLabel>
              <StatValue>
                {Math.round(selectedActivity.total_timer_time / 60)} min
              </StatValue>
            </StatItem>
          )}

          {selectedActivity.avg_speed && (
            <StatItem>
              <StatLabel>Avg Speed</StatLabel>
              <StatValue>
                {(selectedActivity.avg_speed * 3.6).toFixed(1)} km/h
              </StatValue>
            </StatItem>
          )}

          {selectedActivity.max_speed && (
            <StatItem>
              <StatLabel>Max Speed</StatLabel>
              <StatValue>
                {(selectedActivity.max_speed * 3.6).toFixed(1)} km/h
              </StatValue>
            </StatItem>
          )}

          {selectedActivity.avg_power && (
            <StatItem>
              <StatLabel>Avg Power</StatLabel>
              <StatValue>{selectedActivity.avg_power} W</StatValue>
            </StatItem>
          )}

          {selectedActivity.max_power && (
            <StatItem>
              <StatLabel>Max Power</StatLabel>
              <StatValue>{selectedActivity.max_power} W</StatValue>
            </StatItem>
          )}
        </StatsGrid>

        <RecordsSection>
          <RecordsTitle>Activity Records</RecordsTitle>
          {records ? (
            <RecordsInfo>
              {records.length > 0 ? (
                <RecordsCount>{records.length} data points loaded</RecordsCount>
              ) : (
                <RecordsCount>No records found for this activity</RecordsCount>
              )}
            </RecordsInfo>
          ) : (
            <LoadingText>Loading activity records...</LoadingText>
          )}
        </RecordsSection>
      </ActivityCard>
    </Container>
  );
};

export default ActivityDetails;

// Styled Components
const Container = styled.div`
  padding: 20px;
  //   width: 1000px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 20px;
  font-family: ${({ theme }) => theme.fonts.heading};
`;

const ActivityCard = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: 24px;
  flex-grow: 1;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const ActivityHeader = styled.div`
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const ActivityDate = styled.h2`
  font-size: 24px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 8px 0;
  font-family: ${({ theme }) => theme.fonts.heading};
`;

const ActivitySport = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 500;
  text-transform: capitalize;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatItem = styled.div`
  background: ${({ theme }) => theme.colors.light};
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.7;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

const StatValue = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const RecordsSection = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 20px;
`;

const RecordsTitle = styled.h3`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 12px;
  font-family: ${({ theme }) => theme.fonts.heading};
`;

const RecordsInfo = styled.div`
  background: ${({ theme }) => theme.colors.light};
  border-radius: 6px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const RecordsCount = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.8;
`;

const LoadingText = styled.div`
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.7;
  font-style: italic;
`;

const ErrorText = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  background: ${({ theme }) => theme.colors.light};
  border: 1px solid ${({ theme }) => theme.colors.danger};
  border-radius: 4px;
  padding: 12px;
  margin: 12px 0;
`;

const ChartSection = styled.div`
  width: 1000px;
  margin-bottom: 20px;
`;

const ChartTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 16px;
  font-family: ${({ theme }) => theme.fonts.heading};
`;
