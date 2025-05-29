import { supabase } from "../supabase.client";
import { listUserFilesPaginated } from "./batch_operations";
import { generateFitFilePath } from "./storage";

// Test the bucket setup with realistic scenarios
export async function testBucketSetup() {
  const testUserId = "test-user-123";
  const testFile = new Blob(["test data"], {
    type: "application/octet-stream",
  });

  // Test 1: Upload with hierarchical path
  const filePath = generateFitFilePath(testUserId, new Date(), "test.fit");
  console.log("Generated path:", filePath);

  const { error: uploadError } = await supabase.storage
    .from("fit-files")
    .upload(filePath, testFile);

  if (uploadError) {
    console.error("Upload test failed:", uploadError);
    return;
  }

  // Test 2: List files efficiently
  const { data: listData, error: listError } = await listUserFilesPaginated(
    testUserId,
    {
      limit: 10,
      offset: 0,
      year: null,
      month: null,
    }
  );

  if (listError) {
    console.error("List test failed:", listError);
    return;
  }

  console.log("List test results:", listData?.length || 0, "files found");

  // Test 3: Clean up
  await supabase.storage.from("fit-files").remove([filePath]);

  console.log("Bucket setup test completed successfully");
}
