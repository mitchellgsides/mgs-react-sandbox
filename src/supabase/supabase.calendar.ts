import { supabase } from "./supabase.client";
import type { User } from "@supabase/supabase-js";

// Define the event types
export interface CalendarEvent {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  start_date: string; // ISO 8601 string format
  end_date: string; // ISO 8601 string format
  color?: string;
  all_day: boolean;
  created_at?: string;
  updated_at?: string;
}

export type NewCalendarEvent = Omit<
  CalendarEvent,
  "id" | "created_at" | "updated_at"
>;
export type CalendarEventUpdate = Partial<
  Omit<CalendarEvent, "id" | "user_id" | "created_at" | "updated_at">
>;

// Define the activity types for fit files
export interface Activity {
  id: string;
  user_id: string;
  filename: string;
  file_path: string;
  file_size: number;
  upload_date: string;
  activity_date: string | null;
  activity_type: string | null;
  duration: number | null; // in seconds
  distance: number | null; // in meters
  calories: number | null;
  elevation_gain: number | null; // in meters
  avg_heart_rate: number | null;
  max_heart_rate: number | null;
  avg_speed: number | null; // in m/s
  max_speed: number | null; // in m/s
  sport: string | null;
  device_name: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all calendar events for a user within a date range
 */
export const fetchEvents = async (
  user: User,
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> => {
  try {
    // Convert dates to ISO strings for querying
    const startIso = startDate.toISOString();
    const endIso = endDate.toISOString();

    const { data, error } = await supabase
      .from("calendar_events")
      .select("*")
      .eq("user_id", user.id)
      .or(`start_date.gte.${startIso},end_date.gte.${startIso}`)
      .lt("start_date", endIso)
      .order("start_date", { ascending: true });

    if (error) {
      console.error("Error fetching calendar events:", error);
      throw error;
    }

    return data as CalendarEvent[];
  } catch (error) {
    console.error("Error in fetchEvents:", error);
    throw error;
  }
};

/**
 * Create a new calendar event
 */
export const createEvent = async (
  user: User,
  event: NewCalendarEvent
): Promise<CalendarEvent> => {
  try {
    const { data, error } = await supabase
      .from("calendar_events")
      .insert({
        ...event,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating calendar event:", error);
      throw error;
    }

    return data as CalendarEvent;
  } catch (error) {
    console.error("Error in createEvent:", error);
    throw error;
  }
};

/**
 * Update an existing calendar event
 */
export const updateEvent = async (
  eventId: string,
  userId: string,
  updates: CalendarEventUpdate
): Promise<CalendarEvent> => {
  try {
    const { data, error } = await supabase
      .from("calendar_events")
      .update(updates)
      .eq("id", eventId)
      .eq("user_id", userId) // Security check: ensure user owns this event
      .select()
      .single();

    if (error) {
      console.error("Error updating calendar event:", error);
      throw error;
    }

    return data as CalendarEvent;
  } catch (error) {
    console.error("Error in updateEvent:", error);
    throw error;
  }
};

/**
 * Delete a calendar event
 */
export const deleteEvent = async (
  eventId: string,
  userId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("calendar_events")
      .delete()
      .eq("id", eventId)
      .eq("user_id", userId); // Security check: ensure user owns this event

    if (error) {
      console.error("Error deleting calendar event:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in deleteEvent:", error);
    throw error;
  }
};

// =============================================================================
// ACTIVITY API (FIT FILES)
// =============================================================================

/**
 * Fetch all activities for a user within a date range
 */
export const fetchActivities = async (
  user: User,
  startDate: Date,
  endDate: Date
): Promise<Activity[]> => {
  try {
    // Convert dates to ISO strings for querying
    const startIso = startDate.toISOString();
    const endIso = endDate.toISOString();

    const { data, error } = await supabase
      .from("fit_files")
      .select("*")
      .eq("user_id", user.id)
      .gte("activity_date", startIso)
      .lte("activity_date", endIso)
      .order("activity_date", { ascending: true });

    if (error) {
      console.error("Error fetching activities:", error);
      throw error;
    }

    return data as Activity[];
  } catch (error) {
    console.error("Error in fetchActivities:", error);
    throw error;
  }
};

/**
 * Fetch all activities for a user (no date filtering)
 */
export const fetchAllActivities = async (user: User): Promise<Activity[]> => {
  try {
    const { data, error } = await supabase
      .from("fit_files")
      .select("*")
      .eq("user_id", user.id)
      .order("activity_date", { ascending: false });

    if (error) {
      console.error("Error fetching all activities:", error);
      throw error;
    }

    return data as Activity[];
  } catch (error) {
    console.error("Error in fetchAllActivities:", error);
    throw error;
  }
};

/**
 * Fetch recent activities for a user with pagination
 */
export const fetchRecentActivities = async (
  user: User,
  limit: number = 20,
  offset: number = 0
): Promise<Activity[]> => {
  try {
    const { data, error } = await supabase
      .from("fit_files")
      .select("*")
      .eq("user_id", user.id)
      .order("activity_date", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("Error fetching recent activities:", error);
      throw error;
    }

    return data as Activity[];
  } catch (error) {
    console.error("Error in fetchRecentActivities:", error);
    throw error;
  }
};

/**
 * Fetch activities by sport type
 */
export const fetchActivitiesBySport = async (
  user: User,
  sport: string,
  limit?: number
): Promise<Activity[]> => {
  try {
    let query = supabase
      .from("fit_files")
      .select("*")
      .eq("user_id", user.id)
      .eq("sport", sport)
      .order("activity_date", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching activities by sport:", error);
      throw error;
    }

    return data as Activity[];
  } catch (error) {
    console.error("Error in fetchActivitiesBySport:", error);
    throw error;
  }
};

// /**
//  * Fetch all lap records for a specific activity
//  */
// export const fetchActivityLaps = async (fitFileId: string) => {
//   try {
//     // Specify a very large number to effectively remove pagination
//     const PAGE_SIZE = 100000; // Much larger than expected number of laps

//     const { data, error } = await supabase
//       .from("activity_laps")
//       .select("*")
//       .eq("fit_file_id", fitFileId)
//       .limit(PAGE_SIZE);

//     if (error) {
//       console.error("Error fetching activity laps:", error);
//       throw error;
//     }

//     return data || [];
//   } catch (error) {
//     console.error("Error in fetchActivityLaps:", error);
//     throw error;
//   }
// };

/**
 * Get activity statistics for a user
 */
export const getActivityStats = async (user: User) => {
  try {
    const { data, error } = await supabase
      .from("fit_files")
      .select("sport, activity_type, duration, distance, calories")
      .eq("user_id", user.id)
      .not("activity_date", "is", null);

    if (error) {
      console.error("Error fetching activity stats:", error);
      throw error;
    }

    // Calculate totals and group by sport
    const totalActivities = data.length;
    const totalDuration = data.reduce(
      (sum, activity) => sum + (activity.duration || 0),
      0
    );
    const totalDistance = data.reduce(
      (sum, activity) => sum + (activity.distance || 0),
      0
    );
    const totalCalories = data.reduce(
      (sum, activity) => sum + (activity.calories || 0),
      0
    );

    // Group by sport
    const bySport = data.reduce((acc, activity) => {
      const sport = activity.sport || "unknown";
      if (!acc[sport]) {
        acc[sport] = {
          count: 0,
          duration: 0,
          distance: 0,
          calories: 0,
        };
      }
      acc[sport].count += 1;
      acc[sport].duration += activity.duration || 0;
      acc[sport].distance += activity.distance || 0;
      acc[sport].calories += activity.calories || 0;
      return acc;
    }, {} as Record<string, { count: number; duration: number; distance: number; calories: number }>);

    return {
      totalActivities,
      totalDuration,
      totalDistance,
      totalCalories,
      bySport,
    };
  } catch (error) {
    console.error("Error in getActivityStats:", error);
    throw error;
  }
};

/**
 * Delete an activity (fit file) - removes both from storage and database
 */
export const deleteActivity = async (
  activityId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // 1. Get file info
    const { data: fileInfo, error: fetchError } = await supabase
      .from("fit_files")
      .select("file_path")
      .eq("id", activityId)
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      throw new Error(`File not found: ${fetchError.message}`);
    }

    // 2. Delete from storage
    const { error: storageError } = await supabase.storage
      .from("fit-files")
      .remove([fileInfo.file_path]);

    if (storageError) {
      console.error("Storage deletion error:", storageError);
      // Continue anyway - database record should still be deleted
    }

    // 3. Delete from database
    const { error: dbError } = await supabase
      .from("fit_files")
      .delete()
      .eq("id", activityId)
      .eq("user_id", userId);

    if (dbError) {
      throw new Error(`Database deletion failed: ${dbError.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Error in deleteActivity:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
};

/**
 * Update activity metadata (limited fields that might be user-editable)
 */
export const updateActivityMetadata = async (
  activityId: string,
  userId: string,
  updates: {
    activity_type?: string;
    sport?: string;
  }
): Promise<Activity> => {
  try {
    const { data, error } = await supabase
      .from("fit_files")
      .update(updates)
      .eq("id", activityId)
      .eq("user_id", userId) // Security check: ensure user owns this activity
      .select()
      .single();

    if (error) {
      console.error("Error updating activity metadata:", error);
      throw error;
    }

    return data as Activity;
  } catch (error) {
    console.error("Error in updateActivityMetadata:", error);
    throw error;
  }
};
