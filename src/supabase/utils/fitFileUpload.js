// utils/fitFileUpload.ts
import { supabase } from "../supabase.client";
import FitParser from "fit-file-parser";
import { convertFitTypeToWorkoutType } from "./fit-file-helpers";
import { WorkoutType } from "../../pages/Calendar/context/fakeData";
import FitDataProcessor from "./fitFileProcessing.ts";
import { FitDataStorage } from "./fitDataStorage.js";

// Utility function for generating optimized file paths
function generateFitFilePath(userId, activityDate, originalFilename) {
  const date = new Date(activityDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  // Generate unique filename to avoid collisions
  const timestamp = Date.now();
  const cleanFilename = originalFilename
    .replace(/[^a-zA-Z0-9.-]/g, "_")
    .toLowerCase();
  const filename = `${timestamp}_${cleanFilename}`;

  // Structure: userId/year/month/day/timestamp_filename.fit
  return `${userId}/${year}/${month}/${day}/${filename}`;
}

// Optimized FIT file parser using fit-file-parser
async function parseFitFileMetadata(file, userId) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const buffer = reader.result;

      // Create a FitParser instance with optimized settings
      const fitParser = new FitParser({
        force: true,
        speedUnit: "km/h",
        lengthUnit: "km",
        temperatureUnit: "celsius",
        pressureUnit: "bar", 
        elapsedRecordField: true,
        mode: "cascade",
      });

      // Parse the FIT file
      fitParser.parse(buffer, (error, parsedData) => {
        if (error) {
          console.error("FIT parser error:", error);
          reject(new Error(`FIT parsing failed: ${error.message || error}`));
          return;
        }

        try {
          // Process the data using FitDataProcessor
          const processor = new FitDataProcessor();
          const processedData = processor.processFitFile(parsedData, userId);
          
          // Extract basic metadata for compatibility
          const activity = processedData.activity;
          const stats = processedData.stats;
          
          // Get device info from parsed data
          const deviceInfos = parsedData?.activity?.device_infos || [];
          const device = deviceInfos[0] || {};
          
          const metadata = {
            activityDate: activity.activity_timestamp,
            activityType: activity.sub_sport,
            sport: convertFitTypeToWorkoutType(activity.sport) || WorkoutType.OTHER,
            duration: activity.total_timer_time || activity.total_elapsed_time || 0,
            distance: activity.total_distance || 0,
            calories: 0, // Not in processed data, would need to be calculated
            elevationGain: 0, // Not in processed data, would need to be calculated
            avgHeartRate: 0, // Could be calculated from records if needed
            maxHeartRate: 0, // Could be calculated from records if needed
            avgSpeed: 0, // Could be calculated from records if needed
            maxSpeed: 0, // Could be calculated from records if needed
            deviceName: device.manufacturer || device.product_name || device.device_type || "unknown",
            recordCount: stats.total_records,
            lapCount: stats.total_laps,
          };

          resolve({
            metadata,
            processedData,
          });
        } catch (processingError) {
          console.error("Error processing parsed FIT data:", processingError);
          reject(new Error(`FIT data processing failed: ${processingError.message}`));
        }
      });
    };

    reader.onerror = () => {
      reject(new Error("Failed to read FIT file"));
    };

    reader.readAsArrayBuffer(file);
  });
}

// Optimized FIT file upload function
export async function uploadFitFile(file, userId, options = {}) {
  const startTime = Date.now();
  const { 
    onProgress = null, 
    allowDuplicates = false,
    skipFileStorage = false 
  } = options;

  // Report initial progress
  if (onProgress) {
    onProgress({ stage: 'validation', progress: 0 });
  }

  try {
    // 1. Validate file input
    if (!file) {
      throw new Error("No file provided");
    }

    if (!file.name.toLowerCase().endsWith(".fit")) {
      throw new Error("File must be a .fit file");
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error("File size exceeds limit (10MB)");
    }

    if (!userId) {
      throw new Error("User ID is required");
    }

    // Report parsing progress
    if (onProgress) {
      onProgress({ stage: 'parsing', progress: 10 });
    }

    // 2. Parse and process FIT file
    console.log("Parsing FIT file...");
    const data = await parseFitFileMetadata(file, userId);
    const { metadata, processedData } = data;

    if (onProgress) {
      onProgress({ stage: 'duplicate_check', progress: 30 });
    }

    // 3. Check for duplicates if enabled
    if (!allowDuplicates) {
      const fitDataStorage = new FitDataStorage(supabase);
      const exists = await fitDataStorage.activityExists(
        userId, 
        processedData.activity.activity_timestamp
      );
      
      if (exists) {
        throw new Error(`Activity from ${metadata.activityDate} already exists`);
      }
    }

    if (onProgress) {
      onProgress({ stage: 'storing_data', progress: 40 });
    }

    // 4. Store processed data to database
    console.log("Storing processed FIT data...");
    const fitDataStorage = new FitDataStorage(supabase);
    
    // Set up progress callback for batch operations
    if (onProgress) {
      fitDataStorage.onProgressCallback((batchProgress) => {
        const overallProgress = 40 + (batchProgress.percentage * 0.4); // 40-80% range
        onProgress({ 
          stage: 'storing_records', 
          progress: overallProgress,
          recordsProcessed: batchProgress.processed,
          totalRecords: batchProgress.total
        });
      });
    }

    const storageResult = await fitDataStorage.storeFitData(processedData);
    
    if (!storageResult.success) {
      throw new Error(`Failed to store FIT data: ${storageResult.error}`);
    }

    if (onProgress) {
      onProgress({ stage: 'file_storage', progress: 80 });
    }

    let filePath = null;
    
    // 5. Optionally store file to Supabase storage
    if (!skipFileStorage) {
      console.log("Uploading file to storage...");
      filePath = generateFitFilePath(userId, metadata.activityDate, file.name);
      
      const { error: storageError } = await supabase.storage
        .from("fit-files")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (storageError) {
        console.warn("File storage failed:", storageError);
        // Don't fail the entire upload for storage issues
        filePath = null;
      }
    }

    if (onProgress) {
      onProgress({ stage: 'complete', progress: 100 });
    }

    const duration = Date.now() - startTime;
    console.log(`Upload completed successfully in ${duration}ms`);

    return {
      success: true,
      activity_id: storageResult.activity_id,
      file: metadata,
      uploadTime: duration,
      filePath: filePath,
      stats: {
        recordsStored: storageResult.stats.records_stored,
        lapsStored: storageResult.stats.laps_stored,
        totalRecords: metadata.recordCount,
        totalLaps: metadata.lapCount,
      },
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`Upload failed after ${duration}ms:`, error);

    if (onProgress) {
      onProgress({ stage: 'error', progress: 0, error: error.message });
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: errorMessage,
      uploadTime: duration,
    };
  }
}