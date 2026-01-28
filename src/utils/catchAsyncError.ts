import { Request, Response, NextFunction } from "express";
import AppError from "./appError";
import { ResponseHelper } from "./response";
import jwt from "jsonwebtoken";
import logger from "../config/logger.config";

// Async controller function
export type AsyncFunction<TReq extends Request = Request> = (
  req: TReq,
  res: Response,
  next: NextFunction,
) => Promise<void>;

export const catchAsyncError = <TReq extends Request = Request>(
  fn: AsyncFunction<TReq>,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req as TReq, res, next)).catch(next);
  };
};

/**
 * Enhanced wrapper với error code mặc định
 * Xử lý các loại errors phổ biến
 */
export const catchAsyncErrorWithCode = <TReq extends Request = Request>(
  fn: AsyncFunction<TReq>,
  defaultErrorCode = "INTERNAL_ERROR",
) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await fn(req as TReq, res, next);
    } catch (error: any) {
      // Nếu response đã gửi rồi thì skip
      if (res.headersSent) {
        return;
      }

      // Handle AppError (custom errors)
      if (error instanceof AppError) {
        res
          .status(error.statusCode)
          .json(
            ResponseHelper.error(error.message, error.code || defaultErrorCode),
          );
        return;
      }

      // Handle JWT errors
      if (error instanceof jwt.JsonWebTokenError) {
        res
          .status(401)
          .json(
            ResponseHelper.error(
              "Token không hợp lệ hoặc đã hết hạn",
              "TOKEN_INVALID",
            ),
          );
        return;
      }

      if (error instanceof jwt.TokenExpiredError) {
        res
          .status(401)
          .json(ResponseHelper.error("Token đã hết hạn", "TOKEN_EXPIRED"));
        return;
      }

      // Handle Prisma errors
      if (error && typeof error === "object" && "code" in error) {
        const prismaError = error as any;

        // Prisma unique constraint violation
        if (prismaError.code === "P2002") {
          const field = prismaError.meta?.target?.[0] || "field";
          res
            .status(409)
            .json(
              ResponseHelper.error(`${field} đã tồn tại`, "DUPLICATE_ENTRY"),
            );
          return;
        }
        // Prisma record not found
        if (prismaError.code === "P2025") {
          res
            .status(404)
            .json(ResponseHelper.error("Không tìm thấy dữ liệu", "NOT_FOUND"));
          return;
        }
        // Other Prisma errors
        logger.error(`Prisma error: ${prismaError.code}`, prismaError);
        res
          .status(500)
          .json(ResponseHelper.error("Lỗi database", "DATABASE_ERROR"));
        return;
      }

      // Unexpected errors
      logger.error(
        `Unexpected error in ${fn.name || "controller"}: ${error.message || error}`,
      );

      res
        .status(500)
        .json(
          ResponseHelper.error(
            error.message || "Đã xảy ra lỗi không mong muốn",
            defaultErrorCode,
          ),
        );
    }
  };
};
