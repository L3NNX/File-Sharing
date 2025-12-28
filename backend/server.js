import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./src/db.js";
import fileRoutes from "./src/routes/files.js";
import "./src/jobs/cleanup.js";

dotenv.config();
await connectDB();

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGINS || "*",
    credentials: false,
  })
);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
})

app.get("/", (req, res) => {
  res.send("File Sharing Service is running.");
});

app.use("/api", fileRoutes);

const PORT = process.env.PORT || 8000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
