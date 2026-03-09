import dotenv from "dotenv";
import config from "./config";
import express, { Application, Request, Response } from "express";
import testRoutes from "./api/test.routes";
import apiRoutes from "./api";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "./config/logger.config";
import morgan from "morgan";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";
import performanceMonitoring from "./middleware/performance.middleware";
import {
  preventParameterPollution,
  requestSizeLimit,
  securityHeaders,
} from "./middleware/security.middleware";
import { ensureBucket } from "./config/minio.config";
import { MINIO_BUCKET } from "./constant/minio.constant";
import AppError from "./utils/appError";

dotenv.config(); // Load biến từ .env

const app: Application = express();

// CORS Configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
);

// Middleware to parse JSON
app.use(express.json());

// Middleware to parse cookies
app.use(cookieParser());

// Create stream for morgan
const stream = {
  write: (message: string) => logger.http(message.trim()), // log Http requests
};

// moragan middleware
app.use(morgan("combined", { stream }));

app.use(securityHeaders);
app.use(preventParameterPollution);
app.use(requestSizeLimit);
app.use(performanceMonitoring);

// API Routes
app.use("/api/v1", apiRoutes);

// Test routes
if (config.isDevelopment) {
  app.use("/api/test", testRoutes);
}

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});

// 404 Handler
app.use(notFoundHandler);

// Error Handler
app.use(errorHandler);

// Upload minio storage
async function initializeStorage() {
  try {
    await ensureBucket(MINIO_BUCKET.IMAGES);
    logger.info("MinIO buckets initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize MinIO buckets", error);
  }
}

initializeStorage();

export default app;
