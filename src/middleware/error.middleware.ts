import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import logger from "../config/logger.config";
import config from "../config";

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // If is AppError
  if (err instanceof AppError) {
    logger.error(`[AppError] ${err.message}`, {
      statusCode: err.statusCode,
      code: err.code,
      path: req.path,
      method: req.method,
    });

    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      ...(config.isDevelopment && { stack: err.stack }),
    });
  }

  // Handle Prisma Error
  const handlePrismaError = (err: any, res: Response) => {
    logger.error(`[PrismaError] ${err.code}: ${err.message}`);

    // P2002: Unique constraint violation
    if (err.code === "P2002") {
      const field = err.meta?.target?.[0] || "field";
      return res.status(409).json({
        success: false,
        message: `${field} already exists`,
        code: "DUPLICATE_ENTRY",
      });
    }

    // P2025: Record not found
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        message: "Record not found",
        code: "NOT_FOUND",
      });
    }

    // Lỗi Prisma khác
    return res.status(400).json({
      success: false,
      message: "Database operation failed",
      code: "DATABASE_ERROR",
    });
  };

  // Handle Validation Error
  const handleValidationError = (err: any, res: Response) => {
    logger.error(`[ValidationError] ${err.message}`);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      errors: err.errors,
    });
  };

  // Prisma Error
  if (err.name === "PrismaClientKnownRequestError") {
    return handlePrismaError(err, res);
  }

  // Validation Error
  if (err.name === "ValidationError") {
    return handleValidationError(err, res);
  }

  // Validation Upload Error
  if (err.name === "MulterError") {
    return res.status(400).json({
      success: false,
      message: err.message,
      code: "UPLOAD_ERROR",
    });
  }

  logger.error(`[UnhandledError] ${err.message || err}`, {
    name: err.name,
    path: req.path,
    method: req.method,
  });
  return res.status(500).json({
    success: false,
    message: err.message || "Đã xảy ra lỗi không mong muốn",
    code: "INTERNAL_SERVER_ERROR",
  });
};

// Middleware not found (404)
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    true,
    "ROUTE_NOT_FOUND",
  );
  next(error);
};
