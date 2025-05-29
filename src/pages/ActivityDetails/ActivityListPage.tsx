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
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 20px;
`;

const ActivityList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ActivityItem = styled.li`
  background: #f5f5f5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  border-left: 4px solid #007bff;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #e9ecef;
    transform: translateX(4px);
  }
`;

const ActivityDate = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const ActivitySport = styled.div`
  font-size: 14px;
  color: #666;
  margin-top: 4px;
`;

const LoadingText = styled.div`
  text-align: center;
  color: #666;
  font-style: italic;
`;

const ErrorText = styled.div`
  color: #dc3545;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 12px;
  margin: 12px 0;
`;
