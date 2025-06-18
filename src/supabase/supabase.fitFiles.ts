import { supabase } from "./supabase.client";

// Types for FIT file operations
export interface FitFileData {
  activity: {
    timestamp: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface ActivityUploadResult {
  success: boolean;
  activity_id?: string;
  stats?: {
    recordsStored?: number;
    lapsStored?: number;
    totalRecords?: number;
    totalLaps?: number;
  };
  error?: string;
  details?: unknown;
}

export interface Activity {
  id: string;
  user_id: string;
  name?: string;
  description?: string;
  sport?: string;
  activity_timestamp: string;
  total_distance?: number;
  total_timer_time?: number;
  avg_speed?: number;
  max_speed?: number;
  avg_power?: number;
  max_power?: number;
  avg_heart_rate?: number;
  max_heart_rate?: number;
  created_at: string;
  updated_at: string;
}

export interface ActivityRecord {
  id: string;
  activity_id: string;
  time: string;
  elapsed_time?: number;
  timer_time?: number;
  distance?: number;
  speed?: number;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  power?: number;
  cadence?: number;
  heart_rate?: number;
  temperature?: number;
}

export interface ActivityLap {
  id: string;
  activity_id: string;
  lap_index: number;
  start_time: string;
  end_time: string;
  total_distance?: number;
  total_elapsed_time?: number;
  total_timer_time?: number;
  avg_speed?: number;
  max_speed?: number;
  avg_power?: number;
  max_power?: number;
}

export interface UserStats {
  activity_count: number;
  total_distance: number;
  total_time: number;
  avg_speed: number;
  max_speed: number;
  avg_power: number;
  max_power: number;
  sports: string;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
  sport?: string;
  from_date?: string;
  to_date?: string;
  order_by?: string;
  order_direction?: "asc" | "desc";
}

export interface GetActivitiesResponse {
  success: boolean;
  data: Activity[];
  pagination: {
    limit: number;
    offset: number;
    total: number | null;
  };
  error?: string;
}

export interface GetActivityResponse {
  success: boolean;
  data?: Activity & { records?: ActivityRecord[] };
  error?: string;
}

export interface GetTimeseriesResponse {
  success: boolean;
  data: unknown[];
  interval: string;
  error?: string;
}

export interface GetTrackResponse {
  success: boolean;
  data: unknown[];
  simplification: number;
  error?: string;
}

export interface GetLapsResponse {
  success: boolean;
  data: ActivityLap[];
  error?: string;
}

export interface DeleteActivityResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface GetUserStatsResponse {
  success: boolean;
  data: UserStats;
  period: string;
  sport: string | null;
  error?: string;
}

export interface UpdateActivityResponse {
  success: boolean;
  data?: Activity;
  error?: string;
}

export const uploadFitFile = async (
  fitData: FitFileData,
  userId: string,
  onProgress?: (progress: { percentage: number }) => void
): Promise<ActivityUploadResult> => {
  try {
    if (!fitData || !userId) {
      return {
        success: false,
        error: "Missing fitData or userId",
      };
    }

    // Check if activity already exists
    const activityTimestamp = fitData.activity.timestamp;
    const { data: existingActivity, error: checkError } = await supabase
      .from("activities")
      .select("id")
      .eq("user_id", userId)
      .eq("activity_timestamp", activityTimestamp)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      return {
        success: false,
        error: `Error checking existing activity: ${checkError.message}`,
      };
    }

    if (existingActivity) {
      return {
        success: false,
        error: "Activity already exists",
      };
    }

    // Call progress callback if provided
    if (onProgress) {
      onProgress({ percentage: 25 });
    }

    // TODO: Process FIT data - this would need to be implemented
    // For now, we'll create a basic activity record
    const { data: activity, error: insertError } = await supabase
      .from("activities")
      .insert({
        user_id: userId,
        activity_timestamp: activityTimestamp,
        sport: fitData.activity.sport || "unknown",
        // Add other activity fields as needed
      })
      .select()
      .single();

    if (insertError) {
      return {
        success: false,
        error: `Failed to create activity: ${insertError.message}`,
      };
    }

    if (onProgress) {
      onProgress({ percentage: 100 });
    }

    return {
      success: true,
      activity_id: activity.id,
      stats: {
        recordsStored: 0,
        lapsStored: 0,
        totalRecords: 0,
        totalLaps: 0,
      },
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: "Failed to upload activity",
      details: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

export const getUserActivities = async (
  userId: string,
  options: PaginationOptions = {}
): Promise<GetActivitiesResponse> => {
  try {
    const {
      limit = 50,
      offset = 0,
      sport = null,
      from_date = null,
      to_date = null,
      order_by = "activity_timestamp",
      order_direction = "desc",
    } = options;

    let query = supabase
      .from("activities")
      .select("*", { count: "exact" })
      .eq("user_id", userId);

    if (sport) {
      query = query.eq("sport", sport);
    }

    if (from_date) {
      query = query.gte("activity_timestamp", from_date);
    }

    if (to_date) {
      query = query.lte("activity_timestamp", to_date);
    }

    query = query
      .order(order_by, { ascending: order_direction === "asc" })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      return {
        success: false,
        data: [],
        pagination: {
          limit,
          offset,
          total: null,
        },
        error: `Failed to fetch activities: ${error.message}`,
      };
    }

    return {
      success: true,
      data: data || [],
      pagination: {
        limit,
        offset,
        total: count,
      },
    };
  } catch (error) {
    console.error("Get activities error:", error);
    return {
      success: false,
      data: [],
      pagination: {
        limit: options.limit || 50,
        offset: options.offset || 0,
        total: null,
      },
      error: "Failed to fetch activities",
    };
  }
};

// export const getActivity = async (
//   activityId: string,
//   includeRecords: boolean = false
// ): Promise<GetActivityResponse> => {
//   try {
//     const { data, error } = await supabase
//       .from("activities")
//       .select("*")
//       .eq("id", activityId)
//       .single();

//     if (error) {
//       return {
//         success: false,
//         error: `Failed to fetch activity: ${error.message}`,
//       };
//     }

//     if (!data) {
//       return {
//         success: false,
//         error: "Activity not found",
//       };
//     }

//     const result: GetActivityResponse = {
//       success: true,
//       data: data,
//     };

//     // Include detailed records if requested
//     if (includeRecords && result.data) {
//       const { data: records, error: recordsError } = await supabase
//         .from("activity_records")
//         .select("*")
//         .eq("activity_id", activityId)
//         .range(0, result?.data?.total_timer_time || 80000) // Limit to 10 hours of records
//         .order("time", { ascending: true });

//       if (recordsError) {
//         return {
//           success: false,
//           error: `Failed to fetch activity records: ${recordsError.message}`,
//         };
//       }

//       result.data.records = records || [];
//     }

//     return result;
//   } catch (error) {
//     console.error("Get activity error:", error);
//     return {
//       success: false,
//       error: "Failed to fetch activity",
//     };
//   }
// };

export const getActivity = async (
  activityId: string
): Promise<GetActivityResponse> => {
  try {
    // First, get the activity
    const { data: activity, error: activityError } = await supabase
      .from("activities")
      .select("*")
      .eq("id", activityId)
      .single();

    if (activityError || !activity) {
      return {
        success: false,
        error: activityError
          ? `Failed to fetch activity: ${activityError.message}`
          : "Activity not found",
      };
    }

    // Then, get all records for this activity in batches
    const BATCH_SIZE = 1000;
    let allRecords: ActivityRecord[] = [];
    let hasMore = true;
    let offset = 0;

    while (hasMore) {
      const { data: records, error: recordsError } = await supabase
        .from("activity_records")
        .select("*", { count: "exact" })
        .eq("activity_id", activityId)
        .order("time", { ascending: true })
        .range(offset, offset + BATCH_SIZE - 1);

      if (recordsError) {
        console.error("Error fetching activity records batch:", recordsError);
        // If we have some records but hit an error, continue with what we have
        hasMore = false;
        continue;
      }

      if (records && records.length > 0) {
        allRecords = [...allRecords, ...records];
      }

      // If we got fewer records than requested, we've reached the end
      if (!records || records.length < BATCH_SIZE) {
        hasMore = false;
      } else {
        offset += BATCH_SIZE;
      }
    }

    console.log(
      `Fetched ${allRecords.length} records for activity ${activityId}`
    );

    return {
      success: true,
      data: {
        ...activity,
        records: allRecords,
      },
    };
  } catch (error) {
    console.error("Get activity error:", error);
    return {
      success: false,
      error: "Failed to fetch activity",
    };
  }
};

export const getActivityTimeseries = async (
  activityId: string,
  interval: string = "30 seconds"
): Promise<GetTimeseriesResponse> => {
  try {
    const { data, error } = await supabase.rpc("get_activity_timeseries", {
      p_activity_id: activityId,
      p_interval: interval,
    });

    if (error) {
      return {
        success: false,
        data: [],
        interval,
        error: `Failed to fetch timeseries data: ${error.message}`,
      };
    }

    return {
      success: true,
      data: data || [],
      interval,
    };
  } catch (error) {
    console.error("Get timeseries error:", error);
    return {
      success: false,
      data: [],
      interval,
      error: "Failed to fetch timeseries data",
    };
  }
};

export const getActivityTrack = async (
  activityId: string,
  simplify: number = 0.0001
): Promise<GetTrackResponse> => {
  try {
    const { data, error } = await supabase.rpc("get_activity_track", {
      p_activity_id: activityId,
      p_simplify_tolerance: simplify,
    });

    if (error) {
      return {
        success: false,
        data: [],
        simplification: simplify,
        error: `Failed to fetch track data: ${error.message}`,
      };
    }

    return {
      success: true,
      data: data || [],
      simplification: simplify,
    };
  } catch (error: unknown) {
    console.error("Get track error:", error);
    return {
      success: false,
      data: [],
      simplification: simplify,
      error: "Failed to fetch track data",
    };
  }
};

export const getActivityLaps = async (
  activityId: string
): Promise<GetLapsResponse> => {
  try {
    const { data, error } = await supabase
      .from("laps")
      .select("*")
      .eq("activity_id", activityId)
      .order("lap_index", { ascending: true });

    if (error) {
      return {
        success: false,
        data: [],
        error: `Failed to fetch lap data: ${error.message}`,
      };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    console.error("Get laps error:", error);
    return {
      success: false,
      data: [],
      error: "Failed to fetch lap data",
    };
  }
};

export const deleteActivity = async (
  activityId: string,
  userId: string
): Promise<DeleteActivityResponse> => {
  try {
    console.log(`Starting comprehensive delete for activity ${activityId}`);

    // 1. First, get activity info to check ownership and get any file paths
    const { data: activity, error: fetchError } = await supabase
      .from("activities")
      .select("user_id, created_at")
      .eq("id", activityId)
      .single();

    if (fetchError) {
      return {
        success: false,
        error: `Activity not found: ${fetchError.message}`,
      };
    }

    // Security check: ensure user owns this activity
    if (activity.user_id !== userId) {
      return {
        success: false,
        error: "Unauthorized: You can only delete your own activities",
      };
    }

    // 2. Find any associated FIT files in storage
    // FIT files are stored in pattern: userId/YYYY/MM/DD/timestamp_filename.fit
    const activityDate = new Date(activity.created_at);
    const year = activityDate.getFullYear();
    const month = String(activityDate.getMonth() + 1).padStart(2, "0");
    const day = String(activityDate.getDate()).padStart(2, "0");
    const searchPath = `${userId}/${year}/${month}/${day}`;

    console.log(`Searching for FIT files in path: ${searchPath}`);

    // List files in the storage directory
    const { data: files, error: listError } = await supabase.storage
      .from("fit-files")
      .list(searchPath);

    if (listError) {
      console.warn(
        `Warning: Could not list files in storage: ${listError.message}`
      );
    }

    // Delete associated FIT files (best effort - don't fail if no files found)
    if (files && files.length > 0) {
      console.log(`Found ${files.length} files in storage directory`);

      // Create full paths for deletion
      const filePaths = files.map((file) => `${searchPath}/${file.name}`);

      const { error: storageError } = await supabase.storage
        .from("fit-files")
        .remove(filePaths);

      if (storageError) {
        console.warn("Storage deletion warning:", storageError);
        // Continue with database deletion even if storage cleanup fails
      } else {
        console.log(
          `Successfully deleted ${filePaths.length} files from storage`
        );
      }
    } else {
      console.log("No FIT files found in storage for this activity");
    }

    // 3. Delete from activities table (this will cascade to laps and records if FK constraints are set up)
    const { error: deleteError } = await supabase
      .from("activities")
      .delete()
      .eq("id", activityId)
      .eq("user_id", userId); // Double-check ownership

    if (deleteError) {
      return {
        success: false,
        error: `Failed to delete activity from database: ${deleteError.message}`,
      };
    }

    console.log(`Successfully deleted activity ${activityId}`);

    return {
      success: true,
      message: "Activity and associated data deleted successfully",
    };
  } catch (error) {
    console.error("Delete activity error:", error);
    return {
      success: false,
      error: "Failed to delete activity: An unexpected error occurred",
    };
  }
};

export const updateActivity = async (
  activityId: string,
  userId: string,
  updates: { name?: string; description?: string }
): Promise<UpdateActivityResponse> => {
  try {
    console.log(`Updating activity ${activityId} for user ${userId}`, updates);

    // Security check: ensure user owns this activity
    const { data: activity, error: fetchError } = await supabase
      .from("activities")
      .select("user_id")
      .eq("id", activityId)
      .single();

    if (fetchError) {
      return {
        success: false,
        error: `Activity not found: ${fetchError.message}`,
      };
    }

    if (activity.user_id !== userId) {
      return {
        success: false,
        error: "Unauthorized: You can only update your own activities",
      };
    }

    // Filter out undefined values to only update provided fields
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, value]) => value !== undefined)
    );

    if (Object.keys(filteredUpdates).length === 0) {
      return {
        success: false,
        error: "No valid updates provided",
      };
    }

    // Update the activity
    const { data: updatedActivity, error: updateError } = await supabase
      .from("activities")
      .update(filteredUpdates)
      .eq("id", activityId)
      .eq("user_id", userId) // Double-check ownership
      .select()
      .single();

    if (updateError) {
      return {
        success: false,
        error: `Failed to update activity: ${updateError.message}`,
      };
    }

    console.log(`Successfully updated activity ${activityId}`);

    return {
      success: true,
      data: updatedActivity,
    };
  } catch (error) {
    console.error("Update activity error:", error);
    return {
      success: false,
      error: "Failed to update activity: An unexpected error occurred",
    };
  }
};

