import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Check, Copy, Download, Clock, ArrowLeft, Zap, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const SuccessPage = () => {
  const { fileId } = useParams();
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const [data, setData] = useState(location.state?.data || null);

  useEffect(() => {
    if (!data && fileId) {
      window.location.href = "/";
    }
  }, [data, fileId]);

  if (!data) {
    return null;
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(data.download_url);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const getExpiryTime = () => {
    const expiryDate = new Date(data.expires_at);
    return expiryDate.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden font-sans">
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
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-2xl mb-6 border border-green-500/20"
            >
              <Check className="w-8 h-8 text-green-400" strokeWidth={2} />
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white mb-4">
              Share Ready!
            </h1>
            <p className="text-base md:text-lg text-zinc-400 max-w-lg mx-auto leading-relaxed">
              Your file is encrypted and ready to share. Use the link below or scan the QR code.
            </p>
          </div>

          {/* Success Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.05] rounded-3xl p-8 mb-8 backdrop-blur-sm space-y-8"
            data-testid="success-card"
          >
            {/* File Name */}
            <div className="pb-8 border-b border-white/[0.05]">
              <p className="text-sm text-zinc-500  mb-3">
                File Name
              </p>
              <p
                className="mono text-lg text-white font-medium break-all"
                data-testid="file-name"
              >
                {data.filename}
              </p>
            </div>

            {/* File Size */}
            <div className="pb-8 border-b border-white/[0.05]">
              <p className="text-sm text-zinc-500  mb-3">
                File Size
              </p>
              <p
                className="mono text-lg text-white font-medium"
                data-testid="file-size"
              >
                {formatFileSize(data.size)}
              </p>
            </div>

            {/* Share Link */}
            <div className="pb-8 border-b border-white/[0.05]">
              <p className="text-sm text-zinc-500  mb-3">
                Share Link
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={data.download_url}
                  readOnly
                  className="flex-1 h-12 px-4 bg-white/5 border border-white/10 rounded-md text-sm text-white mono focus:outline-none focus:ring-2 focus:ring-white/20 placeholder-zinc-600"
                  data-testid="share-link-input"
                />
                <button
                  onClick={handleCopyLink}
                  className="h-12 px-6 bg-white text-black font-bold rounded-md hover:bg-zinc-200 transition-all flex items-center gap-2"
                  data-testid="copy-link-button"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" strokeWidth={2} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" strokeWidth={2} />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* QR Code */}
            <div>
              <p className="text-sm text-zinc-500 mb-4">
                QR Code
              </p>
              <div className="flex justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="qr-container inline-block rounded-2xl p-4 bg-white"
                  data-testid="qr-code-container"
                >
                  <img
                    src={data.qr_code}
                    alt="QR Code"
                    className="w-48 h-48"
                    data-testid="qr-code-image"
                  />
                </motion.div>
              </div>
              <p className="text-center text-sm text-zinc-500 mt-4">
                Scan to download
              </p>
            </div>

            {/* Expiry Warning */}
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-sm font-medium text-amber-400 mb-1">
                  Auto-delete in 2 hours
                </p>
                <p className="text-xs text-amber-500/80 mono">
                  Expires at {getExpiryTime()}
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
              className="flex-1 h-12 px-8 bg-white/5 border border-white/10 text-white font-medium  rounded-md hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              data-testid="upload-another-button"
            >
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
              Upload Another
            </Link>
            <a
              href={`${BACKEND_URL}/api/download/${fileId}`}
              className="flex-1 h-12 px-8 bg-white text-black font-medium rounded-md hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
              data-testid="test-download-button"
            >
              <Download className="w-4 h-4" strokeWidth={2} />
              Test Download
            </a>
          </motion.div>

          {/* Features Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-16 pt-12 border-t border-white/[0.05] flex justify-center items-center gap-6 text-center"
          >
            <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.2em] text-zinc-600">
              <Check className="w-3 h-3" /> SHARED
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.2em] text-zinc-600">
              <Clock className="w-3 h-3" /> 120M
            </div>
            <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.2em] text-zinc-600">
              <Zap className="w-3 h-3" /> INSTANT
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

export default SuccessPage;