export class FitDataStorage {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
    this.BATCH_SIZE = 500; // Reduced for better memory usage
    this.onProgress = null;
  }

  /**
   * Main storage function with improved error handling and transaction management
   */
  async storeFitData(processedData) {
    const { activity, laps, records, stats } = processedData;
    console.log('xxx processedData', processedData);
    try {
      // Check for required data
      if (!activity || !activity.user_id) {
        throw new Error("Invalid activity data: missing user_id");
      }

      // Start transaction (if your database supports it)
      // Note: Supabase doesn't have explicit transaction RPC functions by default
      // This would need to be implemented as stored procedures
      
      let activityResult;
      let lapsResult = [];
      
      try {
        // 1. Store activity
        activityResult = await this.insertActivity(activity);
        const activityId = activityResult.id;

        // 2. Store laps if available
        if (laps && laps.length > 0) {
          lapsResult = await this.insertLaps(laps, activityId);
        }

        // 3. Store records in batches if available
        if (records && records.length > 0) {
          await this.insertRecordsBatched(records, activityId, lapsResult);
        }

        return {
          success: true,
          activity_id: activityId,
          stats: {
            ...stats,
            laps_stored: lapsResult.length,
            records_stored: records?.length || 0,
          },
        };
      } catch (error) {
        // If we had a transaction, we would rollback here
        console.error("Storage operation failed:", error);
        
        // Attempt cleanup if activity was created but subsequent operations failed
        if (activityResult?.id) {
          console.log("Attempting cleanup of partially created activity...");
          try {
            await this.supabase.from("activities").delete().eq("id", activityResult.id);
          } catch (cleanupError) {
            console.warn("Cleanup failed:", cleanupError);
          }
        }
        
        throw error;
      }
    } catch (error) {
      console.error("Storage error:", error);
      return {
        success: false,
        error: error.message,
        details: error,
      };
    }
  }

  /**
   * Insert activity metadata
   */
  async insertActivity(activityData) {
    const { data, error } = await this.supabase
      .from("activities")
      .insert([activityData])
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        // Unique constraint violation
        throw new Error("Activity already exists for this user and timestamp");
      }
      throw new Error(`Failed to insert activity: ${error.message}`);
    }

    return data;
  }

  /**
   * Insert laps data
   */
  async insertLaps(lapsData, activityId) {
    if (!lapsData || lapsData.length === 0) return [];

    const lapsWithActivityId = lapsData.map((lap) => ({
      ...lap,
      activity_id: activityId,
    }));

    const { data, error } = await this.supabase
      .from("laps")
      .insert(lapsWithActivityId)
      .select();

    if (error) {
      throw new Error(`Failed to insert laps: ${error.message}`);
    }

    return data;
  }

  /**
   * Insert records in batches for better performance and memory usage
   */
  async insertRecordsBatched(records, activityId, laps) {
    if (!records || records.length === 0) return;

    // Create lap lookup map for better performance
    const lapMap = new Map();
    if (laps && laps.length > 0) {
      laps.forEach((lap) => {
        lapMap.set(lap.lap_index, lap.id);
      });
    }

    console.log(`Processing ${records.length} records in batches of ${this.BATCH_SIZE}...`);

    // Process in batches to manage memory and database load
    for (let i = 0; i < records.length; i += this.BATCH_SIZE) {
      const batch = records.slice(i, i + this.BATCH_SIZE);
      
      // Add activity_id and lap_id to records
      const enrichedRecords = batch.map((record) => ({
        ...record,
        activity_id: activityId,
        lap_id: lapMap.get(record.lap_index) || null,
      }));

      const { error } = await this.supabase
        .from("activity_records")
        .insert(enrichedRecords);

      if (error) {
        throw new Error(
          `Failed to insert records batch ${
            Math.floor(i / this.BATCH_SIZE) + 1
          }: ${error.message}`
        );
      }

      // Report progress if callback is set
      if (this.onProgress) {
        const processed = Math.min(i + this.BATCH_SIZE, records.length);
        this.onProgress({
          processed,
          total: records.length,
          percentage: Math.round((processed / records.length) * 100),
        });
      }

      // Small delay to prevent overwhelming the database
      if (i + this.BATCH_SIZE < records.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
  }

  /**
   * Check if activity already exists
   */
  async activityExists(userId, timestamp) {
    // Normalize timestamp to ISO format to prevent timezone parsing issues
    let normalizedTimestamp;
    try {
      // Convert to JavaScript Date object and then to ISO string
      normalizedTimestamp = new Date(timestamp).toISOString();
    } catch (err) {
      throw new Error(`Invalid timestamp format: ${err.message}`);
    }

    const { data, error } = await this.supabase
      .from("activities")
      .select("id")
      .eq("user_id", userId)
      .eq("activity_timestamp", normalizedTimestamp)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = no rows found
      throw new Error(`Error checking activity existence: ${error.message}`);
    }

    return data !== null;
  }

  /**
   * Get activity summary
   */
  async getActivitySummary(activityId) {
    const { data, error } = await this.supabase.rpc("get_activity_summary", {
      activity_id: activityId,
    });

    if (error) {
      throw new Error(`Error getting activity summary: ${error.message}`);
    }

    return data;
  }

  /**
   * Set progress callback
   */
  onProgressCallback(callback) {
    this.onProgress = callback;
  }
}
