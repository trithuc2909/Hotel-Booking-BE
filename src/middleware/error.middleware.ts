import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";
import logger from "../config/logger.config";
import config from "../config";

// Bắt tất cả lỗi trong ứng dụng và trả về response nhất quán
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // If is AppError (Lỗi tự tạo)
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

  // Xử lý lỗi từ Prisma ORM
  const handlePrismaError = (err: any, res: Response) => {
    logger.error(`[PrismaError] ${err.code}: ${err.message}`);

    // P2002: Unique constraint violation (trùng email, username...)
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

  // Xử lý lỗi validation (express-validator)
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

    // Xử lý lỗi validation
  if (err.name === 'ValidationError') {
    return handleValidationError(err, res);
  }
};

// Middleware bắt route không tồn tại (404)
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404,
    true,
    "ROUTE_NOT_FOUND"
  );
  next(error);
};
