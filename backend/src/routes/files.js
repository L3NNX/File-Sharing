import express from "express";
import mongoose from "mongoose";
import { upload } from "../utils/upload.js";
import File from "../models/File.js";
import { generateQR } from "../utils/qr.js";
import { v4 as uuid } from "uuid";
import { Readable } from "stream";

const router = express.Router();

const getBucket = () =>
  new mongoose.mongo.GridFSBucket(mongoose.connection.db);

router.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const publicId = uuid();
  const now = new Date();
  const expires = new Date(now.getTime() + 2 * 60 * 60 * 1000);

  const bucket = getBucket();
  const gridfsId = new mongoose.Types.ObjectId();

  // Convert buffer → stream
  const stream = Readable.from(req.file.buffer);

  await new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStreamWithId(
      gridfsId,
      req.file.originalname,
      { contentType: req.file.mimetype }
    );

    stream
      .pipe(uploadStream)
      .on("error", reject)
      .on("finish", resolve);
  });

  await File.create({
    id: publicId,
    gridfs_id: gridfsId,
    filename: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
    upload_time: now,
    expires_at: expires,
  })

  const downloadUrl = `${process.env.FRONTEND_URL}/download/${publicId}`;
  const qr = await generateQR(downloadUrl);

  res.json({
    id: publicId,
    filename: req.file.originalname,
    size: req.file.size,
    download_url: downloadUrl,
    qr_code: qr,
    expires_at: expires.toISOString(),
  });
});
router.get("/download/:id", async (req, res) => {
  const meta = await File.findOne({ id: req.params.id });
  if (!meta) return res.sendStatus(404);

  if (new Date() > meta.expires_at) {
    await File.deleteOne({ id: meta.id });
    return res.sendStatus(410);
  }

  const bucket = getBucket();

  res.setHeader(
    "Content-Disposition",
    `attachment; filename="${meta.filename}"`
  );
  res.setHeader("Content-Type", meta.mimetype);

  bucket.openDownloadStream(meta.gridfs_id).pipe(res);
});


router.get("/file/:id", async (req, res) => {
  const meta = await File.findOne({ id: req.params.id });
  if (!meta) return res.sendStatus(404);

  if (new Date() > meta.expires_at) return res.sendStatus(410);

  res.json(meta);
});

export default router;
