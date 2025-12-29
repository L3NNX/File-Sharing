import rateLimit from "express-rate-limit";

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,                 // 15 uploads per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many uploads. Try again later."
  }
});

export const downloadLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 100,               // 100 downloads per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many downloads. Slow down."
  }
});

export const metadataLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
