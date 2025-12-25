import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Download, FileX, Clock, Home, Loader2 } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL
const API = `${BACKEND_URL}/api`;

export const DownloadPage = () => {
  const { fileId } = useParams();
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    fetchFileInfo();
  }, [fileId]);

  const fetchFileInfo = async () => {
    try {
      const response = await axios.get(`${API}/file/${fileId}`);
      setFileInfo(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching file info:", err);
      
      if (err.response?.status === 404) {
        setError("File not found");
      } else if (err.response?.status === 410) {
        setError("File has expired");
      } else {
        setError("Failed to load file information");
      }
      
      setLoading(false);
    }
  };

  const handleDownload = () => {
    setDownloading(true);
    window.location.href = `${API}/download/${fileId}`;
    setTimeout(() => setDownloading(false), 2000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getExpiryTime = () => {
    if (!fileInfo) return "";
    const expiryDate = new Date(fileInfo.expires_at);
    return expiryDate.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" strokeWidth={2} />
          <p className="text-lg text-slate-600">Loading file information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6 py-24">
        <div className="max-w-md w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
            {error === "File has expired" ? (
              <Clock className="w-8 h-8 text-red-600" strokeWidth={2} />
            ) : (
              <FileX className="w-8 h-8 text-red-600" strokeWidth={2} />
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tighter text-slate-900 mb-4">
            {error === "File has expired" ? "File Expired" : "File Not Found"}
          </h1>
          <p className="text-base text-slate-500 mb-8">
            {error === "File has expired"
              ? "This file has been automatically deleted after 2 hours."
              : "The file you're looking for doesn't exist or has been removed."}
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700"
            data-testid="home-button"
          >
            <Home className="w-4 h-4" strokeWidth={2} />
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-24">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
            <Download className="w-8 h-8 text-blue-600" strokeWidth={2} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-slate-900 mb-4">
            Ready to Download
          </h1>
          <p className="text-base md:text-lg text-slate-500 leading-relaxed">
            Click the button below to download your file.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-8 mb-6" data-testid="download-info-card">
          <div className="mb-6 pb-6 border-b border-slate-200">
            <p className="text-sm text-slate-500 mb-1">File Name</p>
            <p className="mono text-lg text-slate-900 font-medium break-all" data-testid="download-file-name">
              {fileInfo.filename}
            </p>
          </div>

          <div className="mb-6 pb-6 border-b border-slate-200">
            <p className="text-sm text-slate-500 mb-1">File Size</p>
            <p className="mono text-lg text-slate-900 font-medium" data-testid="download-file-size">
              {formatFileSize(fileInfo.size)}
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-amber-900 mb-1">
                File expires soon
              </p>
              <p className="mono text-xs text-amber-700">
                Expires at {getExpiryTime()}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            to="/"
            className="h-12 px-8 bg-slate-100 text-slate-900 font-medium rounded-md hover:bg-slate-200 flex items-center justify-center gap-2"
            data-testid="home-link-button"
          >
            <Home className="w-4 h-4" strokeWidth={2} />
            Home
          </Link>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 h-12 px-8 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center gap-2"
            data-testid="download-file-button"
          >
            {downloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" strokeWidth={2} />
                Download File
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadPage;
