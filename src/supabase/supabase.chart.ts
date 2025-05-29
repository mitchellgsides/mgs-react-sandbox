import { supabase } from "./supabase.client";

// Define the activity lap interface based on the activity_laps table structure
export interface ActivityLap {
  id?: string;
  fit_file_id: string;
  lap_index: number;
  timestamp: string;
  power: number | null;
  heart_rate: number | null;
  speed: number | null;
  distance: number | null;
  cadence: number | null;
  altitude: number | null;
  position_lat: number | null;
  position_long: number | null;
  lap_avg_power: number | null;
  lap_max_power: number | null;
  lap_avg_heart_rate: number | null;
  lap_max_heart_rate: number | null;
  lap_avg_speed: number | null;
  lap_max_speed: number | null;
  lap_avg_cadence: number | null;
  lap_max_cadence: number | null;
  created_at?: string;
}

/**
 * Efficiently fetch all lap data for charting
 */
export const fetchAllActivityLapsForChart = async (
  fitFileId: string
): Promise<ActivityLap[]> => {
  try {
    const PAGE_SIZE = 1000;
    let allLaps: ActivityLap[] = [];

    // First, get a count to know how many pages we need
    const { count } = await supabase
      .from("activity_laps")
      .select("*", { count: "exact", head: true })
      .eq("fit_file_id", fitFileId);

    if (!count || count === 0) return [];

    const totalPages = Math.ceil(count / PAGE_SIZE);

    // Create promises for all pages
    const fetchPromises: Promise<ActivityLap[]>[] = [];
    for (let i = 0; i < totalPages; i++) {
      const promise = (async (): Promise<ActivityLap[]> => {
        const { data, error } = await supabase
          .from("activity_laps")
          .select("*")
          .eq("fit_file_id", fitFileId)
          .range(i * PAGE_SIZE, (i + 1) * PAGE_SIZE - 1)
          .order("lap_index");

        if (error) {
          throw error;
        }
        return data as ActivityLap[];
      })();

      fetchPromises.push(promise);
    }

    // Execute all requests concurrently
    const results = await Promise.all(fetchPromises);

    // Combine all results
    for (const data of results) {
      allLaps = allLaps.concat(data);
    }

    // Sort by lap index to ensure proper order for charting
    allLaps.sort((a, b) => (a.lap_index || 0) - (b.lap_index || 0));

    return allLaps;
  } catch (error) {
    console.error("Error in fetchAllActivityLapsForChart:", error);
    throw error;
  }
};

/**
 * Transform lap data for Highcharts
 */
export const transformLapsForHighcharts = (laps: ActivityLap[]) => {
  return laps.map((lap, index) => ({
    x: index + 1, // Lap number
    y: lap.power || 0,
    name: `Lap ${index + 1}`,
    distance: lap.distance || 0,
    time: lap.timestamp,
    speed: lap.speed || 0,
    power: lap.power || 0,
    altitude: lap.altitude || 0,
    cadence: lap.cadence || 0,
    heart_rate: lap.heart_rate || 0,
  }));
};

/**
 * Complete function to get chart-ready data
 */
export const getLapChartData = async (fitFileId: string) => {
  const laps = await fetchAllActivityLapsForChart(fitFileId);
  return transformLapsForHighcharts(laps);
};
