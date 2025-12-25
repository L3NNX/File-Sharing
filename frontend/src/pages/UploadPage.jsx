import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { Upload, File, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
const API = `${BACKEND_URL}/api`;

export const UploadPage = () => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      
      // Check file size
      if (file.size > 50 * 1024 * 1024) {
        toast.error("File size must be under 50MB");
        return;
      }
      
      if (file.size < 1) {
        toast.error("File is empty");
        return;
      }
      
      setSelectedFile(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    multiple: false
  });

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axios.post(`${API}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("File uploaded successfully!");
      navigate(`/success/${response.data.id}`, { state: { data: response.data } });
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error.response?.data?.detail || "Failed to upload file";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-24">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-slate-900 mb-4">
            Share Files Instantly
          </h1>
          <p className="text-base md:text-lg text-slate-500 leading-relaxed">
            Upload a file, get a link and QR code. Files auto-delete after 2 hours.
          </p>
        </div>

        <div
          {...getRootProps()}
          className={`upload-zone bg-white border-2 border-dashed rounded-xl p-12 cursor-pointer group mb-6 ${
            isDragActive ? "drag-active" : "border-slate-300"
          }`}
          data-testid="file-upload-zone"
        >
          <input {...getInputProps()} data-testid="file-input" />
          <div className="text-center">
            <div className="flex justify-center mb-6">
              {selectedFile ? (
                <File className="w-16 h-16 text-blue-600" strokeWidth={1.5} />
              ) : (
                <Upload className="w-16 h-16 text-slate-400 group-hover:text-blue-600 transition-all" strokeWidth={1.5} />
              )}
            </div>
            
            {selectedFile ? (
              <div>
                <p className="text-xl font-semibold text-slate-900 mb-2">
                  {selectedFile.name}
                </p>
                <p className="mono text-sm text-slate-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xl font-semibold text-slate-900 mb-2">
                  {isDragActive ? "Drop your file here" : "Drop a file here"}
                </p>
                <p className="text-slate-500">
                  or click to select (max 50MB)
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-slate-600 shrink-0 mt-0.5" strokeWidth={1.5} />
          <p className="text-sm text-slate-600">
            Files are automatically deleted after 2 hours for your privacy and security.
          </p>
        </div>

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full h-12 px-8 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
          data-testid="upload-button"
        >
          {uploading ? "Uploading..." : "Upload & Generate Link"}
        </button>
      </div>
    </div>
  );
};

export default UploadPage;
