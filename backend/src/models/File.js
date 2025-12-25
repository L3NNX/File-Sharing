// src/models/File.js
import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // public ID
  gridfs_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  filename: String,
  size: Number,
  mimetype: String,
  upload_time: Date,
  expires_at: Date,
});

export default mongoose.model("File", FileSchema);
