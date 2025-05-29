import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useAuth } from "../../../contexts/Auth/authContextDef";
import {
  getActivity,
  getUserActivities,
  type Activity,
  type GetActivitiesResponse,
} from "../../../supabase/supabase.fitFiles";
import { supabase } from "../../../supabase/supabase.client";

// ActivityRecord interface - move this here for shared use
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

// Define the context type
type ActivityDetailsContextType = {
  // State
  activities: Activity[];
  loading: boolean;
  error: string | null;
  records: ActivityRecord[] | null;
  selectedActivity: Activity | null;

  // Actions
  setSelectedActivity: (activity: Activity | null) => void;
  refreshActivities: () => Promise<void>;
  clearError: () => void;
};

const ActivityDetailsContext = createContext<
  ActivityDetailsContextType | undefined
>(undefined);

type ActivityDetailsProviderProps = {
  children: ReactNode;
};

// Provider component that will wrap components needing access to the activity details context
export const ActivityDetailsContextProvider: React.FC<
  ActivityDetailsProviderProps
> = ({ children }) => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [records, setRecords] = useState<ActivityRecord[] | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );

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

  const value: ActivityDetailsContextType = {
    // State
    activities,
    loading,
    error,
    records,
    selectedActivity,

    // Actions
    setSelectedActivity,
    refreshActivities,
    clearError,
  };

  return (
    <ActivityDetailsContext.Provider value={value}>
      {children}
    </ActivityDetailsContext.Provider>
  );
};

// Custom hook for consuming the context
export const useActivityDetailsContext = (): ActivityDetailsContextType => {
  const context = useContext(ActivityDetailsContext);

  if (context === undefined) {
    throw new Error(
      "useActivityDetailsContext must be used within an ActivityDetailsContextProvider"
    );
  }

  return context;
};

export default ActivityDetailsContextProvider;
