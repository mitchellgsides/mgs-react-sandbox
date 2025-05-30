import React, { useState, useCallback } from "react";
import { Upload, File, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { uploadFitFile } from "../supabase/utils/fitFileUpload.js";
import { useAuthContext } from "../contexts/Auth/useAuthContext";

export const UploadPage = () => {
  return <FitFileUploader />;
};

const FitFileUploader = () => {
  const [files, setFiles] = useState([] as File[]);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<UploadResultItem[]>([]);

  const { user } = useAuthContext();
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
        alert("Only .FIT files are allowed");
      }

      setFiles(fitFiles);
      setUploadResults([]); // Clear previous results
    },
    []
  );

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    const results: UploadResultItem[] = [];

    try {
      // Upload files one by one (could be batched for better UX)
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`Uploading file ${i + 1}/${files.length}: ${file.name}`);

        const result = await uploadFitFile(file, userId);
        results.push({ file, result });

        // Update results as we go
        setUploadResults([...results]);
      }
    } catch (error) {
      console.error("Upload process error:", error);
    } finally {
      setUploading(false);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    setUploadResults([]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const successfulUploads = uploadResults.filter((r) => {
    return r.result.success;
  }).length;

  const failedUploads = uploadResults.filter((r) => !r.result?.success).length;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Upload FIT Files
      </h2>

      {/* File Selection */}
      <div className="mb-6">
        <label className="block mb-2 text-sm font-medium text-gray-700">
          Select .FIT files to upload
        </label>
        <input
          type="file"
          multiple
          accept=".fit"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-medium
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            cursor-pointer"
          disabled={uploading}
        />
      </div>

      {/* Selected Files Preview */}
      {files.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 text-gray-800">
            Selected Files ({files.length})
          </h3>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center p-2 bg-gray-50 rounded"
              >
                <File className="w-4 h-4 mr-2 text-gray-500" />
                <span className="flex-1 text-sm text-gray-700 truncate">
                  {file.name}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {formatFileSize(file.size)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Controls */}
      {files.length > 0 && (
        <div className="flex gap-3 mb-6">
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            {uploading ? "Uploading..." : "Upload Files"}
          </button>

          <button
            onClick={clearFiles}
            disabled={uploading}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            Clear
          </button>
        </div>
      )}

      {/* Upload Progress/Results */}
      {uploadResults.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3 text-gray-800">
            Upload Results
          </h3>

          {/* Summary */}
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <div className="text-sm text-gray-600">
              Progress: {uploadResults.length} / {files.length} files processed
            </div>
            {successfulUploads > 0 && (
              <div className="text-sm text-green-600">
                ✓ {successfulUploads} successful
              </div>
            )}
            {failedUploads > 0 && (
              <div className="text-sm text-red-600">
                ✗ {failedUploads} failed
              </div>
            )}
          </div>

          {/* Individual Results */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {uploadResults.map(({ file, result }, index) => (
              <div
                key={index}
                className="flex items-center p-2 bg-white border rounded"
              >
                {result.success ? (
                  <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2 text-red-500" />
                )}
                <span className="flex-1 text-sm text-gray-700 truncate">
                  {file.name}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {result.success ? `${result.uploadTime}ms` : result.error}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload in Progress Indicator */}
      {uploading && (
        <div className="text-center py-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-2" />
          <p className="text-sm text-gray-600">
            Uploading files... ({uploadResults.length} / {files.length}{" "}
            completed)
          </p>
        </div>
      )}
    </div>
  );
};

export default FitFileUploader;
