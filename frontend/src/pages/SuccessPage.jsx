import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { Check, Copy, Download, Clock, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL

export const SuccessPage = () => {
  const { fileId } = useParams();
  const location = useLocation();
  const [copied, setCopied] = useState(false);
  const [data, setData] = useState(location.state?.data || null);

  useEffect(() => {
    if (!data && fileId) {
      // If navigated directly without state, we could fetch file info
      // For now, redirect to home
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
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const getExpiryTime = () => {
    const expiryDate = new Date(data.expires_at);
    return expiryDate.toLocaleString();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 py-24">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
            <Check className="w-8 h-8 text-green-600" strokeWidth={2} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-slate-900 mb-4">
            Upload Successful!
          </h1>
          <p className="text-base md:text-lg text-slate-500 leading-relaxed">
            Your file is ready to share. Use the link or QR code below.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-8 mb-6" data-testid="success-card">
          <div className="mb-6 pb-6 border-b border-slate-200">
            <p className="text-sm text-slate-500 mb-1">File Name</p>
            <p className="mono text-lg text-slate-900 font-medium break-all" data-testid="file-name">
              {data.filename}
            </p>
          </div>

          <div className="mb-6 pb-6 border-b border-slate-200">
            <p className="text-sm text-slate-500 mb-1">File Size</p>
            <p className="mono text-lg text-slate-900 font-medium" data-testid="file-size">
              {formatFileSize(data.size)}
            </p>
          </div>

          <div className="mb-6 pb-6 border-b border-slate-200">
            <p className="text-sm text-slate-500 mb-2">Share Link</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={data.download_url}
                readOnly
                className="flex-1 h-12 px-4 bg-slate-50 border border-slate-200 rounded-md mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                data-testid="share-link-input"
              />
              <button
                onClick={handleCopyLink}
                className="h-12 px-6 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 flex items-center gap-2"
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

          <div className="mb-6 pb-6 border-b border-slate-200">
            <p className="text-sm text-slate-500 mb-4">QR Code</p>
            <div className="flex justify-center">
              <div className="qr-container inline-block rounded-lg" data-testid="qr-code-container">
                <img 
                  src={data.qr_code} 
                  alt="QR Code" 
                  className="w-48 h-48"
                  data-testid="qr-code-image"
                />
              </div>
            </div>
            <p className="text-center text-sm text-slate-500 mt-3">
              Scan to download
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-amber-900 mb-1">
                Auto-delete in 2 hours
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
            className="flex-1 h-12 px-8 bg-slate-100 text-slate-900 font-medium rounded-md hover:bg-slate-200 flex items-center justify-center gap-2"
            data-testid="upload-another-button"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            Upload Another
          </Link>
          <a
            href={`${BACKEND_URL}/api/download/${fileId}`}
            className="flex-1 h-12 px-8 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
            data-testid="test-download-button"
          >
            <Download className="w-4 h-4" strokeWidth={2} />
            Test Download
          </a>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
