import mongoose from "mongoose";
import File from "../models/File.js";

const CLEANUP_INTERVAL_MS = 30 * 60 * 1000;

const cleanupExpiredFiles = async () => {
     console.log("🧹 Cleanup job running at", new Date().toISOString());

  try {
    const now = new Date();

    // Find expired files
    const expiredFiles = await File.find({
      expires_at: { $lt: now },
    });

    if (!expiredFiles.length) return;

    const bucket = new mongoose.mongo.GridFSBucket(
      mongoose.connection.db
    );

    for (const file of expiredFiles) {
      try {
        // Delete file from GridFS
        await bucket.delete(file.gridfs_id);

        // Delete metadata
        await File.deleteOne({ _id: file._id });
         console.log(`✅ Deleted expired file ${file.id}`);
      } catch (err) {
        console.error(
          `❌ Failed to delete file ${file.id}:`,
          err.message
        );
      }
    }

    console.log(`🧹 Cleaned up ${expiredFiles.length} expired files`);
  } catch (err) {
    console.error("🔥 Cleanup job failed:", err);
  }
};

// Start cleanup loop AFTER DB connection exists
const startCleanupJob = () => {
  setInterval(cleanupExpiredFiles, CLEANUP_INTERVAL_MS);
};

startCleanupJob();
