// Type definitions for FIT file data structures
interface FitRecord {
  timestamp: string; // ISO string
  elapsed_time?: number;
  timer_time?: number;
  distance?: number;
  speed?: number;
  position_lat?: number;
  position_long?: number;
  altitude?: number;
  power?: number;
  cadence?: number;
  heart_rate?: number;
  temperature?: number;
}

interface FitLap {
  start_time: string; // ISO string
  timestamp: string; // ISO string
  total_distance?: number;
  total_elapsed_time?: number;
  total_timer_time?: number;
  start_position_lat?: number;
  start_position_long?: number;
  end_position_lat?: number;
  end_position_long?: number;
  lap_trigger?: string;
  records?: FitRecord[];
}

interface FitSession {
  sport?: string;
  sub_sport?: string;
  total_distance?: number;
  total_timer_time?: number;
  total_elapsed_time?: number;
  laps: FitLap[];
}

interface FitActivity {
  timestamp: string; // ISO string
  sessions: FitSession[];
}

interface FitData {
  activity: FitActivity;
}

interface ProcessedActivity {
  user_id: string;
  activity_timestamp: string; // ISO string
  name: string; // Human-readable name from filename
  sport: string;
  sub_sport: string;
  total_distance?: number;
  total_timer_time?: number;
  total_elapsed_time?: number;
  start_lat: number | null;
  start_lng: number | null;
  end_lat: number | null;
  end_lng: number | null;
  // Activity-level averages and maximums
  avg_speed?: number | null;
  max_speed?: number | null;
  avg_power?: number | null;
  max_power?: number | null;
  avg_heart_rate?: number | null;
  max_heart_rate?: number | null;
}

interface ProcessedLap {
  lap_index: number;
  start_time: string; // ISO string
  end_time: string; // ISO string
  total_distance?: number;
  total_elapsed_time?: number;
  total_timer_time?: number;
  start_lat: number | null;
  start_lng: number | null;
  end_lat: number | null;
  end_lng: number | null;
  avg_speed: number | null;
  max_speed: number | null;
  avg_power: number | null;
  max_power: number | null;
  avg_cadence: number | null;
  avg_heart_rate: number | null;
  trigger: string;
}

interface ProcessedRecord {
  time: string; // ISO string
  elapsed_time: number | null;
  timer_time: number | null;
  distance: number | null;
  speed: number | null;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  power: number | null;
  cadence: number | null;
  heart_rate: number | null;
  temperature: number | null;
  record_type: string;
  data_quality: number;
  lap_index?: number; // Added for easier database insertion
}

interface LapStats {
  avg_speed: number | null;
  max_speed: number | null;
  avg_power: number | null;
  max_power: number | null;
  avg_cadence: number | null;
  avg_heart_rate: number | null;
}

interface ActivityStats {
  total_records: number;
  total_laps: number;
  sport?: string;
  sub_sport?: string;
}

interface ActivityBounds {
  start_lat: number | null;
  start_lng: number | null;
  end_lat: number | null;
  end_lng: number | null;
}

interface ProcessedFitData {
  activity: ProcessedActivity;
  laps: ProcessedLap[];
  records: ProcessedRecord[];
  stats: ActivityStats;
}

class FitDataProcessor {
  private readonly COORDINATE_PRECISION: number = 7; // ~0.011m accuracy
  private readonly MIN_VALID_TEMP: number = -50; // Filter obviously invalid temperatures
  private readonly MAX_VALID_TEMP: number = 60;
  private readonly MAX_RECORDS_PER_LAP: number = 10000; // Prevent memory issues

  /**
   * Generate a human-readable activity name from filename
   */
  private formatActivityName(filename?: string): string {
    if (!filename) {
      return "Activity";
    }

    // Remove file extension
    let name = filename.replace(/\.[^/.]+$/, "");

    // Replace underscores with spaces
    name = name.replace(/_/g, " ");

    // Trim any extra whitespace
    name = name.trim();

    return name || "Activity";
  }

