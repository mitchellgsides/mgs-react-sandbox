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
