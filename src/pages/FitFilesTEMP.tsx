import { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import { DateTime } from "luxon";
import { useAuth } from "../contexts/Auth/authContextDef";
import {
  getActivity,
  getUserActivities,
  type Activity,
  type GetActivitiesResponse,
} from "../supabase/supabase.fitFiles";
import { supabase } from "../supabase/supabase.client";

interface ActivityRecord {
  activity_id: string;
  altitude: number;
  cadence: number;
  calories: number;
  data_quality: number;
  distance: number;
  elapsed_time: null;
  grade: null;
  heart_rate: null;
  lap_id: string;
  lap_index: number;
  latitude: number;
  longitude: number;
  power: number;
  record_type: string;
  resistance: number | null;
  speed: number;
  temperature: number;
  time: string;
  timer_time: number;
}

const FitFilesTEMP = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<ActivityRecord[] | null>(null); // Adjust type as needed
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );

  useEffect(() => {
    const fetchActivities = async () => {
      if (!user?.id) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response: GetActivitiesResponse = await getUserActivities(
          user.id,
          {
            limit: 20,
            order_by: "activity_timestamp",
            order_direction: "desc",
          }
        );

        if (response.success) {
          setActivities(response.data);
          // Console log the activity metadata for each activity
          response.data.forEach((activity, index) => {
            console.log(`Activity ${index + 1} metadata:`, {
              id: activity.id,
              sport: activity.sport,
              timestamp: activity.activity_timestamp,
              total_distance: activity.total_distance,
              total_timer_time: activity.total_timer_time,
              avg_speed: activity.avg_speed,
              max_speed: activity.max_speed,
              avg_power: activity.avg_power,
              max_power: activity.max_power,
              created_at: activity.created_at,
              updated_at: activity.updated_at,
            });
          });
        } else {
          setError(response.error || "Failed to fetch activities");
        }
      } catch (err) {
        console.error("Error fetching activities:", err);
        setError("An unexpected error occurred while fetching activities");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user?.id]);

  useEffect(() => {
    const fetchActivityAndRecords = async () => {
      if (!activities.length) return;

      if (!selectedActivity || !selectedActivity.id) {
        return;
      }

      try {
        const res = await getActivity(selectedActivity.id);
        if (!res.success || !res.data) {
          setError(res.error || "Failed to fetch activity");
          return;
        }

        const activity = res.data;

        const batchSize = 1000;
        const allRecords: ActivityRecord[] = [];
        let offset = 0;
        let hasMore = true;

        while (hasMore) {
          const { data: batch, error } = await supabase
            .from("activity_records")
            .select("*")
            .eq("activity_id", activity.id)
            .order("time", { ascending: true })
            .range(offset, offset + batchSize - 1);

          if (error) {
            setError(`Error fetching activity records: ${error.message}`);
            return;
          }

          if (batch && batch.length > 0) {
            allRecords.push(...batch);
            offset += batchSize;
          }

          if (!batch || batch.length < batchSize) {
            hasMore = false;
          }
        }

        // ✅ Only update state once
        setRecords(allRecords);
      } catch (err) {
        console.error("Error fetching records:", err);
        setError("An unexpected error occurred while fetching records");
      }
    };

    fetchActivityAndRecords();
  }, [activities, selectedActivity]);

  console.log("xxx fetched records:", records);

  const formatDate = useCallback((timestamp: string): string => {
    try {
      return DateTime.fromISO(timestamp).toFormat("MMMM dd, yyyy");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  }, []);

  const handleActivityClick = (activity: Activity) => {
    console.log("Clicked activity full metadata:", activity);
    setSelectedActivity(activity);
  };

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
  }, [activities, formatDate]);

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

export default FitFilesTEMP;

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