export const getUserStats = async (
  userId: string,
  period: string = "30 days",
  sport: string | null = null
): Promise<GetUserStatsResponse> => {
  try {
    // For this implementation, we'll use a simpler approach since the RPC call seems complex
    // This could be implemented as a proper RPC function in Supabase
    let query = supabase
      .from("activity_overview")
      .select("*")
      .eq("user_id", userId);

    // Add date filter based on period (simplified)
    const periodDate = new Date();
    if (period === "30 days") {
      periodDate.setDate(periodDate.getDate() - 30);
    } else if (period === "7 days") {
      periodDate.setDate(periodDate.getDate() - 7);
    } else if (period === "1 year") {
      periodDate.setFullYear(periodDate.getFullYear() - 1);
    }

    query = query.gte("activity_timestamp", periodDate.toISOString());

    if (sport) {
      query = query.eq("sport", sport);
    }

    const { data, error } = await query;

    if (error) {
      return {
        success: false,
        data: {
          activity_count: 0,
          total_distance: 0,
          total_time: 0,
          avg_speed: 0,
          max_speed: 0,
          avg_power: 0,
          max_power: 0,
          sports: "",
        },
        period,
        sport,
        error: `Failed to fetch user statistics: ${error.message}`,
      };
    }

    // Calculate stats from the data
    const activities = data || [];
    const stats: UserStats = {
      activity_count: activities.length,
      total_distance: activities.reduce(
        (sum, a) => sum + (a.total_distance || 0),
        0
      ),
      total_time: activities.reduce(
        (sum, a) => sum + (a.total_timer_time || 0),
        0
      ),
      avg_speed:
        activities.length > 0
          ? activities.reduce((sum, a) => sum + (a.avg_speed || 0), 0) /
            activities.length
          : 0,
      max_speed: Math.max(...activities.map((a) => a.max_speed || 0)),
      avg_power:
        activities.length > 0
          ? activities.reduce((sum, a) => sum + (a.avg_power || 0), 0) /
            activities.length
          : 0,
      max_power: Math.max(...activities.map((a) => a.max_power || 0)),
      sports: [...new Set(activities.map((a) => a.sport).filter(Boolean))].join(
        ", "
      ),
    };

    return {
      success: true,
      data: stats,
      period,
      sport,
    };
  } catch (error) {
    console.error("Get user stats error:", error);
    return {
      success: false,
      data: {
        activity_count: 0,
        total_distance: 0,
        total_time: 0,
        avg_speed: 0,
        max_speed: 0,
        avg_power: 0,
        max_power: 0,
        sports: "",
      },
      period,
      sport,
      error: "Failed to fetch user statistics",
    };
  }
};

export const checkDataIntegrity = async (): Promise<{
  success: boolean;
  checks: unknown[];
  timestamp: string;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase.rpc("check_data_integrity");

    if (error) {
      return {
        success: false,
        checks: [],
        timestamp: new Date().toISOString(),
        error: `Failed to run integrity check: ${error.message}`,
      };
    }

    return {
      success: true,
      checks: data || [],
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Integrity check error:", error);
    return {
      success: false,
      checks: [],
      timestamp: new Date().toISOString(),
      error: "Failed to run integrity check",
    };
  }
};
