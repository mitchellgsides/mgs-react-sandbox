import { useCallback, useMemo } from "react";
import styled from "styled-components";
import { DateTime } from "luxon";
import { useNavigate } from "react-router-dom";
import { useActivityDetailsContext } from "./context/useActivityDetailsContext";
import type { Activity } from "../../supabase/supabase.fitFiles";

const ActivityListPage = () => {
  const navigate = useNavigate();
  const { activities, loading, error, records, setSelectedActivity } =
    useActivityDetailsContext();

  console.log("xxx fetched records:", records);

  const formatDate = useCallback((timestamp: string): string => {
    try {
      return DateTime.fromISO(timestamp).toFormat("MMMM dd, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  }, []);

  const handleActivityClick = useCallback(
    (activity: Activity) => {
      console.log("Clicked activity full metadata:", activity);
      setSelectedActivity(activity);
      navigate(`/activities/${activity.id}`);
    },
    [setSelectedActivity, navigate]
  );

  const activityList = useMemo(() => {
    return activities.map((activity) => (
      <ActivityItem
        key={activity.id}
        onClick={() => handleActivityClick(activity)}
      >
        <ActivityDate>{formatDate(activity.activity_timestamp)}</ActivityDate>
        {activity.sport && (
          <ActivitySport>Sport: {activity.sport}</ActivitySport>
        )}
      </ActivityItem>
    ));
  }, [activities, formatDate, handleActivityClick]);

  if (loading) {
    return (
      <Container>
        <Title>Activities</Title>
        <LoadingText>Loading activities...</LoadingText>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Title>Activities</Title>
        <ErrorText>{error}</ErrorText>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Activities ({activities.length})</Title>

      {activities.length === 0 ? (
        <LoadingText>No activities found</LoadingText>
      ) : (
        <ActivityList>{activityList}</ActivityList>
      )}
    </Container>
  );
};

export default ActivityListPage;

// Styled Components
const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 20px;
  font-family: ${({ theme }) => theme.fonts.heading};
`;

const ActivityList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ActivityItem = styled.li`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.light};
    transform: translateX(4px);
  }
`;

const ActivityDate = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const ActivitySport = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.7;
  margin-top: 4px;
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
