import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";
import logger from "../config/logger.config";

export const performanceMonitoring = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Tạo request ID riêng biệt
  const requestId = uuidv4();

  req.headers["x-request-id"] = requestId;

  const startTime = Date.now();
  const startMemory = process.memoryUsage().heapUsed;

  // log khi response success
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const endMemory = process.memoryUsage().heapUsed;
    const memoryDelta = ((endMemory - startMemory) / 1024 / 1024).toFixed(2);

    logger.info("Request completed", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      memoryDelta: `${memoryDelta}MB`,
    });
  });
  next();
};

export default performanceMonitoring;
