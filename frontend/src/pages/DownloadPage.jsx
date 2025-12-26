import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Download, FileX, Clock, Home, Loader2, Zap, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
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
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getExpiryTime = () => {
    if (!fileInfo) return "";
    const expiryDate = new Date(fileInfo.expires_at);
    return expiryDate.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" strokeWidth={1.5} />
          <p className="text-lg text-zinc-400">Loading file information...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-2xl mb-6 border border-red-500/20">
            {error === "File has expired" ? (
              <Clock className="w-8 h-8 text-red-500" strokeWidth={1.5} />
            ) : (
              <FileX className="w-8 h-8 text-red-500" strokeWidth={1.5} />
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">
            {error === "File has expired" ? "File Expired" : "File Not Found"}
          </h1>
          <p className="text-base text-zinc-400 mb-8">
            {error === "File has expired"
              ? "This file has been automatically deleted after 2 hours."
              : "The file you're looking for doesn't exist or has been removed."}
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-all"
            data-testid="home-button"
          >
            <Home className="w-4 h-4" strokeWidth={2} />
            Go to Home
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] border-b border-white/[0.05] bg-black/50 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-white" />
            <span className="font-semibold tracking-tight text-sm uppercase">Flash</span>
          </div>
          <Link
            to="/"
            className="text-xs text-zinc-500 hover:text-white transition-colors"
          >
            Upload New
          </Link>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-white/5 rounded-2xl mb-6 border border-white/10"
            >
              <CheckCircle className="w-8 h-8 text-white" strokeWidth={1.5} />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-white mb-4">
              File Ready
            </h1>
            <p className="text-base text-zinc-400 max-w-lg mx-auto leading-relaxed">
              Your file is waiting to be downloaded. This link will expire in 2 hours.
            </p>
          </div>

          {/* File Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.05] rounded-3xl p-8 mb-8 backdrop-blur-sm"
            data-testid="download-info-card"
          >
            {/* Filename */}
            <div className="mb-8 pb-8 border-b border-white/[0.05]">
              <p className="text-sm text-zinc-500 mb-3">
                File Name
              </p>
              <p
                className="mono text-lg text-white font-medium break-all"
                data-testid="download-file-name"
              >
                {fileInfo.filename}
              </p>
            </div>

            {/* File Size */}
            <div className="mb-8 pb-8 border-b border-white/[0.05]">
              <p className="text-sm text-zinc-500 mb-3">
                File Size
              </p>
              <p
                className="mono text-lg text-white font-medium"
                data-testid="download-file-size"
              >
                {formatFileSize(fileInfo.size)}
              </p>
            </div>

            {/* Expiry Warning */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium text-amber-400 mb-1">
                  File expires soon
                </p>
                <p className="mono text-xs text-amber-500/80 font-mono">
                  {getExpiryTime()}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-3"
          >
            <Link
              to="/"
              className="h-12 px-6 bg-white/5 border border-white/10 text-white font-medium rounded-md hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              data-testid="home-link-button"
            >
              <Home className="w-4 h-4" strokeWidth={2} />
              Home
            </Link>
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="flex-1 h-12 px-8 bg-white text-black font-medium rounded-md hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
          </motion.div>

          {/* Features Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-16 pt-12 border-t border-white/[0.05] flex justify-center items-center gap-6 text-center"
          >
            <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.2em] text-zinc-600">
              <CheckCircle className="w-3 h-3" /> SECURE
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.2em] text-zinc-600">
              <Clock className="w-3 h-3" /> 120M
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.2em] text-zinc-600">
              <AlertCircle className="w-3 h-3" /> EPHEMERAL
            </div>
          </motion.div>
        </motion.div>
      </main>

      <footer className="border-t border-white/[0.05] py-8 px-6 text-center">
       <p className="text-base text-zinc-600 ">
          © Anonymous • Zero Footprint Sharing
        </p>
      </footer>
    </div>
  );
};

export default DownloadPage;