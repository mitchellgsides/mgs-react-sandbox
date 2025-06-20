import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from "@mui/material";
import {
  CloudUpload,
  InsertDriveFile,
  CheckCircle,
  Error,
  Description,
  Visibility,
} from "@mui/icons-material";
import { useQueryClient } from "@tanstack/react-query";
import { uploadFitFile } from "../supabase/utils/fitFileUpload.js";
import { useAuthContext } from "../contexts/Auth/useAuthContext";
import { ACTIVITIES_QUERY_KEY } from "../hooks/api/useActivities";
import { CALENDAR_ACTIVITIES_QUERY_KEY } from "../hooks/api/useCalendar";

export const UploadPage = () => {
  return <FitFileUploader />;
};

const FitFileUploader = () => {
  const [files, setFiles] = useState([] as File[]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResultItem[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const userId = user?.id || "mgs-admin-user";

  interface FileUploadResult {
    success: boolean;
    file?: {
      id: string;
      filename: string;
      file_size: number;
      activity_date: string;
      activity_type: string;
    };
    error?: string;
    uploadTime?: number;
  }

  interface UploadResultItem {
    file: File;
    result: FileUploadResult;
  }

  const handleFileSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files || []);
      const fitFiles = selectedFiles.filter((file) =>
        file.name.toLowerCase().endsWith(".fit")
      );

      if (fitFiles.length !== selectedFiles.length) {
        // Show error for non-FIT files
      }

      setFiles(fitFiles);
      setUploadResults([]); // Clear previous results
    },
    []
  );

  const handleUpload = useCallback(async () => {
    if (files.length === 0) return;

    setUploading(true);
    const results: UploadResultItem[] = [];
    let hasSuccessfulUpload = false;

    for (const file of files) {
      try {
        const startTime = Date.now();
        const result = await uploadFitFile(file, userId);
        const uploadTime = Date.now() - startTime;

        results.push({
          file,
          result: { ...result, uploadTime },
        });

        if (result.success) {
          hasSuccessfulUpload = true;
        }
      } catch (error: unknown) {
        let errorMessage = "Unknown error";
        if (error && typeof error === "object" && "message" in error) {
          errorMessage = String((error as Error).message);
        } else if (typeof error === "string") {
          errorMessage = error;
        }

        results.push({
          file,
          result: {
            success: false,
            error: errorMessage,
          },
        });
      }
    }

    // Invalidate React Query cache if any uploads were successful
    if (hasSuccessfulUpload) {
      try {
        // Invalidate activities queries to refresh the activities list
        await queryClient.invalidateQueries({
          queryKey: [ACTIVITIES_QUERY_KEY],
        });

        // Invalidate calendar activities to refresh calendar view
        await queryClient.invalidateQueries({
          queryKey: [CALENDAR_ACTIVITIES_QUERY_KEY],
        });

        console.log("Cache invalidated successfully after upload");
        setShowSuccessMessage(true);

        // Hide success message after 5 seconds
        setTimeout(() => setShowSuccessMessage(false), 5000);

        // Optionally navigate to activities page after successful upload
        // Uncomment the line below if you want automatic navigation
        // setTimeout(() => navigate('/activities'), 2000);
      } catch (error) {
        console.error("Failed to invalidate cache after upload:", error);
      }
    }

    setUploadResults(results);
    setUploading(false);
    setFiles([]); // Clear files after upload

    // Show success message
    setShowSuccessMessage(true);
  }, [files, userId, queryClient]);

  const clearResults = useCallback(() => {
    setUploadResults([]);
    setFiles([]);
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const totalFiles = files.length;
  const successfulUploads = uploadResults.filter(
    (r) => r.result.success
  ).length;
  const failedUploads = uploadResults.filter((r) => !r.result.success).length;

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h3" color="primary" gutterBottom align="center">
        Upload FIT Files
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        align="center"
        sx={{ mb: 4 }}
      >
        Select and upload your Garmin FIT files to analyze your workout data.
      </Typography>

      {/* File Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ textAlign: "center" }}>
            <input
              accept=".fit"
              style={{ display: "none" }}
              id="file-upload"
              multiple
              type="file"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <label htmlFor="file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<Description />}
                disabled={uploading}
                sx={{ mb: 2 }}
              >
                Choose FIT Files
              </Button>
            </label>

            {files.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Selected Files ({files.length})
                </Typography>
                <List>
                  {files.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <InsertDriveFile color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary={file.name}
                        secondary={formatFileSize(file.size)}
                      />
                    </ListItem>
                  ))}
                </List>

                <Button
                  variant="contained"
                  startIcon={<CloudUpload />}
                  onClick={handleUpload}
                  disabled={uploading}
                  size="large"
                  sx={{ mt: 2 }}
                >
                  {uploading
                    ? "Uploading..."
                    : `Upload ${files.length} File${
                        files.length > 1 ? "s" : ""
                      }`}
                </Button>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploading && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Uploading Files...
            </Typography>
            <LinearProgress sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Processing {uploadResults.length + 1} of {totalFiles} files
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Upload Results */}
      {uploadResults.length > 0 && (
        <Card>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Upload Results</Typography>
              <Button variant="outlined" onClick={clearResults} size="small">
                Clear
              </Button>
            </Box>

            {/* Summary */}
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <Chip
                icon={<CheckCircle />}
                label={`${successfulUploads} Successful`}
                color="success"
                variant="outlined"
              />
              {failedUploads > 0 && (
                <Chip
                  icon={<Error />}
                  label={`${failedUploads} Failed`}
                  color="error"
                  variant="outlined"
                />
              )}
            </Box>

            {/* Results List */}
            <List>
              {uploadResults.map((item, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    item.result.success && item.result.file ? (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() =>
                          navigate(`/activities/${item.result.file?.id}`)
                        }
                        sx={{ ml: 1 }}
                      >
                        View
                      </Button>
                    ) : null
                  }
                >
                  <ListItemIcon>
                    {item.result.success ? (
                      <CheckCircle color="success" />
                    ) : (
                      <Error color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.file.name}
                    secondary={
                      item.result.success ? (
                        <Box>
                          <Typography variant="body2" color="success.main">
                            Uploaded successfully
                          </Typography>
                          {item.result.file && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Activity: {item.result.file.activity_type} •
                              {new Date(
                                item.result.file.activity_date
                              ).toLocaleDateString()}
                              {item.result.uploadTime &&
                                ` • ${item.result.uploadTime}ms`}
                            </Typography>
                          )}
                        </Box>
                      ) : (
                        <Typography variant="body2" color="error.main">
                          {item.result.error || "Upload failed"}
                        </Typography>
                      )
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <Alert
          severity="success"
          onClose={() => setShowSuccessMessage(false)}
          sx={{ mt: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate("/activities")}
            >
              View Activities
            </Button>
          }
        >
          Files uploaded successfully! Your activities list and calendar have
          been updated.
        </Alert>
      )}
    </Container>
  );
};

export default UploadPage;
