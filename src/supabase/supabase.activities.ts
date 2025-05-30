import { supabase } from "./supabase.client";
import type { User } from "@supabase/supabase-js";
import type { WorkoutType } from "../pages/Calendar/context/fakeData";

// Map activity data from Supabase to calendar Workout format
export interface CalendarActivity {
  id: string;
  date: Date;
  name: string;
  duration: string | null;
  type: WorkoutType;
  description?: string;
  // Additional fields from activities table
  sport?: string;
  total_distance?: number;
  avg_speed?: number;
  max_speed?: number;
  avg_power?: number;
  max_power?: number;
  avg_heart_rate?: number;
  max_heart_rate?: number;
  // For backward compatibility, distance maps to total_distance
  distance?: number;
}

// Sport mapping from Supabase activities to calendar workout types
const SPORT_TO_WORKOUT_TYPE_MAP: Record<string, WorkoutType> = {
  running: "run",
  cycling: "bike",
  swimming: "swim",
  strength_training: "strength",
  yoga: "yoga",
  generic: "other",
  unknown: "other",
};

/**
 * Fetch activities from the 'activities' table for the calendar's visible weeks
 */
export const fetchActivitiesForCalendar = async (
  user: User,
  visibleWeeks: Date[]
): Promise<CalendarActivity[]> => {
  try {
    if (!visibleWeeks.length) {
      return [];
    }

    // Calculate the date range from the visible weeks
    const sortedWeeks = [...visibleWeeks].sort(
      (a, b) => a.getTime() - b.getTime()
    );
    const startDate = new Date(sortedWeeks[0]);
    startDate.setHours(0, 0, 0, 0); // Start of first week

    const endDate = new Date(sortedWeeks[sortedWeeks.length - 1]);
    endDate.setDate(endDate.getDate() + 6); // End of last week (6 days after start of week)
    endDate.setHours(23, 59, 59, 999); // End of day

    console.log(
      `Fetching activities from ${startDate.toISOString()} to ${endDate.toISOString()}`
    );

    const { data, error } = await supabase
      .from("activities")
      .select(
        `
        id,
        activity_timestamp,
        sport,
        total_distance,
        total_timer_time,
        avg_speed,
        max_speed,
        avg_power,
        max_power,
        avg_heart_rate,
        max_heart_rate
      `
      )
      .eq("user_id", user.id)
      .gte("activity_timestamp", startDate.toISOString())
      .lte("activity_timestamp", endDate.toISOString())
      .order("activity_timestamp", { ascending: true });

    if (error) {
      console.error("Error fetching activities for calendar:", error);
      throw error;
    }

    // Transform activities to calendar format
    const calendarActivities: CalendarActivity[] = (data || []).map(
      (activity) => {
        const activityDate = new Date(activity.activity_timestamp);
        const sport = activity.sport || "unknown";
        const workoutType =
          SPORT_TO_WORKOUT_TYPE_MAP[sport.toLowerCase()] || "other";

        // Format duration
        let durationString: string | null = null;
        if (activity.total_timer_time) {
          const hours = Math.floor(activity.total_timer_time / 3600);
          const minutes = Math.floor((activity.total_timer_time % 3600) / 60);
          const seconds = activity.total_timer_time % 60;
          durationString = `${hours}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        }

        // Generate activity name based on sport and distance/duration
        let activityName = sport.charAt(0).toUpperCase() + sport.slice(1);
        if (activity.total_distance && activity.total_distance > 0) {
          const distanceKm = (activity.total_distance / 1000).toFixed(1);
          activityName += ` - ${distanceKm}km`;
        } else if (durationString) {
          activityName += ` - ${durationString}`;
        }

        // Generate description with stats
        let description = `${sport} activity`;
        const stats: string[] = [];

        if (activity.total_distance && activity.total_distance > 0) {
          stats.push(
            `Distance: ${(activity.total_distance / 1000).toFixed(1)}km`
          );
        }

        if (activity.avg_speed && activity.avg_speed > 0) {
          const speedKmh = (activity.avg_speed * 3.6).toFixed(1);
          stats.push(`Avg Speed: ${speedKmh}km/h`);
        }

        if (activity.avg_power && activity.avg_power > 0) {
          const powerText = `Avg Power: ${Math.round(activity.avg_power)}W`;
          if (activity.max_power && activity.max_power > 0) {
            stats.push(
              `${powerText} (Max: ${Math.round(activity.max_power)}W)`
            );
          } else {
            stats.push(powerText);
          }
        }

        if (activity.avg_heart_rate && activity.avg_heart_rate > 0) {
          const hrText = `Avg HR: ${Math.round(activity.avg_heart_rate)}bpm`;
          if (activity.max_heart_rate && activity.max_heart_rate > 0) {
            stats.push(
              `${hrText} (Max: ${Math.round(activity.max_heart_rate)}bpm)`
            );
          } else {
            stats.push(hrText);
          }
        }

        if (stats.length > 0) {
          description += ` • ${stats.join(" • ")}`;
        }

        return {
          id: activity.id,
          date: activityDate,
          name: activityName,
          duration: durationString,
          type: workoutType,
          description,
          sport: activity.sport,
          total_distance: activity.total_distance,
          avg_speed: activity.avg_speed,
          max_speed: activity.max_speed,
          avg_power: activity.avg_power,
          max_power: activity.max_power,
          avg_heart_rate: activity.avg_heart_rate,
          max_heart_rate: activity.max_heart_rate,
          // For backward compatibility
          distance: activity.total_distance,
        };
      }
    );

    console.log(`Fetched ${calendarActivities.length} activities for calendar`);
    return calendarActivities;
  } catch (error) {
    console.error("Error in fetchActivitiesForCalendar:", error);
    throw error;
  }
};

/**
 * Fetch activities for a specific date range (alternative method)
 */
export const fetchActivitiesForDateRange = async (
  user: User,
  startDate: Date,
  endDate: Date
): Promise<CalendarActivity[]> => {
  try {
    console.log(
      `Fetching activities from ${startDate.toISOString()} to ${endDate.toISOString()}`
    );

    const { data, error } = await supabase
      .from("activities")
      .select(
        `
        id,
        activity_timestamp,
        sport,
        total_distance,
        total_timer_time,
        avg_speed,
        max_speed,
        avg_power,
        max_power,
        avg_heart_rate,
        max_heart_rate
      `
      )
      .eq("user_id", user.id)
      .gte("activity_timestamp", startDate.toISOString())
      .lte("activity_timestamp", endDate.toISOString())
      .order("activity_timestamp", { ascending: true });

    if (error) {
      console.error("Error fetching activities for date range:", error);
      throw error;
    }

    // Transform using the same logic as above
    const calendarActivities: CalendarActivity[] = (data || []).map(
      (activity) => {
        const activityDate = new Date(activity.activity_timestamp);
        const sport = activity.sport || "unknown";
        const workoutType =
          SPORT_TO_WORKOUT_TYPE_MAP[sport.toLowerCase()] || "other";

        let durationString: string | null = null;
        if (activity.total_timer_time) {
          const hours = Math.floor(activity.total_timer_time / 3600);
          const minutes = Math.floor((activity.total_timer_time % 3600) / 60);
          const seconds = activity.total_timer_time % 60;
          durationString = `${hours}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        }

        let activityName = sport.charAt(0).toUpperCase() + sport.slice(1);
        if (activity.total_distance && activity.total_distance > 0) {
          const distanceKm = (activity.total_distance / 1000).toFixed(1);
          activityName += ` - ${distanceKm}km`;
        } else if (durationString) {
          activityName += ` - ${durationString}`;
        }

        return {
          id: activity.id,
          date: activityDate,
          name: activityName,
          duration: durationString,
          type: workoutType,
          sport: activity.sport,
          total_distance: activity.total_distance,
          avg_speed: activity.avg_speed,
          max_speed: activity.max_speed,
          avg_power: activity.avg_power,
          max_power: activity.max_power,
          avg_heart_rate: activity.avg_heart_rate,
          max_heart_rate: activity.max_heart_rate,
          // For backward compatibility
          distance: activity.total_distance,
        };
      }
    );

    return calendarActivities;
  } catch (error) {
    console.error("Error in fetchActivitiesForDateRange:", error);
    throw error;
  }
};
