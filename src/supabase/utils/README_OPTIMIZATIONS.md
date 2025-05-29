# FIT File Upload Optimizations

## Overview

The `uploadFitFile` function has been significantly optimized to provide better performance, error handling, and user experience when uploading FIT files from fitness devices.

## Key Optimizations Made

### 1. **Streamlined Data Processing**

- Removed redundant metadata extraction since `FitDataProcessor` already handles all data processing
- Unified data flow to reduce processing overhead
- Better memory management for large FIT files

### 2. **Enhanced Error Handling**

- More specific error messages for different failure scenarios
- Automatic cleanup of partial uploads on failure
- Better validation of input data

### 3. **Progress Reporting**

- Added comprehensive progress callbacks for UI feedback
- Tracks different stages: validation, parsing, duplicate checking, data storage, and file storage
- Provides batch progress for large datasets

### 4. **Duplicate Prevention**

- Optional duplicate checking based on user ID and activity timestamp
- Can be disabled with `allowDuplicates: true` option

### 5. **Flexible File Storage**

- File storage to Supabase Storage is now optional
- Can skip file storage with `skipFileStorage: true` for data-only uploads
- Non-blocking file storage failures (won't fail entire upload)

### 6. **Performance Improvements**

- Reduced batch size from 1000 to 500 records for better memory usage
- Added small delays between batches to prevent database overload
- Better transaction handling and cleanup

## Usage Examples

### Basic Upload

```javascript
import { uploadFitFile } from "./supabase/utils/fitFileUpload";

const result = await uploadFitFile(file, userId);
if (result.success) {
  console.log(`Activity ${result.activity_id} uploaded successfully`);
} else {
  console.error("Upload failed:", result.error);
}
```

### Upload with Progress Tracking

```javascript
const result = await uploadFitFile(file, userId, {
  onProgress: (progress) => {
    console.log(`${progress.stage}: ${progress.progress}%`);
    if (progress.recordsProcessed) {
      console.log(
        `Records: ${progress.recordsProcessed}/${progress.totalRecords}`
      );
    }
  },
});
```

### Upload with Custom Options

```javascript
const result = await uploadFitFile(file, userId, {
  allowDuplicates: true, // Skip duplicate checking
  skipFileStorage: true, // Only store data, not file
  onProgress: (progress) => {
    updateProgressBar(progress.progress);
  },
});
```

## Progress Stages

The progress callback receives an object with the following stages:

1. **validation** (0-10%) - File validation
2. **parsing** (10-30%) - FIT file parsing and processing
3. **duplicate_check** (30-40%) - Checking for existing activities
4. **storing_data** (40%) - Starting database storage
5. **storing_records** (40-80%) - Batch processing records
6. **file_storage** (80-100%) - Uploading file to storage
7. **complete** (100%) - Upload finished
8. **error** - Upload failed

## Return Value

### Success Response

```javascript
{
  success: true,
  activity_id: "uuid",
  file: { /* metadata object */ },
  uploadTime: 1234, // milliseconds
  filePath: "user/2025/05/29/file.fit", // or null if skipFileStorage
  stats: {
    recordsStored: 5000,
    lapsStored: 10,
    totalRecords: 5000,
    totalLaps: 10
  }
}
```

### Error Response

```javascript
{
  success: false,
  error: "Error message",
  uploadTime: 1234 // milliseconds
}
```

## FitDataStorage Optimizations

### Improved Batch Processing

- Reduced batch size for better memory usage
- Added progress reporting for batch operations
- Better error handling with partial cleanup

### Enhanced Error Recovery

- Automatic cleanup of partial uploads
- Better transaction handling
- More descriptive error messages

## FitDataProcessor Optimizations

### Memory Management

- Added limits for maximum records per lap (10,000)
- Early warnings for large datasets
- Better validation and filtering

### Data Quality

- Enhanced coordinate precision handling
- Improved data validation for all metrics
- Better handling of edge cases

## Database Schema Assumptions

The optimized code assumes the following database tables:

- `activities` - Main activity metadata
- `laps` - Lap-level data with `activity_id` foreign key
- `activity_records` - Time-series data with `activity_id` and `lap_id` foreign keys

## Migration Notes

If upgrading from the previous version:

1. The function signature remains the same
2. Add progress callbacks if desired
3. Update error handling to use the new error structure
4. Consider enabling duplicate checking for better UX

## Performance Characteristics

- **Small files** (<1000 records): ~1-3 seconds
- **Medium files** (1000-10000 records): ~5-15 seconds
- **Large files** (10000+ records): ~20-60 seconds

Performance will vary based on database connection speed and server load.
