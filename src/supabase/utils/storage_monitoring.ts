import { supabase } from "../supabase.client";

// Storage usage monitoring function
export const getStorageStats = async (userId: string) => {
  const { data: files, error } = await supabase.storage
    .from("fit-files")
    .list(`${userId}/`, {
      limit: 1000,
      offset: 0,
    });

  if (error) {
    console.error("Storage stats error:", error);
    return null;
  }

  return {
    totalFiles: files.length,
    totalSize: files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0),
    lastUpdated: new Date().toISOString(),
  };
};

// Performance monitoring for storage operations
export const monitoredStorageUpload = async (filePath: string, file: File) => {
  const startTime = Date.now();

  try {
    const { data, error } = await supabase.storage
      .from("fit-files")
      .upload(filePath, file);

    const duration = Date.now() - startTime;

    // Log performance metrics
    console.log(`Storage upload: ${duration}ms, size: ${file.size}bytes`);

    return { data, error, duration };
  } catch (error) {
    console.error("Storage upload failed:", error);
    throw error;
  }
};
