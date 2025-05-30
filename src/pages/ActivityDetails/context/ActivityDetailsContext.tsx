import React, { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "../../../contexts/Auth/useAuthContext";
import {
  getActivity,
  getUserActivities,
  deleteActivity,
  type Activity,
  type GetActivitiesResponse,
  type DeleteActivityResponse,
} from "../../../supabase/supabase.fitFiles";
import { supabase } from "../../../supabase/supabase.client";
import {
  ActivityDetailsContext,
  type ActivityDetailsProviderProps,
} from "./useActivityDetailsContext";

// ActivityRecord interface - move this here for shared use
export interface ActivityRecord {
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

// Define the context type
export type ActivityDetailsContextType = {
  // State
  activities: Activity[];
  loading: boolean;
  error: string | null;
  records: ActivityRecord[] | null;
  selectedActivity: Activity | null;
  deleting: boolean;

  // Actions
  setSelectedActivity: (activity: Activity | null) => void;
  refreshActivities: () => Promise<void>;
  clearError: () => void;
  deleteActivityById: (
    activityId: string
  ) => Promise<{ success: boolean; error?: string }>;
};

// Provider component that will wrap components needing access to the activity details context
export const ActivityDetailsContextProvider: React.FC<
  ActivityDetailsProviderProps
> = ({ children }) => {
  const { user } = useAuthContext();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<ActivityRecord[] | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  // Fetch activities effect
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
            console.log(`xxx Activity ${index + 1} metadata:`, {
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

  // Fetch activity records effect
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

  // Actions
  const refreshActivities = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const response: GetActivitiesResponse = await getUserActivities(user.id, {
        limit: 20,
        order_by: "activity_timestamp",
        order_direction: "desc",
      });

      if (response.success) {
        setActivities(response.data);
      } else {
        setError(response.error || "Failed to fetch activities");
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError("An unexpected error occurred while fetching activities");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const deleteActivityById = useCallback(
    async (activityId: string) => {
      if (!user?.id) {
        return { success: false, error: "User not authenticated" };
      }

      try {
        setDeleting(true);
        setError(null);

        const result: DeleteActivityResponse = await deleteActivity(
          activityId,
          user.id
        );

        if (result.success) {
          // Remove the activity from local state
          setActivities((prev) =>
            prev.filter((activity) => activity.id !== activityId)
          );

          // Clear selected activity if it was the one being deleted
          if (selectedActivity?.id === activityId) {
            setSelectedActivity(null);
            setRecords(null);
          }

          return { success: true };
        } else {
          setError(result.error || "Failed to delete activity");
          return { success: false, error: result.error };
        }
      } catch (err) {
        console.error("Error deleting activity:", err);
        const errorMessage =
          "An unexpected error occurred while deleting the activity";
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setDeleting(false);
      }
    },
    [user?.id, selectedActivity?.id]
  );

  const value: ActivityDetailsContextType = {
    // State
    activities,
    loading,
    error,
    records,
    selectedActivity,
    deleting,

    // Actions
    setSelectedActivity,
    refreshActivities,
    clearError,
    deleteActivityById,
  };

  return (
    <ActivityDetailsContext.Provider value={value}>
      {children}
    </ActivityDetailsContext.Provider>
  );
};

export default ActivityDetailsContextProvider;
