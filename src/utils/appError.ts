import { BaseResponse } from "../types/response/base";

export enum ErrorType {
  VALIDATION = "VALIDATION",
  AUTH = "AUTH",
  NOT_FOUND = "NOT_FOUND",
  CONFLICT = "CONFLICT",
  FORBIDDEN = "FORBIDDEN",
  UNAUTHORIZED = "UNAUTHORIZED",
  DATABASE = "DATABASE",
  INTERNAL = "INTERNAL",
  EXTERNAL = "EXTERNAL",
  BAD_REQUEST = "BAD_REQUEST",
}

export interface ErrorMetadata {
  [key: string]: any;
}

export default class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: "fail" | "error";
  public readonly isOperational: boolean;
  public readonly type: ErrorType;
  public readonly metadata: ErrorMetadata;
  public readonly timestamp: Date;
  public readonly requestId?: string;
  public readonly code: string;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    code?: string,
    type?: ErrorType,
    metadata: ErrorMetadata = {},
    requestId?: string,
  ) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = isOperational;
    this.type = type || this.getTypeFromStatusCode(statusCode);
    this.metadata = metadata;
    this.timestamp = new Date();
    this.requestId = requestId;
    this.code = code || this.type;

    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, AppError.prototype);
  }

  private getTypeFromStatusCode(statusCode: number): ErrorType {
    if (statusCode === 400) return ErrorType.VALIDATION;
    if (statusCode === 401) return ErrorType.UNAUTHORIZED;
    if (statusCode === 403) return ErrorType.FORBIDDEN;
    if (statusCode === 404) return ErrorType.NOT_FOUND;
    if (statusCode === 409) return ErrorType.CONFLICT;
    return ErrorType.INTERNAL;
  }

  public toAPIResponse(): BaseResponse<null> {
    return {
      succeeded: false,
      message: this.message,
      statusCode: this.statusCode,
      code: this.code,
      data: null,
      errors: this.metadata,
    };
  }

  // Helper methods
  static validation(
    message: string,
    code = "VALIDATION_ERROR",
    metadata: ErrorMetadata = {},
  ): AppError {
    return new AppError(
      message,
      400,
      true,
      code,
      ErrorType.VALIDATION,
      metadata,
    );
  }

  static unauthorized(
    message = "Unauthorized",
    code = "UNAUTHORIZED",
  ): AppError {
    return new AppError(message, 401, true, code, ErrorType.UNAUTHORIZED);
  }

  static forbidden(message = "Forbidden", code = "FORBIDDEN"): AppError {
    return new AppError(message, 403, true, code, ErrorType.FORBIDDEN);
  }

  static notFound(
    message = "Resource not found",
    code = "NOT_FOUND",
  ): AppError {
    return new AppError(message, 404, true, code, ErrorType.NOT_FOUND);
  }

  static badRequest(message = "Bad request", code = "BAD_REQUEST"): AppError {
    return new AppError(message, 400, true, code, ErrorType.VALIDATION);
  }

  static conflict(
    message = "Conflict",
    code = "CONFLICT",
    metadata: ErrorMetadata = {},
  ): AppError {
    return new AppError(message, 409, true, code, ErrorType.CONFLICT, metadata);
  }

  static database(
    message = "Database error",
    code = "DATABASE_ERROR",
  ): AppError {
    return new AppError(message, 500, true, code, ErrorType.DATABASE);
  }

  static internal(
    message = "Internal server error",
    code = "INTERNAL_ERROR",
  ): AppError {
    return new AppError(message, 500, true, code, ErrorType.INTERNAL);
  }

  static fromPrismaError(prismaError: any): AppError {
    switch (prismaError.code) {
      case "P2002":
        const field = prismaError.meta?.target?.[0] || "Giá trị";
        return AppError.conflict(
          `${field} đã tồn tại`,
          "DUPLICATE_FIELD",
          prismaError.meta,
        );
      case "P2025":
        return AppError.notFound("Không tìm thấy dữ liệu", "RECORD_NOT_FOUND");
      default:
        return AppError.database("Lỗi database", "PRISMA_ERROR");
    }
  }
}
