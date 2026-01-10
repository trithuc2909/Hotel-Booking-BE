import dotenv from "dotenv";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

dotenv.config(); // Load biến từ .env

const app: Application = express();

// CORS Configuration
app.use(
  cors({
    origin: process.env.COR_ORIGIN || "http://localhost:3000",
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

// API Routes (sẽ thêm sau)
// app.use('/api/v1', apiRoutes);
export default app;
