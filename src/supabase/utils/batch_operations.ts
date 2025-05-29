import { supabase } from "../supabase.client";

// Efficient batch listing with pagination
export async function listUserFilesPaginated(
  userId: string,
  options = {
    limit: 100,
    offset: 0,
    year: null,
    month: null,
  }
) {
  const { limit = 100, offset = 0, year = null, month = null } = options;

  let path = userId;
  if (year) path += `/${year}`;
  if (month) path += `/${String(month).padStart(2, "0")}`;

  const { data, error } = await supabase.storage
    .from("fit-files")
    .list(path, { limit, offset });

  return { data, error };
}

// Batch delete for cleanup operations
export async function batchDeleteFiles(filePaths: string[]) {
  const batchSize = 50; // Process in batches to avoid timeouts
  const results = [];

  for (let i = 0; i < filePaths.length; i += batchSize) {
    const batch = filePaths.slice(i, i + batchSize);

    const { data, error } = await supabase.storage
      .from("fit-files")
      .remove(batch);

    results.push({ data, error, batch });

    // Small delay between batches to be kind to the system
    if (i + batchSize < filePaths.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return results;
}
