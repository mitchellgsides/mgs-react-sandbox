// Example usage of optimized uploadFitFile function
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useQueryClient } from "@tanstack/react-query";
import { uploadFitFile } from "../supabase/utils/fitFileUpload";
import { useAuthContext } from "../contexts/Auth/useAuthContext";
import { ACTIVITIES_QUERY_KEY } from "../hooks/api/useActivities";
import { CALENDAR_ACTIVITIES_QUERY_KEY } from "../hooks/api/useCalendar";

// Styled Components
const FitFileUploaderContainer = styled.div`
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  border-radius: 8px;
  max-width: 500px;
`;

const FileInput = styled.input`
  margin: 10px 0;
  padding: 10px;
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: 4px;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const UploadProgress = styled.div`
  margin: 20px 0;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 20px;
  background-color: ${({ theme }) => theme.colors.light};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background-color: ${({ theme }) => theme.colors.success};
  transition: width 0.3s ease;
  width: ${(props) => props.progress}%;
`;

const ProgressMessage = styled.p`
  margin: 10px 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  opacity: 0.8;
`;

const UploadResult = styled.div<{ isSuccess: boolean }>`
  margin: 20px 0;
  padding: 15px;
  border-radius: 4px;
  background-color: ${(props) =>
    props.isSuccess
      ? `${props.theme.colors.success}22`
      : `${props.theme.colors.danger}22`};
  border: 1px solid
    ${(props) =>
      props.isSuccess ? props.theme.colors.success : props.theme.colors.danger};
  color: ${(props) =>
    props.isSuccess ? props.theme.colors.success : props.theme.colors.danger};

  h4 {
    margin: 0 0 10px 0;
  }

  p {
    margin: 5px 0;
    font-size: 14px;
  }
`;

const ViewButton = styled.button`
  margin-top: 10px;
  padding: 8px 16px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary}dd;
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.primary}aa;
  }
`;

// Define proper result type interface
interface UploadResult {
  success: boolean;
  activity_id?: string;
  file?: File;
  uploadTime?: number;
  stats?: {
    recordsStored?: number;
    lapsStored?: number;
    totalRecords?: number;
    totalLaps?: number;
  };
  filePath?: string | null;
  error?: string;
}

interface UploadProgress {
  stage: string;
  progress: number;
  recordsProcessed?: number;
  totalRecords?: number;
  error?: string;
}

export const OptimizedFitFileUploader: React.FC = () => {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !user) return;

      setUploading(true);
      setProgress(null);
      setResult(null);

      try {
        const uploadResult = await uploadFitFile(file, user.id, {
          onProgress: (progressData: UploadProgress) => {
            setProgress(progressData);
          },
          allowDuplicates: false, // Prevent duplicate uploads
          skipFileStorage: false, // Store both data and file
        });

        setResult(uploadResult);

        if (uploadResult.success) {
          console.log("Upload successful:", uploadResult);

          // Invalidate React Query cache after successful upload
          try {
            await queryClient.invalidateQueries({
              queryKey: [ACTIVITIES_QUERY_KEY],
            });

            await queryClient.invalidateQueries({
              queryKey: [CALENDAR_ACTIVITIES_QUERY_KEY],
            });

            console.log("Cache invalidated successfully after upload");
          } catch (cacheError) {
            console.error(
              "Failed to invalidate cache after upload:",
              cacheError
            );
          }
        } else {
          console.error("Upload failed:", uploadResult.error);
        }
      } catch (error) {
        console.error("Upload error:", error);
        setResult({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        setUploading(false);
        setProgress(null);
      }
    },
    [user, queryClient]
  );

  const getProgressMessage = (progress: UploadProgress) => {
    switch (progress.stage) {
      case "validation":
        return "Validating file...";
      case "parsing":
        return "Parsing FIT file...";
      case "duplicate_check":
        return "Checking for duplicates...";
      case "storing_data":
        return "Storing activity data...";
      case "storing_records":
        return `Processing records (${progress.recordsProcessed || 0}/${
          progress.totalRecords || 0
        })...`;
      case "file_storage":
        return "Uploading file...";
      case "complete":
        return "Upload complete!";
      case "error":
        return `Error: ${progress.error}`;
      default:
        return "Processing...";
    }
  };

  return (
    <FitFileUploaderContainer>
      <h3>Upload FIT File</h3>

      <FileInput
        type="file"
        accept=".fit"
        onChange={handleFileUpload}
        disabled={uploading}
      />

      {uploading && progress && (
        <UploadProgress>
          <ProgressBar>
            <ProgressFill progress={progress.progress} />
          </ProgressBar>
          <ProgressMessage>
            {getProgressMessage(progress)} ({Math.round(progress.progress)}%)
          </ProgressMessage>
        </UploadProgress>
      )}

      {result && (
        <UploadResult isSuccess={result.success}>
          {result.success ? (
            <div>
              <h4>✅ Upload Successful!</h4>
              <p>Activity ID: {result.activity_id}</p>
              <p>Upload time: {result.uploadTime}ms</p>
              <p>Records stored: {result.stats?.recordsStored}</p>
              <p>Laps stored: {result.stats?.lapsStored}</p>
              {result.filePath && <p>File path: {result.filePath}</p>}
              {result.activity_id && (
                <ViewButton
                  onClick={() => navigate(`/activities/${result.activity_id}`)}
                >
                  View Activity
                </ViewButton>
              )}
            </div>
          ) : (
            <div>
              <h4>❌ Upload Failed</h4>
              <p>Error: {result.error}</p>
              <p>Upload time: {result.uploadTime}ms</p>
            </div>
          )}
        </UploadResult>
      )}
    </FitFileUploaderContainer>
  );
};

export default OptimizedFitFileUploader;
