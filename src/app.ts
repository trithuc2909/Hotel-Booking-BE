import dotenv from "dotenv";
import config from "./config";
import express, { Application, Request, Response } from "express";
import testRoutes from './api/test.routes';
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "./config/logger.config";
import morgan from "morgan";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

dotenv.config(); // Load biến từ .env

const app: Application = express();

// CORS Configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
);

// Middleware to parse JSON
app.use(express.json());

// Middleware to parse cookies
app.use(cookieParser());

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});

// Create stream for morgan
const stream = {
  write: (message: string) => logger.http(message.trim()), // log Http requests
};

// moragan middleware
app.use(morgan("combined", { stream }));

// API Routes (sẽ thêm sau)
// app.use('/api/v1', apiRoutes);

// Test routes
if (config.isDevelopment) {
  app.use('/api/test', testRoutes);
}

// 404 Handler
app.use(notFoundHandler);

// Error Handler
app.use(errorHandler);

export default app;