  /**
   * Main processing function for FIT file data with optimizations
   */
  processFitFile(
    fitData: FitData,
    userId: string,
    filename?: string
  ): ProcessedFitData {
    try {
      const activity = fitData.activity;
      const session = activity.sessions[0];

      if (!session || !session.laps || session.laps.length === 0) {
        throw new Error("Invalid FIT file: No session data found");
      }

      // Validate data size to prevent memory issues
      const totalRecords = session.laps.reduce(
        (total, lap) => total + (lap.records?.length || 0),
        0
      );

      if (totalRecords > 50000) {
        console.warn(
          `Large dataset detected: ${totalRecords} records. Processing may take longer.`
        );
      }

      return {
        activity: this.extractActivityMetadata(fitData, userId, filename),
        laps: this.processLaps(session.laps),
        records: this.processRecords(session.laps),
        stats: this.calculateActivityStats(session),
      };
    } catch (error) {
      console.error("Error processing FIT file:", error);
      throw new Error(
        `FIT processing failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Extract activity-level metadata
   */
  private extractActivityMetadata(
    fitData: FitData,
    userId: string,
    filename?: string
  ): ProcessedActivity {
    const activity = fitData.activity;
    const session = activity.sessions[0];

    // Calculate activity bounds
    const bounds = this.calculateActivityBounds(session.laps);

    // Calculate activity-level statistics from all records
    const activityStats = this.calculateActivityLevelStats(session.laps);

    return {
      user_id: userId,
      activity_timestamp: activity.timestamp,
      name: this.formatActivityName(filename),
      sport: session.sport || "unknown",
      sub_sport: session.sub_sport || "generic",
      total_distance: session.total_distance,
      total_timer_time: session.total_timer_time,
      total_elapsed_time: session.total_elapsed_time,
      start_lat: bounds.start_lat,
      start_lng: bounds.start_lng,
      end_lat: bounds.end_lat,
      end_lng: bounds.end_lng,
      // Include activity-level statistics
      avg_speed: activityStats.avg_speed,
      max_speed: activityStats.max_speed,
      avg_power: activityStats.avg_power,
      max_power: activityStats.max_power,
      avg_heart_rate: activityStats.avg_heart_rate,
      max_heart_rate: activityStats.max_heart_rate,
    };
  }

  /**
   * Process lap data
   */
  private processLaps(laps: FitLap[]): ProcessedLap[] {
    return laps.map((lap, index) => {
      const lapStats = this.calculateLapStats(lap.records || []);

      return {
        lap_index: index,
        start_time: lap.start_time,
        end_time: lap.timestamp,
        total_distance: lap.total_distance,
        total_elapsed_time: lap.total_elapsed_time,
        total_timer_time: lap.total_timer_time,
        start_lat: this.roundCoordinate(lap.start_position_lat),
        start_lng: this.roundCoordinate(lap.start_position_long),
        end_lat: this.roundCoordinate(lap.end_position_lat),
        end_lng: this.roundCoordinate(lap.end_position_long),
        avg_speed: lapStats.avg_speed,
        max_speed: lapStats.max_speed,
        avg_power: lapStats.avg_power,
        max_power: lapStats.max_power,
        avg_cadence: lapStats.avg_cadence,
        avg_heart_rate: lapStats.avg_heart_rate,
        trigger: lap.lap_trigger || "manual",
      };
    });
  }

  /**
   * Process individual records for time-series storage with memory optimization
   */
  private processRecords(laps: FitLap[]): ProcessedRecord[] {
    const allRecords: ProcessedRecord[] = [];

    laps.forEach((lap, lapIndex) => {
      if (!lap.records || lap.records.length === 0) return;

      // Limit records per lap to prevent memory issues
      const recordsToProcess =
        lap.records.length > this.MAX_RECORDS_PER_LAP
          ? lap.records.slice(0, this.MAX_RECORDS_PER_LAP)
          : lap.records;

      if (lap.records.length > this.MAX_RECORDS_PER_LAP) {
        console.warn(
          `Lap ${lapIndex} has ${lap.records.length} records, limiting to ${this.MAX_RECORDS_PER_LAP}`
        );
      }

      recordsToProcess.forEach((record) => {
        const processedRecord = this.processRecord(record);
        if (processedRecord) {
          // Add lap index for easier database insertion
          processedRecord.lap_index = lapIndex;
          allRecords.push(processedRecord);
        }
      });
    });

    // Sort by timestamp to ensure proper ordering
    return allRecords.sort(
      (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
    );
  }

  /**
   * Process individual record
   */
  private processRecord(record: FitRecord): ProcessedRecord | null {
    if (!record.timestamp) return null;

    return {
      time: record.timestamp,
      elapsed_time: record.elapsed_time || null,
      timer_time: record.timer_time || null,
      distance: record.distance || null,
      speed: this.validateSpeed(record.speed),
      latitude: this.roundCoordinate(record.position_lat),
      longitude: this.roundCoordinate(record.position_long),
      altitude: record.altitude || null,
      power: this.validatePower(record.power),
      cadence: this.validateCadence(record.cadence),
      heart_rate: this.validateHeartRate(record.heart_rate),
      temperature: this.validateTemperature(record.temperature),
      record_type: "data",
      data_quality: this.assessDataQuality(record),
    };
  }

  /**
   * Utility functions for data validation and processing
   */
  private roundCoordinate(coord: number | undefined): number | null {
    if (coord == null || isNaN(coord)) return null;
    return (
      Math.round(coord * Math.pow(10, this.COORDINATE_PRECISION)) /
      Math.pow(10, this.COORDINATE_PRECISION)
    );
  }

  private validateSpeed(speed: number | undefined): number | null {
    if (speed == null || isNaN(speed) || speed < 0 || speed > 200) return null;
    return Math.round(speed * 100) / 100; // 2 decimal places
  }

  private validatePower(power: number | undefined): number | null {
    if (power == null || isNaN(power) || power < 0 || power > 2000) return null;
    return Math.round(power);
  }

  private validateCadence(cadence: number | undefined): number | null {
    if (cadence == null || isNaN(cadence) || cadence < 0 || cadence > 300)
      return null;
    return Math.round(cadence);
  }

  private validateHeartRate(hr: number | undefined): number | null {
    if (hr == null || isNaN(hr) || hr < 30 || hr > 250) return null;
    return Math.round(hr);
  }

  private validateTemperature(temp: number | undefined): number | null {
    if (
      temp == null ||
      isNaN(temp) ||
      temp < this.MIN_VALID_TEMP ||
      temp > this.MAX_VALID_TEMP
    ) {
      return null;
    }
    return Math.round(temp * 10) / 10; // 1 decimal place
  }

  private assessDataQuality(record: FitRecord): number {
    let quality = 100;

    // Reduce quality for missing key metrics
    if (!record.position_lat || !record.position_long) quality -= 20;
    if (!record.speed) quality -= 15;
    if (!record.distance) quality -= 10;
    if (!record.power) quality -= 15; // Removed sport check as it's not available in record
    if (!record.heart_rate) quality -= 10;

    return Math.max(0, quality);
  }

  /**
   * Calculate activity bounds and statistics
   */
  private calculateActivityBounds(laps: FitLap[]): ActivityBounds {
    let firstValidLap: FitLap | null = null;
    let lastValidLap: FitLap | null = null;

    for (const lap of laps) {
      if (lap.start_position_lat && lap.start_position_long) {
        if (!firstValidLap) firstValidLap = lap;
        lastValidLap = lap;
      }
    }

    return {
      start_lat: firstValidLap?.start_position_lat || null,
      start_lng: firstValidLap?.start_position_long || null,
      end_lat: lastValidLap?.end_position_lat || null,
      end_lng: lastValidLap?.end_position_long || null,
    };
  }

  /**
   * Calculate activity-level statistics from all records across all laps
   */
  private calculateActivityLevelStats(laps: FitLap[]): {
    avg_speed: number | null;
    max_speed: number | null;
    avg_power: number | null;
    max_power: number | null;
    avg_heart_rate: number | null;
    max_heart_rate: number | null;
  } {
    // Collect all records from all laps
    const allRecords: FitRecord[] = [];
    for (const lap of laps) {
      if (lap.records && lap.records.length > 0) {
        allRecords.push(...lap.records);
      }
    }

    if (allRecords.length === 0) {
      return {
        avg_speed: null,
        max_speed: null,
        avg_power: null,
        max_power: null,
        avg_heart_rate: null,
        max_heart_rate: null,
      };
    }

    // Extract valid values for each metric
    const speeds = allRecords
      .map((r) => r.speed)
      .filter((s): s is number => s != null && s > 0);
    const powers = allRecords
      .map((r) => r.power)
      .filter((p): p is number => p != null && p > 0);
    const heartRates = allRecords
      .map((r) => r.heart_rate)
      .filter((hr): hr is number => hr != null && hr > 0);

    return {
      avg_speed:
        speeds.length > 0
          ? Math.round(
              (speeds.reduce((a, b) => a + b, 0) / speeds.length) * 100
            ) / 100
          : null,
      max_speed: speeds.length > 0 ? Math.max(...speeds) : null,
      avg_power:
        powers.length > 0
          ? Math.round(powers.reduce((a, b) => a + b, 0) / powers.length)
          : null,
      max_power: powers.length > 0 ? Math.max(...powers) : null,
      avg_heart_rate:
        heartRates.length > 0
          ? Math.round(
              heartRates.reduce((a, b) => a + b, 0) / heartRates.length
            )
          : null,
      max_heart_rate: heartRates.length > 0 ? Math.max(...heartRates) : null,
    };
  }

  private calculateLapStats(records: FitRecord[]): LapStats {
    if (!records || records.length === 0) {
      return {
        avg_speed: null,
        max_speed: null,
        avg_power: null,
        max_power: null,
        avg_cadence: null,
        avg_heart_rate: null,
      };
    }

    const validRecords = records.filter((r) => r != null);
    const speeds = validRecords
      .map((r) => r.speed)
      .filter((s): s is number => s != null && s > 0);
    const powers = validRecords
      .map((r) => r.power)
      .filter((p): p is number => p != null && p > 0);
    const cadences = validRecords
      .map((r) => r.cadence)
      .filter((c): c is number => c != null && c > 0);
    const heartRates = validRecords
      .map((r) => r.heart_rate)
      .filter((hr): hr is number => hr != null && hr > 0);

    return {
      avg_speed:
        speeds.length > 0
          ? Math.round(
              (speeds.reduce((a, b) => a + b, 0) / speeds.length) * 100
            ) / 100
          : null,
      max_speed: speeds.length > 0 ? Math.max(...speeds) : null,
      avg_power:
        powers.length > 0
          ? Math.round(powers.reduce((a, b) => a + b, 0) / powers.length)
          : null,
      max_power: powers.length > 0 ? Math.max(...powers) : null,
      avg_cadence:
        cadences.length > 0
          ? Math.round(cadences.reduce((a, b) => a + b, 0) / cadences.length)
          : null,
      avg_heart_rate:
        heartRates.length > 0
          ? Math.round(
              heartRates.reduce((a, b) => a + b, 0) / heartRates.length
            )
          : null,
    };
  }

  private calculateActivityStats(session: FitSession): ActivityStats {
    return {
      total_records:
        session.laps?.reduce(
          (total, lap) => total + (lap.records?.length || 0),
          0
        ) || 0,
      total_laps: session.laps?.length || 0,
      sport: session.sport,
      sub_sport: session.sub_sport,
    };
  }
}

export default FitDataProcessor;
