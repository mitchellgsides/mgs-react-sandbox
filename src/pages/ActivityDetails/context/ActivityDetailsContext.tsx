import React, { useCallback, useMemo, useState, useEffect, createContext } from "react";
import type { ReactNode } from "react";
import { useAuthContext } from "../../../contexts/Auth/useAuthContext";
import type { Activity } from "../../../supabase/supabase.fitFiles";
import {
  useActivities,
  useActivityRecords,
  useDeleteActivity,
  type ActivityRecord,
} from "../../../hooks/api/useActivities";

export type { ActivityRecord };

export const ActivityDetailsContext = createContext<ActivityDetailsContextType | undefined>(undefined);

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

  // Actions
  setSelectedActivity: (activity: Activity | null) => void;
  refreshActivities: () => void;
  clearError: () => void;
  deleteActivityById: (
    activityId: string
  ) => Promise<{ success: boolean; error?: string }>;
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
  const [error, setError] = useState<string | null>(null);

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
        const currentActivity = activities.find(a => a.id === selectedActivity.id);
        if (!currentActivity) {
          setSelectedActivity(activities[0]);
        } else if (currentActivity !== selectedActivity) {
          // If the activity data has changed, update the selected activity
          setSelectedActivity(currentActivity);
        }
      }
    }
  }, [activities, selectedActivity]);

  // Actions
  const refreshActivities = useCallback(() => {
    refetchActivities();
  }, [refetchActivities]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

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

  const contextValue = useMemo<ActivityDetailsContextType>(
    () => ({
      activities,
      loading,
      error: activitiesError?.message || null,
      records: records.length > 0 ? records : null,
      recordsLoading,
      selectedActivity,
      deleting,
      setSelectedActivity,
      refreshActivities: refetchActivities,
      clearError: () => setError(null),
      deleteActivityById,
    }),
    [
      activities,
      activitiesError,
      records,
      recordsLoading,
      selectedActivity,
      deleting,
      loading,
      refetchActivities,
      deleteActivityById,
    ]
  );

  return (
    <ActivityDetailsContext.Provider value={contextValue}>
      {children}
    </ActivityDetailsContext.Provider>
  );
};

export default ActivityDetailsProvider;
