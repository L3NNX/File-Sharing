import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import {
  Upload,
  File,
  Shield,
  Zap,
  Clock,
  Sparkles,
  Link2,
  Lock,
  X
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
const API = `${BACKEND_URL}/api`;

export const UploadPage = () => {
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];

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

      toast.success("File shared successfully");
      navigate(`/success/${response.data.id}`, { state: { data: response.data } });
    } catch (error) {
      console.error("Upload error:", error);
      const errorMessage = error.response?.data?.detail || "Upload failed";
      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <div className="min-h-screen text-white selection:bg-white/10 overflow-x-hidden font-sans">
      {/* Navigation */}
          <Navbar />
      <main className="relative z-10 pt-28 pb-20 px-6">
        {/* Hero */}
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <div className="bg-white/5 text-zinc-400 border border-white/10 px-3 py-1.5 rounded-full text-[12px] tracking-widest font-semibold uppercase inline-flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-300" />
              Secure Ephemeral Sharing
            </div>
          </motion.div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter">
              Share files with <span className="text-foreground">zero footprint.</span>
            </h1>
            <p className="text-base md:text-lg text-foreground max-w-xl mx-auto leading-relaxed">
              Fast, encrypted, and temporary. Your files are automatically purged every 2 hours. Built for complete privacy.
            </p>
          </div>

          {/* Upload Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="max-w-xl mx-auto pt-6"
          >
            <div className="p-1 rounded-[1.2rem] bg-zinc-900/10  overflow-hidden">
              <div
                {...getRootProps()}
                className={`relative h-64 rounded-xl border-2 border-dashed border-white/20 
  bg-white/5 backdrop-blur-sm 
  transition-all duration-300 
  flex flex-col items-center justify-center 
  cursor-pointer group
  ${isDragActive ? "bg-white/10 border-white/30" : "hover:bg-white/10 hover:border-white/30"}`}
              >
                <input {...getInputProps()} />

                <AnimatePresence mode="wait">
                  {selectedFile ? (
                    <motion.div
                      key="selected"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center px-8"
                    >
                      <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm 
                      flex items-center justify-center mb-4 
                    group-hover:bg-white/20 transition-all duration-300">

                        <File className="w-5 h-5 text-white" />
                      </div>
                      <p className="text-xl font-semibold text-white truncate max-w-[240px] mb-1">
                        {selectedFile.name}
                      </p>
                      <p className="text-sm text-foreground mono">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center"
                    >
                      <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/5 group-hover:border-white/20 transition-all">
                        <Upload className="w-5 h-5 text-foreground group-hover:text-white" />
                      </div>
                      <p className="text-sm font-medium text-zinc-300">
                        {isDragActive ? "Drop here" : "Click to select file"}
                      </p>
                      <p className="text-[10px] text-zinc-600 mt-2 uppercase tracking-widest font-bold">Max 50MB</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-3 flex gap-2">
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="inline-flex items-center justify-center gap-2
                  w-full h-12
                  bg-white text-black
                  font-medium rounded-xl leading-relaxed
                  border border-white
                 hover:bg-zinc-200
                  transition-all duration-300
                  disabled:opacity-50"
                >
                  {uploading ? "Processing..." : "Create Link"}
                </button>

                {selectedFile && !uploading && (
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="h-12 w-12 flex items-center justify-center rounded-xl border border-white/10 hover:bg-white/5 text-zinc-400"
                  >
                    <X className="w-4 h-4 stroke-[2.25]" />
                  </button>
                )}
              </div>
            </div>

            <div className="mt-8 flex justify-center items-center gap-6">
              <p className="flex items-center gap-1.5 text-xs mono tracking-[0.2em] text-foreground">
                <Shield className="w-3 h-3" /> SECURE
              </p>
              <p className="flex items-center gap-1.5 text-xs mono tracking-[0.2em] text-foreground">
                <Lock className="w-3 h-3" /> E2EE
              </p>
              <p className="flex items-center gap-1.5 text-xs mono tracking-[0.2em] text-foreground">
                <Clock className="w-3 h-3" /> 120M
              </p>
            </div>
          </motion.div>
        </div>

        {/* Features */}
        <section className="max-w-5xl mx-auto mt-30 grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="p-6 space-y-3 rounded-3xl border border-white/10 hover:bg-white/[0.01] transition-colors">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-white/[0.05]">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold tracking-tighter">Self-Destruct</h3>
            <p className="text-foreground text-sm mono leading-relaxed">
              Every upload is ephemeral. Links expire and data is wiped automatically after 2 hours.
            </p>
          </div>
          <div className="p-6 space-y-3 rounded-3xl border border-white/10 hover:bg-white/[0.01] transition-colors">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-white/[0.05]">
              <Link2 className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold tracking-tighter">One-Click Sharing</h3>
            <p className="text-foreground text-sm mono leading-relaxed">
              No accounts, no logins. Just upload your file and get a unique sharing link instantly.
            </p>
          </div>
          <div className="p-6 space-y-3 rounded-3xl border border-white/10 hover:bg-white/[0.01] transition-colors">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center border border-white/[0.05]">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-sm font-semibold tracking-tighter">Privacy Core</h3>
            <p className="text-foreground text-sm mono leading-relaxed">
              Built with a privacy-first architecture. We don't track who sends or receives.
            </p>
          </div>
        </section>
      </main>

       <Footer />
    </div>
  );
};

export default UploadPage;