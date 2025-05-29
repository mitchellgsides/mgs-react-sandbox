// Utility function for generating optimized file paths
export const generateFitFilePath = (
  userId: string,
  activityDate: Date,
  originalFilename: string
) => {
  const date = new Date(activityDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  // Generate unique filename to avoid collisions
  const timestamp = Date.now();
  const cleanFilename = originalFilename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filename = `${timestamp}_${cleanFilename}`;

  // Structure: userId/year/month/day/timestamp_filename.fit
  return `${userId}/${year}/${month}/${day}/${filename}`;
};

// Example usage:
// const filePath = generateFitFilePath(
//   "user-123",
//   "2024-01-15T10:30:00Z",
//   "morning_run.fit"
// );
// Results in: user-123/2024/01/15/1705320600000_morning_run.fit
