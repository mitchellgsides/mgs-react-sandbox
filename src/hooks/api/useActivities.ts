import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import {
  getUserActivities,
  getActivity,
  deleteActivity,
  type Activity,
  type ActivityRecord as SupabaseActivityRecord,
  type PaginationOptions,
  type GetActivityResponse,
} from "../../supabase/supabase.fitFiles";

export type ActivityRecord = SupabaseActivityRecord & {
  // Add any additional fields that might be needed
  calories?: number;
  data_quality?: number;
  grade?: number | null;
  lap_id?: string;
  lap_index?: number;
  resistance?: number | null;
};

export const ACTIVITIES_QUERY_KEY = "activities";
export const ACTIVITY_RECORDS_QUERY_KEY = "activity-records";

export const useActivities = (
  userId: string,
  options: PaginationOptions = {}
) => {
  return useQuery<Activity[], Error>({
    queryKey: [ACTIVITIES_QUERY_KEY, userId, options],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const response = await getUserActivities(userId, {
        limit: 20,
        order_by: "activity_timestamp",
        order_direction: "desc",
        ...options,
      });
      if (!response.success)
        throw new Error(response.error || "Failed to fetch activities");
      return response.data;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useActivityRecords = (activityId: string) => {
  return useQuery<ActivityRecord[], Error>({
    queryKey: [ACTIVITY_RECORDS_QUERY_KEY, activityId],
    queryFn: async () => {
      if (!activityId) throw new Error("Activity ID is required");
      console.log("Fetching records for activity:", activityId);
      const response: GetActivityResponse = await getActivity(activityId);
      if (!response.success) {
        throw new Error(response.error || "Failed to fetch activity records");
      }
      console.log("Fetched records:", response.data?.records?.length || 0);
      return response.data?.records || [];
    },
    enabled: !!activityId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

type DeleteActivityParams = {
  activityId: string;
  userId: string;
};

export const useDeleteActivity = () => {
  const queryClient = useQueryClient();

  return useMutation<string, Error, DeleteActivityParams>({
    mutationFn: async ({ activityId, userId }) => {
      const { error } = await deleteActivity(activityId, userId);
      if (error) throw new Error(error);
      return activityId;
    },
    onSuccess: (deletedId) => {
      // Invalidate and refetch activities
      queryClient.invalidateQueries({ queryKey: [ACTIVITIES_QUERY_KEY] });
      // Also invalidate any queries for the deleted activity's records
      queryClient.invalidateQueries({
        queryKey: [ACTIVITY_RECORDS_QUERY_KEY, deletedId],
      });
    },
  });
};
