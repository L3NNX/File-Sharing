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

app.use("/api", fileRoutes);

app.listen(8000, () => {
  console.log("Server running on port 8000");
});
