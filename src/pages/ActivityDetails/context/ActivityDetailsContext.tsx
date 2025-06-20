import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  createContext,
} from "react";
import type { ReactNode } from "react";
import { useAuthContext } from "../../../contexts/Auth/useAuthContext";
import type { Activity } from "../../../supabase/supabase.fitFiles";
import {
  useActivities,
  useActivityRecords,
  useDeleteActivity,
  type ActivityRecord,
} from "../../../hooks/api/useActivities";
import { updateActivity } from "../../../supabase/supabase.fitFiles";

export type { ActivityRecord };

export const ActivityDetailsContext = createContext<
  ActivityDetailsContextType | undefined
>(undefined);

export type ActivityDetailsProviderProps = {
  children: ReactNode;
};

export type ActivityDetailsContextType = {
  // State
  activities: Activity[];
  loading: boolean;
  error: string | null;
  records: ActivityRecord[] | null;
  recordsLoading: boolean;
  selectedActivity: Activity | null;
  deleting: boolean;
  updating: boolean;
  domain: "time" | "distance";

  // Actions
  setSelectedActivity: (activity: Activity | null) => void;
  refreshActivities: () => void;
  clearError: () => void;
  deleteActivityById: (
    activityId: string
  ) => Promise<{ success: boolean; error?: string }>;
  updateActivityById: (
    activityId: string,
    updates: { name?: string; description?: string }
  ) => Promise<{ success: boolean; data?: Activity; error?: string }>;
  setDomain: (domain: "time" | "distance") => void;
  speedIsKmh: boolean;
};

// Provider component that will wrap components needing access to the activity details context
export const ActivityDetailsProvider: React.FC<
  ActivityDetailsProviderProps
> = ({ children }) => {
  const { user } = useAuthContext();

  // Fetch activities using React Query
  const {
    data: activities = [],
    isLoading: loading,
    error: activitiesError,
    refetch: refetchActivities,
  } = useActivities(user?.id || "");

  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domain, setDomain] = useState<"time" | "distance">("time");
  if (error) {
    console.log("xxx error", error);
  }

  // Fetch activity records using React Query
  const { data: records = [], isLoading: recordsLoading } = useActivityRecords(
    selectedActivity?.id || ""
  );

  // Use mutation for deleting activity
  const { mutateAsync: deleteActivity } = useDeleteActivity();

  // Set error from activities query if it exists
  useEffect(() => {
    if (activitiesError) {
      setError(activitiesError.message);
    }
  }, [activitiesError]);

  // Set first activity as selected when activities load or when activityId changes
  useEffect(() => {
    if (activities.length > 0) {
      // If no activity is selected, select the first one
      if (!selectedActivity) {
        setSelectedActivity(activities[0]);
      } else {
        // If selectedActivity exists but its ID doesn't match any activity in the list,
        // update it to the first activity in the list
        const currentActivity = activities.find(
          (a) => a.id === selectedActivity.id
        );
        if (!currentActivity) {
          setSelectedActivity(activities[0]);
        } else if (currentActivity !== selectedActivity) {
          // If the activity data has changed, update the selected activity
          setSelectedActivity(currentActivity);
        }
      }
    }
  }, [activities, selectedActivity]);

  const deleteActivityById = useCallback(
    async (activityId: string) => {
      if (!activityId)
        return { success: false, error: "No activity ID provided" };
      if (!user?.id) return { success: false, error: "User not authenticated" };

      setDeleting(true);
      try {
        await deleteActivity({ activityId, userId: user.id });

        // If the deleted activity was selected, clear the selection
        if (selectedActivity?.id === activityId) {
          setSelectedActivity(activities[0] || null);
        }

        return { success: true };
      } catch (err) {
        const error =
          err instanceof Error ? err.message : "Failed to delete activity";
        setError(error);
        return { success: false, error };
      } finally {
        setDeleting(false);
      }
    },
    [deleteActivity, selectedActivity, activities, user?.id]
  );

  const updateActivityById = useCallback(
    async (
      activityId: string,
      updates: { name?: string; description?: string }
    ) => {
      if (!activityId)
        return { success: false, error: "No activity ID provided" };
      if (!user?.id) return { success: false, error: "User not authenticated" };

      setUpdating(true);
      try {
        const result = await updateActivity(activityId, user.id, updates);

        if (result.success && result.data) {
          // Update the selected activity if it's the one we just updated
          if (selectedActivity?.id === activityId) {
            setSelectedActivity(result.data);
          }

          // Trigger refetch to update the activities list
          refetchActivities();
        }

        return result;
      } catch (err) {
        const error =
          err instanceof Error ? err.message : "Failed to update activity";
        setError(error);
        return { success: false, error };
      } finally {
        setUpdating(false);
      }
    },
    [selectedActivity, user?.id, refetchActivities]
  );

  // Helper to detect speed units for pace/speed calculations
  const speedIsKmh = useMemo(() => {
    if (!records || records.length === 0) return false;
    const speedValues = records.filter((r) => r.speed).map((r) => r.speed!);
    const avgSpeed =
      speedValues.length > 0
        ? speedValues.reduce((a, b) => a + b, 0) / speedValues.length
        : 0;
    return avgSpeed > 15; // Speeds > 15 m/s (~54 km/h) are likely already in km/h
  }, [records]);

  const contextValue = useMemo<ActivityDetailsContextType>(
    () => ({
      activities,
      loading,
      error: activitiesError?.message || null,
      records: records.length > 0 ? records : null,
      recordsLoading,
      selectedActivity,
      deleting,
      updating,
      domain,
      setSelectedActivity,
      refreshActivities: refetchActivities,
      clearError: () => setError(null),
      deleteActivityById,
      updateActivityById,
      setDomain,
      speedIsKmh,
    }),
    [
      activities,
      activitiesError,
      records,
      recordsLoading,
      selectedActivity,
      deleting,
      updating,
      domain,
      loading,
      refetchActivities,
      deleteActivityById,
      updateActivityById,
      speedIsKmh,
    ]
  );

  return (
    <ActivityDetailsContext.Provider value={contextValue}>
      {children}
    </ActivityDetailsContext.Provider>
  );
};

export default ActivityDetailsProvider;
