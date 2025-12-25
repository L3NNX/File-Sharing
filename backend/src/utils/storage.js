import dotenv from "dotenv";
import { GridFsStorage } from "multer-gridfs-storage";
import multer from "multer";
import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

dotenv.config();

const storage = new GridFsStorage({
  url: process.env.MONGO_URL,
  file: (req, file) => {
    return {
      _id: new mongoose.Types.ObjectId(), // 🔥 REQUIRED
      filename: uuid(),
      contentType: file.mimetype,
    };
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
});
